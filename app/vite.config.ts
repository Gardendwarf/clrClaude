import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Vite 8 / Rolldown uses a function-based manualChunks
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/react-markdown') || id.includes('node_modules/remark-') || id.includes('node_modules/rehype-') || id.includes('node_modules/highlight.js')) {
            return 'markdown';
          }
          if (id.includes('node_modules/@supabase')) {
            return 'supabase';
          }
        },
      },
    },
    // Vercel handles compression -- raise the warning threshold
    chunkSizeWarningLimit: 600,
  },
});
