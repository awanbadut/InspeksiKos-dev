import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Let the client-side router (DashboardFallback) handle dashboard routing and redirection
  // based on localStorage. This fixes login/redirection failures in PWA environments
  // where cookies are often blocked or stripped.
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard'],
};
