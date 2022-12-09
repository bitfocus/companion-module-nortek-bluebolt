const { InstanceBase, Regex, runEntrypoint, UDPHelper, TelnetHelper } = require('@companion-module/base')
const { parseString } = require('xml2js')
const actions = require('./actions')
const variables = require('./variables')
const feedbacks = require('./feedbacks')
const models = require('./models.json')


class BlueBoltInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		Object.assign(this, {
			...actions,
			...variables,
			...feedbacks
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
				if (this.config.pollingEnable) {
					this.pollTimer = setInterval(this.poll.bind(this), this.config.pollingInterval)
				}
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
		this.updateVariables()
		this.updateFeedbacks()
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
				width: 12,
				regex: '/^[a-zA-Z0-9]*$/',
			},
			{
				type: 'checkbox',
				id: 'pollingEnable',
				label: 'Polling',
				description: 'Enable polling for variables/feedback?',
				width: 6,
				default: false,
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
	
	poll() {
		if (this.model.protocol == 'udp') {
            this.sendBlueBolt('<sendstatus/>', 'pollCallback')
        } else if (this.model.protocol == 'telnet') {
            
        }
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

	pollCallback(data) {
		if (this.model.variables) {
			this.log('debug', 'setting vars')
			var variables = {}
			if (this.model.variables.power === true) {
				this.log('debug', 'setting power vars')
				variables.voltage = data.device.status[0].voltage[0]
				variables.amperage = data.device.status[0].amperage[0]
				variables.wattage = data.device.status[0].wattage[0]
				variables.pwrva = data.device.status[0].pwrva[0]
				variables.pwrfact = data.device.status[0].pwrfact[0]
				if (this.model.banks > 0) {
					for (let i = 0; i < this.model.banks; i++) {
						variables[`bank${ i+1 }`] = data.device.status[0].outlet[i]._
					}
				}
				if (this.model.smartlink === true) {
					variables.remote = data.device.status[0].remote[0]
					variables.protok = data.device.status[0].protok[0]
					variables.smp = data.device.status[0].smp[0]
					variables.secok = data.device.status[0].secok[0]
					variables.overvolt = data.device.status[0].overvolt[0]
					variables.undervolt = data.device.status[0].undervolt[0]
					variables.pwrok = data.device.status[0].pwrok[0]
					variables.seqprog = data.device.status[0].seqprog[0]
				} else {
					variables.seq = data.device.status[0].seq[0]
					variables.pwrcond = data.device.status[0].pwrcond[0]
					variables.wiringfault = data.device.status[0].wiringfault[0]
				}
			}
			if (this.model.variables.trigger === true) {
				variables.triggersense = data.device.status[0].triggersense[0]
				variables.trigger = data.device.status[0].trigger[0]
			}
			this.setVariableValues(variables)
		}
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
