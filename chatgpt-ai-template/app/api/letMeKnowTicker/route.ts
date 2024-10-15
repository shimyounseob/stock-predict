import { ChatBody } from '@/types/types'; // ChatBody 임포트
import { OpenAIStream } from '@/utils/chatStream'; // OpenAIStream 임포트

export async function POST(req: Request): Promise<Response> {
    try {
        console.log('Request received'); // 요청이 수신되었음을 로그로 출력

        const { inputCode, model } = (await req.json()) as ChatBody;
        console.log('Parsed request body:', { inputCode, model }); // 요청 본문 파싱 완료

        const stockQuery = inputCode.trim();
        console.log('Stock query:', stockQuery); // 사용자 입력에서 주식 심볼 추출 후 출력

        // 티커를 추출하기 위한 프롬프트 생성
        const prompt = `
        The user has input "${stockQuery}". 
        If the input contains multiple stock symbols, respond only with the stock ticker symbols, separated by commas (e.g., "TICKER1, TICKER2, TICKER3"). 
        If the input contains only one stock symbol, respond with just that ticker symbol (e.g., "AAPL"). 
        Do not include any explanations, extra information, or suggestions. 
        Make sure the ticker symbols are formatted without line breaks or numbering.
        `;

        const apiKeyFinal = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

        // OpenAI API 호출
        console.log('Calling OpenAI API...');
        const stream = await OpenAIStream(prompt, model, apiKeyFinal);
        console.log('Received stream from OpenAI API'); // API 호출 결과 로그

        // 스트림 데이터를 수동으로 읽음
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let responseText = '';

        console.log('Reading stream data...');
        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            responseText += decoder.decode(value);
            console.log('Chunk of data received:', responseText); // 스트림 데이터 청크별로 로그 출력
        }

        console.log('Complete response text:', responseText); // 전체 응답 로그

        if (responseText.includes('invalid ticker')) {
            console.error('Invalid ticker detected');
            throw new Error('Invalid ticker received.');
        }

        console.log('Ticker extraction successful:', responseText);
        return new Response(JSON.stringify({ ticker: responseText }), { status: 200 });
    } catch (error) {
        console.error('Error occurred while processing the request:', error);
        return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`, { status: 500 });
    }
}
