/* eslint-env mocha */

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

const stateNode = require('../lib/statelint/state_node')

describe('StateMachineLint::StateNode', () => {
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
    4
  )

  verify(
    'should find States.ALL not in last position',
    {
      Retry: [
        { ErrorEquals: ['States.ALL'] },
        { ErrorEquals: ['YET ANOTHER'] }
      ]
    },
    1
  )

  verify(
    'should find States.ALL not by itself',
    {
      Retry: [
        { ErrorEquals: ['YET ANOTHER'] },
        { ErrorEquals: ['States.ALL', 'other'] }
      ]
    },
    1
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
          Type: 'C',
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

function verify(title, json, count) {
  it(title, () => {
    const problems = []
    const checker = stateNode()
    checker.check(json, 'a.b', problems)
    expect(problems.length).to.eql(count)

    console.log(problems)
  })
} // verify
