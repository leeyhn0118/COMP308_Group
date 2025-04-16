import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

// [https://vitejs.dev/config/](https://vitejs.dev/config/)
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'adminApp', 
      filename: 'remoteEntry.js', 
      exposes: {
        './App': './src/App.jsx', 
      },
      shared: ['react', 'react-dom', '@apollo/client', 'graphql'] 
    })
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  },
  server: {
    port: 3003, 
  }
});