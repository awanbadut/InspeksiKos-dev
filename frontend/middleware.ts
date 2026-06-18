import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/dashboard') {
    const token = request.cookies.get('access_token')?.value;
    const role = request.cookies.get('user_role')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (role === 'mahasiswa') {
      return NextResponse.rewrite(new URL('/mahasiswa-dashboard', request.url));
    } else if (role === 'inspektur') {
      return NextResponse.rewrite(new URL('/inspektur-dashboard', request.url));
    } else if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard'],
};
