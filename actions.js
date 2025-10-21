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
        const opt = await event.options;
        this.sendBlueBolt(`<sequence>${opt.id_sequencedir}</sequence>`);
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
        description: "NOTE: Toggle anly works if Polling is enabled",
        options: [
          {
            type: "textinput",
            id: "id_bank",
            label: "Bank:",
            default: "1",
            required: true,
            useVariables: true,
            regex: "/^\\d+$/",
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
          const opt = await event.options;
          switch (opt.id_power_option) {
            case "on":
              this.sendBlueBolt(`<outlet id="${opt.id_bank}">1</outlet>`);
              break;
            case "off":
              this.sendBlueBolt(`<outlet id="${opt.id_bank}">0</outlet>`);
              break;
            case "cycle":
              this.sendBlueBolt(`<cycleoutlet id="${opt.id_bank}"/>`);
              break;
            case "toggle":
              if (this.config.pollingEnable) {
                var newState =
                  this.varStates[`bank${opt.id_bank}`] == "1" ? "0" : "1";
                this.sendBlueBolt(
                  `<outlet id="${opt.id_bank}">${newState}</outlet>`
                );
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
              required: true,
              useVariables: true,
              regex: "/^\\d+$/",
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
              required: true,
              useVariables: true,
              regex: "/^\\d+$/",
            },
          ],
          callback: async (event) => {
            const opt = await event.options;
            this.sendBlueBolt(
              `<set><delay id="${opt.id_bank}" act="${opt.id_delay_type}">${opt.id_delay}</delay></set>`
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
            required: true,
            useVariables: true,
            regex: "/^\\d+$/",
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
          const opt = await event.options;
          this.sendBlueBolt(
            `<set><triggerena id="${opt.id_bank}">${opt.id_triggerena}</triggerena></set>`
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
            required: true,
            useVariables: true,
            regex: "/^[1-5]$/",
          },
        ],
        callback: async (event) => {
          const opt = await event.options;
          this.sendBlueBolt(
            `<set><brightness>${opt.id_brightness}</brightness></set>`
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
        const opt = await event.options;
        this.sendBlueBolt(opt.id_trigger_option);
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
          required: true,
          useVariables: true,
          regex: "/^\\d+$/",
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
        const opt = await event.options;
        this.sendBlueBolt(`!SWITCH ${opt.id_bank} ${opt.id_power_option}`);
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
          required: true,
          useVariables: true,
          regex: "/^\\d+$/",
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
        const opt = await event.options;
        this.sendBlueBolt(
          `!SET_TRIGGER ${opt.id_bank} ${opt.id_trigger_source}`
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
          required: true,
          useVariables: true,
          regex: "/^\\d+$/",
        },
        {
          type: "textinput",
          id: "id_delay_2",
          label: "Button 2 Delay",
          default: "1",
          required: true,
          useVariables: true,
          regex: "/^\\d+$/",
        },
      ],
      callback: async (event) => {
        const opt = await event.options;
        this.sendBlueBolt(
          `!SET_REBOOT_DELAY ${opt.id_delay_1} ${opt.id_delay_2}`
        );
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
          required: true,
          useVariables: true,
          regex: "/^\\d+$/",
        },
        {
          type: "textinput",
          id: "id_delay_on",
          label: "On Delay",
          default: "1",
          required: true,
          useVariables: true,
          regex: "/^\\d+$/",
        },
        {
          type: "textinput",
          id: "id_delay_off",
          label: "Off Delay",
          default: "1",
          required: true,
          useVariables: true,
          regex: "/^\\d+$/",
        },
      ],
      callback: async (event) => {
        const opt = await event.options;
        this.sendBlueBolt(
          `!SET_DELAY ${opt.id_bank} ${opt.id_delay_on} ${opt.id_delay_off}`
        );
      },
    };
  }

  this.setActionDefinitions(actions);
};
