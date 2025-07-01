import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

async function copyDirectory(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function prepareStaticBuild() {
  console.log('Preparing static build...');
  
  // Copy assets/sounds to public/sounds for static export
  const soundsSrc = path.join(rootDir, 'assets', 'sounds');
  const soundsDest = path.join(rootDir, 'public', 'sounds');
  
  try {
    await copyDirectory(soundsSrc, soundsDest);
    console.log('✅ Copied sounds to public directory');
  } catch (error) {
    console.error('❌ Failed to copy sounds:', error);
    process.exit(1);
  }
}

prepareStaticBuild();