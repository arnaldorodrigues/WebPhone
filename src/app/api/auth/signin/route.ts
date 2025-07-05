import { NextResponse } from 'next/server';
import { findUserByEmail, validatePassword } from '@/lib/users';
import { SignInRequest } from '@/types/auth';
import { signToken } from '@/utils/auth';

export async function POST(request: Request) {
  try {
    const body: SignInRequest = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email.toLowerCase());

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValidPassword = await validatePassword(user, password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user._id,
      userName: user.name,
      email: user.email,
      role: user.role
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}