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
import { Link, useNavigate } from 'react-router-dom'
import { signup } from '../../api/auth'
import { ApiError } from '../../api/client'
import { AuthLayout } from '../../components/auth/AuthLayout'

export function SignupPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const response = await signup(email.trim(), password)
      navigate('/login', {
        replace: true,
        state: {
          signupMessage: response.message,
          email: email.trim(),
        },
      })
    } catch (err) {
      setError(
        err instanceof ApiError ? err.detail : 'Signup failed. Try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Title order={3}>Create account</Title>
          <Text size="sm" c="dimmed">
            Password must be 8–128 characters.
          </Text>
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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
          />
          <Button type="submit" loading={loading} fullWidth>
            Sign up
          </Button>
          <Text size="sm" c="dimmed" ta="center">
            Already have an account?{' '}
            <Anchor component={Link} to="/login" fw={500}>
              Sign in
            </Anchor>
          </Text>
        </Stack>
      </form>
    </AuthLayout>
  )
}
