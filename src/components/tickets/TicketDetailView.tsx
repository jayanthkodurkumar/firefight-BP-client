import {
  Alert,
  Badge,
  Button,
  Code,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconAdjustments } from '@tabler/icons-react'
import { useEffect, useState, type ReactNode } from 'react'
import { ApiError } from '../../api/client'
import { listTechnicians } from '../../api/technicians'
import { assignTicket, getTicket, patchTicket } from '../../api/tickets'
import type { Technician } from '../../types/technician'
import { formatDateTime, formatUnitLocation } from '../../lib/format'
import { basePalette } from '../../theme/basePalette'
import {
  canManualAssignTicket,
  canRejectTicket,
  canResolveTicket,
  canShowTicketActions,
  type TicketDetail,
} from '../../types/ticket'
import { PriorityBadge } from './PriorityBadge'
import { SeverityBadge } from './SeverityBadge'
import { TicketActionsModal } from './TicketActionsModal'
import { TicketStatusBadge } from './TicketStatusBadge'

function MetaItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Paper p="md">
      <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={6}>
        {label}
      </Text>
      <div>{children}</div>
    </Paper>
  )
}

function snapshotRows(snapshot: Record<string, unknown>): [string, string][] {
  return Object.entries(snapshot)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => [key, formatSnapshotValue(value)])
}

function formatSnapshotValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '—'
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

type TicketDetailViewProps = {
  ticketId: string
  /** Increment to refetch without clearing the panel (e.g. after assignment). */
  refreshKey?: number
  onTicketLoaded?: (ticket: TicketDetail) => void
  onTicketUpdated?: () => void
  /** Fired when a nested dialog (e.g. actions) opens or closes. */
  onNestedOverlayChange?: (open: boolean) => void
}

export function TicketDetailView({
  ticketId,
  refreshKey = 0,
  onTicketLoaded,
  onTicketUpdated,
  onNestedOverlayChange,
}: TicketDetailViewProps) {
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [resolving, setResolving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<
    string | null
  >(null)
  const [assignNotes, setAssignNotes] = useState('')
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [techniciansLoading, setTechniciansLoading] = useState(false)
  const [techniciansError, setTechniciansError] = useState<string | null>(null)
  const [actionsOpened, { open: openActions, close: closeActions }] =
    useDisclosure(false)

  useEffect(() => {
    onNestedOverlayChange?.(actionsOpened)
  }, [actionsOpened, onNestedOverlayChange])

  useEffect(() => {
    let cancelled = false
    const silentRefresh = refreshKey > 0

    if (!silentRefresh) {
      setLoading(true)
      setError(null)
      setTicket(null)
    }

    getTicket(ticketId)
      .then((data) => {
        if (!cancelled) {
          setTicket(data)
          setError(null)
          onTicketLoaded?.(data)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const message =
            err instanceof ApiError
              ? err.detail
              : err instanceof Error
                ? err.message
                : 'Failed to load ticket'
          setError(message)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [ticketId, refreshKey])

  useEffect(() => {
    if (!actionsOpened || !ticket || !canManualAssignTicket(ticket.status)) {
      return
    }

    let cancelled = false
    setTechniciansLoading(true)
    setTechniciansError(null)

    listTechnicians()
      .then((data) => {
        if (!cancelled) {
          setTechnicians(data.items)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setTechnicians([])
          setTechniciansError(
            err instanceof ApiError
              ? err.detail
              : 'Failed to load technicians',
          )
        }
      })
      .finally(() => {
        if (!cancelled) {
          setTechniciansLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [actionsOpened, ticket?.status, ticket?.ticket_id])

  const resetActionForm = () => {
    setRejectReason('')
    setAssignNotes('')
    setSelectedTechnicianId(null)
    setActionError(null)
  }

  const handleAssign = async () => {
    if (
      !ticket ||
      !selectedTechnicianId ||
      assigning ||
      rejecting ||
      resolving ||
      !canManualAssignTicket(ticket.status)
    ) {
      return
    }
    setAssigning(true)
    setActionError(null)
    try {
      await assignTicket(ticket.ticket_id, {
        technician_id: selectedTechnicianId,
        notes: assignNotes.trim() || null,
      })
      resetActionForm()
      closeActions()
      onTicketUpdated?.()
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.detail : 'Failed to assign technician',
      )
    } finally {
      setAssigning(false)
    }
  }

  const handleResolve = async () => {
    if (!ticket || resolving || rejecting || assigning || !canResolveTicket(ticket.status)) {
      return
    }
    setResolving(true)
    setActionError(null)
    try {
      await patchTicket(ticket.ticket_id, { status: 'resolved' })
      closeActions()
      onTicketUpdated?.()
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.detail : 'Failed to resolve ticket',
      )
    } finally {
      setResolving(false)
    }
  }

  const handleReject = async () => {
    if (!ticket || rejecting || resolving || assigning || !canRejectTicket(ticket.status)) {
      return
    }
    setRejecting(true)
    setActionError(null)
    try {
      await patchTicket(ticket.ticket_id, {
        status: 'rejected',
        reason: rejectReason.trim() || null,
      })
      setRejectReason('')
      closeActions()
      onTicketUpdated?.()
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.detail : 'Failed to reject ticket',
      )
    } finally {
      setRejecting(false)
    }
  }

  if (loading) {
    return (
      <Group justify="center" py="xl">
        <Loader color="gray" />
      </Group>
    )
  }

  if (error || !ticket) {
    return (
      <Alert color="red" title="Ticket unavailable">
        {error ?? 'Ticket not found'}
      </Alert>
    )
  }

  const snapshot = snapshotRows(ticket.state_snapshot)
  const hasActions = canShowTicketActions(ticket.status)

  return (
    <Stack gap="lg">
      <Paper p="lg">
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <div>
            <Title order={2}>{ticket.ticket_id}</Title>
            <Text c="dimmed" size="sm" mt={6}>
              {formatUnitLocation(ticket.unit)}
            </Text>
          </div>
          <Group gap="xs" align="flex-start">
            <TicketStatusBadge status={ticket.status} />
            <SeverityBadge severity={ticket.severity} />
            <PriorityBadge priority={ticket.priority} />
            {hasActions ? (
              <Button
                size="compact-sm"
                variant="light"
                color="brand"
                leftSection={<IconAdjustments size={16} stroke={1.75} />}
                onClick={openActions}
              >
                Actions
              </Button>
            ) : null}
          </Group>
        </Group>
      </Paper>

      <TicketActionsModal
        opened={actionsOpened}
        onClose={() => {
          closeActions()
          resetActionForm()
        }}
        ticketId={ticket.ticket_id}
        status={ticket.status}
        technicians={technicians}
        techniciansLoading={techniciansLoading}
        techniciansError={techniciansError}
        selectedTechnicianId={selectedTechnicianId}
        onSelectedTechnicianChange={setSelectedTechnicianId}
        assignNotes={assignNotes}
        onAssignNotesChange={setAssignNotes}
        onAssign={() => void handleAssign()}
        assigning={assigning}
        rejectReason={rejectReason}
        onRejectReasonChange={setRejectReason}
        onReject={() => void handleReject()}
        onResolve={() => void handleResolve()}
        rejecting={rejecting}
        resolving={resolving}
        error={actionError}
      />

      <Paper p="lg" bg="brand.0">
        <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="sm">
          What happened
        </Text>
        <Stack gap="sm">
          <Text fw={600}>
            {ticket.primary_rule?.name ??
              ticket.primary_rule_id ??
              'No primary rule'}
          </Text>
          {ticket.hint ? (
            <Text style={{ whiteSpace: 'pre-wrap' }}>{ticket.hint}</Text>
          ) : (
            <Text c="dimmed">No triage hint on this ticket.</Text>
          )}
          {ticket.fired_rule_details.length > 0 ? (
            <Group gap="xs">
              {ticket.fired_rule_details.map((rule) => (
                <Badge key={rule.id} variant="light" color="gray">
                  {rule.name}
                </Badge>
              ))}
            </Group>
          ) : null}
        </Stack>
      </Paper>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        <MetaItem label="Recorded">
          <Text size="sm">{formatDateTime(ticket.recorded_at)}</Text>
        </MetaItem>
        <MetaItem label="Created">
          <Text size="sm">{formatDateTime(ticket.created_at)}</Text>
        </MetaItem>
        <MetaItem label="Category">
          <Text size="sm">{ticket.category ?? '—'}</Text>
        </MetaItem>
        <MetaItem label="Skill">
          <Text size="sm">{ticket.skill ?? '—'}</Text>
        </MetaItem>
        {ticket.assigned_to ||
        ticket.assigned_by ||
        ticket.assigned_at ||
        ticket.dispatch_notes ? (
          <>
            <MetaItem label="Assigned to">
              <Text size="sm">{ticket.assigned_to?.name ?? '—'}</Text>
            </MetaItem>
            <MetaItem label="Assigned by">
              <Text size="sm">{ticket.assigned_by?.email ?? '—'}</Text>
            </MetaItem>
            <MetaItem label="Assigned at">
              <Text size="sm">
                {ticket.assigned_at
                  ? formatDateTime(ticket.assigned_at)
                  : '—'}
              </Text>
            </MetaItem>
            {ticket.dispatch_notes ? (
              <MetaItem label="Dispatch notes">
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                  {ticket.dispatch_notes}
                </Text>
              </MetaItem>
            ) : null}
          </>
        ) : null}
        <MetaItem label="DTC">
          <Text size="sm">{ticket.dtc ?? '—'}</Text>
        </MetaItem>
        <MetaItem label="Record id">
          <Code
            block
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              fontSize: 'var(--mantine-font-size-xs)',
            }}
          >
            {ticket.record_id}
          </Code>
        </MetaItem>
      </SimpleGrid>

      <Paper p="lg">
        <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="md">
          State snapshot
          {snapshot.length > 0 ? ` · ${snapshot.length} signals` : ''}
        </Text>
        {snapshot.length === 0 ? (
          <Text c="dimmed">No signals in snapshot.</Text>
        ) : (
          <Table
            striped
            highlightOnHover
            withTableBorder
            styles={{
              table: { tableLayout: 'fixed', width: '100%' },
              td: { verticalAlign: 'top' },
            }}
          >
            <Table.Thead
              style={{ backgroundColor: basePalette.grey5 }}
            >
              <Table.Tr>
                <Table.Th w="35%">Signal</Table.Th>
                <Table.Th w="65%">Value</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {snapshot.map(([signal, value]) => (
                <Table.Tr key={signal}>
                  <Table.Td>
                    <Code style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {signal}
                    </Code>
                  </Table.Td>
                  <Table.Td>
                    <Text
                      size="sm"
                      style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                    >
                      {value}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>
    </Stack>
  )
}
