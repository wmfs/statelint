#! /usr/bin/env node
const cli = require('../lib/driver/cli')

const driver = cli()
const ok = driver.process()
process.exit(ok ? 0 : 1)
