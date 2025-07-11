import { NextResponse } from 'next/server';
import { SignUpRequest } from '@/types/auth';
import UserModel from '@/models/User';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import { signToken } from '@/utils/auth';

export async function POST(request: Request) {
  try {
    const body: SignUpRequest = await request.json();
    const { password, name, email } = body;

    if (!password || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    const hashedPassword = await bcrypt.hash(password, 10);

    const checkEmailDuplication = await UserModel.findOne({ email: email.toLowerCase() });

    if (checkEmailDuplication) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    const createdUser = await UserModel.create({
      email,
      password: hashedPassword,
      name
    });

    const userObject = createdUser.toJSON();
    const { password: _, ...userWithoutPassword } = userObject;
    const user = userWithoutPassword;

    const token = signToken({
      userId: user._id,
      userName: user.name,
      email: user.email,
      role: user.role
    });

    return NextResponse.json({ token, user });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 