const validator = require('@wmfs/j2119')
const checkStateNodes = require('./state_node')

const schemaPath = require.resolve('../schema/StateMachine.j2119')

class StateLint {
  constructor (...schemaExtensions) {
    this.validator = validator(schemaPath, ...schemaExtensions)
  } // constructor

  validate (json) {
    const problems = this.validator.validate(json)

    return checkStateNodes(json, this.validator.root, problems)
  } // validate
} // class StateLint

module.exports = StateLint
