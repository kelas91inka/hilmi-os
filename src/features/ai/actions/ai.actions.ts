'use server';

import { aiRepository } from '../repositories/ai.repository';

export async function getConversationsAction() {
  try {
    const data = await aiRepository.getConversations();
    return { success: true, data };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

export async function getConversationMessagesAction(conversationId: string) {
  try {
    const data = await aiRepository.getMessages(conversationId);
    return { success: true, data };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

export async function createConversationAction(title: string) {
  try {
    const data = await aiRepository.createConversation(title);
    return { success: true, data };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

export async function saveMessageAction(conversationId: string, role: string, content: string) {
  try {
    const data = await aiRepository.saveMessage(conversationId, role, content);
    return { success: true, data };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}
