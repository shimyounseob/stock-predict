import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from 'C:/Users/shimyunseop/vsworkspace/chat-stock/chatgpt-ai-template/app/api/auth/[...nextauth]/route';  // 경로 수정
import clientPromise from 'C:/Users/shimyunseop/vsworkspace/chat-stock/chatgpt-ai-template/lib/mongodb';  // 경로 수정
import { ObjectId } from 'mongodb';

// 채팅 메시지 생성 함수 (POST 요청)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.redirect('/api/auth/signin');
  }

  try {
    const body = await request.json();
    const { roomId, message } = body;

    const client = await clientPromise;
    const db = client.db('chat-db');

    // 새로운 채팅 메시지 저장
    const newMessage = await db.collection('messages').insertOne({
      roomId, // 채팅방 ID
      userId: session.user.email, // 메시지 작성자
      message, // 메시지 내용
      createdAt: new Date(), // 작성 시간
    });

    return NextResponse.json({ message: 'Message created', newMessage });
  } catch (error) {
    console.error('메시지 생성 중 에러 발생:', error);
    return NextResponse.json({ message: 'Error creating message' });
  }
}

// 채팅 메시지 조회 함수 (GET 요청)
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.redirect('/api/auth/signin');
  }

  try {
    const roomId = request.url.split('/').pop(); // URL에서 채팅방 ID 추출

    const client = await clientPromise;
    const db = client.db('chat-db');

    // 해당 채팅방의 모든 메시지 조회
    const messages = await db
      .collection('messages')
      .find({ roomId })
      .toArray();

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('메시지 조회 중 에러 발생:', error);
    return NextResponse.json({ message: 'Error fetching messages' });
  }
}

// 채팅 메시지 삭제 함수 (DELETE 요청)
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.redirect('/api/auth/signin');
  }

  try {
    const { messageId } = await request.json();

    const client = await clientPromise;
    const db = client.db('chat-db');

    // 메시지 삭제
    const result = await db.collection('messages').deleteOne({
      _id: new ObjectId(messageId), // 삭제할 메시지 ID
      userId: session.user.email, // 본인이 작성한 메시지만 삭제 가능
    });

    if (result.deletedCount === 1) {
      return NextResponse.json({ message: 'Message deleted' });
    } else {
      return NextResponse.json({ message: 'Message not found or not authorized' });
    }
  } catch (error) {
    console.error('메시지 삭제 중 에러 발생:', error);
    return NextResponse.json({ message: 'Error deleting message' });
  }
}
