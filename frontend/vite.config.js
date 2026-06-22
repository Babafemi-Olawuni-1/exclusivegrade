import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // req.url = /api/classes  or  /api/classes?foo=bar
            const url   = req.url || ''
            const [pathPart, qsPart] = url.split('?')
            // Strip /api/ prefix to get the route
            const route = pathPart.replace(/^\/api\/?/, '').replace(/\/$/, '')
            // Build new path pointing to index.php with route param
            const newPath = '/exclusivegrade/backend/api/index.php?route=' + route
                          + (qsPart ? '&' + qsPart : '')
            proxyReq.path = newPath
          })
        },
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
