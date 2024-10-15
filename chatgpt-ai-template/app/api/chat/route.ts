import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const client = await clientPromise;
  const db = client.db('your_database_name');
  const { chatRoomId, message } = await req.json();

  if (session) {
    await db.collection('chats').insertOne({
      email: session.user?.email,
      chatRoomId,
      message,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: 'Chat saved' });
  } else {
    return NextResponse.redirect('/api/auth/signin');
  }
}
