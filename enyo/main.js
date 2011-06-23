enyo.kind({
	
  	name: "wIRC.Main",
  	kind: enyo.HFlexBox,
  	
  	servers: [],
  	
  	components: [
	  	{
	  		kind: "SlidingPane",
	  		flex: 1,
	  		components: [
				{
					name: 'servers',
					width: "200px",
					components: [
				  		{
							kind: "VirtualList",
							name: 'serverList',
							flex: 1,
							onSetupRow: 'updateServerList',
							components: [
								{
									kind: 'wIRC.ServerListItem',
									name: "serverListItem",
								}
							]
						}
					]
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
			onPluginReady: 'testConnections',
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
	
	updateServerList: function(inSender, inIndex) {
  		if (this.servers.length > 0 && inIndex >= 0 && inIndex < this.servers.length) {
      		this.$.serverListItem.update(this.servers[inIndex].address,this.servers[inIndex].buffers)
	      	return true;
		}
	},
	
	pushDebugLog: function(message) {
		this.$.debugLog.data.unshift(message)
  		this.$.debugLog.refresh()
	},
  	
  	testConnections: function() {
  		
		this.servers[0] = new Server('0', 'chat.freenode.net', '6666')
		this.servers[1] = new Server('1', 'irc.morphism.net', '6667')
		this.servers[2] = new Server('2', 'irc.dal.net', '6668')
		
		for (i in this.servers) {
			this.$.serverList.refresh()
			this.connect(i)
		}
		
  	},
  	
  	connect: function(id) {
		var nick = 'wircer_enyo_'+Math.floor(Math.random()*10000)
  		this.$.plugin.connect(
			this.servers[id].id, this.servers[id].address, this.servers[id].port, 0, nick, null, nick, 'wIRC User', ''
		)
  	},
	
	retry_connection: function(inSender, id) {
  		var i = parseInt(id)
  		enyo.error('(&^&^&^&^&^^ RETRY    '+i)
  		this.pushDebugLog(['retry_connection', i])
  		enyo.asyncMethod(this, 'connect', i)
  	},
  	
  	event_connect: function(inSender, id, event, origin, params_s, ip) {
  		enyo.log('~~~~~ Connected to ' + this.servers[id].address + ' on port ' + this.servers[id].port + ' ~~~~~')
  		//this.servers[id].connected = true
  		this.pushDebugLog(['event_connect', id, event, origin, params_s, ip])
  	},
  	
  	event_nick: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(['event_nick', id, event, origin, params_s])
  	},
  	
  	event_quit: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(['event_quit', id, event, origin, params_s])
  	},
  	
  	event_join: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(['event_join', id, event, origin, params_s])
  	},
  	
  	event_part: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(['event_part', id, event, origin, params_s])
  	},
  	
  	event_invite: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(['event_invite', id, event, origin, params_s])
  	},
  	
  	event_mode: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(['event_mode', id, event, origin, params_s])
  	},
  	
  	event_umode: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(['event_umode', id, event, origin, params_s])
  	},
  	
  	event_topic: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(['event_topic', id, event, origin, params_s])
  	},
  	
  	event_kick: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(['event_kick', id, event, origin, params_s])
  	},
  	
  	event_channel: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(['event_channel', id, event, origin, params_s])
  	},
  	
  	event_privmsg: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(['event_privmsg', id, event, origin, params_s])
  	},
  	
  	event_notice: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(['event_notice', id, event, origin, params_s])
  	},
  	
  	event_channel_notice: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(['event_channel_notice', id, event, origin, params_s])
  	},
  	
  	event_ctcp_req: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(['event_ctcp_req', id, event, origin, params_s])
  	},
  	
  	event_ctcp_rep: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(['event_ctcp_rep', id, event, origin, params_s])
  	},
  	
  	event_ctcp_action: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(['event_ctcp_action', id, event, origin, params_s])
  	},
  	
  	event_unknown: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(['event_unknown', id, event, origin, params_s])
  	},
  	
  	event_numeric: function(inSender, id, event, origin, params_s) {
  		this.pushDebugLog(['event_numeric', id, event, origin, params_s])
  	},
  	
  	event_rtt: function(inSender, id, rtt) {},
  	event_dcc_send_req: function(inSender, id, nick, address, filename, size, dcc_id) {},
  	event_dcc_chat_req: function(inSender, id, nick, address, dcc_id) {},
  	handle_dcc_callback: function(inSender, id, dcc_id, status, length, data) {},
  	handle_dcc_send_callback: function(inSender, id, dcc_id, status, bitsIn, percent) {}
	
})