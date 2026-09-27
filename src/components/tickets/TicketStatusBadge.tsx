import { Badge } from '@mantine/core'
import { basePalette } from '../../theme/basePalette'
import type { TicketStatus } from '../../types/ticket'

const statusStyles: Record<
  TicketStatus,
  { backgroundColor: string; color: string }
> = {
  open: {
    backgroundColor: basePalette.green5,
    color: basePalette.green90,
  },
  assigned: {
    backgroundColor: '#cce5f5',
    color: basePalette.green90,
  },
  rejected: {
    backgroundColor: '#fbe3d8',
    color: '#742c0b',
  },
  resolved: {
    backgroundColor: basePalette.grey20,
    color: basePalette.grey80,
  },
}

type TicketStatusBadgeProps = {
  status: TicketStatus
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const colors = statusStyles[status]

  return (
    <Badge
      variant="light"
      size="sm"
      styles={{
        root: {
          backgroundColor: colors.backgroundColor,
          color: colors.color,
          textTransform: 'capitalize',
        },
      }}
    >
      {status}
    </Badge>
  )
}
