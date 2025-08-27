import { promises as fs } from 'fs'
import path from 'path'

export interface StoredAnalysis {
  id: string
  url: string
  videoId: string
  timestamp: number
  analysis: any
  tracks: {
    id: string
    name: string
    color: string
    duration: number
  }[]
  metadata: {
    duration: number
    title?: string
    description?: string
  }
}

const ANALYSIS_STORAGE_DIR = path.join(process.cwd(), 'analysis-cache')

// Ensure storage directory exists
export async function ensureStorageDir() {
  try {
    await fs.access(ANALYSIS_STORAGE_DIR)
    console.log('Analysis storage directory exists:', ANALYSIS_STORAGE_DIR)
  } catch {
    console.log('Creating analysis storage directory:', ANALYSIS_STORAGE_DIR)
    await fs.mkdir(ANALYSIS_STORAGE_DIR, { recursive: true })
  }
}

// Save analysis to disk
export async function saveAnalysis(analysis: StoredAnalysis) {
  try {
    await ensureStorageDir()
    
    const filePath = path.join(ANALYSIS_STORAGE_DIR, `${analysis.id}.json`)
    await fs.writeFile(filePath, JSON.stringify(analysis, null, 2))
    console.log('Analysis saved successfully:', analysis.id)
    
    // Also update the index file
    await updateAnalysisIndex(analysis)
  } catch (error) {
    console.error('Error saving analysis:', error)
    throw new Error(`Failed to save analysis: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Load analysis from disk
export async function loadAnalysis(id: string): Promise<StoredAnalysis | null> {
  try {
    const filePath = path.join(ANALYSIS_STORAGE_DIR, `${id}.json`)
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error('Error loading analysis:', error)
    return null
  }
}

// Get all stored analyses (recent first)
export async function getStoredAnalyses(): Promise<StoredAnalysis[]> {
  try {
    await ensureStorageDir()
    
    const indexPath = path.join(ANALYSIS_STORAGE_DIR, 'index.json')
    
    try {
      const content = await fs.readFile(indexPath, 'utf-8')
      const index = JSON.parse(content)
      return index.analyses || []
    } catch (fileError) {
      // Index file doesn't exist yet, return empty array
      console.log('No analysis index found, returning empty array')
      return []
    }
  } catch (error) {
    console.error('Error reading analysis index:', error)
    return []
  }
}

// Update the analysis index
async function updateAnalysisIndex(analysis: StoredAnalysis) {
  try {
    const indexPath = path.join(ANALYSIS_STORAGE_DIR, 'index.json')
    
    let index = { analyses: [] as StoredAnalysis[] }
    
    try {
      const content = await fs.readFile(indexPath, 'utf-8')
      index = JSON.parse(content)
    } catch {
      // File doesn't exist, use empty index
      console.log('Creating new analysis index')
    }
    
    // Remove existing analysis with same ID
    index.analyses = index.analyses.filter(a => a.id !== analysis.id)
    
    // Add new analysis to beginning
    index.analyses.unshift(analysis)
    
    // Keep only last 50 analyses
    index.analyses = index.analyses.slice(0, 50)
    
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2))
    console.log('Analysis index updated successfully')
  } catch (error) {
    console.error('Error updating analysis index:', error)
    throw error
  }
}

// Delete an analysis
export async function deleteAnalysis(id: string) {
  try {
    const filePath = path.join(ANALYSIS_STORAGE_DIR, `${id}.json`)
    await fs.unlink(filePath)
    
    // Update index
    const indexPath = path.join(ANALYSIS_STORAGE_DIR, 'index.json')
    const content = await fs.readFile(indexPath, 'utf-8')
    const index = JSON.parse(content)
    
    index.analyses = index.analyses.filter((a: StoredAnalysis) => a.id !== id)
    
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2))
  } catch (error) {
    console.error('Error deleting analysis:', error)
  }
}

// Check if analysis exists for a URL
export async function findAnalysisByUrl(url: string): Promise<StoredAnalysis | null> {
  const analyses = await getStoredAnalyses()
  return analyses.find(a => a.url === url) || null
}

// Clean up old analyses (older than 30 days)
export async function cleanupOldAnalyses() {
  const analyses = await getStoredAnalyses()
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
  
  const toDelete = analyses.filter(a => a.timestamp < thirtyDaysAgo)
  
  for (const analysis of toDelete) {
    await deleteAnalysis(analysis.id)
  }
  
  console.log(`Cleaned up ${toDelete.length} old analyses`)
}