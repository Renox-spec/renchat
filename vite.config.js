// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// package.json dosyasından projenizin adını alacak (otomatik)
const repoName = require('./package.json').homepage.split('/').pop();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // BU YENİ ALANI EKLEYİN:
  // Projenin yayınlanacağı yolu belirtir
  base: `/${repoName}/`, 
})