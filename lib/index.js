const validator = require('@wmfs/j2119')
const checkStateNodes = require('./statelint/state_node')

const schemaPath = require.resolve('./schema/StateMachine.j2119')

class StateLint {
  constructor () {
    this.validator = validator(schemaPath)
  } // constructor

  validate (jsonSource) {
    const [json, problems] = this.validator.validate(jsonSource)

    return checkStateNodes(json, this.validator.root, problems)
  } // validate
} // class StateLint

module.exports = () => new StateLint()
