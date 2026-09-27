export type TicketStatus = 'open' | 'assigned' | 'rejected' | 'resolved'

export type PatchTicketResponse = {
  ticket_id: string
  status: TicketStatus
  rejection_reason: string | null
}

export type PatchTicketBody =
  | { status: 'resolved' }
  | { status: 'rejected'; reason?: string | null }

export type AssignTicketBody = {
  technician_id: string
  notes?: string | null
}

export type AssignTicketResponse = {
  ticket_id: string
  status: 'assigned'
  technician_id: string
  technician_name: string
  dispatch_notes: string | null
}

export type TicketUnit = {
  unit_id: string
  site_id: string
  site_name: string | null
}

export type TicketAssigneeRef = {
  id: string
  name: string
}

export type TicketAssignedByRef = {
  id: string
  email: string
}

export type TicketListItem = {
  ticket_id: string
  status: TicketStatus
  severity: string
  priority: string
  category: string | null
  skill: string | null
  dtc: string | null
  primary_rule_id: string | null
  primary_rule_name: string | null
  unit: TicketUnit
  recorded_at: string
  created_at: string
  assigned_to: TicketAssigneeRef | null
  assigned_by: TicketAssignedByRef | null
  assigned_at: string | null
}

export type TicketListResponse = {
  items: TicketListItem[]
  total: number
  limit: number
  offset: number
}

export type TicketRuleRef = {
  id: string
  name: string
}

export type TicketDetail = {
  id: string
  ticket_id: string
  status: TicketStatus
  severity: string
  priority: string
  category: string | null
  skill: string | null
  dtc: string | null
  hint: string | null
  primary_rule_id: string | null
  primary_rule: TicketRuleRef | null
  fired_rules: string[]
  fired_rule_details: TicketRuleRef[]
  unit: TicketUnit
  /** Ingested CAN / telemetry row id (API may send as record_id or telemetry_record_pk). */
  record_id: string
  state_snapshot: Record<string, unknown>
  recorded_at: string
  created_at: string
  assigned_to: TicketAssigneeRef | null
  assigned_by: TicketAssignedByRef | null
  assigned_at: string | null
  dispatch_notes?: string | null
  rejection_reason?: string | null
}

export type TicketStatusFilter = TicketStatus | 'all'

export type ListTicketsParams = {
  limit?: number
  offset?: number
  status?: TicketStatus
}

export function canShowTicketActions(status: TicketStatus): boolean {
  return status === 'open' || status === 'assigned'
}

export function canManualAssignTicket(status: TicketStatus): boolean {
  return status === 'open'
}

export function canRejectTicket(status: TicketStatus): boolean {
  return status === 'open'
}

export function canResolveTicket(status: TicketStatus): boolean {
  return (
    status === 'open' || status === 'assigned' || status === 'rejected'
  )
}
