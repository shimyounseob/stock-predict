import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';  // MongoDB 연결

export async function POST(req: Request) {
  const session = await getServerSession();  // 세션 정보 가져오기

  // 세션이 없거나 세션에 사용자가 없는 경우 에러 반환
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: 'You must be logged in to remove favorites.' }, { status: 401 });
  }

  const { symbol } = await req.json();  // 요청에서 주식 심볼 가져오기

  if (!symbol) {
    return NextResponse.json({ error: 'Stock symbol is required.' }, { status: 400 });
  }

  try {
    const client = await clientPromise;  // MongoDB 클라이언트 가져오기
    const db = client.db('PredictStock');  // 데이터베이스 선택
    const usersCollection = db.collection('users');  // users 컬렉션

    // 사용자의 이메일로 MongoDB에서 사용자 찾기
    const user = await usersCollection.findOne({ email: session.user.email });

    if (user) {
      // 사용자 문서에서 favorite 목록에서 심볼 제거
      await usersCollection.updateOne(
        { email: session.user.email },
        { $pull: { favorites: symbol } }  // 해당 심볼을 favorites 목록에서 제거
      );
    }

    return NextResponse.json({ success: 'Stock removed from favorites.' });
  } catch (error) {
    return NextResponse.json({ error: 'Error removing stock from favorites.' }, { status: 500 });
  }
}
