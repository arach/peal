import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { prepareNpmPackage } from './prepare-npm-package.mjs'

test('prepares a self-contained package with a dependency-free CLI', async (context) => {
  const fixture = await mkdtemp(path.join(tmpdir(), 'peal-package-test-'))
  const packageDir = path.join(fixture, 'package')
  const projectDir = path.join(fixture, 'project')
  context.after(() => rm(fixture, { recursive: true, force: true }))

  const pkg = await prepareNpmPackage({
    name: '@peal-sounds/peal',
    outDir: packageDir,
  })
  await mkdir(projectDir)

  assert.equal(pkg.dependencies, undefined)
  assert.equal(pkg.optionalDependencies, undefined)
  assert.equal(pkg.peerDependencies, undefined)
  assert.equal(pkg.bin.peal, 'cli/index.js')
  assert.equal(pkg.repository.url, 'git+https://github.com/arach/peal.git')
  assert.match(
    await readFile(path.join(packageDir, 'THIRD_PARTY_LICENSES.md'), 'utf8'),
    /howler\.js[\s\S]+MIT License|howler\.js[\s\S]+Permission is hereby granted/,
  )

  const cliSource = await readFile(path.join(packageDir, 'cli', 'index.js'), 'utf8')
  const imports = [...cliSource.matchAll(/^import .* from ['"]([^'"]+)['"];?$/gm)]
    .map((match) => match[1])
  assert.ok(imports.length > 0)
  assert.ok(imports.every((specifier) => specifier.startsWith('node:')))

  const result = spawnSync(
    process.execPath,
    [path.join(packageDir, 'cli', 'index.js'), 'add', 'success'],
    { cwd: projectDir, encoding: 'utf8' },
  )

  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /no runtime dependencies/)
  const helper = await readFile(path.join(projectDir, 'peal.js'), 'utf8')
  assert.doesNotMatch(helper, /from ['"]|require\(|howler/i)
})
