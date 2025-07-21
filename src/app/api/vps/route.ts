import { generateIPv4 } from '@/lib/ip';
import { calculatePrice } from '@/lib/price';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createVpsSchema } from '@/schemas/vps';
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
  power: 'off' | 'on' | 'starting';
}[];

class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'AuthError';
  }
}

async function getUserFromHeader(req: Request) {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    throw new AuthError(401, 'Missing or invalid Authorization header');
  }

  const token = auth.split(' ')[1];
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    throw new AuthError(401, error?.message ?? 'Invalid token');
  }

  return user;
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
        ipv6: Array.from({ length: bodyData.ipv4 }, () => generateIPv4()).join(','),
        status: 'pending',
        location: bodyData.location,
        user_id: user.id,
        os: bodyData.os,
        auth_method: bodyData.authMethod,
        power: 'off',
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
