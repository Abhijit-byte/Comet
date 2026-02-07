import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'NO_REFRESH_TOKEN' },
        { status: 401 }
      );
    }

    // Call Django refresh endpoint
    const djangoUrl = process.env.NEXT_PUBLIC_DJANGO_URL || 'http://localhost:8000';
    const response = await fetch(`${djangoUrl}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Clear invalid tokens
      cookieStore.delete('access_token');
      cookieStore.delete('refresh_token');
      
      return NextResponse.json(
        { error: 'TOKEN_REFRESH_FAILED' },
        { status: 401 }
      );
    }

    // Update access token
    cookieStore.set('access_token', data.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'TOKEN_REFRESHED'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'REFRESH_SYSTEM_ERROR' },
      { status: 500 }
    );
  }
}
