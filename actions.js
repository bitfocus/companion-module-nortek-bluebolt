const { Regex } = require("@companion-module/base");

exports.updateActions = function () {
  var actions = {};

  if (this.model.protocol == "udp") {
    actions["udp_cmd_sequence"] = {
      name: "Sequence On/Off",
      options: [
        {
          type: "dropdown",
          id: "id_sequencedir",
          label: "Direction",
          default: "1",
          choices: [
            { id: "1", label: "On" },
            { id: "0", label: "Off" },
          ],
        },
      ],
      callback: async (event) => {
        this.sendBlueBolt(
          `<sequence>${event.options.id_sequencedir}</sequence>`
        );
      },
    };
    if (!this.model.smartlink) {
      actions["udp_cmd_reboot"] = {
        name: "Reboot Device",
        options: [],
        callback: async () => {
          this.sendBlueBolt(`<reboot/>`);
        },
      };
    }
    if (this.model.banks > 0) {
      actions["udp_cmd_power"] = {
        name: "Power Action",
        description: "NOTE: Toggle only works if Polling is enabled",
        options: [
          {
            type: "textinput",
            id: "id_bank",
            label: "Bank:",
            default: "1",
            regex: Regex.NUMBER,
            required: true,
            useVariables: true,
          },
          {
            type: "dropdown",
            id: "id_power_option",
            label: "Action",
            default: "on",
            choices: [
              { id: "on", label: "On" },
              { id: "off", label: "Off" },
              { id: "cycle", label: "Cycle" },
              { id: "toggle", label: "Toggle" },
            ],
          },
        ],
        callback: async (event) => {
          let bank = this.clamp(
            parseInt(event.options.id_bank),
            1,
            this.model.banks
          );
          switch (event.options.id_power_option) {
            case "on":
              this.sendBlueBolt(`<outlet id="${bank}">1</outlet>`);
              break;
            case "off":
              this.sendBlueBolt(`<outlet id="${bank}">0</outlet>`);
              break;
            case "cycle":
              this.sendBlueBolt(`<cycleoutlet id="${bank}"/>`);
              break;
            case "toggle":
              if (this.config.pollingEnable) {
                var newState = this.varStates[`bank${bank}`] == "1" ? "0" : "1";
                this.sendBlueBolt(`<outlet id="${bank}">${newState}</outlet>`);
              } else {
                this.log(
                  "error",
                  "Action Error: Enable Polling to use the Toggle action"
                );
              }
              break;
          }
        },
      };
      if (!this.model.smartlink) {
        actions["udp_set_delay"] = {
          name: "Set Bank Delay",
          options: [
            {
              type: "textinput",
              id: "id_bank",
              label: "Bank:",
              default: "1",
              regex: Regex.NUMBER,
              required: true,
              useVariables: true,
            },
            {
              type: "dropdown",
              id: "id_delay_type",
              label: "Delay Setting",
              default: "0",
              choices: [
                { id: "0", label: "Off" },
                { id: "1", label: "On" },
                { id: "2", label: "Power Cycle" },
              ],
            },
            {
              type: "textinput",
              id: "id_delay",
              label: "Delay (s)",
              default: "1",
              regex: Regex.NUMBER,
              required: true,
              useVariables: true,
            },
          ],
          callback: async (event) => {
            let bank = this.clamp(
              parseInt(event.options.id_bank),
              1,
              this.model.banks
            );
            let delay = this.clamp(parseInt(event.options.id_delay), 0, 65536);
            this.sendBlueBolt(
              `<set><delay id="${bank}" act="${event.options.id_delay_type}">${delay}</delay></set>`
            );
          },
        };
      }
    }
    if (this.model.smartlink) {
      actions["udp_cmd_refreshinfo"] = {
        name: "Refresh Info",
        options: [],
        callback: async () => {
          this.sendBlueBolt(`<refreshinfo/>`);
        },
      };
      actions["udp_cmd_refreshsettings"] = {
        name: "Refresh Settings",
        options: [],
        callback: async () => {
          this.sendBlueBolt(`<refreshsettings/>`);
        },
      };
    }
    if (this.model.id == "bb232") {
      actions["udp_cmd_enumerate"] = {
        name: "Enumerate",
        options: [],
        callback: async () => {
          this.sendBlueBolt(`<enumerate/>`);
        },
      };
      actions["udp_cmd_rollcall"] = {
        name: "Roll Call",
        options: [],
        callback: async () => {
          this.sendBlueBolt(`<rollcall/>`);
        },
      };
    }
    if (this.model.id == "m4000") {
      actions["udp_set_triggerena"] = {
        name: "Enable Trigger",
        options: [
          {
            type: "textinput",
            id: "id_bank",
            label: "Bank:",
            default: "1",
            regex: Regex.NUMBER,
            required: true,
            useVariables: true,
          },
          {
            type: "dropdown",
            id: "id_triggerena",
            label: "Trigger",
            default: "0",
            choices: [
              { id: "0", label: "Disabled" },
              { id: "1", label: "Enabled" },
            ],
          },
        ],
        callback: async (event) => {
          let bank = this.clamp(
            parseInt(event.options.id_bank),
            1,
            this.model.banks
          );
          this.sendBlueBolt(
            `<set><triggerena id="${bank}">${event.options.id_triggerena}</triggerena></set>`
          );
        },
      };
      actions["udp_set_brightness"] = {
        name: "Set Brightness",
        options: [
          {
            type: "textinput",
            label: "Brightness",
            id: "id_brightness",
            default: "1",
            regex: Regex.NUMBER,
            required: true,
            useVariables: true,
          },
        ],
        callback: async (event) => {
          let brightness = this.clamp(
            parseInt(event.options.id_brightness),
            1,
            5
          );
          this.sendBlueBolt(
            `<set><brightness>${brightness}</brightness></set>`
          );
        },
      };
    }
  } else if (this.model.protocol == "telnet") {
    actions["telnet_cmd_trigger"] = {
      name: "Trigger Action",
      options: [
        {
          type: "dropdown",
          id: "id_trigger_option",
          label: "Action",
          choices: [
            { id: "!GREEN_BUTTON", label: "Green Button" },
            { id: "!REBOOT_1", label: "Reboot 1" },
            { id: "!REBOOT_2", label: "Reboot 2" },
            { id: "!ALL_OFF", label: "All Off" },
            { id: "!ALL_ON", label: "All On" },
          ],
        },
      ],
      callback: async (event) => {
        this.sendBlueBolt(event.options.id_trigger_option);
      },
    };
    actions["telnet_cmd_power"] = {
      name: "Bank Power Action",
      options: [
        {
          type: "textinput",
          id: "id_bank",
          label: "Bank:",
          default: "1",
          regex: Regex.NUMBER,
          required: true,
          useVariables: true,
        },
        {
          type: "dropdown",
          id: "id_power_option",
          label: "Action",
          default: "ON",
          choices: [
            { id: "ON", label: "On" },
            { id: "OFF", label: "Off" },
          ],
        },
      ],
      callback: async (event) => {
        let bank = this.clamp(
          parseInt(event.options.id_bank),
          1,
          this.model.banks
        );
        this.sendBlueBolt(`!SWITCH ${bank} ${event.options.id_power_option}`);
      },
    };
    actions["telnet_set_trigger_source"] = {
      name: "Set Trigger Source",
      options: [
        {
          type: "textinput",
          id: "id_bank",
          label: "Bank:",
          default: "1",
          regex: Regex.NUMBER,
          required: true,
          useVariables: true,
        },
        {
          type: "dropdown",
          id: "id_trigger_source",
          label: "Action",
          default: "NONE",
          choices: [
            { id: "NONE", label: "None" },
            { id: "BUTTON_1", label: "Button 1" },
            { id: "BUTTON_2", label: "Button 2" },
            { id: "BUTTON_GREEN", label: "Green Button" },
            { id: "TRIGIN", label: "DC Trigger" },
          ],
        },
      ],
      callback: async (event) => {
        let bank = this.clamp(
          parseInt(event.options.id_bank),
          1,
          this.model.banks
        );
        this.sendBlueBolt(
          `!SET_TRIGGER ${bank} ${event.options.id_trigger_source}`
        );
      },
    };
    actions["telnet_set_reboot_delay"] = {
      name: "Set Reboot Delay",
      options: [
        {
          type: "textinput",
          id: "id_delay_1",
          label: "Button 1 Delay",
          default: "1",
          regex: Regex.NUMBER,
          required: true,
          useVariables: true,
        },
        {
          type: "textinput",
          id: "id_delay_2",
          label: "Button 2 Delay",
          default: "1",
          regex: Regex.NUMBER,
          required: true,
          useVariables: true,
        },
      ],
      callback: async (event) => {
        let delay1 = this.clamp(parseInt(event.options.id_delay_1), 1, 255);
        let delay2 = this.clamp(parseInt(event.options.id_delay_2), 1, 255);
        this.sendBlueBolt(`!SET_REBOOT_DELAY ${delay1} ${delay2}`);
      },
    };
    actions["telnet_set_delay"] = {
      name: "Set Delay",
      options: [
        {
          type: "textinput",
          id: "id_bank",
          label: "Bank:",
          default: "1",
          regex: Regex.NUMBER,
          required: true,
          useVariables: true,
        },
        {
          type: "textinput",
          id: "id_delay_on",
          label: "On Delay",
          default: "1",
          regex: Regex.NUMBER,
          required: true,
          useVariables: true,
        },
        {
          type: "textinput",
          id: "id_delay_off",
          label: "Off Delay",
          default: "1",
          regex: Regex.NUMBER,
          required: true,
          useVariables: true,
        },
      ],
      callback: async (event) => {
        let bank = this.clamp(
          parseInt(event.options.id_bank),
          1,
          this.model.banks
        );
        let delayOn = this.clamp(parseInt(event.options.id_delay_on), 1, 255);
        let delayOff = this.clamp(parseInt(event.options.id_delay_off), 1, 255);
        this.sendBlueBolt(`!SET_DELAY ${bank} ${delayOn} ${delayOff}`);
      },
    };
  }

  this.setActionDefinitions(actions);
};
