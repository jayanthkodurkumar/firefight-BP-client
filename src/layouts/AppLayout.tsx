import { AppShell, Button, Group } from '@mantine/core'
import { useLocalStorage } from '@mantine/hooks'
import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { setUnauthorizedHandler } from '../api/client'
import { FirefightLogo } from '../components/brand/FirefightLogo'
import { AppSidebar } from '../components/layout/AppSidebar'
import { useAuthStore } from '../stores/authStore'

const NAVBAR_WIDTH_EXPANDED = 220
const NAVBAR_WIDTH_COLLAPSED = 72

export function AppLayout() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const [collapsed, setCollapsed] = useLocalStorage({
    key: 'firefight-sidebar-collapsed',
    defaultValue: false,
  })

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout()
      navigate('/login', { replace: true })
    })
    return () => setUnauthorizedHandler(null)
  }, [logout, navigate])

  const navbarWidth = collapsed ? NAVBAR_WIDTH_COLLAPSED : NAVBAR_WIDTH_EXPANDED

  return (
    <AppShell
      navbar={{ width: navbarWidth, breakpoint: 'sm' }}
      header={{ height: 56 }}
      padding="lg"
      transitionDuration={200}
      transitionTimingFunction="ease"
    >
      <AppShell.Header>
        <Group h="100%" px="lg" justify="space-between">
          <FirefightLogo />
          <Button variant="subtle" color="gray" size="compact-sm" onClick={logout}>
            Sign out
          </Button>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <AppSidebar
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed(!collapsed)}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
