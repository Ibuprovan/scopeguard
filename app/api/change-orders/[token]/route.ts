import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: { token: string } }
) {
  const { token } = params;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );

  const { data, error } = await supabase
    .from('change_orders')
    .select(`
      id,
      items,
      total_amount,
      status,
      share_token,
      created_at,
      project:project_id(name, client_name)
    `)
    .eq('share_token', token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}
