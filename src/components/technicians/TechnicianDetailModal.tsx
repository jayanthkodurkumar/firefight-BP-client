import {
  ActionIcon,
  Box,
  Container,
  Group,
  Overlay,
  Portal,
  Text,
  Title,
} from '@mantine/core'
import { useHotkeys } from '@mantine/hooks'
import { IconX } from '@tabler/icons-react'
import { useEffect } from 'react'
import { basePalette } from '../../theme/basePalette'
import { TechnicianDetailView } from './TechnicianDetailView'

type TechnicianDetailModalProps = {
  technicianId: string | null
  opened: boolean
  onClose: () => void
  selectedTicketId?: string | null
  onOpenTicket: (ticketId: string) => void
  /** Increment to refetch profile and cases. */
  refreshKey?: number
  /** When a ticket overlay is open, Esc should close the ticket first. */
  nestedTicketOpen?: boolean
}

export function TechnicianDetailModal({
  technicianId,
  opened,
  onClose,
  selectedTicketId,
  onOpenTicket,
  refreshKey = 0,
  nestedTicketOpen = false,
}: TechnicianDetailModalProps) {
  useHotkeys([['Escape', onClose]], [], opened && !nestedTicketOpen)

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
        zIndex={200}
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
          zIndex: 201,
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
              Technician profile
            </Title>
            <Text size="xs" c="dimmed">
              Press Esc to close
            </Text>
          </div>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            aria-label="Close technician profile"
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
            overflowY: 'auto',
            backgroundColor: basePalette.grey5,
          }}
        >
          {technicianId ? (
            <Container size="xl" py="xl" px="lg">
              <TechnicianDetailView
                technicianId={technicianId}
                refreshKey={refreshKey}
                selectedTicketId={selectedTicketId}
                onOpenTicket={onOpenTicket}
              />
            </Container>
          ) : null}
        </Box>
      </Box>
    </Portal>
  )
}
