import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  define: {
    'import.meta.env.VITE_KLS_HEADERLABEL': JSON.stringify(
      process.env.kls_HeaderLabel ??
        process.env.KLS_HEADERLABEL ??
        process.env.VITE_KLS_HEADERLABEL ??
        'Employee Registration Form'
    )
  }
});