import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next'; // 세션 정보 가져오기
import clientPromise from '../../../lib/mongodb';  // MongoDB 연결

export async function GET(req: Request) {
  try {
    // 인증된 사용자 세션 가져오기
    const session = await getServerSession();

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 사용자 이메일을 세션에서 동적으로 가져옴
    const email = session.user.email;

    // MongoDB에서 사용자 즐겨찾기 주식 목록 가져오기
    const client = await clientPromise;
    const db = client.db('PredictStock');
    const usersCollection = db.collection('users');

    // MongoDB에서 사용자의 즐겨찾기 주식 목록을 가져옴
    const user = await usersCollection.findOne({ email });

    if (!user || !user.favorites) {
      return NextResponse.json({ error: 'No favorites found' }, { status: 404 });
    }

    const favorites = user.favorites;

    // Flask 서버로 POST 요청 보내기
    const flaskApiUrl = 'http://127.0.0.1:5000/getFavStock';
    const response = await fetch(flaskApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ favorites }),  // MongoDB에서 받은 주식 목록을 Flask로 전송
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Error fetching stock data from Flask server' }, { status: response.status });
    }

    // Flask 서버로부터 받은 주식 데이터를 클라이언트로 반환
    const stockData = await response.json();
    return NextResponse.json(stockData);
  } catch (error) {
    return NextResponse.json({ error: 'Error connecting to Flask server' }, { status: 500 });
  }
}
