import { ActionIcon, Box, NavLink, Stack, Tooltip } from '@mantine/core'
import {
  IconChevronLeft,
  IconChevronRight,
  IconTicket,
  IconUsers,
} from '@tabler/icons-react'
import { Link, useLocation } from 'react-router-dom'
import { basePalette } from '../../theme/basePalette'

const navItems = [
  {
    label: 'Tickets',
    to: '/tickets',
    icon: IconTicket,
  },
  {
    label: 'Technicians',
    to: '/technicians',
    icon: IconUsers,
  },
] as const

type AppSidebarProps = {
  collapsed: boolean
  onToggleCollapsed: () => void
}

export function AppSidebar({ collapsed, onToggleCollapsed }: AppSidebarProps) {
  const { pathname } = useLocation()

  return (
    <Stack
      justify="space-between"
      gap="xs"
      p={collapsed ? 'sm' : 'md'}
      h="100%"
    >
      <Stack gap="xs">
        {navItems.map((item) => {
          const active =
            pathname === item.to || pathname.startsWith(`${item.to}/`)
          const link = (
            <NavLink
              key={item.to}
              component={Link}
              to={item.to}
              label={collapsed ? undefined : item.label}
              active={active}
              leftSection={
                <item.icon
                  size={20}
                  stroke={1.75}
                  color={
                    active ? basePalette.green90 : basePalette.grey60
                  }
                />
              }
              variant="light"
              color="brand"
              styles={{
                root: {
                  borderRadius: 'var(--mantine-radius-md)',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '10px' : undefined,
                },
                section: collapsed
                  ? { marginInlineEnd: 0, marginInlineStart: 0 }
                  : undefined,
                body: collapsed ? { display: 'none' } : undefined,
              }}
            />
          )

          if (collapsed) {
            return (
              <Tooltip key={item.to} label={item.label} position="right" withArrow>
                {link}
              </Tooltip>
            )
          }

          return link
        })}
      </Stack>

      <Box
        style={{
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'flex-end',
          width: '100%',
          padding: collapsed ? 4 : '4px 8px',
        }}
      >
        <ActionIcon
          variant="subtle"
          color="gray"
          size="md"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <IconChevronRight size={18} stroke={1.75} />
          ) : (
            <IconChevronLeft size={18} stroke={1.75} />
          )}
        </ActionIcon>
      </Box>
    </Stack>
  )
}
