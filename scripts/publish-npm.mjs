import { execFileSync } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { prepareNpmPackage } from './prepare-npm-package.mjs'

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

if (!process.env.NPM_TOKEN) {
  console.error('NPM_TOKEN is required. Run via: secret run NPM_TOKEN -- node scripts/publish-npm.mjs')
  process.exit(1)
}

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const stagingRoot = await mkdtemp(path.join(tmpdir(), 'peal-publish-'))
const npmrcPath = path.join(stagingRoot, '.npmrc')

try {
  execFileSync('pnpm', ['build:lib'], { cwd: rootDir, stdio: 'inherit' })
  await writeFile(npmrcPath, `//registry.npmjs.org/:_authToken=${process.env.NPM_TOKEN}\n`)

  for (const name of targets) {
    const packageDir = path.join(stagingRoot, name.replaceAll('/', '-').replace('@', ''))
    const pkg = await prepareNpmPackage({ name, outDir: packageDir })
    console.log(`Publishing ${pkg.name}@${pkg.version}...`)
    execFileSync(
      'npm',
      ['publish', '--access', 'public', '--userconfig', npmrcPath],
      { cwd: packageDir, stdio: 'inherit' },
    )
  }
} finally {
  await rm(stagingRoot, { recursive: true, force: true })
}
