import { promises as fs } from 'fs'
import path from 'path'

async function setupDirectories() {
  const directories = [
    'audio-cache',
    'analysis-cache'
  ]
  
  console.log('Setting up required directories...')
  
  for (const dir of directories) {
    const dirPath = path.join(process.cwd(), dir)
    try {
      await fs.access(dirPath)
      console.log(`✓ ${dir} directory exists`)
    } catch {
      await fs.mkdir(dirPath, { recursive: true })
      console.log(`✓ Created ${dir} directory`)
    }
  }
  
  console.log('Directory setup complete!')
}

setupDirectories().catch(console.error)