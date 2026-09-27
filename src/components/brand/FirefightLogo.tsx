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
  const boxSize = size === 'sm' ? 24 : 28
  const emojiSize = size === 'sm' ? 14 : 16

  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Box
        w={boxSize}
        h={boxSize}
        style={{
          borderRadius: 8,
          backgroundColor: basePalette.green20,
          border: `1px solid ${basePalette.green90}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        aria-hidden
      >
        <Text span style={{ fontSize: emojiSize, lineHeight: 1 }}>
          {FIREFIGHT_EMOJI}
        </Text>
      </Box>
      {showWordmark ? (
        <div>
          <Text fw={700} size="sm" lh={1.2} c={basePalette.grey100}>
            Firefight
          </Text>
          <Text size="xs" c={basePalette.grey60} lh={1.2}>
            CAN telemetry operations
          </Text>
        </div>
      ) : null}
    </Box>
  )
}
