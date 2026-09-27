import { Button, Group, Modal, Stack, Text } from '@mantine/core'
import { useEffect, useState } from 'react'
import {
  EMPTY_TICKET_FILTERS,
  type TicketFilters,
} from '../../lib/ticketFilters'
import { TicketFiltersBar } from './TicketFiltersBar'

type TicketFiltersModalProps = {
  opened: boolean
  onClose: () => void
  filters: TicketFilters
  categoryOptions: string[]
  onApply: (filters: TicketFilters) => void
  onClear: () => void
  filtersActive: boolean
  showFetchLimitNote?: boolean
}

export function TicketFiltersModal({
  opened,
  onClose,
  filters,
  categoryOptions,
  onApply,
  onClear,
  filtersActive,
  showFetchLimitNote,
}: TicketFiltersModalProps) {
  const [draft, setDraft] = useState(filters)

  useEffect(() => {
    if (opened) {
      setDraft(filters)
    }
  }, [opened, filters])

  const handleApply = () => {
    onApply(draft)
    onClose()
  }

  const handleClear = () => {
    setDraft(EMPTY_TICKET_FILTERS)
    onClear()
    onClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Filter tickets"
      size="lg"
      centered
    >
      <Stack gap="md">
        <TicketFiltersBar
          filters={draft}
          categoryOptions={categoryOptions}
          onChange={setDraft}
          onClear={() => setDraft(EMPTY_TICKET_FILTERS)}
          active={filtersActive || isDraftActive(draft)}
        />
        {showFetchLimitNote ? (
          <Text size="xs" c="dimmed">
            Filters apply to the newest 200 tickets for the current status tab.
          </Text>
        ) : null}
        <Group justify="flex-end" mt="xs">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="subtle" color="gray" onClick={handleClear}>
            Clear all
          </Button>
          <Button onClick={handleApply}>Apply filters</Button>
        </Group>
      </Stack>
    </Modal>
  )
}

function isDraftActive(filters: TicketFilters): boolean {
  return (
    filters.severities.length > 0 ||
    filters.priorities.length > 0 ||
    Boolean(filters.category) ||
    Boolean(filters.unitId) ||
    Boolean(filters.siteId) ||
    Boolean(filters.query?.trim())
  )
}
