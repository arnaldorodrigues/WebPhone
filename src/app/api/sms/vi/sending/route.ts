import { NextRequest } from "next/server";
import {Apidaze} from '@apidaze/node';

export async function POST(request: NextRequest) {
  try {
    // const body = await request.json();
    // const to = body.to;
    // const messageBody = body.messageBody;

    const to = '447427844303';
    const messageBody = 'Hello, this is a test message from the VI SMS API';

    console.log(to,messageBody);

    const ApidazeClient = new Apidaze(
      'rts01d7g',
      '8f02cb9cc4c8670ab5aebb364c094b2e',
    );

    console.log(ApidazeClient);

    const response = await ApidazeClient.messages.send('18556949555', to, messageBody);

    console.log(response);

    return new Response(JSON.stringify({ success: true, data: response }), { status: 200 });

  } catch (error) {
    console.error('Error sending SMS:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500 }
    );
  }
}