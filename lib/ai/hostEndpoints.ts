// Hudson owns inference. The module runs in this browser, so visitor keys
// continue to go directly to their provider rather than to a hosted API.
const HUDSON_SITE_ORIGIN = process.env.NEXT_PUBLIC_HUDSON_ORIGIN || 'https://hudsonkit.com'
export const HUDSON_AI_BROWSER_URL = new URL('/ai/browser-v1.js', HUDSON_SITE_ORIGIN).href
export const HUDSON_AI_CHAT_PATH = '/api/ai/chat'
export const HUDSON_AI_SERVER_ORIGIN = process.env.HUDSON_AI_ORIGIN || 'http://localhost:3500'
