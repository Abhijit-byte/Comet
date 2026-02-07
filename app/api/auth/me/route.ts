import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'NOT_AUTHENTICATED' },
        { status: 401 }
      );
    }

    // Verify token with Django backend
    const djangoUrl = process.env.NEXT_PUBLIC_DJANGO_URL || 'http://localhost:8000';
    const response = await fetch(`${djangoUrl}/api/auth/me/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'TOKEN_INVALID' },
        { status: 401 }
      );
    }

    const userData = await response.json();

    return NextResponse.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'AUTH_CHECK_FAILED' },
      { status: 500 }
    );
  }
}
