class StateNode {
  constructor () {
    this.currentStatesNode = []
    this.currentStatesIncoming = []

    this.allStateNames = new Map()
  } // constructor

  check (node, path, problems = []) {
    if (!isObject(node)) return

    const isMachineTop = isObject(node.States)

    if (isMachineTop) {
      this.checkForDuplicateStates(node, path, problems)
    } // if (isMachineTop)

    this.checkNode(node, path, problems)

    if (isMachineTop) {
      this.checkForOrphanStates(path, problems)
    } // if ...

    return problems
  } // check

  checkNode (node, path, problems) {
    this.checkForTerminal(node, path, problems)

    this.checkNext(node, path, problems)

    this.checkStatesALL(node.Retry, `${path}.Retry`, problems)
    this.checkStatesALL(node.Catch, `${path}.Catch`, problems)

    this.checkChildNodes(node, path, problems)
  } // checkNode

  checkChildNodes (node, path, problems) {
    for (const [name, value] of Object.entries(node)) {
      if (isArray(value)) {
        for (const [index, element] of Object.entries(value)) {
          this.check(element, `${path}.${name}[${index}]`, problems)
        }
      } else {
        this.check(value, `${path}.${name}`, problems)
      }
    } // for ...
  } // checkChildNodes

  checkForTerminal (node, path, problems) {
    if (!isObject(node.States)) return

    const terminalFound = Object.values(node.States)
      .filter(isObject)
      .reduce(
        (terminalFound, stateNode) => {
          return terminalFound ||
            (['Succeed', 'Fail'].includes(stateNode.Type)) ||
            (stateNode.End === true)
        },
        false
      )

    if (!terminalFound) {
      problems.push(`No terminal state found in machine at ${path}.States`)
    }
  } // checkForTerminal

  checkNext (node, path, problems) {
    this.addNext(node, path, 'Next', problems)
    this.addNext(node, path, 'Default', problems)
  } // checkNext

  addNext (node, path, field, problems) {
    if (!isString(node[field])) return

    const transitionTo = node[field]

    if (this.currentStatesNode.length) {
      if (this.currentStatesNode[this.currentStatesNode.length - 1][transitionTo]) {
        this.currentStatesIncoming[this.currentStatesIncoming.length - 1].push(transitionTo)
      } else {
        problems.push(`No state found named "${transitionTo}", referenced at ${path}.${field}`)
      }
    }
  } // addNext

  checkStatesALL (node, path, problems) {
    if (!isArray(node)) return

    for (const [index, element] of node.entries()) {
      const ee = element.ErrorEquals

      if (!isArray(ee)) continue

      if (ee.includes('States.ALL')) {
        if (index !== (node.length - 1) || ee.length !== 1) {
          problems.push(`${path}[${index}]: States.ALL can only appear in the last element, and by itself.`)
        }
      }
    } // for ...
  } // checkStatesALL

  checkForDuplicateStates (node, path, problems) {
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
      if (this.allStateNames.has(name)) {
        problems.push(`State "${name}", defined at ${path}.States, ` +
          `is also defined at ${this.allStateNames.get(name)}`)
      } else {
        this.allStateNames.set(name, `${path}.States`)
      }
    } // for ...
  } // checkForDuplicateStates

  checkForOrphanStates (path, problems) {
    const states = this.currentStatesNode.pop()
    const incoming = this.currentStatesIncoming.pop()
    const missing = Object.keys(states).filter(k => !incoming.includes(k))
    missing.forEach(state =>
      problems.push(`No transition found to state ${path}.${state}`)
    )
  }
} // class StateNode

function isObject (o) {
  return o && (typeof o === 'object')
} // isObject

function isString (s) {
  return (typeof s === 'string')
} // isString

function isArray (a) {
  return Array.isArray(a)
} // isArray

module.exports = (node, path, problems) => {
  const checker = new StateNode()
  return checker.check(node, path, problems)
}
