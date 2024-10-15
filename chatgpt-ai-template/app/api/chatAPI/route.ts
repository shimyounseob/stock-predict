import { ChatBody } from '@/types/types';
import { OpenAIStream } from '@/utils/chatStream';

export const runtime = 'edge';

/*
  POST 요청에 대해 실행되는 함수임
  이 함수는 클라이언트가 HTTP POST 요청을 보낼 때 실행됨
  POST 요청은 보통 데이터를 서버로 전송할 때 사용됨
  이 함수는 사용자의 입력을 받아 GPT API에 요청을 보내고, 응답을 스트림 방식으로 반환함
*/
export async function POST(req: Request): Promise<Response> {
  try {
    // 요청에서 inputCode와 model을 추출
    const { inputCode, model } = await req.json() as { inputCode: { ticker: string }, model: string }; 
    console.log("chatAPI inputCode:", inputCode);
    
    // inputCode가 객체로 전달되었으므로 ticker 값을 추출
    const stockSymbol = inputCode.ticker.trim().toUpperCase();
    console.log("chatAPI stockSymbol:", stockSymbol); // 추출한 티커 로그


    // 주가 데이터 텍스트 생략
    const prompt = `
    You are a stock market expert. When a user asks about a stock, provide the following information in a structured format.
    If the stock ticker is invalid or the stock does not exist, simply inform the user that the stock ticker might be incorrect and ask them to verify and re-enter the correct ticker. Do not suggest any alternative tickers.
    Respond with the following structured information for all stocks combined without separating them by company name:

    **Introduction to the company:**
    Provide a brief introduction about each company associated with the stock ticker separately. Each company should have its own introduction clearly separated from the others. Include key details like what the company does, its history, and its position in the industry. Write in full sentences without using bullet points, numbering, or symbols. Ensure that each introduction is clearly distinguishable for each company.

    **1. Strengths of the stock:**
    For each company, write about 4 key strengths. Ensure that each company has its strengths clearly separated from the others. Write in full sentences without using bullet points, numbering, or symbols. Each strength should be part of a separate paragraph for clarity.
    
    **2. Weaknesses of the stock:**
    For each company, write about 4 key weaknesses. Ensure that each company has its weaknesses clearly separated from the others. Write in full sentences without using bullet points, numbering, or symbols. Each weakness should be part of a separate paragraph for clarity.
    
    **3. Stock price data**
    
    
    **4. Similar stocks:**
    List some similar stocks in the same industry.
    
    **5. Industry outlook:**
    Analyze the industry this stock belongs to and provide a future outlook.
    
    **6. Final Summary:**
    Provide a concise final summary about the stock.
    
    If the stock ticker provided by the user is incorrect or missing, inform them that the ticker is invalid and ask them to check and provide the correct stock ticker without suggesting alternatives.
    
    User's query: ${stockSymbol}
    `;

    const apiKeyFinal = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    // OpenAI API 호출 및 스트림 생성
    const stream = await OpenAIStream(prompt, model, apiKeyFinal);

    return new Response(stream);
  } catch (error) {
    // 에러를 콘솔에 로그로 출력
    console.error('Error occurred while processing the request:', error);

    // 에러 메시지를 클라이언트에 반환
    return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`, { status: 500 });
  }
}
