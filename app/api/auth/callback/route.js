import { NextResponse } from 'next/server';
import api from '@/utils/axios';

export async function POST(request) {
  try {
    const { credential } = await request.json();

    //const baseUrl = 'http://hama-auth:3001';
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_AUTH_URL;
    const backendResponse = await api.post(`${baseUrl}/auth/google/login`, {
      credential,
    });

    if (backendResponse.data.isNewUser) {
      return NextResponse.json({
        redirect: '/signup',
        userData: backendResponse.data.userData,
      });
    }

    return NextResponse.json({
      token: backendResponse.data.token,
      redirect: '/dashboard',
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
