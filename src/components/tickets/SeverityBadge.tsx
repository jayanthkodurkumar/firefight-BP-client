import { Badge } from '@mantine/core'

const severityColor: Record<string, string> = {
  S1: 'red',
  S2: 'orange',
  S3: 'yellow',
  S4: 'gray',
}

type SeverityBadgeProps = {
  severity: string
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <Badge
      variant="light"
      color={severityColor[severity] ?? 'gray'}
      size="sm"
    >
      {severity}
    </Badge>
  )
}
