/* eslint-env mocha */

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

const stateLint = require('../lib')

describe('StateMachineLint', () => {
  verify(
    'allow Fail states to omit optional Cause/Error fields',
    require('./fixtures/minimal-fail-state.json'),
    0
  )

  describe('Empty ErrorEquals clauses', () => {
    verify(
      'reject empty ErrorEquals on Catch',
      require('./fixtures/empty-error-equals-on-catch'),
      1,
      'non-empty required'
    )

    verify(
      'reject empty ErrorEquals on Retry',
      require('./fixtures/empty-error-equals-on-retry'),
      1,
      'non-empty required'
    )
  })

  describe('ResultPath only valid on Pass, Task, Parallel', () => {
    verify(
      'Pass with ResultPath',
      require('./fixtures/pass-with-resultpath'),
      0
    )
    verify(
      'Task with ResultPath',
      require('./fixtures/task-with-resultpath'),
      0
    )
    verify(
      'Parallel with ResultPath',
      require('./fixtures/parallel-with-resultpath'),
      0
    )
  })

  describe('ResultPath not valid on all other State types', () => {
    verify(
      'Choice with ResultPath',
      require('./fixtures/choice-with-resultpath'),
      1,
      '"ResultPath"'
    )
    verify(
      'Wait with ResultPath',
      require('./fixtures/wait-with-resultpath'),
      1,
      '"ResultPath"'
    )
    verify(
      'Succeed with ResultPath',
      require('./fixtures/succeed-with-resultpath'),
      1,
      '"ResultPath"'
    )
    verify(
      'Fail with ResultPath',
      require('./fixtures/fail-with-resultpath'),
      1,
      '"ResultPath"'
    )
  })
})

function verify (label, json, count, msg) {
  it(label, () => {
    const linter = stateLint()
    const problems = linter.validate(json)
    expect(problems.length).to.eql(count)
    if (msg) {
      expect(problems[0]).to.include(msg)
    }
  })
}
