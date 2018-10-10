const StateLint = require('./statelint/statelint')
const cli = require('./driver/cli')

module.exports = () => new StateLint()
module.exports.StateLint = StateLint
module.exports.cli = cli
