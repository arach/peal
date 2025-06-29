import { modernAppPresets } from '../lib/presets/modernAppSounds'
import { SoundGenerator } from '../hooks/useSoundGeneration'
import fs from 'fs/promises'
import path from 'path'

async function generateAllPresets() {
  const generator = new SoundGenerator()
  const outputDir = path.join(process.cwd(), 'public', 'presets')
  
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true })
  
  console.log(`Generating ${modernAppPresets.length} preset sounds...`)
  
  for (const preset of modernAppPresets) {
    console.log(`\nGenerating: ${preset.name} (${preset.id})`)
    
    try {
      // Generate the sound
      const sound = await generator.generate(preset.name, preset.parameters)
      
      // Save the audio file
      const audioPath = path.join(outputDir, `${preset.id}.wav`)
      await fs.writeFile(audioPath, Buffer.from(sound.audioData))
      
      // Save the metadata
      const metadataPath = path.join(outputDir, `${preset.id}.json`)
      await fs.writeFile(metadataPath, JSON.stringify({
        ...preset,
        audioFile: `/presets/${preset.id}.wav`,
        generatedAt: new Date().toISOString()
      }, null, 2))
      
      console.log(`✓ Generated ${preset.id}`)
    } catch (error) {
      console.error(`✗ Failed to generate ${preset.id}:`, error)
    }
  }
  
  // Create an index file
  const indexPath = path.join(outputDir, 'index.json')
  const index = modernAppPresets.map(preset => ({
    id: preset.id,
    name: preset.name,
    category: preset.category,
    audioFile: `/presets/${preset.id}.wav`,
    metadataFile: `/presets/${preset.id}.json`
  }))
  
  await fs.writeFile(indexPath, JSON.stringify(index, null, 2))
  
  console.log('\n✨ All presets generated successfully!')
  console.log(`Output directory: ${outputDir}`)
}

// Run the script
generateAllPresets().catch(console.error)