#!/usr/bin/env node

// Entry point for the Peal CLI
import('./cli/index.js').catch(err => {
  console.error('Failed to load Peal CLI:', err);
  console.error('Please ensure you have Node.js 16+ installed.');
  process.exit(1);
});