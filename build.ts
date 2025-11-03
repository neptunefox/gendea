// Build script using Vite for Vue support
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

try {
  await execAsync('npx vite build');
  console.log('✓ Built app.bundle.js');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
