import { Box, Container, Paper, Stack } from '@mantine/core'
import { FirefightAbout } from '../brand/FirefightAbout'
import { FirefightLogo } from '../brand/FirefightLogo'
import { basePalette } from '../../theme/basePalette'

import type { ReactNode } from 'react'

type AuthLayoutProps = {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <Box
      mih="100vh"
      style={{
        backgroundColor: basePalette.grey5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--mantine-spacing-md)',
      }}
    >
      <Container size={480} w="100%">
        <Stack gap="lg">
          <FirefightLogo />
          <FirefightAbout />
          <Paper p="xl" radius="md" withBorder shadow="xs">
            {children}
          </Paper>
        </Stack>
      </Container>
    </Box>
  )
}
