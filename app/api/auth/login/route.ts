import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password, rememberMe } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'OPERATOR_ID and SECURITY_CIPHER required' },
        { status: 400 }
      );
    }

    // Call Django JWT authentication endpoint
    const djangoUrl = process.env.NEXT_PUBLIC_DJANGO_URL || 'http://localhost:8000';
    const response = await fetch(`${djangoUrl}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Authentication failed' },
        { status: response.status }
      );
    }

    // Set HTTP-only cookies for tokens
    const cookieStore = await cookies();
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days or 1 day

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
      maxAge: maxAge,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: data.user,
      message: 'ACCESS_GRANTED'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'SYSTEM_ERROR: Connection to command center failed' },
      { status: 500 }
    );
  }
}
