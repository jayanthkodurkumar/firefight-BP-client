import {
  Button,
  Group,
  MultiSelect,
  Select,
  SimpleGrid,
  TextInput,
} from '@mantine/core'
import { IconFilterOff, IconSearch } from '@tabler/icons-react'
import {
  PRIORITY_OPTIONS,
  SEVERITY_OPTIONS,
  type TicketFilters,
} from '../../lib/ticketFilters'

type TicketFiltersBarProps = {
  filters: TicketFilters
  categoryOptions: string[]
  onChange: (filters: TicketFilters) => void
  onClear: () => void
  active: boolean
}

export function TicketFiltersBar({
  filters,
  categoryOptions,
  onChange,
  onClear,
  active,
}: TicketFiltersBarProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm">
      <MultiSelect
        label="Severity"
        placeholder="All severities"
        data={[...SEVERITY_OPTIONS]}
        value={filters.severities}
        onChange={(severities) => onChange({ ...filters, severities })}
        clearable
        searchable
      />
      <MultiSelect
        label="Priority"
        placeholder="All priorities"
        data={[...PRIORITY_OPTIONS]}
        value={filters.priorities}
        onChange={(priorities) => onChange({ ...filters, priorities })}
        clearable
        searchable
      />
      <Select
        label="Category"
        placeholder="All categories"
        data={categoryOptions}
        value={filters.category}
        onChange={(category) => onChange({ ...filters, category })}
        clearable
        searchable
      />
      <TextInput
        label="Unit id"
        placeholder="e.g. U09"
        value={filters.unitId ?? ''}
        onChange={(event) =>
          onChange({
            ...filters,
            unitId: event.currentTarget.value || null,
          })
        }
      />
      <TextInput
        label="Site"
        placeholder="Site id or name"
        value={filters.siteId ?? ''}
        onChange={(event) =>
          onChange({
            ...filters,
            siteId: event.currentTarget.value || null,
          })
        }
      />
      <TextInput
        label="Search"
        placeholder="Ticket, rule, DTC…"
        value={filters.query ?? ''}
        onChange={(event) =>
          onChange({
            ...filters,
            query: event.currentTarget.value || null,
          })
        }
        leftSection={<IconSearch size={16} stroke={1.75} />}
      />
      <Group align="flex-end" h="100%" pb={2}>
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconFilterOff size={16} stroke={1.75} />}
          onClick={onClear}
          disabled={!active}
        >
          Reset form
        </Button>
      </Group>
    </SimpleGrid>
  )
}
