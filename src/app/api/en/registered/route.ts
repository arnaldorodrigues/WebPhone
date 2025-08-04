import { NextRequest, NextResponse } from 'next/server';
import { Connection } from 'modesl';

// Define interfaces for ESL responses
interface ESLResponse {
    getBody: () => string;
}

// Define interface for Connection with api method
interface ESLConnection extends Connection {
    // Override the api method to match how we're using it
    api(command: string, args: string[] | ((event: ESLResponse | null) => void), cb?: () => void): void;
}

export async function GET(_request: NextRequest) {
    try {
        // Create a connection to FreeSWITCH using Event Socket Library (ESL)
        const conn = new Connection(
            process.env.FS_HOST || '127.0.0.1',
            parseInt(process.env.FS_PORT || '8021'),
            process.env.FS_PASSWORD || 'ClueCon'
        ) as ESLConnection;

        // Handle connection errors
        conn.on('error', (err) => {
            console.error('ESL Connection Error:', err);
            return NextResponse.json(
                {
                    success: false,
                    message: 'Failed to connect to FreeSWITCH',
                    error: err.message
                },
                { status: 500 }
            );
        });

        // When the connection is ready, get the registrations
        const result = await new Promise<NextResponse>((resolve, reject) => {
            conn.on('esl::ready', async () => {
                try {
                    // Execute the sofia status command to get registrations
                    const response = await new Promise<string>((innerResolve, innerReject) => {
                        conn.api('sofia status profile internal reg', (response: ESLResponse | null) => {
                            if (!response) innerReject(new Error('No response from FreeSWITCH'));
                            else innerResolve(response.getBody());
                        });
                    });

                    // Parse the response to extract registered extension numbers
                    const registrations = response
                        .split('\n')
                        .filter(line => line.trim().length > 0)
                        .filter(line => line.includes('Auth-User'))
                        .map(line => line.replace('Auth-User:', " ").trim());

                    // Return the registered extension numbers as JSON
                    resolve(NextResponse.json({
                        success: true,
                        data: registrations
                    }));
                } catch (error) {
                    console.error('ESL command error:', error instanceof Error ? error.message : 'Unknown error');

                    // Return an error response
                    resolve(NextResponse.json(
                        {
                            success: false,
                            message: 'Failed to get registrations',
                            error: error instanceof Error ? error.message : 'Unknown error'
                        },
                        { status: 500 }
                    ));
                } finally {
                    // Disconnect from FreeSWITCH
                    conn.disconnect();
                }
            });

            // Connect to FreeSWITCH
            conn.connected();

            // Set a timeout to reject the promise if the connection takes too long
            setTimeout(() => {
                reject(new Error('Connection timeout'));
                conn.disconnect();
            }, 5000);
        });

        return result;
    } catch (error) {
        console.error('ESL error:', error instanceof Error ? error.message : 'Unknown error');

        // Return an error response
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to initialize ESL connection',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}