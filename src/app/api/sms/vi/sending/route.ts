import { NextRequest } from "next/server";
import {Apidaze} from '@apidaze/node';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const to = body.to;
    const messageBody = body.messageBody;

    // const to = '447427844303';
    // const messageBody = 'Hello, this is a test message from the VI SMS API';

    const ApidazeClient = new Apidaze(
      process.env.APIDAZ_API_KEY!,
      process.env.APIDAZ_API_SECRET!,
    );

    const response = await ApidazeClient.messages.send(process.env.VI_SMS_DID!, to, messageBody);

    return new Response(JSON.stringify({ success: true, data: response }), { status: 200 });

  } catch (error) {
    console.error('Error sending SMS:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500 }
    );
  }
}