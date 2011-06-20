enyo.kind({
  	name: "wIRC.Main",
  	kind: enyo.VFlexBox,
  	
  	_nicks: [],
  	_msgs: [],
  	_nickname: 'wircer_enyo_'+Math.floor(Math.random()*10000),
  	_channel: '#wirc',
  	
  	components: [
  		{
  			kind: "SlidingPane",
  			flex: 1,
  			components: [
  				{
  					name: "buffers",
  					minWidth: "175px",
  					components: [
  						{
  							kind: 'DividerDrawer',
  							flex: 1,
  							caption: 'Freenode',
  							components: [
  								{
  									kind: 'Item',
  									content: '#wirc'
  								}
  							]
  						}
  					]
				},
				{
  					name: "chans",
  					flex: 1,
  					components: [
				  		{
							kind: 'PageHeader',
							name: 'topic',
							style: 'color: #888; font-size: 80%;'
						},
				  		{
				  			kind: "SlidingPane",
				  			flex: 1,
				  			components: [  				
				  				{
				  					name: "nicks",
				  					minWidth: "175px",
				  					components: [
				  						{
				  							kind: "VirtualList",
				  							name: 'nickList',
				  							flex: 1,
											onSetupRow: "setupNickList",
											components: [
												{
													kind: "Item",
													layoutKind: "HFlexLayout",
													onclick: "itemClick",
													components: [
														{
															name: "nick",
															flex: 1
														},
									              	]
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
												}
											]
										}
				  					]
				  				},
				  				{
				  					name: "chat",
				  					flex: 1,
				  					components: [
				  						{
				  							kind: "VirtualList",
				  							name: 'messages',
				  							pack: 'end',
				  							flex: 1,
											onSetupRow: "setupRow",
											components: [
												{
													name: "caption",
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
				  		}
			  		]
		  		}
	  		]
  		},
  		{
  			name: 'pluginObject',
  			kind: enyo.Hybrid,
  			executable: 'plugin/wirc',
  			params: ["20","0","10"],
  			onPluginReady: 'pluginReady',
  			onPluginConnected: 'pluginConnected',
  			onPluginDisconnected: 'pluginDisconnected'
		},
		{
			kind: 'Scrim',
			layoutKind: 'VFlexLayout',
			align: 'center',
			pack: 'center',
			components: [
				{kind: 'SpinnerLarge', name: 'spinner'}
			]
		}
  	],
  	  	
  	sortNicks: function(a, b) {
  		var score1 = -2
  		if (a[0] == '!') score1 = -64
  		else if (a[0] == '.') score1 = -32
  		else if (a[0] == '@') score1 = -16
  		else if (a[0] == '%') score1 = -8
  		else if (a[0] == '+') score1 = -4
  		var score2 = -2
  		if (b[0] == '!') score2 = -64
  		else if (b[0] == '.') score2 = -32
  		else if (b[0] == '@') score2 = -16
  		else if (b[0] == '%') score2 = -8
  		else if (b[0] == '+') score2 = -4
  		var x = a.toLowerCase()
  		var y = b.toLowerCase()
  		var comp = ((x < y) ? -1 : ((x > y) ? 1 : 0))
  		if (comp > 0)
  			score1 = score1 + 1
		if (comp < 0)
			score2 = score2 + 1
		if (score1 > score2)
        	return 1
    	if (score1 < score2)
        	return -1;
    	return 0
	},
  	
  	inputChange: function() {
  		var msg = this.$.messageInput.getValue()
  		this.$.pluginObject.callPluginMethod('cmd_msg', 0, this._channel, msg)
  		this._msgs.push([this._nickname,msg])
  		this.$.messages.refresh()
  		this.$.messageInput.setValue('')
  	},
  	
  	setupNickList: function(inSender, inIndex) {
  		if (this._nicks.length > 0 && inIndex >= 0 && inIndex < this._nicks.length) {
      		this.$.nick.setContent(this._nicks[inIndex]);
	      	return true;
		}
	},
  	
  	setupRow: function(inSender, inIndex) {
		if (this._msgs.length > 0) {
			if (inIndex >= 0 && inIndex < this._msgs.length) {
				this.$.caption.setContent('<'+this._msgs[inIndex][0]+'> '+this._msgs[inIndex][1]);
				var style = 'font-size: 80%;'
				if (this._msgs[inIndex][0] == this._nickname)
					style = style + ' color: blue;'
				this.$.caption.setStyle(style)
				return true
			}/* else if (inIndex == -1) {
				this.$.caption.setStyle('height: 500px;')
				return true
			}*/
		}
	},

  	rendered: function() {
		this.inherited(arguments)
		this.$.scrim.show()
		this.$.spinner.show();
	},
	
  	pluginReady: function(inSender, inResponse, inRequest) {
  		this.$.pluginObject.addCallback('retry_connection', enyo.bind(this, 'retry_connection'))
  		this.$.pluginObject.addCallback('event_connect', enyo.bind(this, 'event_connect'))
  		this.$.pluginObject.addCallback('event_nick', enyo.bind(this, 'event_nick'))
  		this.$.pluginObject.addCallback('event_quit', enyo.bind(this, 'event_quit'))
  		this.$.pluginObject.addCallback('event_join', enyo.bind(this, 'event_join'))
  		this.$.pluginObject.addCallback('event_part', enyo.bind(this, 'event_part'))
  		this.$.pluginObject.addCallback('event_mode', enyo.bind(this, 'event_mode'))
  		this.$.pluginObject.addCallback('event_umode', enyo.bind(this, 'event_umode'))
  		this.$.pluginObject.addCallback('event_topic', enyo.bind(this, 'event_topic'))
  		this.$.pluginObject.addCallback('event_kick', enyo.bind(this, 'event_kick'))
  		this.$.pluginObject.addCallback('event_channel', enyo.bind(this, 'event_channel'))
  		this.$.pluginObject.addCallback('event_privmsg', enyo.bind(this, 'event_privmsg'))
  		this.$.pluginObject.addCallback('event_notice', enyo.bind(this, 'event_notice'))
  		this.$.pluginObject.addCallback('event_channel_notice', enyo.bind(this, 'event_channel_notice'))
  		this.$.pluginObject.addCallback('event_ctcp_req', enyo.bind(this, 'event_ctcp_req'))
  		this.$.pluginObject.addCallback('event_ctcp_rep', enyo.bind(this, 'event_ctcp_rep'))
  		this.$.pluginObject.addCallback('event_ctcp_action', enyo.bind(this, 'event_ctcp_action'))
  		this.$.pluginObject.addCallback('event_unknown', enyo.bind(this, 'event_unknown'))
  		this.$.pluginObject.addCallback('event_numeric', enyo.bind(this, 'event_numeric'))
  		this.$.pluginObject.addCallback('event_rtt', enyo.bind(this, 'event_rtt'))
  		this.$.pluginObject.addCallback('event_dcc_send_req', enyo.bind(this, 'event_dcc_send_req'))
  		this.$.pluginObject.addCallback('event_dcc_chat_req', enyo.bind(this, 'event_dcc_chat_req'))
  		this.$.pluginObject.addCallback('handle_dcc_callback', enyo.bind(this, 'handle_dcc_callback'))
  		this.$.pluginObject.addCallback('handle_dcc_send_callback', enyo.bind(this, 'handle_dcc_send_callback'))
  		this.connect()
  	},
  	pluginConnected: function(inSender, inResponse, inRequest) {},
  	pluginDisconnected: function(inSender, inResponse, inRequest) {},
  	
  	connect: function() {
  		this.$.pluginObject.callPluginMethod(
  			'connect', 0, 'chat.freenode.net', 6667, 0, this._nickname, null, this._nickname, 'wIRC User', ''
		)
  	},
  	join: function() {
  		this.$.pluginObject.callPluginMethod('cmd_join', 0, this._channel)
  	},
  	
  	retry_connection: function() {
  		enyo.job('retry_connection', enyo.bind(this, 'connect'), 0)
  	},
  	event_connect: function(id, event, origin, params_s, ip) {
  		enyo.job('join', enyo.bind(this, 'join'), 0)
  	},
  	
  	event_nick: function() {},
  	event_quit: function() {},
  	event_join: function() {},
  	event_part: function() {},
  	event_mode: function() {},
  	event_umode: function() {},
  	event_topic: function() {},
  	event_kick: function() {},
  	event_channel: function(id, event, origin, params_s) {
  		var params = enyo.json.parse(params_s)
  		this._msgs.push([origin.split('!')[0],params[1]])
  		this.$.messages.refresh()
  	},
  	event_privmsg: function(id, event, origin, params_s) {
  		var params = enyo.json.parse(params_s)
  	},
  	event_notice: function() {},
  	event_channel_notice: function() {},
  	event_ctcp_req: function() {},
  	event_ctcp_rep: function() {},
  	event_ctcp_action: function() {},
  	event_unknown: function() {},
  	event_numeric: function(id, event, origin, params_s) {
  		var params = enyo.json.parse(params_s)
  		//this.log(event+' '+params)
  		var evt = parseInt(event)
  		switch (evt) {
  			case 332:
  				this.$.topic.setContent(params[2])
  				break;
			case 353:
				this._nicks = this._nicks.concat(params[3].split(" ")).sort(this.sortNicks)
				this.$.nickList.refresh()
				this.$.spinner.hide()
				this.$.scrim.hide()
				break;	
  		}  		
  	},
  	event_rtt: function() {},
  	event_dcc_send_req: function() {},
  	event_dcc_chat_req: function() {},
  	handle_dcc_callback: function() {},
  	handle_dcc_send_callback: function() {}
});