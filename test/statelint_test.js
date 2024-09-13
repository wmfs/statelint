/* eslint-env mocha */

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

const stateLint = require('../lib')

describe('StateMachineLint', () => {
  describe('Fail states', () => {
    verify(
      'Allow Fail states to omit optional Cause/Error fields',
      require('./fixtures/minimal-fail-state.json')
    )

    verify(
      'Allow Fail states to use ErrorPath and CausePath fields',
      require('./fixtures/fail-with-error-and-cause-path.json')
    )

    verify(
    'Allow Fail states to use ErrorPath and CausePath fields with intrinsic functions',
      require('./fixtures/fail-with-error-and-cause-path-using-intrinsic-functions.json')
    )

    verify(
      'Reject Fail state with both static and dynamic error',
      require('./fixtures/fail-with-static-and-dynamic-error.json'),
      'may have only one of Error,ErrorPath'
    )

    verify(
      'Reject Fail state with both static and dynamic cause',
      require('./fixtures/fail-with-static-and-dynamic-cause.json'),
      'may have only one of Cause,CausePath'
    )
  })

  describe('Empty ErrorEquals clauses', () => {
    verify(
      'reject empty ErrorEquals on Catch',
      require('./fixtures/empty-error-equals-on-catch'),
      'non-empty required'
    )

    verify(
      'reject empty ErrorEquals on Retry',
      require('./fixtures/empty-error-equals-on-retry'),
      'non-empty required'
    )
  })

  describe('Parameters only valid on Pass, Task, and Parallel', () => {
    verify(
      'Pass With Parameters',
      require('./fixtures/pass-with-parameters')
    )
    verify(
      'Task With Parameters',
      require('./fixtures/task-with-parameters')
    )
    verify(
      'Parallel With Parameters',
      require('./fixtures/parallel-with-parameters')
    )
  })

  describe('Parameters not valid on all other state types', () => {
    verify(
      'Choice With Parameters',
      require('./fixtures/choice-with-parameters'),
      '"Parameters'
    )
    verify(
      'Wait With Parameters',
      require('./fixtures/wait-with-parameters'),
      '"Parameters'
    )
    verify(
      'Succeed With Parameters',
      require('./fixtures/succeed-with-parameters'),
      '"Parameters'
    )
    verify(
      'Fail With Parameters',
      require('./fixtures/fail-with-parameters'),
      '"Parameters'
    )
  })

  describe('Parameter paths', () => {
    verify(
      'reject non-Path constructs in Parameter fields ending in ".$"',
      require('./fixtures/parameter-path-problems'),
      'bad1',
      'bad2',
      'bad3',
      'bad4'
    )
  })

  describe('ResultPath only valid on Pass, Task, Parallel', () => {
    verify(
      'Pass with ResultPath',
      require('./fixtures/pass-with-resultpath')
    )
    verify(
      'Task with ResultPath',
      require('./fixtures/task-with-resultpath')
    )
    verify(
      'Parallel with ResultPath',
      require('./fixtures/parallel-with-resultpath')
    )
  })

  describe('ResultPath not valid on all other State types', () => {
    verify(
      'Choice with ResultPath',
      require('./fixtures/choice-with-resultpath'),
      '"ResultPath"'
    )
    verify(
      'Wait with ResultPath',
      require('./fixtures/wait-with-resultpath'),
      '"ResultPath"'
    )
    verify(
      'Succeed with ResultPath',
      require('./fixtures/succeed-with-resultpath'),
      '"ResultPath"'
    )
    verify(
      'Fail with ResultPath',
      require('./fixtures/fail-with-resultpath'),
      '"ResultPath"'
    )
  })

  describe('Validate Catch', () => {
    verify(
      'Catch States.ALL',
      require('./fixtures/hello-world-with-caught-failures')
    )
  })

  describe('Real-life state machines', () => {
    verify(
      'BackoffRate maybe an integer',
      require('./fixtures/j2119_issues_37')
    )
  })
})

function verify (label, json, ...msg) {
  it(label, () => {
    const linter = stateLint()
    const problems = linter.validate(json)

    console.log(problems)

    expect(problems.length).to.eql(msg.length)
    for (let i = 0; i !== msg.length; ++i) {
      expect(problems[i]).to.include(msg[i])
    }
  })
}
