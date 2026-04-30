exports.updateVariables = function () {
  if (this.model.variables) {
    var variables = {};
    if (this.model.variables.power === true) {
      variables.voltage = { name: "Current Voltage" };
      variables.amperage = { name: "Current Amperage" };
      variables.wattage = { name: "Current Wattage" };
      variables.pwrva = { name: "Current VA" };
      variables.pwrfact = { name: "Current Power Factor" };
      if (this.model.banks > 0) {
        for (let i = 0; i < this.model.banks; i++) {
          variables[`bank${i + 1}`] = {
            name: `Bank ${i + 1} Status`,
          };
        }
      }
      if (this.model.smartlink === true) {
        variables.remote = { name: "Remote Sensing input" };
        variables.protok = { name: "Surge protection OK" };
        variables.smp = { name: "Series Mode Protection state" };
        variables.secok = { name: "Secondary SmartLink OK" };
        variables.overvolt = { name: "Overvoltage" };
        variables.undervolt = { name: "Undervoltage" };
        variables.pwrok = { name: "Power OK" };
        variables.seqprog = { name: "Currently Sequencing" };
      } else {
        variables.seq = { name: "Sequence Status" };
        variables.pwrcond = { name: "Power Status" };
        variables.wiringfault = { name: "Wiring Fault" };
      }
    }
    if (this.model.variables.trigger === true) {
      variables.triggersense = { name: "Trigger Connected" };
      variables.trigger = { name: "Triggered" };
    }
    this.setVariableDefinitions(variables);
  }
};
