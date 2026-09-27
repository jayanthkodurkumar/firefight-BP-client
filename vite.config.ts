import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // On Vercel, API calls must go to same-origin /api (see vercel.json rewrite).
  // Do not bake http://elasticbeanstalk… into the JS bundle even if env vars are set.
  const onVercel = env.VERCEL === '1'
  const apiUrl = onVercel
    ? ''
    : (env.VITE_API_URL || env.API_URL || '').trim()

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
  }
})
