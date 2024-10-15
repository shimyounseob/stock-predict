import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';  // MongoDB 연결 가져오기

export async function POST(req: Request) {
  try {
    const { symbols } = await req.json();  // 요청에서 여러 주식 티커를 받아옴
    const client = await clientPromise;
    const db = client.db('PredictStock');
    const collection = db.collection('predictions');

    // 주식 심볼이 쉼표로 구분된 문자열로 전달될 경우 배열로 변환
    const symbolArray = symbols.split(',').map((symbol: string) => symbol.trim().toUpperCase());
    
    if (!symbolArray || !Array.isArray(symbolArray) || symbolArray.length === 0) {
      return NextResponse.json({ error: 'No stock symbols provided' }, { status: 400 });
    }

    // 각 심볼에 대한 예측 데이터를 MongoDB에서 조회
    const promises = symbolArray.map(async (symbol: string) => {
      const data = await collection.findOne({ ticker: symbol });

      if (!data) {
        return { symbol, error: 'No prediction data found for this symbol' };
      }
      // predictions 필드가 배열로 나오는지 확인
      if (!Array.isArray(data.predictions)) {
        console.error(`Predictions for symbol ${symbol} is not an array.`);
      }
      return { symbol: symbol.toUpperCase(), predictions: data.predictions };
    });

    // 모든 요청이 완료될 때까지 기다림
    const predictionData = await Promise.all(promises);

    // 결과 확인을 위한 로그 출력
    console.log("Prediction Data:", predictionData);

    // 성공적으로 데이터를 받아오면 반환
    return NextResponse.json({ predictionData });
  } catch (error) {
    console.error('Error fetching prediction data:', error);
    return NextResponse.json({ error: 'Error fetching prediction data' }, { status: 500 });
  }
}
