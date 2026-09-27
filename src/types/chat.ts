export type ChatMessageRole = 'user' | 'assistant'

export type PendingAssignmentAction = {
  action: 'assign_technician'
  ticket_id: string
  technician_id: string
  technician_name: string
  notes: string
}

export type ChatMessage = {
  id: string
  role: ChatMessageRole
  content: string
  pending_action: PendingAssignmentAction | null
  created_at: string
}

export type ChatMessagesResponse = {
  ticket_id: string
  items: ChatMessage[]
}

export type SendChatMessageResponse = {
  reply: string
  pending_action: PendingAssignmentAction | null
}

export type ApproveAssignmentResponse = {
  ticket_id: string
  technician_id: string
  technician_name: string
}
