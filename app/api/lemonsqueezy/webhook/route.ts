import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

function verifySignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  try {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('LEMONSQUEEZY_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Verify webhook signature
  const signature = request.headers.get('x-signature');
  if (!verifySignature(body, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventName = event.meta?.event_name;
  if (!eventName) {
    return NextResponse.json({ error: 'Missing event_name' }, { status: 400 });
  }

  // Use service_role key for admin operations (no cookie dependency in API routes)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Supabase credentials not configured');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    switch (eventName) {
      case 'subscription_created':
      case 'subscription_updated': {
        const email = event.data?.attributes?.user_email;
        const status = event.data?.attributes?.status;

        if (email && typeof email === 'string' && (status === 'active' || status === 'trialing')) {
          await supabase
            .from('profiles')
            .update({ plan: 'pro' })
            .eq('email', email);
        }
        break;
      }

      case 'subscription_cancelled':
      case 'subscription_expired': {
        const email = event.data?.attributes?.user_email;

        if (email && typeof email === 'string') {
          await supabase
            .from('profiles')
            .update({ plan: 'free' })
            .eq('email', email);
        }
        break;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
