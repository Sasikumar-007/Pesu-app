import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/signup'];

    // Check if current path is public
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // For the client-side auth check, we just let the pages handle it
    // since Supabase auth is client-side with this setup
    if (isPublicRoute) {
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
