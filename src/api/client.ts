import { getAccessToken } from '../stores/authStore'

export class ApiError extends Error {
  status: number
  detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

let unauthorizedHandler: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler
}

/** Backend origin, or current site origin when using same-origin `/api` (e.g. Vercel rewrite). */
export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_URL?.trim()
  if (configured) {
    return configured.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  throw new Error(
    'VITE_API_URL is not set and API base cannot be resolved without a browser origin',
  )
}

function apiUrl(path: string): string {
  return new URL(path, `${getApiBaseUrl()}/`).href
}

function parseErrorDetail(body: unknown, fallback: string): string {
  if (typeof body !== 'object' || body === null || !('detail' in body)) {
    return fallback
  }
  const detail = (body as { detail: unknown }).detail
  if (typeof detail === 'string') {
    return detail
  }
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'object' && item !== null && 'msg' in item) {
          return String((item as { msg: unknown }).msg)
        }
        return String(item)
      })
      .join(', ')
  }
  return fallback
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) {
      return undefined as T
    }
    return response.json() as Promise<T>
  }

  let detail = response.statusText
  try {
    detail = parseErrorDetail(await response.json(), detail)
  } catch {
    // ignore non-JSON error bodies
  }

  if (response.status === 401) {
    unauthorizedHandler?.()
  }

  throw new ApiError(response.status, detail)
}

function authHeaders(): HeadersInit {
  const token = getAccessToken()
  if (!token) {
    return {}
  }
  return { Authorization: `Bearer ${token}` }
}

export async function apiGet<T>(
  path: string,
  searchParams?: Record<string, string | number | undefined>,
  options?: { auth?: boolean },
): Promise<T> {
  const url = new URL(apiUrl(path))

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value))
      }
    }
  }

  const useAuth = options?.auth !== false
  const response = await fetch(url, {
    headers: useAuth ? authHeaders() : undefined,
  })

  return parseResponse<T>(response)
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  options?: { auth?: boolean },
): Promise<T> {
  const useAuth = options?.auth !== false
  const response = await fetch(apiUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(useAuth ? authHeaders() : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  return parseResponse<T>(response)
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
  options?: { auth?: boolean },
): Promise<T> {
  const useAuth = options?.auth !== false
  const response = await fetch(apiUrl(path), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(useAuth ? authHeaders() : {}),
    },
    body: JSON.stringify(body),
  })

  return parseResponse<T>(response)
}
