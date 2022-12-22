exports.updateVariables = function () {
  if (this.model.variables) {
    var variables = [];
    if (this.model.variables.power === true) {
      variables.push({ variableId: "voltage", name: "Current Voltage" });
      variables.push({ variableId: "amperage", name: "Current Amperage" });
      variables.push({ variableId: "wattage", name: "Current Wattage" });
      variables.push({ variableId: "pwrva", name: "Current VA" });
      variables.push({ variableId: "pwrfact", name: "Current Power Factor" });
      if (this.model.banks > 0) {
        for (let i = 0; i < this.model.banks; i++) {
          variables.push({
            variableId: `bank${i + 1}`,
            name: `Bank ${i + 1} Status`,
          });
        }
      }
      if (this.model.smartlink === true) {
        variables.push({ variableId: "remote", name: "Remote Sensing input" });
        variables.push({ variableId: "protok", name: "Surge protection OK" });
        variables.push({
          variableId: "smp",
          name: "Series Mode Protection state",
        });
        variables.push({ variableId: "secok", name: "Secondary SmartLink OK" });
        variables.push({ variableId: "overvolt", name: "Overvoltage" });
        variables.push({ variableId: "undervolt", name: "Undervoltage" });
        variables.push({ variableId: "pwrok", name: "Power OK" });
        variables.push({ variableId: "seqprog", name: "Currently Sequencing" });
      } else {
        variables.push({ variableId: "seq", name: "Sequence Status" });
        variables.push({ variableId: "pwrcond", name: "Power Status" });
        variables.push({ variableId: "wiringfault", name: "Wiring Fault" });
      }
    }
    if (this.model.variables.trigger === true) {
      variables.push({ variableId: "triggersense", name: "Trigger Connected" });
      variables.push({ variableId: "trigger", name: "Triggered" });
    }
    this.setVariableDefinitions(variables);
  }
};
