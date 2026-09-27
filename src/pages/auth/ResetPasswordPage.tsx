import { Navigate } from 'react-router-dom'

/** Legacy route — reset is handled on /forgot-password. */
export function ResetPasswordPage() {
  return <Navigate to="/forgot-password" replace />
}
