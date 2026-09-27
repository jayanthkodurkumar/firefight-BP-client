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
import { resetPassword } from '../../api/auth'
import { ApiError } from '../../api/client'
import { AuthLayout } from '../../components/auth/AuthLayout'

const MIN_PASSWORD = 8
const MAX_PASSWORD = 128

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (newPassword.length < MIN_PASSWORD || newPassword.length > MAX_PASSWORD) {
      setError(`Password must be ${MIN_PASSWORD}–${MAX_PASSWORD} characters.`)
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await resetPassword({
        email: email.trim(),
        new_password: newPassword,
      })
      navigate('/login', {
        replace: true,
        state: { reset: true, email: email.trim() },
      })
    } catch (err) {
      setError(
        err instanceof ApiError ? err.detail : 'Reset failed. Try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Title order={3}>Reset password</Title>
          <Text size="sm" c="dimmed">
            Enter your account email and a new password.
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
            label="New password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD}
            maxLength={MAX_PASSWORD}
            value={newPassword}
            onChange={(event) => setNewPassword(event.currentTarget.value)}
          />
          <PasswordInput
            label="Confirm new password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD}
            maxLength={MAX_PASSWORD}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.currentTarget.value)}
          />
          <Button type="submit" loading={loading} fullWidth>
            Update password
          </Button>
          <Anchor component={Link} to="/login" size="sm" ta="center">
            Back to sign in
          </Anchor>
        </Stack>
      </form>
    </AuthLayout>
  )
}
