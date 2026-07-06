import { NextResponse } from 'next/server';
import { getConversationsAction, getConversationMessagesAction } from '@/features/ai/actions/ai.actions';

export async function GET() {
  const convs = await getConversationsAction();
  if (!convs.success || !convs.data?.length) {
    return NextResponse.json({ error: "No convs" });
  }
  
  const msgs = await getConversationMessagesAction(convs.data[0].id);
  return NextResponse.json(msgs);
}
