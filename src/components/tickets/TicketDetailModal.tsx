import {
  ActionIcon,
  Box,
  Container,
  Grid,
  Group,
  Overlay,
  Portal,
  Text,
  Title,
  getDefaultZIndex,
} from '@mantine/core'
import { useHotkeys } from '@mantine/hooks'
import { IconX } from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import type { TicketDetail } from '../../types/ticket'
import { basePalette } from '../../theme/basePalette'
import type { TicketStatus } from '../../types/ticket'
import { TicketChatPanel } from './TicketChatPanel'
import { TicketDetailView } from './TicketDetailView'

type TicketDetailModalProps = {
  ticketId: string | null
  opened: boolean
  onClose: () => void
  onTicketUpdated?: () => void
  /** Raise above another full-screen overlay (e.g. technician profile). */
  elevated?: boolean
}

export function TicketDetailModal({
  ticketId,
  opened,
  onClose,
  onTicketUpdated,
  elevated = false,
}: TicketDetailModalProps) {
  const overlayZ = elevated
    ? getDefaultZIndex('max') - 2
    : 200
  const panelZ = overlayZ + 1
  const [detailRefreshKey, setDetailRefreshKey] = useState(0)
  const [ticketStatus, setTicketStatus] = useState<TicketStatus | null>(null)
  const [nestedOverlayOpen, setNestedOverlayOpen] = useState(false)

  const notifyTicketUpdated = useCallback(() => {
    setDetailRefreshKey((key) => key + 1)
    onTicketUpdated?.()
  }, [onTicketUpdated])

  const handleTicketLoaded = useCallback((ticket: TicketDetail) => {
    setTicketStatus(ticket.status)
  }, [])

  useHotkeys([['Escape', onClose]], [], opened && !nestedOverlayOpen)

  useEffect(() => {
    setDetailRefreshKey(0)
    setTicketStatus(null)
    setNestedOverlayOpen(false)
  }, [ticketId])

  useEffect(() => {
    if (!opened) {
      return
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [opened])

  if (!opened) {
    return null
  }

  return (
    <Portal>
      <Overlay
        fixed
        zIndex={overlayZ}
        backgroundOpacity={0.4}
        blur={2}
        onClick={onClose}
      />

      <Box
        pos="fixed"
        top={{ base: 0, sm: 16 }}
        left={{ base: 0, sm: 16 }}
        right={{ base: 0, sm: 16 }}
        bottom={{ base: 0, sm: 16 }}
        style={{
          zIndex: panelZ,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: basePalette.white,
          borderRadius: 'var(--mantine-radius-md)',
          border: `1px solid ${basePalette.grey20}`,
          boxShadow: '0 18px 48px rgba(0, 0, 0, 0.12)',
          overflow: 'hidden',
        }}
      >
        <Group
          h={56}
          px="lg"
          justify="space-between"
          wrap="nowrap"
          style={{
            flexShrink: 0,
            borderBottom: `1px solid ${basePalette.grey20}`,
            backgroundColor: basePalette.white,
          }}
        >
          <div>
            <Title order={4} fw={600}>
              {ticketId ?? 'Ticket'}
            </Title>
            <Text size="xs" c="dimmed">
              Press Esc to close
            </Text>
          </div>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            aria-label="Close ticket detail"
            onClick={onClose}
          >
            <IconX size={20} stroke={1.75} />
          </ActionIcon>
        </Group>

        <Box
          component="main"
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            backgroundColor: basePalette.grey5,
          }}
        >
          {ticketId ? (
            <Grid gap={0} h="100%" styles={{ inner: { height: '100%' } }}>
              <Grid.Col
                span={{ base: 12, lg: 7 }}
                style={{
                  height: '100%',
                  overflowY: 'auto',
                  borderRight: `1px solid ${basePalette.grey20}`,
                }}
              >
                <Container size="xl" py="xl" px="lg">
                  <TicketDetailView
                    ticketId={ticketId}
                    refreshKey={detailRefreshKey}
                    onTicketLoaded={handleTicketLoaded}
                    onTicketUpdated={notifyTicketUpdated}
                    onNestedOverlayChange={setNestedOverlayOpen}
                  />
                </Container>
              </Grid.Col>
              <Grid.Col
                span={{ base: 12, lg: 5 }}
                style={{
                  height: '100%',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                p="lg"
              >
                <TicketChatPanel
                  ticketId={ticketId}
                  ticketStatus={ticketStatus}
                  onTicketUpdated={notifyTicketUpdated}
                />
              </Grid.Col>
            </Grid>
          ) : null}
        </Box>
      </Box>
    </Portal>
  )
}
