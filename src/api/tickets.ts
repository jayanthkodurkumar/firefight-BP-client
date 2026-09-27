import { apiGet, apiPatch, apiPost } from './client'
import type {
  AssignTicketBody,
  AssignTicketResponse,
  ListTicketsParams,
  PatchTicketBody,
  PatchTicketResponse,
  TicketDetail,
  TicketListResponse,
} from '../types/ticket'

type TicketDetailApiResponse = Omit<TicketDetail, 'record_id'> & {
  record_id?: string
  telemetry_record_pk?: string
}

export function listTickets(
  params: ListTicketsParams = {},
): Promise<TicketListResponse> {
  return apiGet<TicketListResponse>('/api/tickets', {
    limit: params.limit,
    offset: params.offset,
    status: params.status,
  })
}

function normalizeTicketDetail(raw: TicketDetailApiResponse): TicketDetail {
  const recordId = raw.record_id ?? raw.telemetry_record_pk
  if (!recordId) {
    throw new Error('Ticket detail missing record id')
  }

  const { telemetry_record_pk: _telemetryRecordPk, record_id: _recordId, ...rest } =
    raw

  return {
    ...rest,
    record_id: recordId,
  }
}

export function getTicket(ticketId: string): Promise<TicketDetail> {
  return apiGet<TicketDetailApiResponse>(
    `/api/tickets/${encodeURIComponent(ticketId)}`,
  ).then(normalizeTicketDetail)
}

export function assignTicket(
  ticketId: string,
  body: AssignTicketBody,
): Promise<AssignTicketResponse> {
  const payload = {
    technician_id: body.technician_id,
    notes: body.notes?.trim() ? body.notes.trim() : undefined,
  }

  return apiPost<AssignTicketResponse>(
    `/api/tickets/${encodeURIComponent(ticketId)}/assign`,
    payload,
  )
}

export function patchTicket(
  ticketId: string,
  body: PatchTicketBody,
): Promise<PatchTicketResponse> {
  const payload =
    body.status === 'rejected'
      ? {
          status: 'rejected' as const,
          reason: body.reason?.trim() ? body.reason.trim() : null,
        }
      : { status: 'resolved' as const }

  return apiPatch<PatchTicketResponse>(
    `/api/tickets/${encodeURIComponent(ticketId)}`,
    payload,
  )
}
