import { Box, Table, Text } from '@mantine/core'
import { PriorityBadge } from '../tickets/PriorityBadge'
import { SeverityBadge } from '../tickets/SeverityBadge'
import { TicketStatusBadge } from '../tickets/TicketStatusBadge'
import { formatDateTime, formatUnitLocation } from '../../lib/format'
import type { TechnicianTicketCase } from '../../types/technician'
import { basePalette } from '../../theme/basePalette'

type TechnicianCaseTableProps = {
  cases: TechnicianTicketCase[]
  emptyMessage: string
  onSelectTicket: (ticketId: string) => void
  selectedTicketId?: string | null
}

export function TechnicianCaseTable({
  cases,
  emptyMessage,
  onSelectTicket,
  selectedTicketId,
}: TechnicianCaseTableProps) {
  if (cases.length === 0) {
    return (
      <Text c="dimmed" size="sm" py="md">
        {emptyMessage}
      </Text>
    )
  }

  return (
    <Box style={{ overflowX: 'auto' }}>
      <Table
        highlightOnHover
        verticalSpacing="sm"
        horizontalSpacing="md"
        styles={{
          thead: { backgroundColor: basePalette.grey5 },
          th: {
            fontWeight: 600,
            color: basePalette.grey80,
            fontSize: 'var(--mantine-font-size-xs)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          },
          tr: { cursor: 'pointer' },
        }}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Ticket</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Severity</Table.Th>
            <Table.Th>Priority</Table.Th>
            <Table.Th>Rule</Table.Th>
            <Table.Th>Unit / site</Table.Th>
            <Table.Th>Assigned</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {cases.map((ticket) => {
            const isSelected = selectedTicketId === ticket.ticket_id
            return (
              <Table.Tr
                key={ticket.ticket_id}
                onClick={() => onSelectTicket(ticket.ticket_id)}
                bg={isSelected ? 'brand.0' : undefined}
              >
                <Table.Td>
                  <Text fw={600} size="sm" c={basePalette.green90}>
                    {ticket.ticket_id}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <TicketStatusBadge status={ticket.status} />
                </Table.Td>
                <Table.Td>
                  <SeverityBadge severity={ticket.severity} />
                </Table.Td>
                <Table.Td>
                  <PriorityBadge priority={ticket.priority} />
                </Table.Td>
                <Table.Td>
                  <Text size="sm" lineClamp={2}>
                    {ticket.primary_rule_name ??
                      ticket.primary_rule_id ??
                      '—'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{formatUnitLocation(ticket.unit)}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {ticket.assigned_at
                      ? formatDateTime(ticket.assigned_at)
                      : '—'}
                  </Text>
                </Table.Td>
              </Table.Tr>
            )
          })}
        </Table.Tbody>
      </Table>
    </Box>
  )
}
