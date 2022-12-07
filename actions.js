exports.updateActions = function () {
    const sendBlueBolt = (cmd) => {
        if (this.model.protocol == 'udp') {
            cmd = `<?xml version="1.0" ?><device class="${this.config.model}" id="${this.config.id}">${cmd}</device>`
            this.udp.send(cmd + '\n')
        } else if (this.model.protocol == 'telnet') {
            this.telnet.write(cmd + '\r')
        }
        this.log('debug', 'Sent: ' + cmd + ' over ' + this.model.protocol)
    }

    var actions = {}

    if (this.model.protocol == 'udp') {
        actions['udp_cmd_sequence'] = {
            name: 'Sequence On/Off',
            options: [
                {
                    type: 'dropdown',
                    id: 'id_sequencedir',
                    label: 'Direction',
                    default: '1',
                    choices: [
                        { id: '1', label: 'On' },
                        { id: '0', label: 'Off' },
                    ],
                },
            ],
            callback: async (event) => {
                const opt = await event.options
                sendBlueBolt(`<command xid="companion"><sequence>${opt.id_sequencedir}</sequence></command>`)
            },
        }
        if (!this.model.smartlink) {
            actions['udp_cmd_reboot'] = {
                name: 'Reboot Device',
                options: [],
                callback: async (event) => {
                    sendBlueBolt(`<command xid="companion"><reboot/></command>`)
                },
            }
        }
        if (this.model.banks > 0) {
            actions['udp_cmd_power'] = {
                name: 'Power Action',
                options: [
                    {
                        type: 'number',
                        id: 'id_bank',
                        label: 'Bank:',
                        default: '1',
                        min: 1,
                        max: this.model.banks,
                        step: 1,
                        required: true,
                    },
                    {
                        type: 'dropdown',
                        id: 'id_power_option',
                        label: 'Action',
                        default: 'on',
                        choices: [
                            { id: 'on', label: 'On' },
                            { id: 'off', label: 'Off' },
                            { id: 'cycle', label: 'Cycle' },
                        ],
                    },
                ],
                callback: async (event) => {
                    const opt = await event.options
                    switch (opt.id_power_option) {
                        case 'on':
                            sendBlueBolt(`<command xid="companion"><outlet id="${opt.id_bank}">1</outlet></command>`)
                            break
                        case 'off':
                            sendBlueBolt(`<command xid="companion"><outlet id="${opt.id_bank}">0</outlet></command>`)
                            break
                        case 'cycle':
                            sendBlueBolt(`<command xid="companion"><cycleoutlet id="${opt.id_bank}"/></command>`)
                            break
                    }
                },
            }
            if (!this.model.smartlink) {
                actions['udp_set_delay'] = {
                    name: 'Set Bank Delay',
                    options: [
                        {
                            type: 'number',
                            id: 'id_bank',
                            label: 'Bank:',
                            default: '1',
                            min: 1,
                            max: this.model.banks,
                            step: 1,
                            required: true,
                        },
                        {
                            type: 'dropdown',
                            id: 'id_delay_type',
                            label: 'Delay Setting',
                            default: '0',
                            choices: [
                                { id: '0', label: 'Off' },
                                { id: '1', label: 'On' },
                                { id: '2', label: 'Power Cycle' },
                            ],
                        },
                        {
                            type: 'number',
                            id: 'id_delay',
                            label: 'Delay (s)',
                            default: '1',
                            min: 0,
                            max: 65536,
                            step: 1,
                            required: true,
                        },
                    ],
                    callback: async (event) => {
                        const opt = await event.options
                        sendBlueBolt(
                            `<command xid="companion"><set><delay id="${opt.id_bank}" act="${opt.id_delay_type}">${opt.id_delay}</delay></set></command>`
                        )
                    },
                }
            }
        }
        if (this.model.smartlink) {
            actions['udp_cmd_refreshinfo'] = {
                name: 'Refresh Info',
                options: [],
                callback: async (event) => {
                    sendBlueBolt(`<refreshinfo/>`)
                },
            }
            actions['udp_cmd_refreshsettings'] = {
                name: 'Refresh Settings',
                options: [],
                callback: async (event) => {
                    sendBlueBolt(`<refreshsettings/>`)
                },
            }
        }
        if (this.model.id == 'bb232') {
            actions['udp_cmd_enumerate'] = {
                name: 'Enumerate',
                options: [],
                callback: async (event) => {
                    sendBlueBolt(`<enumerate/>`)
                },
            }
            actions['udp_cmd_rollcall'] = {
                name: 'Roll Call',
                options: [],
                callback: async (event) => {
                    sendBlueBolt(`<rollcall/>`)
                },
            }
        }
        if (this.model.id == 'm4000') {
            actions['udp_set_triggerena'] = {
                name: 'Enable Trigger',
                options: [
                    {
                        type: 'number',
                        id: 'id_bank',
                        label: 'Bank:',
                        default: '1',
                        min: 1,
                        max: this.model.banks,
                        step: 1,
                        required: true,
                    },
                    {
                        type: 'dropdown',
                        id: 'id_triggerena',
                        label: 'Trigger',
                        default: '0',
                        choices: [
                            { id: '0', label: 'Disabled' },
                            { id: '1', label: 'Enabled' },
                        ],
                    },
                ],
                callback: async (event) => {
                    const opt = await event.options
                    sendBlueBolt(
                        `<command xid="companion"><set><triggerena id="${opt.id_bank}">${opt.id_triggerena}</triggerena></set></command>`
                    )
                },
            }
            actions['udp_set_brightness'] = {
                name: 'Set Brightness',
                options: [
                    {
                        type: 'number',
                        label: 'Brightness',
                        id: 'id_brightness',
                        min: 1,
                        max: 5,
                        default: 1,
                        step: 1,
                        required: true,
                        range: true,
                    },
                ],
                callback: async (event) => {
                    const opt = await event.options
                    sendBlueBolt(`<command xid="companion"><set><brightness>${opt.id_brightness}</brightness></set></command>`)
                },
            }
        }
    } else if (this.model.protocol == 'telnet') {
        actions['telnet_cmd_trigger'] = {
            name: 'Trigger Action',
            options: [
                {
                    type: 'dropdown',
                    id: 'id_trigger_option',
                    label: 'Action',
                    choices: [
                        { id: '!GREEN_BUTTON', label: 'Green Button' },
                        { id: '!REBOOT_1', label: 'Reboot 1' },
                        { id: '!REBOOT_2', label: 'Reboot 2' },
                        { id: '!ALL_OFF', label: 'All Off' },
                        { id: '!ALL_ON', label: 'All On' },
                    ],
                },
            ],
            callback: async (event) => {
                const opt = await event.options
                sendBlueBolt(opt.id_trigger_option)
            },
        }
        actions['telnet_cmd_power'] = {
            name: 'Bank Power Action',
            options: [
                {
                    type: 'number',
                    id: 'id_bank',
                    label: 'Bank:',
                    default: '1',
                    min: 1,
                    max: this.model.banks,
                    step: 1,
                    required: true,
                },
                {
                    type: 'dropdown',
                    id: 'id_power_option',
                    label: 'Action',
                    default: 'ON',
                    choices: [
                        { id: 'ON', label: 'On' },
                        { id: 'OFF', label: 'Off' },
                    ],
                },
            ],
            callback: async (event) => {
                const opt = await event.options
                sendBlueBolt(`!SWITCH ${opt.id_bank} ${opt.id_power_option}`)
            },
        }
        actions['telnet_set_trigger_source'] = {
            name: 'Set Trigger Source',
            options: [
                {
                    type: 'number',
                    id: 'id_bank',
                    label: 'Bank:',
                    default: '1',
                    min: 1,
                    max: this.model.banks,
                    step: 1,
                    required: true,
                },
                {
                    type: 'dropdown',
                    id: 'id_trigger_source',
                    label: 'Action',
                    default: 'NONE',
                    choices: [
                        { id: 'NONE', label: 'None' },
                        { id: 'BUTTON_1', label: 'Button 1' },
                        { id: 'BUTTON_2', label: 'Button 2' },
                        { id: 'BUTTON_GREEN', label: 'Green Button' },
                        { id: 'TRIGIN', label: 'DC Trigger' },
                    ],
                },
            ],
            callback: async (event) => {
                const opt = await event.options
                sendBlueBolt(`!SET_TRIGGER ${opt.id_bank} ${opt.id_trigger_source}`)
            },
        }
        actions['telnet_set_reboot_delay'] = {
            name: 'Set Reboot Delay',
            options: [
                {
                    type: 'number',
                    id: 'id_delay_1',
                    label: 'Button 1 Delay',
                    default: '1',
                    min: 1,
                    max: 255,
                    step: 1,
                    required: true,
                },
                {
                    type: 'number',
                    id: 'id_delay_2',
                    label: 'Button 2 Delay',
                    default: '1',
                    min: 1,
                    max: 255,
                    step: 1,
                    required: true,
                },
            ],
            callback: async (event) => {
                const opt = await event.options
                sendBlueBolt(`!SET_REBOOT_DELAY ${opt.id_delay_1} ${opt.id_delay_2}`)
            },
        }
        actions['telnet_set_delay'] = {
            name: 'Set Delay',
            options: [
                {
                    type: 'number',
                    id: 'id_bank',
                    label: 'Bank:',
                    default: '1',
                    min: 1,
                    max: this.model.banks,
                    step: 1,
                    required: true,
                },
                {
                    type: 'number',
                    id: 'id_delay_on',
                    label: 'On Delay',
                    default: '1',
                    min: 1,
                    max: 255,
                    step: 1,
                    required: true,
                },
                {
                    type: 'number',
                    id: 'id_delay_off',
                    label: 'Off Delay',
                    default: '1',
                    min: 1,
                    max: 255,
                    step: 1,
                    required: true,
                },
            ],
            callback: async (event) => {
                const opt = await event.options
                sendBlueBolt(`!SET_DELAY ${opt.id_bank} ${opt.id_delay_on} ${opt.id_delay_off}`)
            },
        }
    }

    this.setActionDefinitions(actions)
}