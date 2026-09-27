import {
  Alert,
  Anchor,
  Button,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login } from '../../api/auth'
import { ApiError } from '../../api/client'
import { AuthLayout } from '../../components/auth/AuthLayout'
import { useAuthStore } from '../../stores/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAccessToken = useAuthStore((state) => state.setAccessToken)

  const locationState = location.state as {
    from?: string
    signupMessage?: string
    email?: string
    reset?: boolean
  } | null

  const from = locationState?.from ?? '/tickets'
  const [email, setEmail] = useState(locationState?.email ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const successMessage =
    locationState?.signupMessage ??
    (locationState?.reset ? 'Password updated. Please sign in.' : null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { access_token } = await login(email.trim(), password)
      setAccessToken(access_token)
      navigate(from, { replace: true })
    } catch (err) {
      setError(
        err instanceof ApiError ? err.detail : 'Login failed. Try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Title order={3}>Sign in</Title>
          {successMessage ? (
            <Alert color="green" variant="light">
              {successMessage}
            </Alert>
          ) : null}
          {error ? (
            <Alert color="red" variant="light">
              {error}
            </Alert>
          ) : null}
          <TextInput
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
          />
          <PasswordInput
            label="Password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
          />
          <Anchor component={Link} to="/forgot-password" size="sm">
            Forgot password?
          </Anchor>
          <Button type="submit" loading={loading} fullWidth>
            Sign in
          </Button>
          <Text size="sm" c="dimmed" ta="center">
            No account?{' '}
            <Anchor component={Link} to="/signup" fw={500}>
              Create one
            </Anchor>
          </Text>
        </Stack>
      </form>
    </AuthLayout>
  )
}
