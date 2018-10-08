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

describe('StateMachineLint.StateNode', () => {
  verify(
    'should find missing StartAt targets',
    {
      StartAt: 'x',
      States: {
        y: {
          Type: 'Succeed'
        }
      }
    },
    2
  )

  verify(
    'should catch nested problems',
    {
      StartAt: 'x',
      States: {
        x: {
          StartAt: 'z',
          States: {
            w: 1
          }
        }
      }
    },
    8
  )

  verify(
    'should find States.ALL not in last position',
    {
      Retry: [
        { ErrorEquals: ['States.ALL'] },
        { ErrorEquals: ['YET ANOTHER'] }
      ]
    },
    6
  )

  verify(
    'should find States.ALL not by itself',
    {
      Retry: [
        { ErrorEquals: ['YET ANOTHER'] },
        { ErrorEquals: ['States.ALL', 'other'] }
      ]
    },
    6
  )

  verify(
    'should use Default field correctly',
    {
      StartAt: 'A',
      States: {
        A: {
          Type: 'Choice',
          Choices: [
            {
              Variable: '$.a',
              StringEquals: 'whoo',
              Next: 'B'
            }
          ],
          Default: 'C'
        },
        B: {
          Type: 'Succeed'
        },
        C: {
          Type: 'Succeed'
        }
      }
    },
    0
  )

  verify(
    'should find Next fields with targets that don\'t match state names',
    {
      StartAt: 'A',
      States: {
        A: {
          Type: 'Pass',
          Next: 'B'
        }
      }
    },
    2
  )

  verify(
    'should find un-pointed-to states',
    {
      StartAt: 'A',
      States: {
        A: {
          Type: 'Succeed'
        },
        X: {
          Type: 'Succeed'
        }
      }
    },
    1
  )

  verify(
    'should find missing terminal state',
    {
      StartAt: 'A',
      States: {
        A: {
          Type: 'Pass',
          Next: 'B'
        },
        B: {
          Type: 'Pass',
          Next: 'A'
        }
      }
    },
    1
  )

  verify(
    'should handle complex missing terminal',
    require('./fixtures/no-terminal.json'),
    1
  )

  verify(
    'should catch linkage from one parallel branch to another',
    require('./fixtures/linked-parallel.json'),
    4
  )

  verify(
    'should catch duplicate state names, even in parallels',
    require('./fixtures/has-dupes.json'),
    1
  )
})


function verify (label, json, count, msg) {
  it(label, () => {
    const linter = stateLint()
    const problems = linter.validate(json)

    console.log(problems)

    expect(problems.length).to.eql(count)
    if (msg) {
      expect(problems[0]).to.include(msg)
    }
  })
}
