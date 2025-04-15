import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shellApp',
      remotes: {
        userApp: 'http://localhost:3004/assets/remoteEntry.js',
        communityApp: 'http://localhost:3005/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom', '@apollo/client', 'graphql'],
    }),
  ],
  server: {
    port: 3003,
    strictPort: true,
  },
});
