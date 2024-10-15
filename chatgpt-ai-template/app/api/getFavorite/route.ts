import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';  // MongoDB 연결

export async function GET(req: Request) {
  const session = await getServerSession();

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('PredictStock');
    const usersCollection = db.collection('users');

    // 사용자의 북마크한 주식 목록 가져오기
    const user = await usersCollection.findOne({ email: session.user.email });

    if (!user || !user.favorites) {
      return NextResponse.json({ favorites: [] });
    }

    return NextResponse.json({ favorites: user.favorites });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching favorites.' }, { status: 500 });
  }
}
