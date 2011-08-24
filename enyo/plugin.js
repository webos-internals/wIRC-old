enyo.kind({
	
	name: 'wirc.Plugin',
	kind: enyo.Control,
	
	published: {
		maxServers: 20,
		autoPing: false,
		autoPingInterval: 10,
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
		}, {owner: this});
	    this.inherited(arguments);
	},
	
  	pluginReady: function(inSender, inResponse, inRequest) {
  		this.log('~~~~~ wIRC Plugin Ready ~~~~~');
		enyo.application.pm.setup(this.$.plugin);
		enyo.application.cm = new wirc.connectionManager();
  	},
  	pluginConnected: function(inSender, inResponse, inRequest) {
  		this.log('~~~~~ wIRC Plugin Connected ~~~~~');
  	},
  	pluginDisconnected: function(inSender, inResponse, inRequest) {
  		this.log('~~~~~ wIRC Plugin Disconnected ~~~~~');
  	},
  	
})

enyo.kind({
	name: 'wirc.PluginManager',
	kind: enyo.Control,
	
	dumpLog: false,
	plugin: false,
	
  	call: function() {
		if (this.plugin)
			return this.plugin.callPluginMethod.apply(this.plugin, arguments);
  	},
	
	setup: function(plugin) {
		this.plugin = plugin;
  		this.plugin.addCallback('retry_connection',			enyo.bind(this, 'retryConnection')); // , defer (true/false)?
  		this.plugin.addCallback('event_connect',			enyo.bind(this, 'eventConnect'), true);
  		this.plugin.addCallback('event_nick',				enyo.bind(this, 'eventNick'));
  		this.plugin.addCallback('event_quit',				enyo.bind(this, 'eventQuit'));
  		this.plugin.addCallback('event_join',				enyo.bind(this, 'eventJoin'));
  		this.plugin.addCallback('event_part',				enyo.bind(this, 'eventPart'));
  		this.plugin.addCallback('event_mode',				enyo.bind(this, 'eventMode'));
  		this.plugin.addCallback('event_umode',				enyo.bind(this, 'eventUmode'));
  		this.plugin.addCallback('event_topic',				enyo.bind(this, 'eventTopic'));
  		this.plugin.addCallback('event_kick',				enyo.bind(this, 'eventKick'));
  		this.plugin.addCallback('event_channel',			enyo.bind(this, 'eventChannel'));
  		this.plugin.addCallback('event_privmsg',			enyo.bind(this, 'eventPrivmsg'));
  		this.plugin.addCallback('event_notice',				enyo.bind(this, 'eventNotice'));
  		this.plugin.addCallback('event_channel_notice',		enyo.bind(this, 'eventChannelNotice'));
  		this.plugin.addCallback('event_ctcp_req',			enyo.bind(this, 'eventCtcpReq'));
  		this.plugin.addCallback('event_ctcp_rep',			enyo.bind(this, 'eventCtcpRep'));
  		this.plugin.addCallback('event_ctcp_action',		enyo.bind(this, 'eventCtcpAction'));
  		this.plugin.addCallback('event_unknown',			enyo.bind(this, 'eventUnknown'));
  		this.plugin.addCallback('event_numeric',			enyo.bind(this, 'eventNumeric'));
  		this.plugin.addCallback('event_rtt',				enyo.bind(this, 'eventRtt'));
  		this.plugin.addCallback('event_dcc_send_req',		enyo.bind(this, 'eventDccSendReq'));
  		this.plugin.addCallback('event_dcc_chat_req',		enyo.bind(this, 'eventDccChatReq'));
  		this.plugin.addCallback('handle_dcc_callback',		enyo.bind(this, 'handleDccCallback'));
  		this.plugin.addCallback('handle_dcc_send_callback',	enyo.bind(this, 'handleDccSendCallback'));
  		
	},

  	retryConnection: function(id) {
  		/* This gets called if a connection was not made, should probably
  		retry a few times before giving up. For now just setting state to 
  		disconencted. */
  		enyo.application.s.getFromId(id).setState(wirc.Server.stateDisconnected);
		if (this.dumpLog) this.log(id);
  	},
  	
	eventConnect: function(id, event, origin, params_s, ip) {
		if (this.dumpLog) this.log(id, event, origin, params_s, ip);
		
		if (event == 'CONNECT') {
			enyo.application.s.getFromId(id).connected();
		}
  	},
  	
	eventNick: function(id, event, origin, params_s) {
  		if (this.dumpLog) this.log(id, event, origin, params_s);
  	},
	
  	eventQuit: function(id, event, origin, params_s) {
  		if (this.dumpLog) this.log(id, event, origin, params_s);
  	},
  	
	eventJoin: function(id, event, origin, params_s) {
  		if (this.dumpLog) this.log(id, event, origin, params_s);
  		
  		var id = parseInt(id);
		var server = enyo.application.s.getFromId(id);
		var params = this.parseJson(params_s,'JOIN');
		
		var nick = server.getNick(origin);
		if (nick.name == server.setup.nicks[0]) // Need to not use nicks
  			enyo.nextTick(function() {server.joinChannel(params[0])});
		enyo.nextTick(function() {
			var chan = server.getOrCreateChannel(params[0]);
			if (chan) {
				chan.newMessage('status', '-->', nick.name + ' (' + origin.split("!")[1] + ') has joined ' + params[0]);
			}
		});
		
  	},
  	eventPart: function(id, event, origin, params_s) {
  		if (this.dumpLog) this.log(id, event, origin, params_s);
  		
  		var id = parseInt(id);
		var server = enyo.application.s.getFromId(id);
		var params = this.parseJson(params_s,'PART');
		
		var nick = server.getNick(origin);
		// Remove channel from server list or something?
		var chan = server.getOrCreateChannel(params[0]);
		if (chan) {
			chan.newMessage('status', '<--', nick.name + ' (' + origin.split("!")[1] + ') has left ' + params[0] + ' (' + params[1] + ')');
		}
  	},
  	
	eventInvite: function(id, event, origin, params_s) {
  		if (this.dumpLog) this.log(id, event, origin, params_s);
  	},
  	eventMode: function(id, event, origin, params_s) {
  		if (this.dumpLog) this.log(id, event, origin, params_s);
  	},
  	eventUmode: function(id, event, origin, params_s) {
  		if (this.dumpLog) this.log(id, event, origin, params_s);
  	},
  	eventTopic: function(id, event, origin, params_s) {
  		if (this.dumpLog) this.log(id, event, origin, params_s);
  	},
  	eventKick: function(id, event, origin, params_s) {
  		if (this.dumpLog) this.log(id, event, origin, params_s);
  	},
  	
	eventChannel: function(id, event, origin, params_s) {
  		//if (this.dumpLog) this.log(id, event, origin, params_s);
		
		var id = parseInt(id);
		var server = enyo.application.s.getFromId(id);
		var params = this.parseJson(params_s,'CHANNEL');
		
		var chan = server.getOrCreateChannel(params[0]);
		if (chan)
		{
			var nick = server.getNick(origin);
			//tmpNick.addChannel(tmpChan);
			chan.newMessage('privmsg', nick.name, params[1]);
			if (enyo.application.m.controller.secondary != 'channel-chat-' + chan.getNameSimple()) {
				chan.unread = chan.unread + 1
				enyo.application.e.dispatch('main-crud'); // refresh main list
			}
		}
  	},
  	eventPrivmsg: function(id, event, origin, params_s) {
  		//if (this.dumpLog) this.log(id, event, origin, params_s);
  		this.log(id, event, origin, params_s);
  	},
  	eventNotice: function(id, event, origin, params_s) {
  		if (this.dumpLog) this.log(id, event, origin, params_s);
  	},
  	eventChannelNotice: function(id, event, origin, params_s) {
  		if (this.dumpLog) this.log(id, event, origin, params_s);
		
		var id = parseInt(id);
		var server = enyo.application.s.getFromId(id);
		var params = this.parseJson(params_s,'NOTICE');
		
		server.newMessage('notice', origin, params[1]);
  	},
  	
	eventCtcpReq: function(id, event, origin, params_s) {
  		if (this.dumpLog) this.log(id, event, origin, params_s);
  	},
  	eventCtcpRep: function(id, event, origin, params_s) {
  		if (this.dumpLog) this.log(id, event, origin, params_s);
  	},
  	eventCtcpAction: function(id, event, origin, params_s) {
  		//if (this.dumpLog) this.log(id, event, origin, params_s);
		
		var id = parseInt(id);
		var server = enyo.application.s.getFromId(id);
		var params = this.parseJson(params_s,'ACTION');
		
		var nick = server.getNick(origin);
		var chan = server.getChannel(params[0]);
		if (chan)
			chan.newMessage('action', nick.name, params[1]);
		else
		{
  			if (this.dumpLog) this.log(id, event, origin, params_s);
			/*
			var tmpQuery = servers.servers[id].getQuery(tmpNick);
			if (tmpQuery)
				tmpQuery.newMessage('type7', tmpNick, params[1]);
			else
				servers.servers[id].startQuery(tmpNick, false, 'type7', params[1]);
			*/
		}	
  	},
  	
	eventUnknown: function(id, event, origin, params_s) {
  		if (this.dumpLog) this.log(id, event, origin, params_s);
  	},
  	eventNumeric: function(id, event, origin, params_s) {
  		//if (this.dumpLog) this.log(id, event, origin, params_s);
		
		var id = parseInt(id);
		var server = enyo.application.s.getFromId(id);
		var event = parseInt(event);
		var params = this.parseJson(params_s,'NUMERIC');
		
		var messageSetup = {
			nick: false,
			type: 'notice',
			text: params[1],
		};
		var messageTarget = server;
		
	    var i = 2;
	    if (params.length > i) {
	        do {
	            messageSetup.text += ' ' + params[i];
	            i++;
	        }
	        while (i < params.length);
		}
		
		switch(event) {
			
			case 324: // RPL_CHANNELMODEIS
				var chan = server.getOrCreateChannel(params[1]);
				if (chan) {
					chan.setup.mode = params[2];
					chan.newMessage('status', null, 'Mode: ' + params[2]);
					enyo.application.e.dispatch('channel-mode' + chan.getNameSimple());
				}
				break;

			case 329: // RPL_CREATIONTIME
				var chan = server.getOrCreateChannel(params[1]);
				if (chan) {
					var newDate = new Date();
					newDate.setTime(params[2]*1000);
					dateString = newDate.toUTCString();
					chan.newMessage('status', null, 'Channel ' + params[1] + ' created on ' + dateString);
					enyo.application.e.dispatch('channel-mode' + chan.getNameSimple());
				}
				break;

			case 332: // RPL_TOPIC
				var chan = server.getOrCreateChannel(params[1]);
				if (chan) {
					chan.setup.topic = params[2];
					chan.newMessage('status', null, 'Topic for ' + params[1] + ' is "' + params[2] + '"');
					enyo.application.e.dispatch('channel-topic' + chan.getNameSimple());
				}
				break;

			case 333:
				var chan = server.getOrCreateChannel(params[1]);
				if (chan) {
					var newDate = new Date();
					newDate.setTime(params[3]*1000);
					dateString = newDate.toUTCString();
					chan.newMessage('status', null, 'Topic set by ' + params[2] + ' on ' + dateString);
				}
				break;

			case 353: // RPL_NAMREPLY
				var chan = server.getOrCreateChannel(params[2]);
				if (chan) {
					var nicks = params[3].split(' ');
					for (i in nicks) {
						var prefixNick = '';
						var onlyNick = nicks[i];
						if (ircNick.hasPrefix(onlyNick)) {
							prefixNick = nicks[i].substr(0, 1);
							onlyNick = nicks[i].substr(1);
						}
						tmpNick = server.getNick(onlyNick);
						if (tmpNick)
							tmpNick.addChannel(chan, ircNick.getPrefixMode(prefixNick));
					}
				}
				break;
				
			case 366: // RPL_ENDOFNAMES
				/*var chan = server.getOrCreateChannel(params[1]);
				if (chan)
					chan.sortNicks();*/
				break;
			
			case 372: // MOTD
			case 375: // MOTDSTART
			case 376: // MOTDEND
				break;
			
			default:
  				//if (this.dumpLog) this.log(id, event, origin, params_s);
				break;
		}
		
		if (messageSetup.text)
		{
			if (messageTarget)
			{
				messageTarget.newMessage(messageSetup.type, messageSetup.nick, messageSetup.text);
			}
			else
			{
  				if (this.dumpLog) this.log(id, event, origin, params_s);
			}
		}
		
		
  	},
  	
	eventRtt: function(id, rtt) {
		if (this.dumpLog) this.log(id, rtt);
  	},
  	
	eventDccSendReq: function(id, nick, address, filename, size, dcc_id) {
  		if (this.dumpLog) this.log(id, nick, address, filename, size, dcc_id);
  	},
  	eventDccChatReq: function(id, nick, address, dcc_id) {
  		if (this.dumpLog) this.log(id, nick, address, dcc_id);
  	},
  	handleDccCallback: function(id, dcc_id, status, length, data) {
		if (this.dumpLog) this.log(id, dcc_id, status, length, data);
  	},
  	handleDccSendCallback: function(id, dcc_id, status, bitsIn, percent) {
  		if (this.dumpLog) this.log(id, dcc_id, status, bitsIn, percent);
  	},
	
	parseJson: function(string, src) {
		try {
			// attempt parser
			return enyo.json.parse(string);
		}
		catch (e) {
			this.log(src, e);
			// fall back to eval parser
			return eval(string);
		}
		// wtf?
		return false;
	},
	
});

enyo.application.pm = new wirc.PluginManager();
