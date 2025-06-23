import type { NextRequest } from 'next/server';
import crypto from 'crypto';

// In-memory store for demonstration; use a database in production
let messages: { from: string; to: string; body: string }[] = [];

function validateSignature(req: NextRequest): boolean {
  const signature = req.headers.get('x-signalwire-signature'); // Assuming similar to SignalWire
  const timestamp = req.headers.get('x-timestamp');
  const body = JSON.stringify(req.body || {});
  const data = timestamp + body;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.SANGOMA_AUTH_TOKEN!)
    .update(data)
    .digest('base64');
  return signature === expectedSignature;
}

export async function POST(req: NextRequest) {
  if (!validateSignature(req)) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
  }

  try {
    const { From, To, Body } = await req.json();
    messages.push({ from: From, to: To, body: Body });
    console.log(`Received SMS from ${From} to ${To}: ${Body}`);
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500 }
    );
  }
}

export async function GET() {
  return new Response(JSON.stringify(messages), { status: 200 });
}