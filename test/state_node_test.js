/* eslint-env mocha */

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

const stateNode = require('../lib/statelint/state_node')

describe('StateMachineLint::StateNode', () => {
  it('should find missing StartAt targets', () => {
    const json = {
      StartAt: 'x',
      States: {
        y: {
          Type: 'Succeed'
        }
      }
    }

    const problems = []
    const checker = stateNode()
    checker.check(json, 'a.b', problems)

    expect(problems.length).to.eql(2)
  })

  it('should catch nested problems', () => {
    const json = {
      StartAt: 'x',
      States: {
        x: {
          StartAt: 'z',
          States: {
            w: 1
          }
        }
      }
    }
    const problems = []
    const checker = stateNode()
    checker.check(json, 'a.b', problems)
    expect(problems.length).to.eql(4)
  })


  /*
      it 'should find States.ALL not in end position' do
        json = '{ "Retry": [' +
               '  { "ErrorEquals": [ "States.ALL", "other" ] },'  +
               '  { "ErrorEquals": [ "YET ANOTHER" ] } ' +
               ' ] ' +
               '}'
        json = JSON.parse json
        problems = []
        checker = stateNode()
        checker.check(json, 'a.b', problems)
        expect(problems.length).to.eql(1)
      end

      it 'should find States.ALL not by itself' do
        json = '{ "Retry": [' +
               '  { "ErrorEquals": [ "YET ANOTHER" ] }, ' +
               '  { "ErrorEquals": [ "States.ALL", "other" ] }'  +
               ' ] ' +
               '}'
        json = JSON.parse json
        problems = []
        checker = stateNode()
        checker.check(json, 'a.b', problems)
        expect(problems.length).to.eql(1)
      end

      it 'should use Default field correctly' do
        text = {
          "StartAt"=> "A",
          "States"=> {
            "A" => {
              "Type" => "Choice",
              "Choices" => [
                {
                  "Variable" => "$.a",
                  "Next" => "B"
                }
              ],
              "Default" => "C"
            },
            "B" => {
              "Type" => "Succeed"
            },
            "C" => {
              "Type" => "Succeed"
            }
          }
        }
        json = JSON.parse(JSON.pretty_generate(text))
        problems = []
        checker = stateNode()
        checker.check(json, 'a.b', problems)
        expect(problems.length).to.eql(0)
      end

      it "should find Next fields with targets that don't match state names" do
        text = {
          "StartAt"=> "A",
          "States"=> {
            "A" => {
              "Type" => "Pass",
              "Next" => "B"
            }
          }
        }
        json = JSON.parse(JSON.pretty_generate(text))
        problems = []
        checker = stateNode()
        checker.check(json, 'a.b', problems)
        expect(problems.length).to.eql(2)
      end

      it "should find un-pointed-to states" do
        text = {
          "StartAt"=> "A",
          "States"=> {
            "A" => {
              "Type" => "Succeed"
            },
            "X" => {
              "Type" => "Succeed"
            }
          }
        }
        json = JSON.parse(JSON.pretty_generate(text))
        problems = []
        checker = stateNode()
        checker.check(json, 'a.b', problems)
        expect(problems.length).to.eql(1)
      end

      it "should find missing terminal state" do
        text = {
          "StartAt"=> "A",
          "States"=> {
            "A" => {
              "Type" => "Pass",
              "Next" => "B",
            },
            "B" => {
              "Type" => "C",
              "Next" => "A"
            }
          }
        }
        json = JSON.parse(JSON.pretty_generate(text))
        problems = []
        checker = stateNode()
        checker.check(json, 'a.b', problems)
        expect(problems.length).to.eql(1)
      end

      it 'should handle complex missing terminal' do
        j = File.read "test/no-terminal.json"
        j = JSON.parse j
        problems = []
        checker = stateNode()
        checker.check(j, 'a.b', problems)
        expect(problems.length).to.eql(1)
      end

      it 'should catch linkage from one parallel branch to another' do
        j = File.read "test/linked-parallel.json"
        j = JSON.parse j
        problems = []
        checker = stateNode()
        checker.check(j, 'a.b', problems)
        expect(problems.length).to.eql(4)
      end

      it 'should catch duplicate state names, even in parallels' do
        j = File.read "test/has-dupes.json"
        j = JSON.parse j
        problems = []
        checker = stateNode()
        checker.check(j, 'a.b', problems)
        expect(problems.length).to.eql(1)
        // problems.each {|p| puts "P #{p}"}
      end

    end

     */
})
