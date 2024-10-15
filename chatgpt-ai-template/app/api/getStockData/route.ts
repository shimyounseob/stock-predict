import { NextResponse } from 'next/server';

// Flask 서버의 엔드포인트 URL
const FLASK_API_URL = 'http://127.0.0.1:5000/getSixMonthStock';

export async function POST(req: Request): Promise<Response> {
  try {
    // 요청 본문에서 주식 심볼들을 파싱 (배열 형태로 받음)
    const { symbols } = await req.json();
    console.log("symbols: ", symbols);

    // 쉼표로 구분된 문자열을 배열로 변환
    const symbolArray = symbols.split(',').map((symbol: string) => symbol.trim().toUpperCase());
    console.log("Parsed symbols (after splitting): ", symbolArray);

    if (!symbolArray || !Array.isArray(symbolArray) || symbolArray.length === 0) {
      return NextResponse.json({ error: 'No stock symbols provided' }, { status: 400 });
    }

    // 심볼별로 Flask 서버에 요청 보내기
    const promises = symbolArray.map(async (symbol: string) => {
    console.log(`Sending request for symbol: ${symbol.toUpperCase()}`); // 심볼 로그 출력

      const response = await fetch(FLASK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol: symbol.toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error fetching stock data');
      }

      // console.log(`Received data for symbol: ${symbol.toUpperCase()}`, data); // 응답 데이터 로그 출력

      return { symbol: symbol.toUpperCase(), data };
    });

    

    // 모든 요청이 완료될 때까지 기다림
    const stockData = await Promise.all(promises);

    console.log("stockData: ", stockData);


    // 성공적으로 데이터를 받아오면 반환
    return NextResponse.json(stockData);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json({ error: 'Error fetching stock data' }, { status: 500 });
  }
}
