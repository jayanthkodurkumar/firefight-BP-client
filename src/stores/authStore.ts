import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AuthState = {
  accessToken: string | null
  setAccessToken: (token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      setAccessToken: (token) => set({ accessToken: token }),
      logout: () => set({ accessToken: null }),
      isAuthenticated: () => Boolean(get().accessToken),
    }),
    {
      name: 'firefight-auth',
      partialize: (state) => ({ accessToken: state.accessToken }),
    },
  ),
)

export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken
}
