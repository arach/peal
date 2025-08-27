import { NextRequest, NextResponse } from 'next/server'
import { getStoredAnalyses, loadAnalysis, deleteAnalysis, findAnalysisByUrl } from '@/lib/audioAnalysisStorage'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const url = searchParams.get('url')
    
    if (id) {
      // Get specific analysis by ID
      const analysis = await loadAnalysis(id)
      if (!analysis) {
        return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
      }
      return NextResponse.json(analysis)
    } else if (url) {
      // Find analysis by URL
      const analysis = await findAnalysisByUrl(url)
      if (!analysis) {
        return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
      }
      return NextResponse.json(analysis)
    } else {
      // Get all stored analyses
      const analyses = await getStoredAnalyses()
      return NextResponse.json({ analyses })
    }
  } catch (error) {
    console.error('Error fetching stored analyses:', error)
    // Return empty analyses array instead of error to keep UI working
    return NextResponse.json({ analyses: [] })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Analysis ID is required' }, { status: 400 })
    }
    
    await deleteAnalysis(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting analysis:', error)
    return NextResponse.json(
      { error: 'Failed to delete analysis' },
      { status: 500 }
    )
  }
}