const path = require('path')
const StateLint = require('../statelint/statelint')
const LineReader = require('n-readlines')

class Cli {
  constructor(
    stateLint = new StateLint(),
    description = 'Validates Amazon State Language files'
  ) {
    this.stateLint = stateLint
    this.description = description
  } // constructor

  process (args = process.argv) {
    if (showIfHelp(args, this.description)) return true

    const files = args.slice(2)
    return validateFiles(files, this.stateLint)
  } // process
} // class Cli

/// ////////////////////////
function validateFiles (files, stateLint) {
  let ok = true

  for (const file of files) {
    try {
      validate(file, stateLint)
    } catch (err) {
      console.log(`ERROR: ${file} os not valid\n\t${err.message}`)
      ok = false
    }
  } // for ...

  return ok
} // validateFiles

function validate (file, stateLint) {
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

function showIfHelp (args, description) {
  const name = path.basename(args[1])
  const opts = args.slice(2)

  if (!(opts.length === 1 && ['--help', '-h', '-?'].includes(opts[0]))) {
    return false
  }

  console.log(`Usage: ${name} ...[state-machine-spec]`)
  console.log('')
  console.log(description)
  return true
} // showIfHelp

module.exports = (stateLint, description) => new Cli(stateLint, description)