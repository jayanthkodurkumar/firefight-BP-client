import { useCallback, useEffect, useRef, useState } from 'react'
import { listTickets } from '../api/tickets'
import { ApiError } from '../api/client'
import type {
  TicketListResponse,
  TicketStatusFilter,
} from '../types/ticket'

const POLL_INTERVAL_MS = 5000
const DEFAULT_LIMIT = 50

type UseTicketsListOptions = {
  status: TicketStatusFilter
  limit?: number
  offset: number
  poll?: boolean
}

type UseTicketsListResult = {
  data: TicketListResponse | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useTicketsList({
  status,
  limit = DEFAULT_LIMIT,
  offset,
  poll = true,
}: UseTicketsListOptions): UseTicketsListResult {
  const [data, setData] = useState<TicketListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  const fetchTickets = useCallback(
    async (options?: { silent?: boolean }) => {
      const id = ++requestId.current
      if (!options?.silent) {
        setLoading(true)
      }
      setError(null)

      try {
        const response = await listTickets({
          limit,
          offset,
          status: status === 'all' ? undefined : status,
        })
        if (id === requestId.current) {
          setData(response)
        }
      } catch (err) {
        if (id === requestId.current) {
          const message =
            err instanceof ApiError
              ? err.detail
              : err instanceof Error
                ? err.message
                : 'Failed to load tickets'
          setError(message)
        }
      } finally {
        if (id === requestId.current) {
          setLoading(false)
        }
      }
    },
    [limit, offset, status],
  )

  useEffect(() => {
    void fetchTickets()
  }, [fetchTickets])

  useEffect(() => {
    if (!poll) {
      return
    }
    const timer = window.setInterval(() => {
      void fetchTickets({ silent: true })
    }, POLL_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [fetchTickets, poll])

  return {
    data,
    loading,
    error,
    refresh: () => void fetchTickets(),
  }
}
