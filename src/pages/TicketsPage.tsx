import {
  Alert,
  Badge,
  Box,
  Button,
  Group,
  Loader,
  Pagination,
  Paper,
  SegmentedControl,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconFilter } from '@tabler/icons-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TicketDetailModal } from '../components/tickets/TicketDetailModal'
import { TicketFiltersModal } from '../components/tickets/TicketFiltersModal'
import { PriorityBadge } from '../components/tickets/PriorityBadge'
import { SeverityBadge } from '../components/tickets/SeverityBadge'
import { TicketStatusBadge } from '../components/tickets/TicketStatusBadge'
import { useTicketsList } from '../hooks/useTicketsList'
import { formatDateTime, formatUnitLocation } from '../lib/format'
import {
  applyTicketFilters,
  countActiveTicketFilters,
  EMPTY_TICKET_FILTERS,
  isTicketFiltersActive,
  parseTicketFilters,
  ticketFiltersToSearchParams,
  uniqueCategories,
} from '../lib/ticketFilters'
import type { TicketStatusFilter } from '../types/ticket'
import { basePalette } from '../theme/basePalette'

const PAGE_SIZE = 50
const CLIENT_FILTER_FETCH_LIMIT = 200

const statusOptions: { label: string; value: TicketStatusFilter }[] = [
  { label: 'Open', value: 'open' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'All', value: 'all' },
]

const STATUS_PARAM_VALUES = new Set<TicketStatusFilter>([
  'open',
  'assigned',
  'rejected',
  'resolved',
  'all',
])

function parseStatus(value: string | null): TicketStatusFilter {
  if (value && STATUS_PARAM_VALUES.has(value as TicketStatusFilter)) {
    return value as TicketStatusFilter
  }
  return 'open'
}

function parsePage(value: string | null): number {
  const page = Number(value ?? '1')
  if (!Number.isFinite(page) || page < 1) {
    return 1
  }
  return Math.floor(page)
}

export function TicketsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpened, { open: openFilters, close: closeFilters }] =
    useDisclosure(false)

  const status = parseStatus(searchParams.get('status'))
  const page = parsePage(searchParams.get('page'))
  const selectedTicketId = searchParams.get('ticket')
  const filters = parseTicketFilters(searchParams)
  const filtersActive = isTicketFiltersActive(filters)
  const activeFilterCount = countActiveTicketFilters(filters)

  const apiOffset = filtersActive ? 0 : (page - 1) * PAGE_SIZE
  const apiLimit = filtersActive ? CLIENT_FILTER_FETCH_LIMIT : PAGE_SIZE

  const { data, loading, error, refresh } = useTicketsList({
    status,
    limit: apiLimit,
    offset: apiOffset,
    poll: status === 'open' && !filtersActive,
  })

  const filteredItems = useMemo(
    () => (data ? applyTicketFilters(data.items, filters) : []),
    [data, filters],
  )

  const categoryOptions = useMemo(
    () => (data ? uniqueCategories(data.items) : []),
    [data],
  )

  const tableItems = filtersActive
    ? filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : filteredItems

  const totalForPagination = filtersActive
    ? filteredItems.length
    : (data?.total ?? 0)

  const totalPages = Math.max(1, Math.ceil(totalForPagination / PAGE_SIZE))

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) {
        next.delete(key)
      } else {
        next.set(key, value)
      }
    }
    setSearchParams(next)
  }

  const setStatus = (next: TicketStatusFilter) => {
    updateParams({ status: next, page: '1' })
  }

  const setPage = (nextPage: number) => {
    updateParams({ page: String(nextPage) })
  }

  const setFilters = (next: typeof filters) => {
    updateParams({ ...ticketFiltersToSearchParams(next), page: '1' })
  }

  const clearFilters = () => {
    updateParams({ ...ticketFiltersToSearchParams(EMPTY_TICKET_FILTERS), page: '1' })
  }

  const openTicket = (ticketId: string) => {
    updateParams({ ticket: ticketId })
  }

  const closeTicket = () => {
    updateParams({ ticket: null })
  }

  return (
    <>
      <Stack gap="lg" maw={1400}>
        <Paper p="lg">
          <Group justify="space-between" align="flex-end" wrap="wrap">
            <div>
              <Title order={2} fw={600}>
                Tickets
              </Title>
              {status === 'open' && !filtersActive ? (
                <Text c="dimmed" size="sm" mt={6}>
                  Live refresh every 5s
                </Text>
              ) : null}
            </div>
            <Group gap="sm">
              <Button
                variant={filtersActive ? 'light' : 'default'}
                color={filtersActive ? 'brand' : 'gray'}
                leftSection={<IconFilter size={16} stroke={1.75} />}
                onClick={openFilters}
                rightSection={
                  activeFilterCount > 0 ? (
                    <Badge size="sm" circle color="brand">
                      {activeFilterCount}
                    </Badge>
                  ) : undefined
                }
              >
                Filters
              </Button>
              <SegmentedControl
                value={status}
                onChange={(value) => setStatus(value as TicketStatusFilter)}
                data={statusOptions}
                color="brand"
              />
              <Button
                variant="default"
                onClick={refresh}
                loading={loading && !data}
              >
                Refresh
              </Button>
            </Group>
          </Group>
        </Paper>

        {error ? (
          <Alert color="red" title="Could not load tickets" variant="light">
            {error}
          </Alert>
        ) : null}

        <Paper p={0} style={{ overflow: 'hidden' }}>
          {loading && !data ? (
            <Group justify="center" py="xl">
              <Loader color="gray" />
            </Group>
          ) : (
            <>
              <Box style={{ overflowX: 'auto' }}>
                <Table
                  highlightOnHover
                  verticalSpacing="sm"
                  horizontalSpacing="md"
                  styles={{
                    thead: {
                      backgroundColor: basePalette.grey5,
                    },
                    th: {
                      fontWeight: 600,
                      color: basePalette.grey80,
                      fontSize: 'var(--mantine-font-size-xs)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    },
                    tr: {
                      cursor: 'pointer',
                    },
                  }}
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Ticket</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Assigned to</Table.Th>
                      <Table.Th>Severity</Table.Th>
                      <Table.Th>Priority</Table.Th>
                      <Table.Th>Rule</Table.Th>
                      <Table.Th>Unit / site</Table.Th>
                      <Table.Th>Recorded</Table.Th>
                      <Table.Th>Created</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {tableItems.length ? (
                      tableItems.map((ticket) => {
                        const isSelected = selectedTicketId === ticket.ticket_id
                        return (
                          <Table.Tr
                            key={ticket.ticket_id}
                            onClick={() => openTicket(ticket.ticket_id)}
                            bg={isSelected ? 'brand.0' : undefined}
                          >
                            <Table.Td>
                              <Text fw={600} size="sm" c={basePalette.green90}>
                                {ticket.ticket_id}
                              </Text>
                              {ticket.dtc ? (
                                <Text size="xs" c="dimmed">
                                  DTC {ticket.dtc}
                                </Text>
                              ) : null}
                            </Table.Td>
                            <Table.Td>
                              <TicketStatusBadge status={ticket.status} />
                            </Table.Td>
                            <Table.Td>
                              <Text size="sm">
                                {ticket.assigned_to?.name ?? '—'}
                              </Text>
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
                              {ticket.category ? (
                                <Text size="xs" c="dimmed">
                                  {ticket.category}
                                </Text>
                              ) : null}
                            </Table.Td>
                            <Table.Td>
                              <Text size="sm">
                                {formatUnitLocation(ticket.unit)}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Text size="sm">
                                {formatDateTime(ticket.recorded_at)}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Text size="sm">
                                {formatDateTime(ticket.created_at)}
                              </Text>
                            </Table.Td>
                          </Table.Tr>
                        )
                      })
                    ) : (
                      <Table.Tr>
                        <Table.Td colSpan={9}>
                          <Text ta="center" c="dimmed" py="xl">
                            No tickets match this filter.
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </Box>

              {totalForPagination > PAGE_SIZE ? (
                <Group
                  justify="space-between"
                  p="md"
                  style={{ borderTop: `1px solid ${basePalette.grey20}` }}
                  align="center"
                >
                  <Text size="sm" c="dimmed">
                    {filtersActive
                      ? `${totalForPagination} matching ticket${totalForPagination === 1 ? '' : 's'}`
                      : `${totalForPagination} ticket${totalForPagination === 1 ? '' : 's'}`}
                  </Text>
                  <Pagination
                    total={totalPages}
                    value={Math.min(page, totalPages)}
                    onChange={setPage}
                    color="brand"
                  />
                </Group>
              ) : totalForPagination > 0 || data ? (
                <Text
                  size="sm"
                  c="dimmed"
                  p="md"
                  style={{ borderTop: `1px solid ${basePalette.grey20}` }}
                >
                  {filtersActive
                    ? `${totalForPagination} matching ticket${totalForPagination === 1 ? '' : 's'}`
                    : `${totalForPagination} ticket${totalForPagination === 1 ? '' : 's'}`}
                </Text>
              ) : null}
            </>
          )}
        </Paper>
      </Stack>

      <TicketFiltersModal
        opened={filtersOpened}
        onClose={closeFilters}
        filters={filters}
        categoryOptions={categoryOptions}
        onApply={setFilters}
        onClear={clearFilters}
        filtersActive={filtersActive}
        showFetchLimitNote={
          Boolean(data && data.total > CLIENT_FILTER_FETCH_LIMIT)
        }
      />

      <TicketDetailModal
        ticketId={selectedTicketId}
        opened={Boolean(selectedTicketId)}
        onClose={closeTicket}
        onTicketUpdated={refresh}
      />
    </>
  )
}
