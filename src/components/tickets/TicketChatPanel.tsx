import {
  Alert,
  Box,
  Button,
  Group,
  Loader,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Textarea,
} from '@mantine/core'
import { IconSend } from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './chatMarkdown.css'
import {
  approveAssignment,
  getChatMessages,
  sendChatMessage,
} from '../../api/chat'
import { patchTicket } from '../../api/tickets'
import { ApiError } from '../../api/client'
import { formatDateTime } from '../../lib/format'
import { basePalette } from '../../theme/basePalette'
import type {
  ChatMessage,
  PendingAssignmentAction,
} from '../../types/chat'
import type { TicketStatus } from '../../types/ticket'

type TicketChatPanelProps = {
  ticketId: string
  ticketStatus?: TicketStatus | null
  onTicketUpdated?: () => void
}

function shouldDismissPendingAfterApproveError(err: unknown): boolean {
  if (!(err instanceof ApiError)) {
    return false
  }
  if (err.status === 400) {
    return true
  }
  return /already assigned|invalid technician|not found/i.test(err.detail)
}

export function TicketChatPanel({
  ticketId,
  ticketStatus = null,
  onTicketUpdated,
}: TicketChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [pendingAction, setPendingAction] =
    useState<PendingAssignmentAction | null>(null)
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [approveNotes, setApproveNotes] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const viewportRef = useRef<HTMLDivElement>(null)
  /** After approve/dismiss, history may still include stale pending_action on old rows. */
  const skipPendingRestoreRef = useRef(false)
  const isInitialLoadRef = useRef(true)

  const scrollToBottom = useCallback(() => {
    viewportRef.current?.scrollTo({
      top: viewportRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [])

  const loadMessages = useCallback(async (options?: { restorePending?: boolean }) => {
    const initial = isInitialLoadRef.current
    if (initial) {
      setLoading(true)
    }
    setError(null)
    try {
      const response = await getChatMessages(ticketId)
      setMessages(response.items)
      const shouldRestorePending =
        options?.restorePending !== false && !skipPendingRestoreRef.current
      if (shouldRestorePending) {
        const lastPending = [...response.items]
          .reverse()
          .find(
            (message) =>
              message.role === 'assistant' && message.pending_action !== null,
          )
        setPendingAction(lastPending?.pending_action ?? null)
        if (lastPending?.pending_action?.notes) {
          setApproveNotes(lastPending.pending_action.notes)
        }
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.detail : 'Failed to load chat history',
      )
    } finally {
      if (initial) {
        setLoading(false)
        isInitialLoadRef.current = false
      }
    }
  }, [ticketId])

  useEffect(() => {
    isInitialLoadRef.current = true
    skipPendingRestoreRef.current = false
    setMessages([])
    setPendingAction(null)
    setApproveNotes('')
    setError(null)
    void loadMessages()
  }, [loadMessages, ticketId])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = async () => {
    const text = draft.trim()
    if (!text || sending) {
      return
    }
    setSending(true)
    setError(null)
    const optimisticUser: ChatMessage = {
      id: `local-${Date.now()}`,
      role: 'user',
      content: text,
      pending_action: null,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticUser])
    setDraft('')

    try {
      const response = await sendChatMessage(ticketId, text)
      const assistantMessage: ChatMessage = {
        id: `local-assistant-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        pending_action: response.pending_action,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      if (response.pending_action) {
        skipPendingRestoreRef.current = false
        setPendingAction(response.pending_action)
        setApproveNotes(response.pending_action.notes)
      } else {
        setPendingAction(null)
      }
      void loadMessages({ restorePending: false })
    } catch (err) {
      setMessages((prev) => prev.filter((message) => message.id !== optimisticUser.id))
      setDraft(text)
      setError(
        err instanceof ApiError ? err.detail : 'Failed to send message',
      )
    } finally {
      setSending(false)
    }
  }

  const handleApprove = async () => {
    if (!pendingAction || approving) {
      return
    }
    setApproving(true)
    setError(null)
    try {
      await approveAssignment(ticketId, {
        technician_id: pendingAction.technician_id,
        notes: approveNotes.trim() || pendingAction.notes || null,
      })
      skipPendingRestoreRef.current = true
      setPendingAction(null)
      setApproveNotes('')
      onTicketUpdated?.()
      await loadMessages({ restorePending: false })
    } catch (err) {
      const detail =
        err instanceof ApiError ? err.detail : 'Failed to approve assignment'
      setError(detail)
      if (shouldDismissPendingAfterApproveError(err)) {
        skipPendingRestoreRef.current = true
        setPendingAction(null)
        setApproveNotes('')
        onTicketUpdated?.()
      }
    } finally {
      setApproving(false)
    }
  }

  const handleDismissAssignment = async () => {
    if (approving || rejecting) {
      return
    }

    if (ticketStatus !== 'open') {
      skipPendingRestoreRef.current = true
      setPendingAction(null)
      return
    }

    setRejecting(true)
    setError(null)
    try {
      await patchTicket(ticketId, {
        status: 'rejected',
        reason: rejectReason.trim() || null,
      })
      skipPendingRestoreRef.current = true
      setPendingAction(null)
      setRejectReason('')
      onTicketUpdated?.()
      await loadMessages({ restorePending: false })
    } catch (err) {
      setError(
        err instanceof ApiError ? err.detail : 'Failed to reject ticket',
      )
    } finally {
      setRejecting(false)
    }
  }

  return (
    <Stack gap="sm" h="100%" style={{ minHeight: 0 }}>
      <Text size="sm" fw={600}>
        AI assistant
      </Text>
      <Text size="xs" c="dimmed">
        Ask about this ticket or request technician dispatch.
      </Text>

      {error ? (
        <Alert color="red" variant="light" onClose={() => setError(null)} withCloseButton>
          {error}
        </Alert>
      ) : null}

      <Paper
        withBorder
        p="sm"
        radius="md"
        style={{
          flex: 1,
          minHeight: 200,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: basePalette.white,
        }}
      >
        {loading ? (
          <Group justify="center" py="xl" style={{ flex: 1 }}>
            <Loader color="gray" size="sm" />
          </Group>
        ) : (
          <ScrollArea
            style={{ flex: 1 }}
            viewportRef={viewportRef}
            offsetScrollbars
          >
            <Stack gap="sm" pr="xs">
              {messages.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center" py="lg">
                  No messages yet. Ask a question about this ticket.
                </Text>
              ) : (
                messages.map((message) => (
                  <ChatBubble key={message.id} message={message} />
                ))
              )}
            </Stack>
          </ScrollArea>
        )}
      </Paper>

      {pendingAction && ticketStatus === 'open' ? (
        <Paper p="md" withBorder bg="brand.0">
          <Stack gap="sm">
            <Text size="sm" fw={600}>
              Confirm assignment
            </Text>
            <Text size="sm">
              Assign <strong>{pendingAction.technician_name}</strong> to this
              ticket?
            </Text>
            <Textarea
              label="Dispatch notes"
              minRows={2}
              value={approveNotes}
              onChange={(event) => setApproveNotes(event.currentTarget.value)}
            />
            {ticketStatus === 'open' ? (
              <Textarea
                label="Rejection reason (optional)"
                description="Dismiss rejects this ticket without dispatch."
                minRows={2}
                value={rejectReason}
                onChange={(event) => setRejectReason(event.currentTarget.value)}
              />
            ) : null}
            <Group justify="flex-end">
              <Button
                variant="default"
                onClick={() => void handleDismissAssignment()}
                loading={rejecting}
                disabled={approving}
              >
                {ticketStatus === 'open' ? 'Dismiss' : 'Close'}
              </Button>
              <Button
                onClick={handleApprove}
                loading={approving}
                disabled={rejecting || ticketStatus !== 'open'}
              >
                Approve assignment
              </Button>
            </Group>
          </Stack>
        </Paper>
      ) : null}

      <Group align="flex-end" gap="xs" wrap="nowrap">
        <Textarea
          placeholder="Message…"
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
          minRows={2}
          autosize
          maxRows={5}
          style={{ flex: 1 }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              void handleSend()
            }
          }}
        />
        <Button
          onClick={handleSend}
          loading={sending}
          disabled={!draft.trim()}
          leftSection={<IconSend size={16} stroke={1.75} />}
        >
          Send
        </Button>
      </Group>
    </Stack>
  )
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <Box
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '92%',
      }}
    >
      <Paper
        p="sm"
        radius="md"
        bg={isUser ? 'brand.0' : 'gray.0'}
        withBorder={!isUser}
      >
        <Text size="xs" c="dimmed" mb={4}>
          {isUser ? 'You' : 'Assistant'} · {formatDateTime(message.created_at)}
        </Text>
        <ChatMessageBody content={message.content} isUser={isUser} />
      </Paper>
    </Box>
  )
}

function ChatMessageBody({
  content,
  isUser,
}: {
  content: string
  isUser: boolean
}) {
  if (isUser) {
    return (
      <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
        {content}
      </Text>
    )
  }

  return (
    <Box className="chat-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </Box>
  )
}
