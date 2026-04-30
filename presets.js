const { combineRgb } = require("@companion-module/base");

exports.updatePresets = function () {
  const presets = {};
  const structure = [];

  if (
    this.model.protocol === "udp" &&
    this.model.variables &&
    this.model.variables.power === true &&
    this.model.banks > 0 &&
    this.config &&
    this.config.pollingEnable === true
  ) {
    const togglePresetIds = [];

    for (let bank = 1; bank <= this.model.banks; bank++) {
      const presetId = `bank_toggle_${bank}`;

      presets[presetId] = {
        type: "simple",
        name: `Toggle Bank ${bank}`,
        style: {
          text: `Bank ${bank}\nToggle`,
          size: "14",
          color: combineRgb(255, 255, 255),
          bgcolor: combineRgb(180, 0, 0),
        },
        steps: [
          {
            down: [
              {
                actionId: "udp_cmd_power",
                options: {
                  id_bank: bank,
                  id_power_option: "toggle",
                },
              },
            ],
            up: [],
          },
        ],
        feedbacks: [
          {
            feedbackId: "powerStatus",
            options: {
              bank: bank,
              option: "1",
            },
            style: {
              bgcolor: combineRgb(0, 204, 0),
              color: combineRgb(0, 0, 0),
            },
          },
        ],
      };

      togglePresetIds.push(presetId);
    }

    structure.push({
      id: "bank_power",
      name: "Bank Power",
      definitions: [
        {
          id: "toggle",
          type: "simple",
          name: "Toggle",
          presets: togglePresetIds,
        },
      ],
    });
  }

  this.setPresetDefinitions(structure, presets);
};
