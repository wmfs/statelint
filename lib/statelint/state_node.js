class StateNode {
  constructor () {
    this.currentStatesNode = []
    this.currentStatesIncoming = []

    this.allStateNames = new Set()
  } // constructor

  check (node, path, problems) {
    if (typeof node !== 'object') return

    const isMachineTop = node.States && (typeof node.States === 'object')

    if (isMachineTop) {
      this.currentStatesNode.push(node.States)
      const startAt = node.StartAt
      if (startAt) {
        this.currentStatesIncoming.push([startAt])
        if (!node.States[startAt]) {
          problems.push(`StartAt value ${startAt} not found in States field at ${path}`)
        }
      } else {
        this.currentStatesIncoming.push([])
      }

      for (const name of Object.keys(node.States)) {
        if(this.allStateNames.has(name)) {
          problems.push(`State "${name}", defined at ${path}.States, ` +
          `is also defined at ${this.allStateNames[name]}`)
        } else {
          this.allStateNames[name] = `${path}.States`
        }
      } // for ...
    } // if (isMachineTop)

    this.checkForTerminal(node, path, problems)

    this.checkNext(node, path, problems)

    // check_States_ALL(node['Retry'], path + '.Retry', problems)
    // check_States_ALL(node['Catch'], path + '.Catch', problems)

    for (const [name, value] of Object.entries(node)) {
      if (Array.isArray(value)) {
        for (let i = 0; i !== value.length; ++i) {
          this.check(value[i], `${path}.${name}[${i}]`, problems)
        }
      } else {
        this.check(value, `${path}.${name}`, problems)
      }
    } // for ...

    if (isMachineTop) {
      const states = this.currentStatesNode.pop()
      const incoming = this.currentStatesIncoming.pop()
      const missing = Object.keys(states).filter(k => !incoming.includes(k))
      missing.forEach(state =>
        problems.push(`No transition found to state ${path}.${state}`)
      )
    } // if ...
  } // check

  checkForTerminal (node, path, problems) {
    if (!(node.States && (typeof node.States === 'object'))) return

    let terminalFound = false
    for (const stateNode of Object.values(node.States)) {
      if (typeof stateNode === 'object')
        if (['Succeed', 'Fail'].includes(stateNode.Type)) {
          terminalFound = true
        } else if (stateNode.End === true) {
          terminalFound = true
        }
    }

    if (!terminalFound) {
      problems.push(`No terminal state found in machine at ${path}.States`)
    }
  } // checkForTerminal

  checkNext(node, path, problems) {
    this.addNext(node, path, 'Next', problems)
    this.addNext(node, path, 'Default', problems)
  } // checkNext

  addNext (node, path, field, problems) {
    if (typeof node[field] === 'string') {
      const transitionTo = node[field]

      if (this.currentStatesNode.length) {
        if (this.currentStatesNode[this.currentStatesNode.length - 1][transitionTo]) {
          this.currentStatesIncoming[this.currentStatesIncoming.length - 1].push(transitionTo)
        } else {
          problems.push(`No state found named "${transitionTo}", referenced at ${path}.${field}`)
        }
      }
    }
  }

  /*
      def check_States_ALL(node, path, problems)
        if !node.is_a?(Array)
          return
        end

        i = 0
        node.each do |element|
          if element.is_a?(Hash)
            if element['ErrorEquals'].is_a?(Array)
              ee = element['ErrorEquals']
              if ee.include? 'States.ALL'
                if i != (node.size - 1) || ee.size != 1
                  problems <<
                    "#{path}[#{i}]: States.ALL can only appear in the last " +
                    "element, and by itself."
                end
              end
            end
          end
          i += 1
        end
      end
    end

   */
} // class StateNode

module.exports = () => new StateNode()
