const { InstanceBase, Regex, runEntrypoint, UDPHelper, TelnetHelper } = require('@companion-module/base')
const { parseString } = require('xml2js')
const actions = require('./actions')
const models = require('./models.json')


class BlueBoltInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		Object.assign(this, {
			...actions
		})
	}

	async init(config) {
		if (this.udp) {
			this.udp.destroy()
			delete this.udp
		}
		if (this.telnet) {
			this.telnet.destroy()
			delete this.telnet
		}
		if (this.pollTimer) {
			clearInterval(this.pollTimer)
		}

		this.config = config

		if (!this.config.model) {
			this.config.model = 'm4000'
		}
		this.model = models[this.config.model]

		this.updateStatus('connecting')

		if (this.config.host) {
			if (this.model.protocol == 'udp') {
				this.udp = new UDPHelper(this.config.host, 57010)
				this.udp.on('error', (err) => {
					this.log('error', 'Network error: ' + err.message)
				})

				this.udp.on('status_change', (status) => {
					this.updateStatus(status)
				})

				// If we get data, thing should be good
				this.udp.on('data', (data) => {
					this.incomingDataUDP(data)
				})
				this.pollTimer = setInterval(this.poll.bind(this), this.config.pollingInterval)
			} else if (this.model.protocol == 'telnet') {
				this.telnet = new TelnetHelper(this.config.host, 23)

				this.telnet.on('error', (err) => {
					this.log('error', 'Network error: ' + err.message)
				})

				this.telnet.on('status_change', (status) => {
					this.updateStatus(status)
				})

				// not yet supported
				this.telnet.on('data', (data) => {
					//this.incomingData(data)
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
			} else {
				this.updateStatus('bad_config')
			}
		} else {
			this.updateStatus('bad_config')
		}
		this.updateActions()
	}

	// When module gets deleted
	async destroy() {
		if (this.udp) {
			this.udp.destroy()
			delete this.udp
		}
		if (this.telnet) {
			this.telnet.destroy()
			delete this.telnet
		}
		if (this.pollTimer) {
			clearInterval(this.pollTimer)
			delete this.pollTimer
		}
		this.log('info', 'destroy' + this.id)
	}

	async configUpdated(config) {
		this.init(config)
		this.log('info', 'New config.' + config.model)
	}

	// Return config fields for web config
	getConfigFields() {
		// Generate table of options for config page
		this.model_table = `<table class="tg"><thead><tr><th>Model</th><th>Protocol</th><th>Device IP</th><th>Device ID</th></tr></thead><tbody>`
		for (let modelOption of Object.values(models)) {
			this.model_table += `<tr><td>${modelOption.label}</td><td>${
				modelOption.smartlink ? modelOption.protocol + ' + SmartLink' : modelOption.protocol
			}</td><td>${modelOption.smartlink ? 'BB-RS232 IP' : 'Device IP'}</td><td>${modelOption.deviceID}</td></tr>`
		}
		this.model_table += `</tbody></table>`

		return [
			{
				type: 'static-text',
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
				width: 6,
				required: true,
				choices: Object.values(models),
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Device IP',
				width: 6,
				required: true,
				regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'id',
				label: 'Device ID',
				width: 6,
				regex: '/^[a-zA-Z0-9]*$/',
			},
			{
				type: 'number',
				id: 'pollingInterval',
				label: 'Polling Interval (in ms)',
				width: 6,
				min: 100,
				max: 10000,
				default: 500,
				required: true,
			},
		]
	}

	incomingDataUDP(data) {
		//this.log('debug', 'Received: ' + data.toString())
		parseString(data, (err, result) => {
			if (result.device.ack[0].$.xid){
				var callback = result.device.ack[0].$.xid
				this.log('debug', "callback provided: " + callback)
				if (callback === "pollCallback") {
					this.pollCallback(result)
				}
			}
		})
	}
	
	poll() {
		if (this.model.protocol == 'udp') {
            this.sendBlueBolt('<sendstatus/>', 'pollCallback')
        } else if (this.model.protocol == 'telnet') {
            
        }
	}

	pollCallback(data) {
		this.log('debug', data.device.status[0].voltage[0])
	}

	sendBlueBolt(cmd, cmdID) {
        if (this.model.protocol == 'udp') {
			if (cmdID){
				cmd = `<?xml version="1.0" ?><device class="${this.config.model}" id="${this.config.id}"><command xid="${cmdID}">${cmd}</command></device>\n`
			} else {
				cmd = `<?xml version="1.0" ?><device class="${this.config.model}" id="${this.config.id}"><command>${cmd}</command></device>\n`
			}
            this.udp.send(cmd)
        } else if (this.model.protocol == 'telnet') {
            this.telnet.write(cmd + '\r')
        }
        this.log('debug', 'Sent: ' + cmd + ' over ' + this.model.protocol)

    }

    
}
runEntrypoint(BlueBoltInstance, [])
