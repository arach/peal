import { chmod, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptPath = fileURLToPath(import.meta.url)
const rootDir = path.resolve(path.dirname(scriptPath), '..')

export async function prepareNpmPackage({ name, outDir }) {
  const destination = path.resolve(outDir)
  if (destination === rootDir) throw new Error('Refusing to prepare a package over the repository root')

  const sourcePackage = JSON.parse(await readFile(path.join(rootDir, 'package.json'), 'utf8'))
  const publishedPackage = {
    name,
    version: sourcePackage.version,
    description: sourcePackage.description,
    type: 'module',
    main: './dist/index.cjs',
    module: './dist/index.mjs',
    types: './dist/index.d.ts',
    exports: {
      '.': {
        types: './dist/index.d.ts',
        import: './dist/index.mjs',
        require: './dist/index.cjs',
      },
    },
    bin: { peal: 'cli/index.js' },
    keywords: sourcePackage.keywords,
    author: sourcePackage.author,
    repository: sourcePackage.repository,
    homepage: sourcePackage.homepage,
    bugs: sourcePackage.bugs,
    license: sourcePackage.license,
    engines: sourcePackage.engines,
  }

  await rm(destination, { recursive: true, force: true })
  await mkdir(path.join(destination, 'cli'), { recursive: true })
  await cp(path.join(rootDir, 'dist'), path.join(destination, 'dist'), { recursive: true })
  await cp(path.join(rootDir, 'cli', 'sounds'), path.join(destination, 'cli', 'sounds'), { recursive: true })
  await cp(path.join(rootDir, 'cli', 'templates'), path.join(destination, 'cli', 'templates'), { recursive: true })
  await cp(path.join(rootDir, 'cli', 'index.js'), path.join(destination, 'cli', 'index.js'))
  await cp(path.join(rootDir, 'README.npm.md'), path.join(destination, 'README.md'))
  await cp(path.join(rootDir, 'LICENSE'), path.join(destination, 'LICENSE'))
  const howlerLicense = await readFile(path.join(rootDir, 'node_modules', 'howler', 'LICENSE.md'), 'utf8')
  await writeFile(
    path.join(destination, 'THIRD_PARTY_LICENSES.md'),
    `# Third-party licenses\n\n## howler.js\n\n${howlerLicense}`,
  )
  await chmod(path.join(destination, 'cli', 'index.js'), 0o755)
  await writeFile(
    path.join(destination, 'package.json'),
    `${JSON.stringify(publishedPackage, null, 2)}\n`,
  )

  return publishedPackage
}

if (path.resolve(process.argv[1] || '') === scriptPath) {
  const outIndex = process.argv.indexOf('--out')
  const nameIndex = process.argv.indexOf('--name')
  if (outIndex === -1 || !process.argv[outIndex + 1]) {
    console.error('Usage: node scripts/prepare-npm-package.mjs --out <directory> [--name <package>]')
    process.exitCode = 1
  } else {
    const sourcePackage = JSON.parse(await readFile(path.join(rootDir, 'package.json'), 'utf8'))
    const prepared = await prepareNpmPackage({
      name: nameIndex === -1 ? sourcePackage.name : process.argv[nameIndex + 1],
      outDir: process.argv[outIndex + 1],
    })
    console.log(`Prepared ${prepared.name}@${prepared.version} with zero runtime dependencies`)
  }
}
