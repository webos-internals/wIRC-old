enyo.kind({
	
  	name: "wIRC.Main",
  	kind: enyo.HFlexBox,
  	
  	servers: [],
  	currentServer: 0,
  	
  	components: [
	  	{
	  		kind: "SlidingPane",
	  		flex: 1,
	  		components: [
				{
					name: 'serverList',
					width: "200px",
					height: '100%'
				},
				{
					name: 'buffers',
					flex: 1,
					components: [
						{
							kind: "wIRC.BufferList",
							name: 'debugLog',
							flex: 1,
							bottomUp: true,
							onSetupRow: 'updateDebugLog',
							height: '100%',
							components: [
								{
									name: "debugLogItem",
									style: 'font-size: 65%;'
								}
							]
						},
						{
							kind: 'Toolbar',
							className: 'enyo-toolbar-light',
							pack: 'left',
							style: 'padding-left: 48px;',
							components: [
								{
									kind: 'GrabButton'
								},
		  						{
		  							name: 'messageInput',
		  							kind: 'Input',
		  							onchange: "inputChange",
		  							alwaysLooksFocused: true,
		  							style: 'width: 100%;',
								}
							]
						}
					]
				}
			]
		},
		{
			name: 'plugin',
			kind: 'wIRC.Plugin',
			onPluginReady: 'plugin_ready',
			onRetryConnection: 'retry_connection',
			onEventConnect: 'event_connect',
			onEventNick: 'event_nick',
			onEventQuit: 'event_quit',
			onEventJoin: 'event_join',
			onEventPart: 'event_part',
			onEventInvite: 'event_invite',
			onEventMode: 'event_mode',
			onEventUmode: 'event_umode',
			onEventTopic: 'event_topic',
			onEventKick: 'event_kick',
			onEventChannel: 'event_channel',
			onEventPrivmsg: 'event_privmsg',
			onEventNotice: 'event_notice',
			onEventChannelNotice: 'event_channel_notice',
			onEventCtcpReq: 'event_ctcp_req',
			onCtcpRep: 'event_ctcp_rep',
			onCtcpAction: 'event_ctcp_action',
			onEventUnknown: 'event_unknown',
			onEventNumeric: 'event_numeric',
			onEventRtt: 'event_rtt',
			onEventDccSendReq: 'event_dcc_send_req',
			onEventDccChatReq: 'event_dcc_chat_req',
			onHandleDccCallback: 'handle_dcc_callback',
			onHandleDccSendCallback: 'handle_dcc_send_callback'			
		}	
	],
	
	updateDebugLog: function(inSender, inMessage, inIndex) {
  		this.$.debugLogItem.setContent(inMessage);
	},
	
	updateServerList: function(inSender, inMessage, inIndex) {
		this.log(inMessage)
  		this.$.serverListItem.update(inMessage.id,inMessage.address,inMessage.buffers)
	},
	
	pushDebugLog: function(id, data) {
		this.servers[id].data.unshift(data)
		this.refreshDebugLog()
	},
	
	refreshDebugLog: function() {
		this.$.debugLog.setData(this.servers[this.currentServer].data)
  		this.$.debugLog.refresh()
	},
	
	bufferClicked: function(id) {
		this.log('Server Clicked: '+id.serverID)
		this.currentServer = id.serverID
		this.refreshDebugLog()
	},
  	
  	plugin_ready: function() {
  		enyo.asyncMethod(this, 'testConnections')
  	},
  	
  	testConnections: function() {
	
		this.servers.push(new Server(this.servers.length, 'chat.freenode.net', 6666))
		this.servers.push(new Server(this.servers.length, 'irc.morphism.net', 6667))
		this.servers.push(new Server(this.servers.length, 'irc.dal.net', 6668))
				
		for (id in this.servers) {
			this.$.serverList.createComponent({
				kind: 'DividerDrawer',
				name: this.servers[id].address,
				caption: this.servers[id].address,
			})
			this.connect(id)
		}
		
		for (var p in this.$.serverList.children) this.log(p)
		
  	},
  	
  	connect: function(id) {
  		this.log('~~~~~ Connection attempt to ' + this.servers[id].address + ' on port ' + this.servers[id].port + ' ~~~~~')
		var nick = 'wircer_enyo_'+Math.floor(Math.random()*10000)
  		this.$.plugin.connect(
			id, 
			this.servers[id].address, 
			this.servers[id].port,
			0, nick, null, nick, 'wIRC User', ''
		)
  	},
	
	retry_connection: function(inSender, id) {
  		var i = parseInt(id)
  		this.error('(&^&^&^&^&^^ RETRY    '+i)
  		this.pushDebugLog(id, i, ['retry_connection'])
  		enyo.asyncMethod(this, 'connect', i)
  	},
  	
  	event_connect: function(inSender, id, event, origin, params_s, ip) {
  		this.log('~~~~~ Connected to ' + this.servers[id].address + ' on port ' + this.servers[id].port + ' ~~~~~')
  		//this.servers[id].connected = true
  		this.pushDebugLog(id, id, ['event_connect', event, origin, params_s, ip])
  	},
  	
  	event_nick: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(id, ['event_nick', event, origin, params_s])
  	},
  	
  	event_quit: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(id, ['event_quit', event, origin, params_s])
  	},
  	
  	event_join: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(id, ['event_join', event, origin, params_s])
  	},
  	
  	event_part: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(id, ['event_part', event, origin, params_s])
  	},
  	
  	event_invite: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(id, ['event_invite', event, origin, params_s])
  	},
  	
  	event_mode: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(id, ['event_mode', event, origin, params_s])
  	},
  	
  	event_umode: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(id, ['event_umode', event, origin, params_s])
  	},
  	
  	event_topic: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(id, ['event_topic', event, origin, params_s])
  	},
  	
  	event_kick: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(id, ['event_kick', event, origin, params_s])
  	},
  	
  	event_channel: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(id, ['event_channel', event, origin, params_s])
  	},
  	
  	event_privmsg: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(id, ['event_privmsg', event, origin, params_s])
  	},
  	
  	event_notice: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(id, ['event_notice', event, origin, params_s])
  	},
  	
  	event_channel_notice: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(id, ['event_channel_notice', event, origin, params_s])
  	},
  	
  	event_ctcp_req: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(id, ['event_ctcp_req', event, origin, params_s])
  	},
  	
  	event_ctcp_rep: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(id, ['event_ctcp_rep', event, origin, params_s])
  	},
  	
  	event_ctcp_action: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(id, ['event_ctcp_action', event, origin, params_s])
  	},
  	
  	event_unknown: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(id, ['event_unknown', event, origin, params_s])
  	},
  	
  	event_numeric: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(id, ['event_numeric', event, origin, params_s])
  	},
  	
  	event_rtt: function(inSender, id, rtt) {},
  	event_dcc_send_req: function(inSender, id, nick, address, filename, size, dcc_id) {},
  	event_dcc_chat_req: function(inSender, id, nick, address, dcc_id) {},
  	handle_dcc_callback: function(inSender, id, dcc_id, status, length, data) {},
  	handle_dcc_send_callback: function(inSender, id, dcc_id, status, bitsIn, percent) {}
	
})