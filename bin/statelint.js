#! /usr/bin/env node

const stateLint = require('../lib/')()

const args = process.argv.slice(2)

if (args.length === 1 && ['--help', '-h', '-?'].includes(args[0])) {
  console.log('Usage: statelint state-machine-spec [state-machine-spec]...')
  console.log('')
  console.log('Validates Amazon State Language files')
  process.exit(0)
}

let ok = true
for (const file of args) {
  const problems = stateLint.validate(file)
  if (problems.length) {
    console.log(`ERROR: ${file} is not valid`)
    problems.forEach(p => console.log(`\t${p}`))

    ok = false
  }
}

process.exit(ok ? 0 : 1)
