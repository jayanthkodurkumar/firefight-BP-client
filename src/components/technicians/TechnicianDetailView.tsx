import {
  Alert,
  Badge,
  Group,
  Loader,
  Pagination,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { useEffect, useState } from 'react'
import { ApiError } from '../../api/client'
import { getTechnician, getTechnicianTickets } from '../../api/technicians'
import { formatDateTime } from '../../lib/format'
import { formatSpecialty } from '../../lib/specialtyLabel'
import type { TechnicianProfile } from '../../types/technician'
import { TechnicianCaseTable } from './TechnicianCaseTable'

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Paper p="md">
      <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={6}>
        {label}
      </Text>
      <div>{children}</div>
    </Paper>
  )
}

const PAST_PAGE_SIZE = 50

type TechnicianDetailViewProps = {
  technicianId: string
  refreshKey?: number
  selectedTicketId?: string | null
  onOpenTicket: (ticketId: string) => void
}

export function TechnicianDetailView({
  technicianId,
  refreshKey = 0,
  selectedTicketId,
  onOpenTicket,
}: TechnicianDetailViewProps) {
  const [profile, setProfile] = useState<TechnicianProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pastPage, setPastPage] = useState(1)
  const [activeCases, setActiveCases] = useState<
    Awaited<ReturnType<typeof getTechnicianTickets>>['active']
  >([])
  const [pastCases, setPastCases] = useState<
    Awaited<ReturnType<typeof getTechnicianTickets>>['past']
  >([])
  const [pastTotal, setPastTotal] = useState(0)
  const [casesLoading, setCasesLoading] = useState(true)
  const [casesError, setCasesError] = useState<string | null>(null)

  useEffect(() => {
    setPastPage(1)
  }, [technicianId])

  useEffect(() => {
    let cancelled = false
    const silent = refreshKey > 0

    if (!silent) {
      setLoading(true)
      setError(null)
      setProfile(null)
    }

    getTechnician(technicianId)
      .then((data) => {
        if (!cancelled) {
          setProfile(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.detail
              : 'Failed to load technician profile',
          )
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
  }, [technicianId, refreshKey])

  useEffect(() => {
    let cancelled = false
    setCasesLoading(true)
    setCasesError(null)

    const pastOffset = (pastPage - 1) * PAST_PAGE_SIZE

    getTechnicianTickets(technicianId, {
      case_set: 'all',
      active_limit: 200,
      active_offset: 0,
      past_limit: PAST_PAGE_SIZE,
      past_offset: pastOffset,
    })
      .then((data) => {
        if (!cancelled) {
          setActiveCases(data.active)
          setPastCases(data.past)
          setPastTotal(data.past_total)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setCasesError(
            err instanceof ApiError
              ? err.detail
              : 'Failed to load technician cases',
          )
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCasesLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [technicianId, refreshKey, pastPage])

  if (loading) {
    return (
      <Group justify="center" py="xl">
        <Loader color="gray" />
      </Group>
    )
  }

  if (error || !profile) {
    return (
      <Alert color="red" title="Technician unavailable">
        {error ?? 'Technician not found'}
      </Alert>
    )
  }

  const pastPages = Math.max(1, Math.ceil(pastTotal / PAST_PAGE_SIZE))

  return (
    <Stack gap="lg">
      <Paper p="lg">
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <div>
            <Title order={2}>{profile.name}</Title>
            <Text c="dimmed" size="sm" mt={6}>
              {profile.employee_id} · {profile.region}
            </Text>
          </div>
          <Group gap="xs">
            {profile.on_call ? (
              <Badge color="green" variant="light">
                On call
              </Badge>
            ) : (
              <Badge color="gray" variant="light">
                Off call
              </Badge>
            )}
            <Badge variant="light" color="brand">
              {profile.active_ticket_count} active
            </Badge>
            <Badge variant="light" color="gray">
              {profile.past_ticket_count} past
            </Badge>
          </Group>
        </Group>
      </Paper>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        <MetaItem label="State">
          <Text size="sm">{profile.state}</Text>
        </MetaItem>
        <MetaItem label="Level">
          <Text size="sm" tt="capitalize">
            {profile.level.replace(/_/g, ' ')}
          </Text>
        </MetaItem>
        <MetaItem label="Experience">
          <Text size="sm">{profile.years_experience} years</Text>
        </MetaItem>
        <MetaItem label="Home hub">
          <Text size="sm">{profile.home_hub}</Text>
        </MetaItem>
        <MetaItem label="Phone">
          <Text size="sm">{profile.phone}</Text>
        </MetaItem>
        <MetaItem label="Roster since">
          <Text size="sm">{formatDateTime(profile.created_at)}</Text>
        </MetaItem>
      </SimpleGrid>

      <Paper p="lg">
        <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="sm">
          Specialties
        </Text>
        {profile.specialties.length ? (
          <Group gap="xs">
            {profile.specialties.map((item) => (
              <Badge key={item} variant="light" color="gray">
                {formatSpecialty(item)}
              </Badge>
            ))}
          </Group>
        ) : (
          <Text size="sm" c="dimmed">
            None listed
          </Text>
        )}
      </Paper>

      <Paper p="lg">
        <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="sm">
          Certifications
        </Text>
        {profile.certifications.length ? (
          <Stack gap={4}>
            {profile.certifications.map((item) => (
              <Text key={item} size="sm">
                {item}
              </Text>
            ))}
          </Stack>
        ) : (
          <Text size="sm" c="dimmed">
            None listed
          </Text>
        )}
      </Paper>

      {casesError ? (
        <Alert color="red" variant="light">
          {casesError}
        </Alert>
      ) : null}

      <Paper p="lg">
        <Title order={4} fw={600} mb="md">
          Active cases
        </Title>
        {casesLoading ? (
          <Loader size="sm" color="gray" />
        ) : (
          <TechnicianCaseTable
            cases={activeCases}
            emptyMessage="No assigned tickets."
            onSelectTicket={onOpenTicket}
            selectedTicketId={selectedTicketId}
          />
        )}
      </Paper>

      <Paper p="lg">
        <Group justify="space-between" mb="md" align="center">
          <Title order={4} fw={600}>
            Past cases
          </Title>
          <Text size="sm" c="dimmed">
            {pastTotal} resolved
          </Text>
        </Group>
        {casesLoading ? (
          <Loader size="sm" color="gray" />
        ) : (
          <>
            <TechnicianCaseTable
              cases={pastCases}
              emptyMessage="No resolved tickets."
              onSelectTicket={onOpenTicket}
              selectedTicketId={selectedTicketId}
            />
            {pastTotal > PAST_PAGE_SIZE ? (
              <Group justify="center" mt="md">
                <Pagination
                  total={pastPages}
                  value={Math.min(pastPage, pastPages)}
                  onChange={setPastPage}
                  color="brand"
                />
              </Group>
            ) : null}
          </>
        )}
      </Paper>
    </Stack>
  )
}
