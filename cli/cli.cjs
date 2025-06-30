#!/usr/bin/env node

// CommonJS wrapper for ES module CLI
const { pathToFileURL } = require('url');
const path = require('path');

async function main() {
  try {
    const cliPath = pathToFileURL(path.join(__dirname, 'index.js')).href;
    await import(cliPath);
  } catch (err) {
    console.error('Failed to load Peal CLI:', err.message);
    process.exit(1);
  }
}

main();