const { combineRgb } = require('@companion-module/base')

exports.updateFeedbacks = function () {
    if (this.model.variables) {
        var feedbacks = {}
        if (this.model.variables.power === true) {
            if (this.model.banks > 0) {
                for (let i = 0; i < this.model.banks; i++) {
                    feedbacks[`bank${ i+1 }`] = {
                      type: 'boolean',
                      name: `Bank ${ i+1 }`,
                      defaultStyle: {
                        bgcolor: combineRgb(255, 0, 0),
                        color: combineRgb(0, 0, 0),
                      },
                      options: [{
                        type: 'dropdown',
                        label: 'Power Status',
                        id: 'option',
                        choices: [
                          { id: '1', label: 'On' },
                          { id: '0', label: 'Off' },
                        ],
                        default: 1
                      }],
                      callback: (feedback) => {
                        return (this.varStates[`bank${ i+1 }`] == Number(feedback.options.option))
                      }
                    }
                }
            }
            if (this.model.smartlink === true) {
                feedbacks.remote = {
                  type: 'boolean',
                  name: `Remote Sensing Input`,
                  defaultStyle: {
                    bgcolor: combineRgb(255, 0, 0),
                    color: combineRgb(0, 0, 0),
                  },
                  options: [{
                    type: 'dropdown',
                    label: 'Remote Sensing Input',
                    id: 'option',
                    choices: [
                      { id: '1', label: 'True' },
                      { id: '0', label: 'False' },
                    ],
                    default: 1
                  }],
                  callback: (feedback) => {
                    return (this.varStates.remote == Number(feedback.options.option))
                  }
                }
                feedbacks.protok = {
                  type: 'boolean',
                  name: `Surge protection circuit status`,
                  defaultStyle: {
                    bgcolor: combineRgb(255, 0, 0),
                    color: combineRgb(0, 0, 0),
                  },
                  options: [{
                    type: 'dropdown',
                    label: 'Surge protection circuit status',
                    id: 'option',
                    choices: [
                      { id: '1', label: 'OK' },
                      { id: '0', label: 'No Protection' },
                    ],
                    default: 1
                  }],
                  callback: (feedback) => {
                    return (this.varStates.protok == Number(feedback.options.option))
                  }
                }
                feedbacks.smp = {
                  type: 'boolean',
                  name: `Series Mode Protection power relay state`,
                  defaultStyle: {
                    bgcolor: combineRgb(255, 0, 0),
                    color: combineRgb(0, 0, 0),
                  },
                  options: [{
                    type: 'dropdown',
                    label: 'Series Mode Protection power relay state',
                    id: 'option',
                    choices: [
                      { id: '1', label: 'relay is on, AC power available' },
                      { id: '0', label: 'relay is off, AC power not available' },
                    ],
                    default: 1
                  }],
                  callback: (feedback) => {
                    return (this.varStates.smp == Number(feedback.options.option))
                  }
                }
                feedbacks.secok = {
                  type: 'boolean',
                  name: `Secondary SmartLink Status`,
                  defaultStyle: {
                    bgcolor: combineRgb(255, 0, 0),
                    color: combineRgb(0, 0, 0),
                  },
                  options: [{
                    type: 'dropdown',
                    label: 'Status',
                    id: 'option',
                    choices: [
                      { id: '1', label: 'OK' },
                      { id: '0', label: 'No Response' },
                    ],
                    default: 1
                  }],
                  callback: (feedback) => {
                    return (this.varStates.secok == Number(feedback.options.option))
                  }
                }
                feedbacks.overvolt = {
                  type: 'boolean',
                  name: `Overvoltage Status`,
                  defaultStyle: {
                    bgcolor: combineRgb(255, 0, 0),
                    color: combineRgb(0, 0, 0),
                  },
                  options: [{
                    type: 'dropdown',
                    label: 'Overvoltage Status',
                    id: 'option',
                    choices: [
                      { id: '1', label: 'Overvoltage condition detected' },
                      { id: '0', label: 'No overvoltage condition detected' },
                    ],
                    default: 1
                  }],
                  callback: (feedback) => {
                    return (this.varStates.overvolt == Number(feedback.options.option))
                  }
                }
                feedbacks.undervolt = {
                  type: 'boolean',
                  name: `Undervoltage Status`,
                  defaultStyle: {
                    bgcolor: combineRgb(255, 0, 0),
                    color: combineRgb(0, 0, 0),
                  },
                  options: [{
                    type: 'dropdown',
                    label: 'Undervoltage Status',
                    id: 'option',
                    choices: [
                      { id: '1', label: 'Uvervoltage condition detected' },
                      { id: '0', label: 'No Undervoltage condition detected' },
                    ],
                    default: 1
                  }],
                  callback: (feedback) => {
                    return (this.varStates.undervolt == Number(feedback.options.option))
                  }
                }
                feedbacks.pwrok = {
                  type: 'boolean',
                  name: `Normal Power Condition`,
                  defaultStyle: {
                    bgcolor: combineRgb(255, 0, 0),
                    color: combineRgb(0, 0, 0),
                  },
                  options: [{
                    type: 'dropdown',
                    label: 'Normal Power Condition',
                    id: 'option',
                    choices: [
                      { id: '1', label: 'Power is normal' },
                      { id: '0', label: 'Power fault; over or undervoltage' },
                    ],
                    default: 1
                  }],
                  callback: (feedback) => {
                    return (this.varStates.pwrok == Number(feedback.options.option))
                  }
                }
                feedbacks.seqprog = {
                  type: 'boolean',
                  name: `Power Sequence Status`,
                  defaultStyle: {
                    bgcolor: combineRgb(255, 0, 0),
                    color: combineRgb(0, 0, 0),
                  },
                  options: [{
                    type: 'dropdown',
                    label: 'Power Sequence Status',
                    id: 'option',
                    choices: [
                      { id: '1', label: 'Sequence in progress' },
                      { id: '0', label: 'No sequence in progress' },
                    ],
                    default: 1
                  }],
                  callback: (feedback) => {
                    return (this.varStates.seqprog == Number(feedback.options.option))
                  }
                }
            } else {
                feedbacks.seq = {
                  type: 'boolean',
                  name: `Power Sequence Status`,
                  defaultStyle: {
                    bgcolor: combineRgb(255, 0, 0),
                    color: combineRgb(0, 0, 0),
                  },
                  options: [{
                    type: 'dropdown',
                    label: 'Power Sequence Status',
                    id: 'option',
                    choices: [
                      { id: '2', label: 'OFF Sequence in progress' },
                      { id: '1', label: 'ON Sequence in progress' },
                      { id: '0', label: 'No sequence in progress' },
                    ],
                    default: 1
                  }],
                  callback: (feedback) => {
                    return (this.varStates.seq == Number(feedback.options.option))
                  }
                }
                feedbacks.pwrcond = {
                  type: 'boolean',
                  name: `Power Condition`,
                  defaultStyle: {
                    bgcolor: combineRgb(255, 0, 0),
                    color: combineRgb(0, 0, 0),
                  },
                  options: [{
                    type: 'dropdown',
                    label: 'Power Condition',
                    id: 'option',
                    choices: [
                      { id: '3', label: 'Over Voltage' },
                      { id: '2', label: 'Under Voltage' },
                      { id: '1', label: 'Fault Recovery' },
                      { id: '0', label: 'Normal' },
                    ],
                    default: 1
                  }],
                  callback: (feedback) => {
                    return (this.varStates.pwrcond == Number(feedback.options.option))
                  }
                }
                feedbacks.wiringfault = {
                  type: 'boolean',
                  name: `Wiring Fault`,
                  defaultStyle: {
                    bgcolor: combineRgb(255, 0, 0),
                    color: combineRgb(0, 0, 0),
                  },
                  options: [{
                    type: 'dropdown',
                    label: 'Wiring Fault',
                    id: 'option',
                    choices: [
                      { id: '1', label: 'Fault' },
                      { id: '0', label: 'No fault' },
                    ],
                    default: 1
                  }],
                  callback: (feedback) => {
                    return (this.varStates.wiringfault == Number(feedback.options.option))
                  }
                }
            }
        }
        this.setFeedbackDefinitions(feedbacks)
    }
}