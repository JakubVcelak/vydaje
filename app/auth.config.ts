import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request }) {
      const { nextUrl, headers } = request;
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        // Use host header to construct the redirect URL
        const host = headers.get('host');
        const protocol = nextUrl.protocol || 'https:'; // fallback to https
        if (host) {
          return Response.redirect(`${protocol}//${host}/dashboard`);
        }
        return Response.redirect(`${nextUrl.origin}/dashboard`);
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;