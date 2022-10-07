const udp = require('../../udp')
const instance_skel = require('../../instance_skel')

class instance extends instance_skel {
	/**
	 * Create an instance of the module
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @param {string} id - the instance ID
	 * @param {Object} config - saved user configuration parameters
	 * @since 1.0.0
	 */
	constructor(system, id, config) {
		super(system, id, config)
		this.actions() // export actions
		this.init_presets() // export presets
	}

	updateConfig(config) {
		this.init_presets()

		if (this.udp !== undefined) {
			this.udp.destroy()
			delete this.udp
		}

		this.config = config

		this.init()
	}

	init() {
		if (this.udp !== undefined) {
			this.udp.destroy()
			delete this.udp
		}

		this.status(this.STATE_WARNING, 'Connecting')

		if (this.config.host !== undefined) {
			this.udp = new udp(this.config.host, 57010)

			this.udp.on('error', (err) => {
				this.debug('Network error', err)
				this.status(this.STATE_ERROR, err)
				this.log('error', 'Network error: ' + err.message)
			})

			// If we get data, thing should be good
			this.udp.on('data', (data, info) => {
				this.status(this.STATE_OK)
				console.log('Data received from client : ' + data.toString())
				console.log('Received %d bytes from %s:%d\n', data.length, info.address, info.port)
			})

			this.udp.on('status_change', (status, message) => {
				this.status(status, message)
			})
		}
	}

	// Return config fields for web config
	config_fields() {
		return [
			{
				type: 'text',
				id: 'info',
				width: 12,
				value: `
					<div>
						<strong>Note: Non-telnet BlueBolt devices need a device ID</strong>
						<br>
						For most devices, this is the MAC Address
					</div>
			`,
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Device IP',
				width: 6,
				regex: this.REGEX_IP,
			},
			{
				type: 'textinput',
				id: 'id',
				label: 'Device ID',
				width: 6,
			},
			{
				type: 'dropdown',
				id: 'model',
				label: 'Device Model',
				default: 'm4000',
				choices: [{ id: 'm4000', label: 'M4000 Pro' }],
			},
		]
	}

	/*
Model 			Device Class 	Identifier (id)
BB-RS232 		bb232 			MAC Address
CN-1800 S 		cn1800 			Device ID
CN-2400 S 		cn2400 			Device ID
CN-3600 SE 		cn3600 			Device ID
CN-15MP 		cnmp15 			Device ID
CN-20MP 		cnmp20 			Device ID
*/

	// When module gets deleted
	destroy() {
		if (this.udp !== undefined) {
			this.udp.destroy()
		}

		this.debug('destroy', this.id)
	}

	init_presets() {
		let presets = []
		this.setPresetDefinitions(presets)
	}

	actions(system) {
		this.setActions({
			custom: {
				label: 'Send Custom Command',
				options: [
					{
						type: 'textwithvariables',
						id: 'id_send',
						label: 'Command:',
						tooltip: 'Automatically adds XML device wrapper, just the command is needed',
						default: '',
						width: 6,
					},
				],
			},
			cmd_power: {
				label: 'Power Action',
				options: [
					{
						type: 'number',
						id: 'id_bank',
						label: 'Bank:',
						default: '1',
						min: 1,
						max: 3,
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
			},
			cmd_sequence: {
				label: 'Sequence On/Off',
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
			},
			cmd_reboot: {
				label: 'Reboot Sequencer',
			},
			set_delay: {
				label: 'Set Bank Delay',
				options: [
					{
						type: 'number',
						id: 'id_bank',
						label: 'Bank:',
						default: '1',
						min: 1,
						max: 3,
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
			},
			set_triggerena: {
				label: 'Enable Trigger',
				options: [
					{
						type: 'number',
						id: 'id_bank',
						label: 'Bank:',
						default: '1',
						min: 1,
						max: 3,
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
			},
			set_brightness: {
				label: 'Set Brightness',
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
			},
		})
	}

	action(action) {
		let cmd

		switch (action.action) {
			// Custom action
			case 'custom':
				this.parseVariables(action.options.id_send, cmd)
				break

			// Commands
			case 'cmd_power':
				switch (action.options.id_power_option) {
					case 'on':
						cmd = `<command xid="companion"><outlet id="${action.options.id_bank}">1</outlet></command>`
						break
					case 'off':
						cmd = `<command xid="companion"><outlet id="${action.options.id_bank}">0</outlet></command>`
						break
					case 'cycle':
						cmd = `<command xid="companion"><cycleoutlet id="${action.options.id_bank}"/></command>`
						break
				}
				break
			case 'cmd_sequence':
				cmd = `<command xid="companion"><sequence>${action.options.id_sequencedir}</sequence></command>`
				break
			case 'cmd_reboot':
				cmd = `<command xid="companion"><reboot/></command>`
				break

			// Settings
			case 'set_delay':
				cmd = `<command xid="companion"><set><delay id="${action.options.id_bank}" act="${action.options.id_delay_type}">${action.options.id_delay}</delay></set></command>`
				break
			case 'set_triggerena':
				cmd = `<command xid="companion"><set><triggerena id="${action.options.id_bank}">${action.options.id_triggerena}</triggerena></set></command>`
				break
			case 'set_brightness':
				cmd = `<command xid="companion"><set><brightness>${action.options.id_brightness}</brightness></set></command>`
				break
		}
		// add wrapper to command
		cmd = `<?xml version="1.0" ?><device class="${this.config.model}" id="${this.config.id}">${cmd}</device>`
		let sendBuf = Buffer.from(cmd + '\n')

		if (sendBuf != '') {
			if (this.udp !== undefined) {
				this.debug('sending', cmd, 'to', this.config.host)

				this.udp.send(sendBuf)
			}
		}
	}
}
exports = module.exports = instance
