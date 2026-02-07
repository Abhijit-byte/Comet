import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, first_name, last_name } = await request.json();

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'OPERATOR_CODE, COMM_CHANNEL, and SECURITY_CIPHER required' },
        { status: 400 }
      );
    }

    // Call Django registration endpoint
    const djangoUrl = process.env.NEXT_PUBLIC_DJANGO_URL || 'http://localhost:8000';
    const response = await fetch(`${djangoUrl}/api/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        username, 
        email, 
        password,
        first_name: first_name || '',
        last_name: last_name || ''
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Registration failed' },
        { status: response.status }
      );
    }

    // Set HTTP-only cookies for tokens
    const cookieStore = await cookies();

    cookieStore.set('access_token', data.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes for access token
      path: '/',
    });

    cookieStore.set('refresh_token', data.refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days for refresh token
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: data.user,
      message: 'OPERATOR_REGISTERED'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'SYSTEM_ERROR: Registration system unavailable' },
      { status: 500 }
    );
  }
}
