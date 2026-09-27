import type { TicketUnit } from './ticket'

export type Technician = {
  id: string
  name: string
  region: string
  employee_id: string
  on_call: boolean
  specialties: string[]
}

export type TechnicianListResponse = {
  items: Technician[]
  total: number
}

export type TechnicianProfile = {
  id: string
  name: string
  region: string
  employee_id: string
  state: string
  level: string
  years_experience: number
  home_hub: string
  phone: string
  on_call: boolean
  specialties: string[]
  certifications: string[]
  active_ticket_count: number
  past_ticket_count: number
  created_at: string
}

export type TechnicianTicketCase = {
  ticket_id: string
  status: 'assigned' | 'resolved'
  severity: string
  priority: string
  category: string | null
  skill: string | null
  dtc: string | null
  primary_rule_id: string | null
  primary_rule_name: string | null
  unit: TicketUnit
  assigned_at: string | null
  recorded_at: string
  created_at: string
}

export type TechnicianCaseSet = 'active' | 'past' | 'all'

export type TechnicianTicketsParams = {
  case_set?: TechnicianCaseSet
  active_limit?: number
  active_offset?: number
  past_limit?: number
  past_offset?: number
}

export type TechnicianTicketsResponse = {
  technician_id: string
  case_set: TechnicianCaseSet
  active: TechnicianTicketCase[]
  past: TechnicianTicketCase[]
  active_total: number
  past_total: number
  active_limit: number
  active_offset: number
  past_limit: number
  past_offset: number
}
