import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: 'index'
    },
    rolldownOptions: {
      external: ['react', 'react-dom', 'react-dom/server', 'react/jsx-runtime'],
    }
  }
})
