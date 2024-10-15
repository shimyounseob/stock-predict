import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '../auth/[...nextauth]/route';

// 로그인 처리 함수
export async function GET() {
  const session = await getServerSession(authOptions);

  if (session) {
    // 이미 로그인된 경우 세션 정보 반환
    return NextResponse.json({ message: 'Already logged in', session });
  } else {
    // 로그인 페이지로 리다이렉트
    return NextResponse.redirect('/api/auth/signin'); 
  }
}

// 로그아웃 처리 함수
export async function DELETE() {
  // 로그아웃 후 리다이렉트 처리
  return NextResponse.redirect('/api/auth/signout');
}
