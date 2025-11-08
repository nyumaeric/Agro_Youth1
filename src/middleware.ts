import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

interface TokenData {
  role?: string;
  userType?: 'farmer' | 'buyer' | 'investor';
  [key: string]: any;
}

const routeConfig = {
  public: ['/login', '/register', '/'],
  
  admin: [
    '/dashboard/courses/admin',
    '/dashboard/users',
    '/dashboard/emotions',
  ],
  
  investor: [
    '/dashboard/investor/review-applications',
  ],
  
  farmer: [
    '/dashboard/apply',
    '/dashboard/allapplications',
  ],
  
  userOnly: [
    '/dashboard/certificates',
    '/dashboard/courses/enrolled',
  ],
  
  shared: [
    '/dashboard',
    '/dashboard/profile',
    '/dashboard/livesessions',
    '/dashboard/courses', 
    '/dashboard/products',
  ],
};

function isRouteAllowed(pathname: string, token: TokenData | null): boolean {
  if (!token) return false;

  const role = token.role?.toLowerCase();
  const userType = token.userType?.toLowerCase();
  
  if (routeConfig.shared.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return true;
  }

  if (role === 'Admin') {
    const isAdminRoute = routeConfig.admin.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    const isSharedRoute = routeConfig.shared.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    
    const isUserOnlyRoute = routeConfig.userOnly.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    const isFarmerRoute = routeConfig.farmer.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    const isInvestorRoute = routeConfig.investor.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    
    if (isUserOnlyRoute || isFarmerRoute || isInvestorRoute) {
      return false;
    }
    
    return isAdminRoute || isSharedRoute;
  }

  if (userType === 'investor') {
    const isInvestorRoute = routeConfig.investor.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    const isUserOnlyRoute = routeConfig.userOnly.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    const isSharedRoute = routeConfig.shared.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    
    const isFarmerRoute = routeConfig.farmer.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    const isAdminRoute = routeConfig.admin.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    
    if (isFarmerRoute || isAdminRoute) {
      return false;
    }
    
    return isInvestorRoute || isUserOnlyRoute || isSharedRoute;
  }

  if (userType === 'farmer') {
    const isFarmerRoute = routeConfig.farmer.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    const isUserOnlyRoute = routeConfig.userOnly.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    const isSharedRoute = routeConfig.shared.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    
    const isInvestorRoute = routeConfig.investor.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    const isAdminRoute = routeConfig.admin.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    
    if (isInvestorRoute || isAdminRoute) {
      return false;
    }
    
    return isFarmerRoute || isUserOnlyRoute || isSharedRoute;
  }

  if (userType === 'buyer') {
    const isUserOnlyRoute = routeConfig.userOnly.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    const isSharedRoute = routeConfig.shared.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    
    const isFarmerRoute = routeConfig.farmer.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    const isInvestorRoute = routeConfig.investor.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    const isAdminRoute = routeConfig.admin.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    
    if (isFarmerRoute || isInvestorRoute || isAdminRoute) {
      return false;
    }
    
    return isUserOnlyRoute || isSharedRoute;
  }

  return false;
}

export default async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET // Match your auth config
  }) as TokenData | null;

  const { pathname } = request.nextUrl;

  if (routeConfig.public.includes(pathname)) {
    if (token && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  const requiresAuth = pathname.startsWith('/dashboard');

  if (requiresAuth && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    
    const response = NextResponse.redirect(url);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  if (requiresAuth && token) {
    const allowed = isRouteAllowed(pathname, token);
    
    if (!allowed) {
      console.log(`Access denied for ${token.role}/${token.userType} to ${pathname}`);
      
      const url = new URL('/dashboard', request.url);
      url.searchParams.set('error', 'unauthorized');
      
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}


export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/login',
    '/register',
  ],
};