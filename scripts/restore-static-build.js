import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')
const stashDir = path.join(rootDir, '.static-build-stash')

const DEV_ROUTES = ['app/strudel', 'app/api/strudel']

async function restoreDevRoutes() {
  for (const rel of DEV_ROUTES) {
    const src = path.join(stashDir, rel)
    const dest = path.join(rootDir, rel)
    try {
      await fs.access(src)
      await fs.mkdir(path.dirname(dest), { recursive: true })
      await fs.rename(src, dest)
      console.log(`♻️  Restored ${rel}`)
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        continue
      }
      throw error
    }
  }
}

restoreDevRoutes().catch((error) => {
  console.error('❌ Failed to restore dev routes:', error)
  process.exit(1)
})