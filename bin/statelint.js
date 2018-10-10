#! /usr/bin/env node
const LineReader = require('n-readlines')
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
  try {
    validate(file)
  } catch (err) {
    console.log(`ERROR: ${file} os not valid\n\t${err.message}`)
    ok = false
  }
} // for ...

process.exit(ok ? 0 : 1)

/// ////////////////////////
function validate (file) {
  const json = readAndParse(file)
  const problems = stateLint.validate(json)
  if (problems.length) {
    console.log(`ERROR: ${file} is not valid`)
    problems.forEach(p => console.log(`\t${p}`))

    ok = false
  }
} // validate

function readAndParse (jsonSource) {
  const lines = [...readlines(jsonSource)].join('\n')
  return JSON.parse(lines)
} // readAndParse

function * readlines (source) {
  const reader = new LineReader(source)
  let line
  while ((line = reader.next())) {
    yield line.toString('utf-8')
  }
} // readlines
