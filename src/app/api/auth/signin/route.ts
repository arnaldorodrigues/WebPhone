import { NextResponse } from 'next/server';
import { findUserByExtensionNumber, validatePassword } from '@/lib/users';
import { generateToken } from '@/utils/jwt';
import { SignInRequest } from '@/types/auth';

export async function POST(request: Request) {
  try {
    const body: SignInRequest = await request.json();
    const { extensionNumber, password } = body;

    // Basic validation
    if (!extensionNumber || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const user = await findUserByExtensionNumber(extensionNumber);
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

    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(userWithoutPassword);
    
    return NextResponse.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}