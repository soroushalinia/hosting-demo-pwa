import { getUserFromHeader } from '@/lib/auth';
import { AuthError } from '@/lib/error';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { ZodError, z } from 'zod';

const commandSchema = z.object({
  id: z.uuid(),
  command: z.enum(['poweron', 'poweroff', 'reboot']),
});

export async function POST(req: Request) {
  try {
    const user = await getUserFromHeader(req);
    const json = await req.json();
    const { id, command } = commandSchema.parse(json);

    const { data: vps, error: fetchError } = await supabaseAdmin
      .from('vps_instances')
      .select('id, status, user_id')
      .eq('id', id)
      .single();

    if (fetchError || !vps) {
      return new Response(JSON.stringify({ error: 'VPS not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (vps.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'VPS not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let newStatus: 'on' | 'off' | 'pending' = vps.status;
    let lastStartup: string | null = null;

    if (command === 'poweron') {
      if (vps.status === 'on') {
        return new Response(JSON.stringify({ message: 'VPS is already powered on' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      newStatus = 'on';
      lastStartup = new Date().toISOString();
    }

    if (command === 'poweroff') {
      if (vps.status === 'off') {
        return new Response(JSON.stringify({ message: 'VPS is already powered off' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      newStatus = 'off';
      lastStartup = null;
    }

    if (command === 'reboot') {
      if (vps.status === 'off') {
        return new Response(JSON.stringify({ message: 'VPS is off and cannot be rebooted' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      newStatus = 'on';
      lastStartup = new Date().toISOString();
    }

    const updateData: { last_startup: string | null; status: 'on' | 'off' | 'pending' } = {
      last_startup: null,
      status: newStatus,
    };
    if (command === 'poweron' || command === 'reboot') {
      updateData.last_startup = lastStartup;
    } else if (command === 'poweroff') {
      updateData.last_startup = null;
    }

    const { error: updateError } = await supabaseAdmin
      .from('vps_instances')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      return new Response(JSON.stringify({ error: 'Failed to update VPS status' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ message: `VPS ${command} command executed`, status: newStatus }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: err.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (err instanceof ZodError) {
      return new Response(JSON.stringify({ error: 'Validation failed', issues: err.issues }), {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.error('Unknown Error processing request:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
