import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, model, voice, speed } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const isGroqModel = model?.startsWith('playai-')
    
    if (isGroqModel) {
      // Handle Groq TTS
      if (!process.env.GROQ_API_KEY) {
        console.error("GROQ_API_KEY is not set in environment variables")
        return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 })
      }

      // Use Groq TTS API
      const response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,  // Use the actual Groq model name
          input: text,
          voice: voice || 'Fritz-PlayAI',
          response_format: 'wav'
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Groq TTS API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`)
      }

      const audioBuffer = await response.arrayBuffer()
      const audioBase64 = Buffer.from(audioBuffer).toString('base64')

      return NextResponse.json({
        audio: audioBase64,
        mimeType: 'audio/wav',
        format: 'wav',
      })
    } else {
      // Handle OpenAI TTS
      if (!process.env.OPENAI_API_KEY) {
        console.error("OPENAI_API_KEY is not set in environment variables")
        return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
      }

      // Generate speech using OpenAI TTS API directly
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'tts-1',
          input: text,
          voice: voice || 'alloy',
          speed: speed || 1.0,
          response_format: 'mp3'
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`OpenAI TTS API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`)
      }

      const audioBuffer = await response.arrayBuffer()
      const audioBase64 = Buffer.from(audioBuffer).toString('base64')

      return NextResponse.json({
        audio: audioBase64,
        mimeType: 'audio/mpeg',
        format: 'mp3',
      })
    }
  } catch (error) {
    console.error("TTS generation error:", error)
    return NextResponse.json({ error: "Failed to generate speech" }, { status: 500 })
  }
}