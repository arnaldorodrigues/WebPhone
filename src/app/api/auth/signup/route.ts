import { NextResponse } from 'next/server';
import { createUser } from '@/lib/users';
import { generateToken } from '@/utils/jwt';
import { SignUpRequest } from '@/types/auth';

export async function POST(request: Request) {
  try {
    const body: SignUpRequest = await request.json();
    const { password, name, email } = body;

    // Basic validation
    if (!password || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }


    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const user = await createUser(password, name.trim(), email.toLowerCase());
    if (!user) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

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