import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: env.VITE_BASE || '/Spaces/TempleDjs/',
    server: {
      port: 3002,
      host: '0.0.0.0',
    },
    plugins: [react()],
    build: {
      // Output directly into the repo's Spaces/TempleDjs folder for GitHub Pages
      outDir: '../../Spaces/TempleDjs',
      // Ensure old hashed assets are removed so clients don't load stale bundles
      emptyOutDir: true,
      // Work around Windows lock on existing assets folder by using a new assets directory name
      assetsDir: 'assets2'
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
