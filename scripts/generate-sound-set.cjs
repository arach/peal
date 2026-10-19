#!/usr/bin/env node
/**
 * Generate a sound set by driving Peal Studio's AI Design panel.
 *
 *   node scripts/generate-sound-set.cjs examples/sound-sets/ebook-reader.json
 *
 * Needs the dev server (`bun dev`, port 3001) and a Chromium/Chrome. Each
 * prompt is one AI turn; every resulting composition is saved into a set
 * named after the file, then the set is exported as JSON + WAVs.
 *
 * Options:
 *   --out <dir>          Export folder (default: ~/Downloads/<set-name>)
 *   --headed             Show the browser window
 *   --browser-url <url>  Attach to a running browser started with
 *                        --remote-debugging-port (e.g. one in a Lattices
 *                        virtual desktop) instead of launching one
 *   --url <url>          Studio URL (default: http://localhost:3001/studio)
 *   --play               Play each sound after it is composed
 *
 * Browser binary: $CHROME_PATH, else /usr/bin/chromium, else macOS Chrome.
 */
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const puppeteer = require('puppeteer')

const args = process.argv.slice(2)
const flag = (name) => args.includes(name)
const opt = (name, fallback) => {
  const i = args.indexOf(name)
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback
}
const file = args.find((a) => a.endsWith('.json'))
if (!file) {
  console.error('usage: node scripts/generate-sound-set.cjs <set.json> [--out dir] [--headed] [--browser-url url] [--play]')
  process.exit(1)
}

const spec = JSON.parse(fs.readFileSync(file, 'utf8'))
const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const outDir = path.resolve(opt('--out', path.join(os.homedir(), 'Downloads', slug(spec.name))))
const studioUrl = opt('--url', 'http://localhost:3001/studio')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function chromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    '/usr/bin/chromium',
    '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean)
  return candidates.find((p) => fs.existsSync(p))
}

// Runs in the page: keep the inspector + AI Design tab open (narrow layouts
// collapse it) and report the composition count ("v3 of 3" → 3).
function openPanelAndCount() {
  const byLabel = (re) => [...document.querySelectorAll('button')]
    .find((b) => re.test(((b.getAttribute('aria-label') || b.title || b.textContent) || '').trim()))
  byLabel(/^Expand Parameters$/)?.click()
  if (!document.querySelector('.peal-ai-composer-input')) byLabel(/^ai design$/i)?.click()
  const label = [...document.querySelectorAll('.peal-ai-label')].map((e) => e.textContent || '').find((t) => /of \d+$/.test(t))
  return label ? Number(label.match(/of (\d+)$/)[1]) : 0
}

const clickButton = (page, text) => page.evaluate((t) => {
  const b = [...document.querySelectorAll('button')].find((el) => (el.textContent || '').trim() === t)
  if (b && !b.disabled) { b.click(); return true }
  return false
}, text)

async function compose(page, prompt) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const before = await page.evaluate(openPanelAndCount)
    await sleep(500)
    await page.evaluate(() => { const t = document.querySelector('.peal-ai-composer-input'); if (t) t.value = '' })
    await page.click('.peal-ai-composer-input')
    await page.type('.peal-ai-composer-input', prompt, { delay: 8 })
    await page.keyboard.press('Enter')
    await sleep(2000)
    try {
      await page.waitForFunction((b, fn) => {
        const n = new Function(`return (${fn})()`)()
        const busy = !!document.querySelector('.peal-ai-bubble--pending')
        return n > b || (!busy && !!document.querySelector('[role=alert]'))
      }, { timeout: 240000, polling: 1000 }, before, openPanelAndCount.toString())
    } catch {
      console.log('  timed out')
    }
    if ((await page.evaluate(openPanelAndCount)) > before) return true
    console.log(attempt === 0 ? '  turn failed, retrying' : '  turn failed')
  }
  return false
}

;(async () => {
  fs.mkdirSync(outDir, { recursive: true })
  const browserUrl = opt('--browser-url')
  const browser = browserUrl
    ? await puppeteer.connect({ browserURL: browserUrl, defaultViewport: null })
    : await puppeteer.launch({
        executablePath: chromePath(),
        headless: !flag('--headed'),
        defaultViewport: { width: 1600, height: 1000 },
        args: ['--window-size=1600,1000', '--autoplay-policy=no-user-gesture-required'],
      })
  const page = await browser.newPage()
  const cdp = await page.createCDPSession()
  await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: outDir })
  page.on('pageerror', (e) => console.log('pageerror', e.message))

  await page.goto(studioUrl, { waitUntil: 'networkidle2', timeout: 60000 })
  await sleep(3000)
  await page.evaluate(openPanelAndCount)
  await sleep(800)

  let setCreated = false
  for (const [i, sound] of spec.sounds.entries()) {
    console.log(`[${i + 1}/${spec.sounds.length}] ${sound.key}`)
    if (!(await compose(page, sound.prompt))) continue
    await page.evaluate(openPanelAndCount)
    await sleep(800)
    if (!setCreated) {
      await clickButton(page, 'New')
      await page.waitForSelector('input[placeholder^="Set name"]', { timeout: 5000 })
      await page.type('input[placeholder^="Set name"]', spec.name)
      await page.keyboard.press('Enter')
      setCreated = true
      await sleep(300)
    }
    await clickButton(page, 'Save to set')
    const summary = await page.evaluate(() => {
      const sec = [...document.querySelectorAll('.peal-ai-section')].find((s) => /Composition/.test(s.textContent || ''))
      return sec?.querySelector('p.text-sm')?.textContent
    })
    console.log(`  saved: ${summary}`)
    if (flag('--play')) {
      await page.evaluate(() => document.querySelector('.peal-inst-transport--main')?.click())
      await sleep(1500)
    }
  }

  await page.evaluate(openPanelAndCount)
  await sleep(500)
  await clickButton(page, 'JSON')
  await clickButton(page, 'WAVs')
  await sleep(4000)
  console.log(`\nExported to ${outDir}`)
  for (const f of fs.readdirSync(outDir)) console.log(`  ${f}`)

  if (browserUrl) browser.disconnect()
  else await browser.close()
})().catch((err) => {
  console.error(err)
  process.exit(1)
})
