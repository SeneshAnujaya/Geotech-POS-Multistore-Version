import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   proxy: {
  //     // Proxy API requests to the backend server
  //     '/': {
  //       target: process.env.VITE_API_URL || 'http://localhost:3001', // Your backend API URL
  //       changeOrigin: true,  // Adjusts the origin of the request to match the backend
  //       secure: false,  // Set to true if you're using HTTPS in development
  //     },
  //   },
  // },
  // build: {
  //   rollupOptions: {
  //     external: [
  //       '@prisma/client',
  //       '.prisma/client',
  //       '.prisma/client/index-browser',
  //       '@prisma/client/runtime/index-browser',
  //     ],
  //   },
  // },
})
