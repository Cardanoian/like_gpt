import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: { outDir: './dist/' },
  // 환경 변수 설정 추가
  envDir: './',
  envPrefix: 'VITE_',
  server: { port: 3000 },
});
