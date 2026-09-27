import {
  Alert,
  Badge,
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { listTechnicians } from '../api/technicians'
import { TechnicianDetailModal } from '../components/technicians/TechnicianDetailModal'
import { TicketDetailModal } from '../components/tickets/TicketDetailModal'
import { formatSpecialty } from '../lib/specialtyLabel'
import type { Technician } from '../types/technician'
import { basePalette } from '../theme/basePalette'

export function TechniciansPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileRefreshKey, setProfileRefreshKey] = useState(0)

  const selectedTechnicianId = searchParams.get('technician')
  const selectedTicketId = searchParams.get('ticket')

  const fetchTechnicians = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await listTechnicians()
      setTechnicians(response.items)
      setTotal(response.total)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.detail
          : 'Failed to load technicians',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchTechnicians()
  }, [fetchTechnicians])

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

  const openTechnician = (technicianId: string) => {
    updateParams({ technician: technicianId, ticket: null })
  }

  const closeTechnician = () => {
    updateParams({ technician: null, ticket: null })
  }

  const openTicket = (ticketId: string) => {
    updateParams({ ticket: ticketId })
  }

  const closeTicket = () => {
    updateParams({ ticket: null })
  }

  const handleTicketUpdated = () => {
    void fetchTechnicians()
    setProfileRefreshKey((key) => key + 1)
  }

  return (
    <>
      <Stack gap="lg" maw={1400}>
        <Paper p="lg">
          <Group justify="space-between" align="flex-end" wrap="wrap">
            <div>
              <Title order={2} fw={600}>
                Technicians
              </Title>
              <Text c="dimmed" size="sm" mt={6}>
                {total ? `${total} in roster` : 'Field technician roster'}
              </Text>
            </div>
            <Button
              variant="default"
              onClick={() => void fetchTechnicians()}
              loading={loading && technicians.length === 0}
            >
              Refresh
            </Button>
          </Group>
        </Paper>

        {error ? (
          <Alert color="red" title="Could not load technicians" variant="light">
            {error}
          </Alert>
        ) : null}

        <Paper p={0} style={{ overflow: 'hidden' }}>
          {loading && technicians.length === 0 ? (
            <Group justify="center" py="xl">
              <Loader color="gray" />
            </Group>
          ) : (
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
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Employee ID</Table.Th>
                    <Table.Th>Region</Table.Th>
                    <Table.Th>On call</Table.Th>
                    <Table.Th>Specialties</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {technicians.length ? (
                    technicians.map((tech) => {
                      const isSelected = selectedTechnicianId === tech.id
                      return (
                        <Table.Tr
                          key={tech.id}
                          onClick={() => openTechnician(tech.id)}
                          bg={isSelected ? 'brand.0' : undefined}
                        >
                          <Table.Td>
                            <Text fw={600} size="sm" c={basePalette.green90}>
                              {tech.name}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{tech.employee_id}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{tech.region}</Text>
                          </Table.Td>
                          <Table.Td>
                            {tech.on_call ? (
                              <Badge size="sm" color="green" variant="light">
                                Yes
                              </Badge>
                            ) : (
                              <Text size="sm" c="dimmed">
                                No
                              </Text>
                            )}
                          </Table.Td>
                          <Table.Td>
                            <Group gap={6}>
                              {tech.specialties.slice(0, 3).map((item) => (
                                <Badge
                                  key={item}
                                  size="sm"
                                  variant="light"
                                  color="gray"
                                >
                                  {formatSpecialty(item)}
                                </Badge>
                              ))}
                              {tech.specialties.length > 3 ? (
                                <Text size="xs" c="dimmed">
                                  +{tech.specialties.length - 3}
                                </Text>
                              ) : null}
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      )
                    })
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={5}>
                        <Text ta="center" c="dimmed" py="xl">
                          No technicians in roster.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Box>
          )}
        </Paper>
      </Stack>

      <TechnicianDetailModal
        technicianId={selectedTechnicianId}
        opened={Boolean(selectedTechnicianId)}
        onClose={closeTechnician}
        selectedTicketId={selectedTicketId}
        onOpenTicket={openTicket}
        refreshKey={profileRefreshKey}
        nestedTicketOpen={Boolean(selectedTicketId)}
      />

      <TicketDetailModal
        ticketId={selectedTicketId}
        opened={Boolean(selectedTicketId)}
        onClose={closeTicket}
        onTicketUpdated={handleTicketUpdated}
        elevated={Boolean(selectedTechnicianId)}
      />
    </>
  )
}
