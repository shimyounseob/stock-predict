// /app/api/checkLogin/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (session && session.user) {
      return NextResponse.json({ loggedIn: true, user: session.user });
    } else {
      return NextResponse.json({ loggedIn: false });
    }
  } catch (error) {
    return NextResponse.json({ loggedIn: false, error: 'Error checking login status' });
  }
}
