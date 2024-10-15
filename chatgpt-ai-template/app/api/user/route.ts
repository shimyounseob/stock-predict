import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '../auth/[...nextauth]/route';  // NextAuth 설정 가져오기
import clientPromise from '../../../lib/mongodb';  // MongoDB 연결

// GET 요청 처리: 세션 확인 및 사용자 저장
export async function GET() {
  const session = await getServerSession(authOptions);  // 세션 정보 가져오기

  if (session) {
    const client = await clientPromise;  // MongoDB 클라이언트 가져오기
    const db = client.db('PredictStock');  // 데이터베이스 이름
    const usersCollection = db.collection('users');  // users 컬렉션

    // 세션의 이메일로 MongoDB에서 사용자 찾기
    const existingUser = await usersCollection.findOne({ email: session.user?.email });

    // 사용자가 없으면 새로 저장
    if (!existingUser) {
      await usersCollection.insertOne({
        email: session.user?.email,
        name: session.user?.name,
      });
    }

    // 세션 정보 반환
    return NextResponse.json({ message: 'Already logged in', session });
  } else {
    // 로그인 안된 경우 로그인 페이지로 리다이렉트
    return NextResponse.redirect('/api/auth/signin');
  }
}

// POST 요청 처리: 사용자 정보 MongoDB에 저장
export async function POST(req: Request) {
  const { email, name } = await req.json();  // 요청에서 email, name 가져오기

  if (!email || !name) {
    return NextResponse.json({ message: 'Email and Name are required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;  // MongoDB 클라이언트 가져오기
    const db = client.db('PredictStock');  // 데이터베이스 이름
    const usersCollection = db.collection('users');  // users 컬렉션

    // MongoDB에 사용자 저장 (업데이트하거나 삽입)
    await usersCollection.updateOne(
      { email },
      { $set: { email, name } },
      { upsert: true }  // 없으면 삽입
    );

    return NextResponse.json({ message: 'User information saved successfully' });
  } catch (error) {
    console.error('Error saving user to database:', error);
    return NextResponse.json({ message: 'Error saving user information' }, { status: 500 });
  }
}
