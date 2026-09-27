import {
  Alert,
  Badge,
  Button,
  Divider,
  Group,
  Loader,
  Modal,
  Select,
  Stack,
  Text,
  Textarea,
  getDefaultZIndex,
} from '@mantine/core'
import type { Technician } from '../../types/technician'
import {
  canManualAssignTicket,
  canRejectTicket,
  canResolveTicket,
  type TicketStatus,
} from '../../types/ticket'

function technicianSelectLabel(tech: Technician): string {
  const parts = [tech.name, tech.employee_id]
  if (tech.region) {
    parts.push(tech.region)
  }
  return parts.join(' · ')
}

type TicketActionsModalProps = {
  opened: boolean
  onClose: () => void
  ticketId: string
  status: TicketStatus
  technicians: Technician[]
  techniciansLoading: boolean
  techniciansError: string | null
  selectedTechnicianId: string | null
  onSelectedTechnicianChange: (value: string | null) => void
  assignNotes: string
  onAssignNotesChange: (value: string) => void
  onAssign: () => void
  assigning: boolean
  rejectReason: string
  onRejectReasonChange: (value: string) => void
  onReject: () => void
  onResolve: () => void
  rejecting: boolean
  resolving: boolean
  error: string | null
}

export function TicketActionsModal({
  opened,
  onClose,
  ticketId,
  status,
  technicians,
  techniciansLoading,
  techniciansError,
  selectedTechnicianId,
  onSelectedTechnicianChange,
  assignNotes,
  onAssignNotesChange,
  onAssign,
  assigning,
  rejectReason,
  onRejectReasonChange,
  onReject,
  onResolve,
  rejecting,
  resolving,
  error,
}: TicketActionsModalProps) {
  const showAssign = canManualAssignTicket(status)
  const showReject = canRejectTicket(status)
  const showResolve = canResolveTicket(status)
  const busy = assigning || rejecting || resolving

  const technicianOptions = technicians.map((tech) => ({
    value: tech.id,
    label: technicianSelectLabel(tech),
  }))

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Ticket actions"
      centered
      size="md"
      zIndex={getDefaultZIndex('popover')}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {ticketId}
        </Text>

        {error ? (
          <Alert color="red" variant="light">
            {error}
          </Alert>
        ) : null}

        {showAssign ? (
          <Stack gap="sm">
            <Text size="sm" fw={600}>
              Assign technician
            </Text>
            <Text size="sm" c="dimmed">
              Manual dispatch from the roster. Use chat assignment for AI
              proposals, not both on the same ticket.
            </Text>
            {techniciansError ? (
              <Alert color="red" variant="light">
                {techniciansError}
              </Alert>
            ) : null}
            {techniciansLoading ? (
              <Group gap="xs">
                <Loader size="sm" color="gray" />
                <Text size="sm" c="dimmed">
                  Loading technicians…
                </Text>
              </Group>
            ) : (
              <Select
                label="Technician"
                placeholder={
                  technicianOptions.length > 0
                    ? 'Select a technician'
                    : 'No technicians available'
                }
                data={technicianOptions}
                value={selectedTechnicianId}
                onChange={onSelectedTechnicianChange}
                searchable
                nothingFoundMessage="No match"
                disabled={busy || technicianOptions.length === 0}
                renderOption={({ option }) => {
                  const tech = technicians.find((t) => t.id === option.value)
                  if (!tech) {
                    return option.label
                  }
                  return (
                    <Group gap="xs" wrap="nowrap">
                      <Text size="sm">{tech.name}</Text>
                      {tech.region ? (
                        <Text size="xs" c="dimmed">
                          {tech.region}
                        </Text>
                      ) : null}
                      {tech.on_call ? (
                        <Badge size="xs" variant="light" color="green">
                          On call
                        </Badge>
                      ) : null}
                    </Group>
                  )
                }}
              />
            )}
            <Textarea
              label="Dispatch notes (optional)"
              minRows={2}
              maxLength={2000}
              value={assignNotes}
              onChange={(event) =>
                onAssignNotesChange(event.currentTarget.value)
              }
              disabled={busy}
            />
            <Button
              onClick={onAssign}
              loading={assigning}
              disabled={
                busy ||
                !selectedTechnicianId ||
                techniciansLoading ||
                Boolean(techniciansError)
              }
            >
              Assign technician
            </Button>
          </Stack>
        ) : null}

        {showAssign && (showReject || showResolve) ? (
          <Divider label="Close ticket" labelPosition="center" />
        ) : null}

        {showReject ? (
          <>
            <Text size="sm">
              Reject closes the ticket without dispatch. Resolve when work is
              complete.
            </Text>
            <Textarea
              label="Rejection reason (optional)"
              minRows={3}
              maxLength={2000}
              value={rejectReason}
              onChange={(event) =>
                onRejectReasonChange(event.currentTarget.value)
              }
              disabled={busy}
            />
          </>
        ) : showResolve && !showAssign ? (
          <Text size="sm">
            Mark this ticket resolved when work is complete.
          </Text>
        ) : null}

        <Group justify="flex-end" mt="xs">
          <Button variant="default" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          {showReject ? (
            <Button
              color="red"
              variant="light"
              loading={rejecting}
              disabled={assigning || resolving}
              onClick={onReject}
            >
              Reject ticket
            </Button>
          ) : null}
          {showResolve ? (
            <Button
              loading={resolving}
              disabled={assigning || rejecting}
              onClick={onResolve}
            >
              Mark resolved
            </Button>
          ) : null}
        </Group>
      </Stack>
    </Modal>
  )
}
