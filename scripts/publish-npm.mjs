import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const NAMESPACES = ['@peal-sounds/peal', '@arach/peal']
const only = process.argv.includes('--only')
  ? process.argv[process.argv.indexOf('--only') + 1]
  : null

const targets = only ? NAMESPACES.filter((name) => name === only) : NAMESPACES
if (only && targets.length === 0) {
  console.error(`Unknown namespace: ${only}`)
  console.error(`Expected one of: ${NAMESPACES.join(', ')}`)
  process.exit(1)
}

const pkgPath = new URL('../package.json', import.meta.url)
const original = readFileSync(pkgPath, 'utf8')
const pkg = JSON.parse(original)
const npmrcPath = '/tmp/peal-npmrc'

if (!process.env.NPM_TOKEN) {
  console.error('NPM_TOKEN is required. Run via: secret run NPM_TOKEN -- node scripts/publish-npm.mjs')
  process.exit(1)
}

writeFileSync(npmrcPath, `//registry.npmjs.org/:_authToken=${process.env.NPM_TOKEN}\n`)

try {
  for (const name of targets) {
    pkg.name = name
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
    console.log(`Publishing ${name}@${pkg.version}...`)
    execSync('npm publish --access public --userconfig /tmp/peal-npmrc', {
      stdio: 'inherit',
      cwd: new URL('..', import.meta.url),
    })
  }
} finally {
  writeFileSync(pkgPath, original)
}