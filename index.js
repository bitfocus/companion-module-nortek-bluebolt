const udp = require('../../udp')
const TelnetSocket = require('../../telnet')
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

		this.CONFIG_MODELS = {
			m4000: {
				id: 'm4000',
				label: 'Panamax M4000 Pro',
				banks: 3,
				protocol: 'udp',
				smartlink: false,
				deviceID: 'MAC Address',
			},
			sm3: {
				id: 'sm3',
				label: 'Panamax SM-3 Pro',
				banks: 2,
				protocol: 'udp',
				smartlink: false,
				deviceID: 'MAC Address',
			},
			m4315: {
				id: 'm4315',
				label: 'Panamax M4315 Pro',
				banks: 8,
				protocol: 'telnet',
				smartlink: false,
				deviceID: 'N/A',
			},
			bb232: {
				id: 'bb232',
				label: 'Furman BB-RS232',
				banks: 0,
				protocol: 'udp',
				smartlink: false,
				deviceID: 'MAC Address',
			},
			cn1800: {
				id: 'cn1800',
				label: 'Furman CN-1800 S',
				banks: 3,
				protocol: 'udp',
				smartlink: true,
				deviceID: 'Serial Number',
			},
			cn2400: {
				id: 'cn2400',
				label: 'Furman CN-2400 S',
				banks: 3,
				protocol: 'udp',
				smartlink: true,
				deviceID: 'Serial Number',
			},
			cn3600: {
				id: 'cn3600',
				label: 'Furman CN-3600 SE',
				banks: 3,
				protocol: 'udp',
				smartlink: true,
				deviceID: 'Serial Number',
			},
			cnmp15: {
				id: 'cnmp15',
				label: 'Furman CN-15MP',
				banks: 1,
				protocol: 'udp',
				smartlink: true,
				deviceID: 'Serial Number',
			},
			cnmp20: {
				id: 'cnmp20',
				label: 'Furman CN-20MP',
				banks: 1,
				protocol: 'udp',
				smartlink: true,
				deviceID: 'Serial Number',
			},
		}
		this.CONFIG_MODELS_CHOICES = Object.values(this.CONFIG_MODELS)
		// Sort names alphabetically
		this.CONFIG_MODELS_CHOICES.sort(function (a, b) {
			var x = a.label.toLowerCase()
			var y = b.label.toLowerCase()
			if (x < y) {
				return -1
			}
			if (x > y) {
				return 1
			}
			return 0
		})

		// Generate table of options for config page
		this.model_table = `<style type="text/css">
			.tg  {border-collapse:collapse;border-spacing:0;}
			.tg td{border-color:black;border-style:solid;border-width:1px;padding:5px 5px;}
			.tg th{text-align:center;}
			</style>
			`
		this.model_table += `<table class="tg"><thead><tr><th>Model</th><th>Protocol</th><th>Device IP</th><th>Device ID</th></tr></thead><tbody>`
		for (let modelOption of this.CONFIG_MODELS_CHOICES) {
			this.model_table += `<tr><td>${modelOption.label}</td><td>${(modelOption.smartlink) ? (modelOption.protocol + ' + SmartLink') : modelOption.protocol}</td><td>${
				modelOption.smartlink ? 'BB-RS232 IP' : 'Device IP'
			}</td><td>${modelOption.deviceID}</td></tr>`
		}
		this.model_table += `</tbody></table>`

		// Set model if none set
		if (this.config.model !== undefined) {
			this.model = this.CONFIG_MODELS[this.config.model]
		} else {
			this.config.model = 'm4000'
			this.model = this.CONFIG_MODELS['m4000']
		}

		this.actions() // export actions
		this.init_presets() // export presets
	}

	updateConfig(config) {
		if (this.config.model != config.model) {
			this.model = this.CONFIG_MODELS[config.model]
		}

		this.config = config
		this.actions() // export actions
		this.init_presets()

		this.init()
		this.debug('New config.', this.model)
	}

	incomingData = function (data) {
		this.status(self.STATUS_OK)
		this.debug('Received: ' + data.toString())
	}

	init() {
		if (this.udp !== undefined) {
			this.udp.destroy()
			delete this.udp
		}
		if (this.telnet !== undefined) {
			this.telnet.destroy()
			delete self.telnet
		}

		this.status(this.STATE_WARNING, 'Connecting')

		if (this.config.host) {
			if (this.model.protocol == 'udp') {
				this.udp = new udp(this.config.host, 57010)

				this.udp.on('error', (err) => {
					this.debug('Network error', err)
					this.status(this.STATE_ERROR, err)
					this.log('error', 'Network error: ' + err.message)
				})

				// If we get data, thing should be good
				this.udp.on('data', (data, info) => {
					this.incomingData(data)
				})

				this.udp.on('status_change', (status, message) => {
					this.status(status, message)
				})
			} else if (this.model.protocol == 'telnet') {
				this.telnet = new TelnetSocket(this.config.host, 23)

				this.telnet.on('status_change', (status, message) => {
					if (this.status !== this.STATUS_OK) {
						this.status(status, message)
					}
				})

				this.telnet.on('error', (err) => {
					this.debug('Network error', err)
					this.log('error', 'Network error: ' + err.message)
				})

				this.telnet.on('connect', () => {
					this.debug('Connected')
				})

				// if we get any data, display it to stdout
				this.telnet.on('data', (buffer) => {
					var indata = buffer.toString('utf8')
					this.incomingData(indata)
				})

				this.telnet.on('iac', function (type, info) {
					// tell remote we WONT do anything we're asked to DO
					if (type == 'DO') {
						this.telnet.write(Buffer.from([255, 252, info]))
					}

					// tell the remote DONT do whatever they WILL offer
					if (type == 'WILL') {
						this.telnet.write(Buffer.from([255, 254, info]))
					}
				})
			}
		}
	}

	// Return config fields for web config
	config_fields() {
		return [
			{
				type: 'text',
				id: 'table',
				width: 12,
				value: `${this.model_table}
					<div>
						<br>
						Note: Each device in a SmartLink chain needs its own instance of this module!
					</div>`,
			},
			{
				type: 'dropdown',
				id: 'model',
				label: 'Device Model',
				required: true,
				choices: this.CONFIG_MODELS_CHOICES,
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Device IP',
				required: true,
				regex: this.REGEX_IP,
			},
			{
				type: 'textinput',
				id: 'id',
				label: 'Device ID',
				regex: '/^[a-zA-Z0-9]*$/',
			},
		]
	}

	// When module gets deleted
	destroy() {
		if (this.udp !== undefined) {
			this.udp.destroy()
		}
		if (this.telnet !== undefined) {
			this.telnet.destroy()
		}

		this.debug('destroy', this.id)
	}

	init_presets() {
		let presets = []
		this.setPresetDefinitions(presets)
	}

	actions(system) {
		var actions = {}

		if (this.model.protocol == 'udp') {
			actions['udp_cmd_sequence'] = {
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
			}
			actions['udp_cmd_reboot'] = {
				label: 'Reboot Device',
			}
			if (this.model.banks > 0) {
				actions['udp_cmd_power'] = {
					label: 'Power Action',
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
				}
				actions['udp_set_delay'] = {
					label: 'Set Bank Delay',
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
				}
			}
			if (this.smartlink) {
				
			}
			if (this.model.id == 'bb232') {
				actions['udp_cmd_enumerate'] = {
					label: 'Enumerate',
				}
				actions['udp_cmd_rollcall'] = {
					label: 'Roll Call',
				}
			}
			if (this.model.id == 'm4000') {
				actions['udp_set_triggerena'] = {
					label: 'Enable Trigger',
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
				}
				actions['udp_set_brightness'] = {
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
				}
			}
		} else if (this.model.protocol == 'telnet') {
			actions['telnet_cmd_trigger'] = {
				label: 'Trigger Action',
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
			}
			actions['telnet_cmd_power'] = {
				label: 'Bank Power Action',
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
			}
			actions['telnet_set_trigger_source'] = {
				label: 'Set Trigger Source',
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
			}
			actions['telnet_set_reboot_delay'] = {
				label: 'Set Reboot Delay',
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
			}
			actions['telnet_set_delay'] = {
				label: 'Set Delay',
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
			}
		}

		this.setActions(actions)
	}

	action(action) {
		let cmd

		switch (action.action) {
			case 'udp_cmd_power':
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
			case 'udp_cmd_sequence':
				cmd = `<command xid="companion"><sequence>${action.options.id_sequencedir}</sequence></command>`
				break
			case 'udp_cmd_reboot':
				cmd = `<command xid="companion"><reboot/></command>`
				break
			case 'udp_cmd_enumerate':
				cmd = '<enumerate/>'
				break
			case 'udp_cmd_rollcall':
				cmd = '<rollcall/>'
				break

			// UDP Settings
			case 'udp_set_delay':
				cmd = `<command xid="companion"><set><delay id="${action.options.id_bank}" act="${action.options.id_delay_type}">${action.options.id_delay}</delay></set></command>`
				break
			case 'udp_set_triggerena':
				cmd = `<command xid="companion"><set><triggerena id="${action.options.id_bank}">${action.options.id_triggerena}</triggerena></set></command>`
				break
			case 'udp_set_brightness':
				cmd = `<command xid="companion"><set><brightness>${action.options.id_brightness}</brightness></set></command>`
				break

			// Telnet
			case 'telnet_cmd_trigger':
				cmd = action.options.id_trigger_option
				break
			case 'telnet_cmd_power':
				cmd = `!SWITCH ${action.options.id_bank} ${action.options.id_power_option}`
				break
			case 'telnet_set_trigger_source':
				cmd = `!SET_TRIGGER ${action.options.id_bank} ${action.options.id_trigger_source}`
				break
			case 'telnet_set_reboot_delay':
				cmd = `!SET_REBOOT_DELAY ${action.options.id_delay_1} ${action.options.id_delay_2}`
				break
			case 'telnet_set_delay':
				cmd = `!SET_DELAY ${action.options.id_bank} ${action.options.id_delay_on} ${action.options.id_delay_off}`
				break
		}
		// add wrapper to command
		if (this.model.protocol == 'udp') {
			cmd = `<?xml version="1.0" ?><device class="${this.config.model}" id="${this.config.id}">${cmd}</device>`
			let sendBuf = Buffer.from(cmd + '\n')

			if (sendBuf != '') {
				if (this.udp !== undefined) {
					this.debug('Sending: ', cmd, ' over ', this.model.protocol)
					this.udp.send(sendBuf)
				}
			}
		} else if (this.model.protocol == 'telnet') {
			this.debug('Sending: ', cmd, ' over ', this.model.protocol)
			self.socket.write(cmd + '\r')
		}
	}
}
exports = module.exports = instance
