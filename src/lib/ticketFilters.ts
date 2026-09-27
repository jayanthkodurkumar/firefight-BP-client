import type { TicketListItem } from '../types/ticket'

export type TicketFilters = {
  severities: string[]
  priorities: string[]
  category: string | null
  unitId: string | null
  siteId: string | null
  query: string | null
}

export const EMPTY_TICKET_FILTERS: TicketFilters = {
  severities: [],
  priorities: [],
  category: null,
  unitId: null,
  siteId: null,
  query: null,
}

export const SEVERITY_OPTIONS = ['S1', 'S2', 'S3', 'S4'] as const
export const PRIORITY_OPTIONS = ['P0', 'P1', 'P2', 'P3'] as const

export function countActiveTicketFilters(filters: TicketFilters): number {
  let count = 0
  if (filters.severities.length) count += 1
  if (filters.priorities.length) count += 1
  if (filters.category) count += 1
  if (filters.unitId) count += 1
  if (filters.siteId) count += 1
  if (filters.query?.trim()) count += 1
  return count
}

export function parseTicketFilters(params: URLSearchParams): TicketFilters {
  const severities = params.get('severity')?.split(',').filter(Boolean) ?? []
  const priorities = params.get('priority')?.split(',').filter(Boolean) ?? []

  return {
    severities,
    priorities,
    category: params.get('category') || null,
    unitId: params.get('unit') || null,
    siteId: params.get('site') || null,
    query: params.get('q') || null,
  }
}

export function ticketFiltersToSearchParams(
  filters: TicketFilters,
): Record<string, string | null> {
  return {
    severity: filters.severities.length ? filters.severities.join(',') : null,
    priority: filters.priorities.length ? filters.priorities.join(',') : null,
    category: filters.category,
    unit: filters.unitId,
    site: filters.siteId,
    q: filters.query?.trim() ? filters.query.trim() : null,
  }
}

export function isTicketFiltersActive(filters: TicketFilters): boolean {
  return countActiveTicketFilters(filters) > 0
}

export function applyTicketFilters(
  items: TicketListItem[],
  filters: TicketFilters,
): TicketListItem[] {
  const query = filters.query?.trim().toLowerCase()

  return items.filter((ticket) => {
    if (
      filters.severities.length > 0 &&
      !filters.severities.includes(ticket.severity)
    ) {
      return false
    }
    if (
      filters.priorities.length > 0 &&
      !filters.priorities.includes(ticket.priority)
    ) {
      return false
    }
    if (filters.category && ticket.category !== filters.category) {
      return false
    }
    if (
      filters.unitId &&
      !ticket.unit.unit_id.toLowerCase().includes(filters.unitId.toLowerCase())
    ) {
      return false
    }
    if (
      filters.siteId &&
      !ticket.unit.site_id.toLowerCase().includes(filters.siteId.toLowerCase()) &&
      !(ticket.unit.site_name ?? '')
        .toLowerCase()
        .includes(filters.siteId.toLowerCase())
    ) {
      return false
    }
    if (query) {
      const haystack = [
        ticket.ticket_id,
        ticket.dtc,
        ticket.primary_rule_id,
        ticket.primary_rule_name,
        ticket.category,
        ticket.skill,
        ticket.unit.unit_id,
        ticket.unit.site_id,
        ticket.unit.site_name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      if (!haystack.includes(query)) {
        return false
      }
    }
    return true
  })
}

export function uniqueCategories(items: TicketListItem[]): string[] {
  const values = new Set<string>()
  for (const item of items) {
    if (item.category) {
      values.add(item.category)
    }
  }
  return [...values].sort((a, b) => a.localeCompare(b))
}
