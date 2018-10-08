const validator = require('@wmfs/j2119')
const stateNode = require('./statelint/state_node')

const schemaPath = require.resolve('./schema/StateMachine.j2119')

class StateLint {
  constructor () {
    this.validator = validator(schemaPath)
  } // constructor

  validate (jsonSource) {
    const [json, problems] = this.validator.validate(jsonSource)

    const checker = stateNode()
    checker.check(json, this.validator.root, problems)

    return problems
  } // validate
} // class StateLint

module.exports = () => new StateLint()
