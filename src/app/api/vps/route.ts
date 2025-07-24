import { getUserFromHeader } from '@/lib/auth';
import { AuthError } from '@/lib/error';
import { generateIPv4, generateIPv6 } from '@/lib/ip';
import { calculatePrice } from '@/lib/price';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createVpsSchema, querySchema } from '@/schemas/vps';
import { NextRequest } from 'next/server';
import { ZodError } from 'zod';

type VpsResponse = {
  id: string;
  cpu: number;
  ram: number;
  storage: number;
  ipv4: string;
  ipv6: string;
  status: 'pending' | 'created';
  location: string;
  created_at: string;
  user_id: string;
  os: string;
  auth_method: string;
  last_startup: string;
}[];

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromHeader(req);

    const searchParams = req.nextUrl.searchParams;
    const queryParams = Object.fromEntries(searchParams.entries());
    const parsed = querySchema.safeParse(queryParams);

    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.issues }), {
        headers: { 'Content-Type': 'application/json' },
        status: 422,
      });
    }

    const { page, pageSize, sortBy, sortOrder } = parsed.data;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const {
      data: server_list,
      error,
      count,
    } = await supabaseAdmin
      .from('vps_instances')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) {
      return new Response(
        JSON.stringify({
          error: 'Error getting servers. Please try again later or contact support.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    if (server_list && server_list.length > 0) {
      const now = new Date();

      const outdatedServers = server_list.filter((server) => {
        const createdAt = new Date(server.created_at);
        const diffInMinutes = (now.getTime() - createdAt.getTime()) / 1000 / 60;
        return diffInMinutes > 3 && server.status === 'pending';
      });

      for (const server of outdatedServers) {
        const { error: updateError } = await supabaseAdmin
          .from('vps_instances')
          .update({ status: 'on', last_startup: new Date().toISOString() })
          .eq('id', server.id);
        if (updateError) {
          return new Response(
            JSON.stringify({
              error: 'Error getting servers. Please try again later or contact support.',
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            },
          );
        }
      }
    }

    return new Response(
      JSON.stringify({
        server_list,
        pagination: {
          page,
          pageSize,
          total: count,
          totalPages: Math.ceil((count ?? 0) / pageSize),
        },
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: err.status,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    console.error('Unknown Error processing request:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromHeader(req);
    const json = await req.json();
    const bodyData = createVpsSchema.parse(json);

    const { data: existingServers, error: fetchError } = await supabaseAdmin
      .from('vps_instances')
      .select('server_name')
      .eq('server_name', bodyData.serverName);

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: 'Error creating vps. Please try again later or contact support.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    if (existingServers && existingServers.length > 0) {
      return new Response(JSON.stringify({ error: 'Server name already in use.' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { totalMonthly } = calculatePrice({
      cpu: bodyData.cpu,
      ram: bodyData.ram,
      storage: bodyData.storage,
      ipv4: bodyData.ipv4,
    });

    const credit = user.user_metadata.credit;

    if (totalMonthly > credit) {
      return new Response(
        JSON.stringify({
          error: 'Insufficent Balance.',
        }),
        {
          status: 402,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        credit: credit - totalMonthly,
      },
    });

    if (updateError !== null) {
      return new Response(
        JSON.stringify({ error: 'Error creating vps. Please try again later or contact support.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    const { data, error } = await supabaseAdmin
      .from('vps_instances')
      .insert({
        server_name: bodyData.serverName,
        cpu: bodyData.cpu,
        ram: bodyData.ram,
        storage: bodyData.storage,
        ipv4: Array.from({ length: bodyData.ipv4 }, () => generateIPv4()).join(','),
        ipv6: Array.from({ length: bodyData.ipv6 }, () => generateIPv6()).join(','),
        status: 'pending',
        location: bodyData.location,
        user_id: user.id,
        os: bodyData.os,
        auth_method: bodyData.authMethod,
      })
      .select();
    const vpsConfigResponse = data as unknown as VpsResponse;
    const vps_config = vpsConfigResponse[0];
    if (error) {
      console.error('Error inserting into `vps_instances`:', {
        error: error.message,
        data: bodyData,
        userId: user.id,
      });
      return new Response(
        JSON.stringify({
          error: 'Error creating vps. Please try again later or contact support.',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }
    return new Response(
      JSON.stringify({
        message: 'VPS instance created successfully',
        vps_config,
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: err.status,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (err instanceof ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          issues: err.issues,
        }),
        {
          status: 422,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }

    console.error('Unknown Error processing request:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
