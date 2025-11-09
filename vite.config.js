// vite.config.js (TAM VE EKSİKSİZ KOD)

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// package.json dosyasından homepage bilgisini çekiyoruz
const repo = require('./package.json').homepage;
const base = repo ? `/${repo.split('/').pop()}/` : '/';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // BU AYAR VİTE PROJELERİ İÇİN HAYATİDİR:
  base: base,
})