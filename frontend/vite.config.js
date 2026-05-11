import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Switches lottie-web to the light version which has no eval statements to resolve security/build warnings
      'lottie-web': 'lottie-web/build/player/lottie_light.js'
    }
  },
  build: {
    // Increases threshold before warnings are shown
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Moves all node_modules into dedicated split chunks to prevent oversized bundles
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      }
    }
  }
})
