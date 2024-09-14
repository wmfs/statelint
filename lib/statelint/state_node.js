const JSONPathChecker = require('@wmfs/j2119/lib/j2119/json_path_checker')

const payloadBuilderFields = ['Parameters', 'ResultSelector']
const contextObjectAccessFields = [
  { field: 'InputPath', nullable: true },
  { field: 'OutputPath', nullable: true },
  { field: 'ItemsPath', nullable: false }
]
const choiceStateNestedOperators = ['And', 'Or', 'Not']
const intrinsicInvocationRegex = /^States\.(Format|Array|ArrayPartition|ArrayContains|ArrayRange|ArrayGetItem|ArrayLength|ArrayUnique|Base64Encode|Base64Decode|Hash|JsonMerge|JsonToString|StringToJson|MathRandom|MathAdd|StringSplit)\(.+\)$/
const intrinsicUUIDInvocationRegex = /^States\.UUID\(\)$/

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
      this.checkStartAt(node, path, problems)
      this.checkStates(node, path, problems)
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

  checkStates (node, path, problems) {
    for (const [name, child] of Object.entries(node.States)) {
      if (isObject(child)) {
        const childPath = `${path}.${name}`
        this.probeContextObjectAccess(child, childPath, problems)
        this.probePayloadBuilders(child, childPath, problems)
        if (child.Type === 'Choice' && child.Choices) {
          this.probeChoiceState(child.Choices, `${childPath}.Choices`, problems)
        }
      } // if ...

      this.checkForDuplicateStates(name, path, problems)
    } // for ...
  } // checkStates

  checkStartAt (node, path, problems) {
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
  } // checkStartAt

  checkForDuplicateStates (name, path, problems) {
    if (this.allStateNames.has(name)) {
      problems.push(`State "${name}", defined at ${path}.States, ` +
        `is also defined at ${this.allStateNames.get(name)}`)
    } else {
      this.allStateNames.set(name, `${path}.States`)
    }
  } // checkForDuplicateStates

  checkForOrphanStates (path, problems) {
    const states = this.currentStatesNode.pop()
    const incoming = this.currentStatesIncoming.pop()
    const missing = Object.keys(states).filter(k => !incoming.includes(k))
    missing.forEach(state =>
      problems.push(`No transition found to state ${path}.${state}`)
    )
  } // checkForOrphanStates

  probeContextObjectAccess (node, path, problems) {
    for (const field of contextObjectAccessFields) {
      const fieldName = field.field
      const nullable = field.nullable
      if (Object.hasOwn(node, fieldName)) {
        if (!nullable && !node[fieldName]) {
          problems.push(`Field "${fieldName}" defined at "${path}" should be non-null`)
        }
        if (node[fieldName] && !isValidParametersPath(node[fieldName])) {
          problems.push(`Field "${fieldName}" defined at "${path}" is not a JSONPath`)
        }
      } // if ...
    } // for ...
  } // probeContextObjectAccess

  probePayloadBuilders (child, childPath, problems) {
    for (const fieldName of payloadBuilderFields) {
      if (child[fieldName]) {
        this.probePayloadBuilder(child[fieldName], childPath, fieldName, problems)
      }
    } // for ...
  } // probePayloadBuilders

  probePayloadBuilder (node, path, fieldName, problems) {
    if (isObject(node)) {
      for (const [name, value] of Object.entries(node)) {
        if (name.endsWith('.$')) {
          if (!isIntrinsicInvocation(value) && !isValidParametersPath(value)) {
            problems.push(`Field "${name}" of ${fieldName} at "${path}" is not a JSONPath or instrinsic function expression`)
          }
        } else {
          this.probePayloadBuilder(value, `${path}.${name}`, fieldName, problems)
        } // if (name.endsWith('.$'))
      } // for ...
    } else if (isArray(node)) {
      for (const [index, value] of node.entries()) {
        this.probePayloadBuilder(value, `${path}[${index}]`, fieldName, problems)
      } // for ...
    }
  } // probePayloadBuilder

  probeChoiceState (node, path, problems) {
    if (isObject(node)) {
      if (node.Variable && !isValidParametersPath(node.Variable)) {
        problems.push(`Field "Variable" of Choice state at "${path}" is not a JSONPath`)
      }
      for (const operator of choiceStateNestedOperators) {
        if (node[operator]) {
          this.probeChoiceState(node[operator], `${path}.${operator}`, problems)
        }
      }
    } else if (isArray(node)) {
      for (const [index, element] of node.entries()) {
        this.probeChoiceState(element, `${path}[${index}]`, problems)
      }
    }
  } // probeChoiceState
} // class StateNode

function isObject (o) {
  return o && (typeof o === 'object')
} // isObject

function isString (s) {
  return (typeof s === 'string')
} // isString

function isIntrinsicInvocation (v) {
  return isString(v) &&
    (
      matchesIntrinsicInvocation(v) ||
      matchesIntrinsicUUIDInvocation(v)
    )
} // isInstrinsicInvocation

function matchesIntrinsicInvocation (v) {
  return intrinsicInvocationRegex.test(v)
} // matchesIntrinsicInvocation

function matchesIntrinsicUUIDInvocation (v) {
  return intrinsicUUIDInvocationRegex.test(v)
} // matchesIntrinsicUUIDInvocation

function isValidParametersPath (v) {
  if (!isString(v)) {
    return false
  }
  if (v.startsWith('$$')) {
    v = v.substring(1)
  }
  return JSONPathChecker.isPath(v)
} // isValidParametersPath

function isArray (a) {
  return Array.isArray(a)
} // isArray

module.exports = (node, path, problems) => {
  const checker = new StateNode()
  return checker.check(node, path, problems)
}
