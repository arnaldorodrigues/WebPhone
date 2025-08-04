import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Define interfaces for database query results
interface ExtensionRow {
  extension: string;
}

export async function GET(_request: NextRequest) {
  // Create a connection pool to the PostgreSQL database
  const pool = new Pool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'fusionpbx',
    password: process.env.DB_PASSWORD || '4R7s2lEftFuQEd6jcO45FMapk',
    database: process.env.DB_NAME || 'fusionpbx',
  });

  try {
    // Query the database for all extension numbers
    const result = await pool.query<ExtensionRow>('SELECT extension FROM v_extensions ORDER BY extension');
    const extensions = result.rows.map((row: ExtensionRow) => row.extension);

    // Return the extension numbers as JSON
    return NextResponse.json({
      success: true,
      data: extensions
    });
  } catch (error) {
    console.error('Query error:', error instanceof Error ? error.message : 'Unknown error');
    
    // Return an` error response
    return NextResponse.json(
      {
        success: false,
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    // Close the database connection pool
    await pool.end();
  }
}