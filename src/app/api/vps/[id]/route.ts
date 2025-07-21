import { getUserFromHeader } from '@/lib/auth';
import { AuthError } from '@/lib/error';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromHeader(req);
    const { id } = await params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'VPS ID is required' }), {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const { data: vps, error } = await supabaseAdmin
      .from('vps_instances')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !vps) {
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

    return new Response(JSON.stringify(vps), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
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
