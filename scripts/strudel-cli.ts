#!/usr/bin/env node

import chalk from 'chalk'
import ora from 'ora'
import {
  getStrudelStatus,
  installStrudel,
  loadStrudelConfig,
  setStrudelCheckoutPath,
  startStrudel,
  stopStrudel,
  type StrudelManageStatus,
} from '../lib/strudel/manage.ts' // node --experimental-strip-types

const commands = ['install', 'start', 'stop', 'status', 'set-path', 'path'] as const

function printStatus(status: StrudelManageStatus) {
  const phaseColor = status.phase === 'running'
    ? chalk.green
    : status.phase === 'error'
      ? chalk.red
      : status.phase === 'starting'
        ? chalk.yellow
        : chalk.gray

  console.log(phaseColor(`● ${status.phase}`))
  if (status.config) {
    console.log(`  path:     ${status.config.checkoutPath}`)
    console.log(`  port:     ${status.config.port}`)
    console.log(`  manager:  ${status.config.packageManager}`)
  }
  if (status.upstream) console.log(`  upstream: ${status.upstream}`)
  console.log(`  reachable: ${status.reachable ? 'yes' : 'no'}`)
  if (status.state?.pid) console.log(`  pid:      ${status.state.pid}`)
  console.log(`  ${status.message}`)
}

async function main() {
  const [command, ...args] = process.argv.slice(2)

  if (!command || command === '--help' || command === '-h') {
    console.log(`
${chalk.cyan('peal strudel')} — manage the external Strudel checkout (AGPL, not vendored)

${chalk.bold('Usage')}
  bun run strudel:install [--path <dir>]
  bun run strudel:start
  bun run strudel:stop
  bun run strudel:status
  bun run strudel:path
  bun run strudel:set-path <dir>

${chalk.bold('Config')}  .peal/strudel.json
${chalk.bold('State')}   .peal/strudel-state.json
${chalk.bold('Logs')}    .peal/strudel.log
`)
    return
  }

  if (!commands.includes(command as typeof commands[number])) {
    console.error(chalk.red(`Unknown command: ${command}`))
    process.exit(1)
  }

  switch (command) {
    case 'path': {
      const config = await loadStrudelConfig()
      console.log(config.checkoutPath)
      break
    }
    case 'set-path': {
      const target = args[0]
      if (!target) {
        console.error(chalk.red('Usage: bun run strudel:set-path <directory>'))
        process.exit(1)
      }
      const config = await setStrudelCheckoutPath(target)
      console.log(chalk.green(`Strudel path → ${config.checkoutPath}`))
      break
    }
    case 'install': {
      const pathFlag = args.indexOf('--path')
      const checkoutPath = pathFlag >= 0 ? args[pathFlag + 1] : undefined
      const spinner = ora('Installing managed Strudel checkout…').start()
      try {
        const config = await installStrudel(checkoutPath)
        spinner.succeed(`Strudel installed at ${config.checkoutPath}`)
      } catch (error) {
        spinner.fail(error instanceof Error ? error.message : String(error))
        process.exit(1)
      }
      break
    }
    case 'start': {
      const spinner = ora('Starting Strudel…').start()
      try {
        const status = await startStrudel()
        spinner.stop()
        printStatus(status)
        if (status.phase !== 'running') process.exit(1)
      } catch (error) {
        spinner.fail(error instanceof Error ? error.message : String(error))
        process.exit(1)
      }
      break
    }
    case 'stop': {
      const spinner = ora('Stopping Strudel…').start()
      const status = await stopStrudel()
      spinner.succeed('Strudel stopped')
      printStatus(status)
      break
    }
    case 'status': {
      printStatus(await getStrudelStatus())
      break
    }
    default:
      break
  }
}

main().catch((error) => {
  console.error(chalk.red(error instanceof Error ? error.message : String(error)))
  process.exit(1)
})