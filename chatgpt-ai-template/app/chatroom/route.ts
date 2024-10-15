// MongoDB 클라이언트와 세션 관리 라이브러리 불러오기
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from 'C:/Users/shimyunseop/vsworkspace/chat-stock/chatgpt-ai-template/app/api/auth/[...nextauth]/route';  // 경로 수정
import clientPromise from 'C:/Users/shimyunseop/vsworkspace/chat-stock/chatgpt-ai-template/lib/mongodb';  // 경로 수정
import { ObjectId } from 'mongodb';

// 채팅방 생성 함수 (POST 요청)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.redirect('/api/auth/signin');
  }

  try {
    const body = await request.json();
    const { roomName, description } = body;

    const client = await clientPromise;
    const db = client.db('chat-db');

    const newChatRoom = await db.collection('chatrooms').insertOne({
      roomName,
      description,
      userId: session.user.email, // session.user?.email 수정
      createdAt: new Date(),
    });

    return NextResponse.json({ message: 'Chat room created', newChatRoom });
  } catch (error) {
    console.error('채팅방 생성 중 에러 발생:', error);
    return NextResponse.json({ message: 'Error creating chat room' });
  }
}

// 채팅방 목록 조회 함수 (GET 요청)
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.redirect('/api/auth/signin');
  }

  try {
    const client = await clientPromise;
    const db = client.db('chat-db');

    const chatRooms = await db
      .collection('chatrooms')
      .find({ userId: session.user.email }) // session.user?.email 수정
      .toArray();

    return NextResponse.json({ chatRooms });
  } catch (error) {
    console.error('채팅방 조회 중 에러 발생:', error);
    return NextResponse.json({ message: 'Error fetching chat rooms' });
  }
}

// 채팅방 삭제 함수 (DELETE 요청)
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.redirect('/api/auth/signin');
  }

  try {
    const { roomId } = await request.json();

    const client = await clientPromise;
    const db = client.db('chat-db');

    const result = await db.collection('chatrooms').deleteOne({
      _id: new ObjectId(roomId),
      userId: session.user.email, // session.user?.email 수정
    });

    if (result.deletedCount === 1) {
      return NextResponse.json({ message: 'Chat room deleted' });
    } else {
      return NextResponse.json({ message: 'Chat room not found or not authorized' });
    }
  } catch (error) {
    console.error('채팅방 삭제 중 에러 발생:', error);
    return NextResponse.json({ message: 'Error deleting chat room' });
  }
}
