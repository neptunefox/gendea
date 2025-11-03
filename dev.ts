// Development script that runs Vite dev server alongside Bun API server
import { spawn } from 'child_process';

// Start Vite dev server
const vite = spawn('npx', ['vite', '--port', '5173'], {
  stdio: 'inherit',
  shell: true
});

// Start Bun API server on different port
const server = spawn('bun', ['run', 'server.ts'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '3001' }
});

process.on('SIGINT', () => {
  vite.kill();
  server.kill();
  process.exit();
});
