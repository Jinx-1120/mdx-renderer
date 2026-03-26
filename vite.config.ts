import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/mdx-renderer/',
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
