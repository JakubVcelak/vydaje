import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { NextRequest, NextResponse } from 'next/server';
 
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
 
async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
    return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
 
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);
 
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);
 
          if (passwordsMatch) return user;
        }
 
        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});
 
/**
 * Middleware-like helper to restrict access to authenticated users.
 * Use in server components, API routes, or route handlers.
 */
export async function requireAuth(req: NextRequest) {
  const session = await auth();
  const publicPaths = ['/', '/login'];
  const { pathname } = req.nextUrl;
 
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }
 
  if (!session?.user) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL('/login', req.url));
  }
 
  return NextResponse.next();
}