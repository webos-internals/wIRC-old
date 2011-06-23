enyo.kind({
	
	name: 'wIRC.Plugin',
	kind: enyo.Control,
		
	published: {
		maxServers: 20,
		autoPing: false,
		autoPingInterval: 10,
	},
	
	events: {
		onRetryConnection:'',onEventConnect:'',onEventNick:'',onEventQuit:'',
		onEventJoin:'',onEventPart:'',onEventInvite:'',onEventMode:'',
		onEventUmode:'',onEventTopic:'',onEventKick:'',onEventChannel:'',
		onEventPrivmsg:'',onEventNotice:'',onEventChannelNotice:'',
		onEventCtcpReq:'',onCtcpRep:'',onCtcpAction:'',onEventUnknown:'',
		onEventNumeric:'',onEventRtt:'',onEventDccSendReq:'',onEventDccChatReq:'',
		onHandleDccCallback:'',onHandleDccSendCallback:'',onPluginReady:''
	},

	initComponents: function() {
		this.createComponent({
			name: 'plugin',
			kind: enyo.Hybrid,
			executable: 'plugin/wirc',
			params: [
				this.maxServers.toString(),
				this.autoPing.toString(),
				this.autoPingInterval.toString()
			],
			onPluginReady: 'pluginReady',
			onPluginConnected: 'pluginConnected',
			onPluginDisconnected: 'pluginDisconnected',
		})
	},
		
  	pluginReady: function(inSender, inResponse, inRequest) {
  		
  		this.log('~~~~~ wIRC Plugin Ready ~~~~~')
  		this.$.plugin.addCallback('retry_connection', enyo.bind(this, 'retry_connection'))
  		this.$.plugin.addCallback('event_connect', enyo.bind(this, 'event_connect'))
  		this.$.plugin.addCallback('event_nick', enyo.bind(this, 'event_nick'))
  		this.$.plugin.addCallback('event_quit', enyo.bind(this, 'event_quit'))
  		this.$.plugin.addCallback('event_join', enyo.bind(this, 'event_join'))
  		this.$.plugin.addCallback('event_part', enyo.bind(this, 'event_part'))
  		this.$.plugin.addCallback('event_mode', enyo.bind(this, 'event_mode'))
  		this.$.plugin.addCallback('event_umode', enyo.bind(this, 'event_umode'))
  		this.$.plugin.addCallback('event_topic', enyo.bind(this, 'event_topic'))
  		this.$.plugin.addCallback('event_kick', enyo.bind(this, 'event_kick'))
  		this.$.plugin.addCallback('event_channel', enyo.bind(this, 'event_channel'))
  		this.$.plugin.addCallback('event_privmsg', enyo.bind(this, 'event_privmsg'))
  		this.$.plugin.addCallback('event_notice', enyo.bind(this, 'event_notice'))
  		this.$.plugin.addCallback('event_channel_notice', enyo.bind(this, 'event_channel_notice'))
  		this.$.plugin.addCallback('event_ctcp_req', enyo.bind(this, 'event_ctcp_req'))
  		this.$.plugin.addCallback('event_ctcp_rep', enyo.bind(this, 'event_ctcp_rep'))
  		this.$.plugin.addCallback('event_ctcp_action', enyo.bind(this, 'event_ctcp_action'))
  		this.$.plugin.addCallback('event_unknown', enyo.bind(this, 'event_unknown'))
  		this.$.plugin.addCallback('event_numeric', enyo.bind(this, 'event_numeric'))
  		this.$.plugin.addCallback('event_rtt', enyo.bind(this, 'event_rtt'))
  		this.$.plugin.addCallback('event_dcc_send_req', enyo.bind(this, 'event_dcc_send_req'))
  		this.$.plugin.addCallback('event_dcc_chat_req', enyo.bind(this, 'event_dcc_chat_req'))
  		this.$.plugin.addCallback('handle_dcc_callback', enyo.bind(this, 'handle_dcc_callback'))
  		this.$.plugin.addCallback('handle_dcc_send_callback', enyo.bind(this, 'handle_dcc_send_callback'))
  		
  		this.doPluginReady()
  		
  	},
  	pluginConnected: function(inSender, inResponse, inRequest) {
  		this.log('~~~~~ wIRC Plugin Connected ~~~~~')
  	},
  	pluginDisconnected: function(inSender, inResponse, inRequest) {
  		this.log('~~~~~ wIRC Plugin Disconnected ~~~~~')
  	},
  	
  	connect: function(id, address, port, encryption, username, password, nick, realname) {
  		return this.$.plugin.callPluginMethod('connect', id, address, port, encryption, username, password, nick, realname)
  	},
  	
  	retry_connection: function(id) {
  		this.doRetryConnection(id)
  	},
  	
  	event_connect: function(id, event, origin, params_s, ip) {
  		this.doEventConnect(id, event, origin, params_s, ip)
  	},
  	
  	event_nick: function(id, event, origin, params_s) {
  		this.doEventNick(id, event, origin, params_s)
  	},
  	
  	event_quit: function(id, event, origin, params_s) {
  		this.doEventQuit(id, event, origin, params_s)
  	},
  	
  	event_join: function(id, event, origin, params_s) {
  		this.doEventJoin(id, event, origin, params_s)
  	},
  	
  	event_part: function(id, event, origin, params_s) {
  		this.doEventPart(id, event, origin, params_s)
  	},
  	
  	event_invite: function(id, event, origin, params_s) {
  		this.doEventInvite(id, event, origin, params_s)
  	},
  	
  	event_mode: function(id, event, origin, params_s) {
  		this.doEventMode(id, event, origin, params_s)
  	},
  	
  	event_umode: function(id, event, origin, params_s) {
  		this.doEventUmode(id, event, origin, params_s)
  	},
  	
  	event_topic: function(id, event, origin, params_s) {
  		this.doEventTopic(id, event, origin, params_s)
  	},
  	
  	event_kick: function(id, event, origin, params_s) {
  		this.doEventKick(id, event, origin, params_s)
  	},
  	
  	event_channel: function(id, event, origin, params_s) {
  		this.doEventChannel(id, event, origin, params_s)
  	},
  	
  	event_privmsg: function(id, event, origin, params_s) {
  		this.doEventPrivmsg(id, event, origin, params_s)
  	},
  	
  	event_notice: function(id, event, origin, params_s) {
  		this.doEventNotice(id, event, origin, params_s)
  	},
  	
  	event_channel_notice: function(id, event, origin, params_s) {
  		this.doEventChannelNotice(id, event, origin, params_s)
  	},
  	
  	event_ctcp_req: function(id, event, origin, params_s) {
  		this.doEventCtcpReq(id, event, origin, params_s)
  	},
  	
  	event_ctcp_rep: function(id, event, origin, params_s) {
  		this.doEventCtcpRep(id, event, origin, params_s)
  	},
  	
  	event_ctcp_action: function(id, event, origin, params_s) {
  		this.doEventCtcpAction(id, event, origin, params_s)
  	},
  	
  	event_unknown: function(id, event, origin, params_s) {
  		this.doEventUnknown(id, event, origin, params_s)
  	},
  	
  	event_numeric: function(id, event, origin, params_s) {
  		this.doEventNumeric(id, event, origin, params_s)
  	},
  	
  	event_rtt: function(id, rtt) {
  		this.doEventRtt(id, rtt)
  	},
  	
  	event_dcc_send_req: function(id, nick, address, filename, size, dcc_id) {
  		this.doEventCtcpReq(id, nick, address, filename, size, dcc_id)
  	},
  	
  	event_dcc_chat_req: function(id, nick, address, dcc_id) {
  		this.doEventCtcpReq(id, nick, address, dcc_id)
  	},
  	
  	handle_dcc_callback: function(id, dcc_id, status, length, data) {
		this.doHandleDccCallback(id, dcc_id, status, length, data)
  	},
  	
  	handle_dcc_send_callback: function(id, dcc_id, status, bitsIn, percent) {
  		this.doHandleDccSendCallback(id, dcc_id, status, bitsIn, percent)
  	}
  	
})