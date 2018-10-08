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

    // check_for_terminal(node, path, problems)

    // check_next(node, path, problems)

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

  /*
      def check_next(node, path, problems)
        add_next(node, path, 'Next', problems)
        add_next(node, path, 'Default', problems)
      end

      def add_next(node, path, field, problems)
        if node[field] && node[field].is_a?(String)
          transition_to = node[field]

          if !this.currentStatesNode.empty?
            if this.currentStatesNode[-1].key?(transition_to)
              this.currentStatesIncoming[-1] << transition_to
            else
              problems <<
                "No state found named \"#{transition_to}\", referenced at " +
                "#{path}.#{field}"
            end
          end
        end
      end

      def check_for_terminal(node, path, problems)
        if node['States'] && node['States'].is_a?(Hash)
          terminal_found = false
          node['States'].each_value do |state_node|
            if state_node.is_a?(Hash)
              if [ 'Succeed', 'Fail' ].include?(state_node['Type'])
                terminal_found = true
              elsif state_node['End'] == true
                terminal_found = true
              end
            end
          end

          if !terminal_found
            problems << "No terminal state found in machine at #{path}.States"
          end
        end
      end

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
