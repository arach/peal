#!/usr/bin/env node

/**
 * Peal Node.js Usage Example
 * 
 * This example shows how to use Peal in a Node.js environment.
 * Note: Audio playback in Node.js requires system audio commands.
 */

import { Peal } from '@peal-sounds/peal'
import { exec } from 'child_process'
import { promisify } from 'util'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Create a custom Peal instance for Node.js
class NodePeal extends Peal {
  constructor(options = {}) {
    super(options)
    this.soundPaths = new Map()
  }
  
  // Override load to store file paths
  load(id, src) {
    super.load(id, src)
    // Store the actual file path for Node.js playback
    this.soundPaths.set(id, src)
  }
  
  // Override play to use system commands
  async play(id, options) {
    const soundPath = this.soundPaths.get(id)
    if (!soundPath) {
      console.error(`Sound "${id}" not found`)
      return
    }
    
    // Detect platform and use appropriate command
    const platform = process.platform
    let command
    
    if (platform === 'darwin') {
      // macOS
      command = `afplay "${soundPath}"`
    } else if (platform === 'win32') {
      // Windows
      command = `powershell -c "(New-Object Media.SoundPlayer '${soundPath}').PlaySync()"`
    } else {
      // Linux - try aplay
      command = `aplay "${soundPath}"`
    }
    
    try {
      await execAsync(command)
      console.log(`✓ Played: ${id}`)
    } catch (error) {
      console.error(`✗ Failed to play ${id}:`, error.message)
    }
  }
}

// Example usage
async function demo() {
  console.log('🔊 Peal Node.js Demo\n')
  
  const peal = new NodePeal()
  
  // Load sounds from the CLI directory
  // In a real app, you'd copy these sounds to your project
  const soundsDir = join(dirname(__dirname), 'cli', 'sounds')
  
  peal.load('click', join(soundsDir, 'click.wav'))
  peal.load('success', join(soundsDir, 'success.wav'))
  peal.load('error', join(soundsDir, 'error.wav'))
  peal.load('notification', join(soundsDir, 'notification.wav'))
  
  console.log('Playing demo sounds...\n')
  
  // Play some sounds
  await peal.play('click')
  await new Promise(r => setTimeout(r, 500))
  
  await peal.play('notification')
  await new Promise(r => setTimeout(r, 1000))
  
  await peal.play('success')
  await new Promise(r => setTimeout(r, 500))
  
  console.log('\n✨ Demo complete!')
  console.log('\nTip: Use "peal add" to copy sounds to your project')
}

// Run demo if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  demo().catch(console.error)
}