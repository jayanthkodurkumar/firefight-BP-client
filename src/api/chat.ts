import { apiGet, apiPost } from './client'
import type {
  ApproveAssignmentResponse,
  ChatMessagesResponse,
  SendChatMessageResponse,
} from '../types/chat'

export function getChatMessages(ticketId: string): Promise<ChatMessagesResponse> {
  return apiGet<ChatMessagesResponse>(
    `/api/tickets/${encodeURIComponent(ticketId)}/chat/messages`,
  )
}

export function sendChatMessage(
  ticketId: string,
  message: string,
): Promise<SendChatMessageResponse> {
  return apiPost<SendChatMessageResponse>(
    `/api/tickets/${encodeURIComponent(ticketId)}/chat/messages`,
    { message },
  )
}

export function approveAssignment(
  ticketId: string,
  payload: { technician_id: string; notes?: string | null },
): Promise<ApproveAssignmentResponse> {
  return apiPost<ApproveAssignmentResponse>(
    `/api/tickets/${encodeURIComponent(ticketId)}/chat/approve-assignment`,
    payload,
  )
}
