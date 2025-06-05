import { NextResponse } from 'next/server';
import { createUser, readAllUsers } from '@/lib/users';
import { generateToken } from '@/utils/jwt';
import { SignUpRequest } from '@/types/auth';

export async function POST(request: Request) {
  try {
    const body: SignUpRequest = await request.json();
    const { email, password, name } = body;

    // Basic validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const user = await createUser(email, password, name);
    const token = generateToken(user);

    return NextResponse.json({ token, user });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 