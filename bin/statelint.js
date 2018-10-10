#! /usr/bin/env node
const cli = require('../lib/driver/cli')

const ok = cli()
process.exit(ok ? 0 : 1)
