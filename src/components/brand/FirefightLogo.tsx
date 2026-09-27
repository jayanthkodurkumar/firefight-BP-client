import { Box, Text } from '@mantine/core'
import { basePalette } from '../../theme/basePalette'

const FIREFIGHT_EMOJI = '🔥'

type FirefightLogoProps = {
  size?: 'sm' | 'md'
  showWordmark?: boolean
}

export function FirefightLogo({
  size = 'md',
  showWordmark = true,
}: FirefightLogoProps) {
  const emojiSize = size === 'sm' ? 22 : 26

  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Text
        span
        style={{ fontSize: emojiSize, lineHeight: 1, flexShrink: 0 }}
        aria-hidden
      >
        {FIREFIGHT_EMOJI}
      </Text>
      {showWordmark ? (
        <div>
          <Text fw={700} size="sm" lh={1.2} c={basePalette.grey100}>
            firefight.ai
          </Text>
          <Text size="xs" c={basePalette.grey60} lh={1.2}>
            Field Operations Simplified.
          </Text>
        </div>
      ) : null}
    </Box>
  )
}
