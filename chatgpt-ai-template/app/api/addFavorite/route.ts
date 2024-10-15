import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';  // MongoDB 연결

export async function POST(req: Request) {
  const session = await getServerSession();  // 세션 정보 가져오기

  // 세션이 없거나 세션에 사용자가 없는 경우 에러 반환
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: 'You must be logged in to save favorites.' }, { status: 401 });
  }

  // 요청에서 inputCode를 추출
  const { inputCode } = await req.json() ;
  console.log("Favorite Received inputCode:", inputCode); // 받은 데이터 로그

  // 주식 심볼이 없을 경우 에러 반환
  if (!inputCode) {
    return NextResponse.json({ error: 'Stock symbol is required.' }, { status: 400 });
  }

  // 주식 심볼을 추출하고 대문자로 변환
  const stockSymbol = inputCode.toUpperCase();
  console.log("Extracted stockSymbol:", stockSymbol); // 티커 확인 로그 출력

  try {
    const client = await clientPromise;  // MongoDB 클라이언트 가져오기
    const db = client.db('PredictStock');  // 데이터베이스 선택
    const usersCollection = db.collection('users');  // users 컬렉션

    // 사용자의 이메일로 MongoDB에서 사용자 찾기
    const user = await usersCollection.findOne({ email: session.user.email });

    if (user) {
      // 사용자 문서에서 favorite 목록에 심볼 추가 (중복 방지)
      await usersCollection.updateOne(
        { email: session.user.email },
        { $addToSet: { favorites: stockSymbol } }  // 중복 방지로 티커 추가
      );
    } else {
      // 사용자 문서가 없는 경우 생성
      await usersCollection.insertOne({
        email: session.user.email,
        name: session.user.name,
        favorites: [stockSymbol],  // 티커 추가
      });
    }

    return NextResponse.json({ success: 'Stock added to favorites.' });
  } catch (error) {
    console.error("Error adding stock to favorites:", error);
    return NextResponse.json({ error: 'Error adding stock to favorites.' }, { status: 500 });
  }
}
