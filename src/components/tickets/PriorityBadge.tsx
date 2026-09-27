import { Badge } from '@mantine/core'

const priorityColor: Record<string, string> = {
  P0: 'red',
  P1: 'orange',
  P2: 'yellow',
  P3: 'gray',
}

type PriorityBadgeProps = {
  priority: string
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <Badge
      variant="outline"
      color={priorityColor[priority] ?? 'gray'}
      size="sm"
    >
      {priority}
    </Badge>
  )
}
