import { apiGet } from './client'
import type {
  TechnicianListResponse,
  TechnicianProfile,
  TechnicianTicketsParams,
  TechnicianTicketsResponse,
} from '../types/technician'

const DEFAULT_LIST_LIMIT = 500

export function listTechnicians(
  limit: number = DEFAULT_LIST_LIMIT,
): Promise<TechnicianListResponse> {
  return apiGet<TechnicianListResponse>('/api/technicians', { limit })
}

export function getTechnician(
  technicianId: string,
): Promise<TechnicianProfile> {
  return apiGet<TechnicianProfile>(
    `/api/technicians/${encodeURIComponent(technicianId)}`,
  )
}

export function getTechnicianTickets(
  technicianId: string,
  params: TechnicianTicketsParams = {},
): Promise<TechnicianTicketsResponse> {
  return apiGet<TechnicianTicketsResponse>(
    `/api/technicians/${encodeURIComponent(technicianId)}/tickets`,
    {
      case_set: params.case_set,
      active_limit: params.active_limit,
      active_offset: params.active_offset,
      past_limit: params.past_limit,
      past_offset: params.past_offset,
    },
  )
}
