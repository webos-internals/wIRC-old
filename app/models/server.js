function ircServer(params)
{
	//this.STATE_SERVICE_UNAVAILABLE	= -3;
	this.STATE_PIFACE_UNAVAILABLE	= -2;
	this.STATE_MAX_RETRIES			= -1;
	this.STATE_TIMEOUT				= 0;
	this.STATE_DISCONNECTED			= 0;
	//this.STATE_TOKEN_REQUEST		= 1 
	this.STATE_CONNECTING			= 2; 
	this.STATE_CONNECTED			= 3; 
	this.STATE_DISCONNECTING		= 4;
	this.STATE_DISRUPTED			= 5;

	this.id =					params.id;
	this.alias =				params.alias;
	this.address =				params.address;
	this.serverUser =			params.serverUser;
	this.serverPassword =		params.serverPassword;
	this.port =					params.port;
	this.encryption = 			(params.encryption?params.encryption:0);
	this.proxyNetwork =			(params.proxyNetwork?params.proxyNetwork:"");
	this.autoConnect =			params.autoConnect;
	this.autoIdentify =			params.autoIdentify;
	this.identifyService =		params.identifyService;
	this.identifyPassword =		params.identifyPassword;
	this.onConnect =			(params.onConnect?params.onConnect:[]);
	this.favoriteChannels =		(params.favoriteChannels?params.favoriteChannels:[]);
	this.dontPartOnClose =		params.dontPartOnClose;
	this.autoOpenFavs =			params.autoOpenFavs;
	this.defaultNick =			params.defaultNick;
	this.nextNick =				1;
	
	this.isTemporary =			params.isTemporary;
	
	this.autoPing =				false;
	this.pings =				{};

	this.lagHistory = 			[];
	this.lag =					'lag-0';
	this.realServer =			'';	
	this.sessionIpAddress =		'';
	this.sessionInterface = 	'';
	this.sessionNetwork =		'';
	
	this.subscriptions =		[];
	
	this.isAway =				false;

	this.reconnect =			true;
	this.autoReconnect =		false;
	this.timerId =				false;
	this.dcThreshold =			5000;
	this.ipAddress =			false;
	this.reconnectOnBetter =	false;
	
	this.connectionTimeout =	false;
	
	this.state =				this.STATE_DISCONNECTED;
	this.channels =				[];
	this.queries =				[];
	this.nick =					false;
	this.nicks =				[];
	this.statusMessages =		[];
	
	this.sessionToken =			false;
	
	this.stageName =			'status-' + this.id;
	this.stageController =		false;
	this.statusAssistant =		false;
	this.invites =				[];
	
	this.dccs =					[];
	
	this.listStageName =		'channel-list-' + this.id;
	this.listStageController =	false;
	this.listsAssistant =		false;
	this.listDisplay =			0;
	this.channelList =			[];
	
	this.dccListStageName =		'dcc-list-' + this.id;
	this.dccListAssistant =		false;
}

ircServer.prototype.setState = function(state)
{
	if (this.state==-1 && state<this.STATE_CONNECTING)
		return;
		
	var message = '';
	switch (state)
	{
		case this.STATE_PIFACE_UNAVAILABLE: message = "Preferred interface is not avaliable!"; break;
		case this.STATE_MAX_RETRIES: message = "Exceeded max retries, not connecting!"; break;
		case this.STATE_DISCONNECTING: message = "Disconnecting..."; break;
		case this.STATE_DISCONNECTED: message = "Disconnected!"; break;
		case this.STATE_CONNECTING: message = "Connecting..."; break;
		case this.STATE_CONNECTED: message = "Connected!"; break;
		case this.STATE_TIMEOUT: message = "Connection timed out!"; break;
	}	
	this.state = state;
	if (message.length>0) {
		this.newMessage('type3', false, message);
	}
	if (servers.listAssistant && servers.listAssistant.controller)
		servers.listAssistant.updateList();		
}

ircServer.prototype.abortConnection = function()
{
	this.setState(this.STATE_TIMEOUT);
	//plugin.disconnect(servers.getServerArrayKey(this.id));
}

ircServer.prototype.init = function()
{
	if (!prefs.get().aiface)
	{
		var state = '';
		switch (prefs.get().piface)
		{
			case 'ppp0': state = connectionInfo.wan.state; break;
			case 'eth0': state = connectionInfo.wifi.state; break;
		}
		if (state == 'disconnected')
		{
			this.setState(this.STATE_PIFACE_UNAVAILABLE);
			return;
		}
	}
	
	this.setState(this.STATE_CONNECTING);
	this.connect();
	
}

ircServer.prototype.isConnected = function(message)
{
	return (this.state === this.STATE_CONNECTED);
}
ircServer.prototype.isDisrupted = function(message)
{
	return (this.state === this.STATE_DISRUPTED);
}

ircServer.prototype.newCommand = function(message)
{
	if (this.state>this.STATE_DISCONNECTED)
	{
		
		cmdHistoryIndex = 0;
		cmdHistory.push(message);
		if (cmdHistory.length>prefs.get().cmdHistoryMax)
			cmdHistory.shift();
		
		message = aliases.parse(message, 'server', this);
		
		var match = cmdRegExp.exec(message);
		if (match)
		{
			var cmd = match[1];
			var val = match[2];
			
			switch (cmd.toLowerCase())
			{
				case 'broadcast':
					if (val) {
						if (this.channels.length > 0){
							for (var c = 0; c < this.channels.length; c++) {
								if (this.channels[c].joined)
									this.channels[c].newCommand(val);
							}
						}
					}
					break;
					
				case 'getip':
					var ip = plugin.get_external_ip();
					this.getVisibleScene().newMessage('status', false, 'Your IP: ' + ip);
					//alert(ip);
					break;
					
				case 'dcc':
					var tmpMatch = twoValRegExp.exec(val);
					if (tmpMatch) {
						switch (tmpMatch[1]) {
							case 'chat':
								var tmpNick = this.getNick(tmpMatch[2]);
								if (tmpNick)
									this.requestDccChat(tmpNick);
								break;
							case 'send':
								var tmpNick = this.getNick(tmpMatch[2]);
								if (tmpNick)
									this.pickDccSend(tmpNick);
								break;
							case 'list':
								this.openDccList();
								break;
						}
					}
					
				case 'ctcp':
					var tmpMatch = twoValRegExp.exec(val);
					if (tmpMatch)
						plugin.ctcp_cmd(servers.getServerArrayKey(this.id), tmpMatch[1], tmpMatch[2]);
					break;
				
				case 'nick':
					this.setNick(val);
					break;
				
				case 'join':
					var vals = val.split(" ");
					this.joinChannel(vals[0],vals[1]);
					break;
				
				case 'msg':
				case 'query':
					var tmpMatch = twoValRegExp.exec(val);
					if (tmpMatch) 
					{
						var sid = servers.getServerArrayKey(this.id);
						var n = Math.ceil(tmpMatch[2].length / 255);
						var i = 0;
						var msg = '';
						alert('Message length: ' + tmpMatch[2].length + ', n: ' + n);
						for (;i<n;i++) {
							if (i < (n - 1))
								msg = tmpMatch[2].substring(i * 255, (i + 1) * 255)
							else
								msg = tmpMatch[2].substring(i * 255);
							plugin.cmd_msg(sid, this.getNick(tmpMatch[1]).name, msg);
							switch (cmd.toLowerCase()) {
								case 'query':
									this.startQuery(this.getNick(tmpMatch[1]), true, 'message', msg);
									break;					
								case 'msg':
									this.getVisibleScene().newMessage('type6', this.getNick(tmpMatch[1]), msg);
									break; 
							}
						}
					}
					break;
					
				case 'kick':
					var tmpMatch = threeValRegExp.exec(val);
					if (tmpMatch) 
					{
						tmpChan = this.getChannel(tmpMatch[1]);
						if (tmpChan)
						{
							tmpChan.kick(this.getNick(tmpMatch[2]).name, tmpMatch[3]);
						}
					}
					break;
					
				case 'ignore':
					this.ignore(val);
					break;
					
				case 'umode':
					alert('/umode ' + val);
					this.newCommand('/mode '+ this.nick.name + ' ' + val);
					break;
					
				case 'mode':
					var tmpMatch = twoValRegExp.exec(val);
					if (tmpMatch) 
					{
						var tmpChan = this.getChannel(tmpMatch[1]);
						if (tmpChan) {
							alert('c /mode ' + tmpMatch[1] + ' ' + tmpMatch[2]);
							tmpChan.setMode(tmpMatch[2]);
						} else {
							var tmpNick = this.getNick(tmpMatch[1]);
							if (tmpNick) {
								alert('n /mode ' + tmpMatch[1] + ' ' + tmpMatch[2]);
								tmpNick.setMode(tmpMatch[2]);
							}		
						}
					}
					break;
					
				case 'list':
					this.list(val?val:null);
					break;
					
				case 'away':
					this.away(val?val:null);
					break;
					
				case 'ping':
					if (val) this.ping(val);
					break;
					
				case 'notice':
					var tmpMatch = twoValRegExp.exec(val);
					if (tmpMatch[2].length>0)
					{
						var tmpNick = this.getNick(tmpMatch[1]);
						var tmpChan = this.getChannel(tmpMatch[1]);
						if (tmpChan)
						{
							tmpChan.newMessage('type6', this.nick, tmpMatch[2]);
							plugin.cmd_notice(servers.getServerArrayKey(this.id), tmpMatch[1], tmpMatch[2]);	
						}
						else if (tmpNick)
						{
							this.startQuery(tmpNick, true, 'type6', tmpMatch[2]);
							plugin.cmd_notice(servers.getServerArrayKey(this.id), tmpMatch[1], tmpMatch[2]);	
						}
					}
					break;
					
				case 'topic':
					if (val) 
					{
						var tmpMatch = twoValRegExp.exec(val);
						if (tmpMatch) 
						{
							this.topic(tmpMatch[1], tmpMatch[2]);
						} 
						else 
						{
							this.topic(val, null);
						}
					}
					break;		
					
				case 'quit':
					this.disconnect(val);
					break;
					
				case 'quote':
					plugin.send_raw(servers.getServerArrayKey(this.id), val);
					break;
					
				case 'whois':
					this.whois(val);
					break;
				
				case 'help':
					this.getVisibleScene().newMessage('status', false, 'You can find help in the app menu.');
					break;
					
				default: // this could probably be left out later
					this.newMessage('status', false, 'Unknown Command: ' + cmd);
					break;
			}
		}
		else 
		{
			// no command match does nothing in status window
		}
	}
	else
	{
		// not connected
		this.newMessage('type3', false, 'Not Connected.');
		if (this.statusAssistant && this.statusAssistant.controller) 
		{
			this.statusAssistant.controller.showAlertDialog(
			{
			    title:				this.alias,
				allowHTMLMessage:	true,
			    message:			$L('Not Connected.'),
			    choices:			[{label:$L('Ok'), value:''}],
				onChoose:			function(value){}
		    });
		}
	}
}

ircServer.prototype.setAwayStatus = function(away)
{
	servers.servers[id].isAway = away;
	for (var c = 0; c < this.channels.length; c++)
		this.channels[c].updateAppMenu();
}

ircServer.prototype.newMessage = function(type, nick, message, dontUpdate)
{
	var obj =
	{
		type:		type,
		nick:		nick,
		message:	message,
		me:			this.nick.name
	};
	var newMsg = new ircMessage(obj);
	this.statusMessages.push(newMsg);
	if (!dontUpdate || (dontUpdate && this.statusAssistant && this.statusAssistant.isVisible))
	{
		this.updateStatusList();
	}
}
ircServer.prototype.getStatusMessages = function(start)
{
	var returnArray = [];
	if (!start) start = 0;
	
	if (this.statusMessages.length > 0 && start < this.statusMessages.length)
	{
		for (var m = start; m < this.statusMessages.length; m++)
		{
			returnArray.push(this.statusMessages[m].getListObject());
		}
	}
	
	return returnArray;
}

ircServer.prototype.connect = function()
{
	try
	{
		this.pings = {};
		var timeout = prefs.get().connectionTimeout;
		if (timeout)
			this.connectionTimeout = setTimeout(this.abortConnection.bind(this), 1000*timeout);
		if (this.proxyNetwork && this.serverUser && this.serverPassword) {
			plugin.connect(
				servers.getServerArrayKey(this.id),
				this.address,
				(this.port?this.port:6667),
				(plugin.has_ssl()=='1'?this.encryption:0),
				"wircer",
				this.serverUser + ':' + this.serverPassword + ':' + this.proxyNetwork,
				this.defaultNick?this.defaultNick:prefs.get().nicknames[0],
				prefs.get().realname,
				prefs.get().piface
			);
		} else {
			plugin.connect(
				servers.getServerArrayKey(this.id),
				this.address,
				(this.port?this.port:6667),
				(plugin.has_ssl()=='1'?this.encryption:0),
				(this.serverUser?this.serverUser:"wircer"),
				(this.serverPassword?this.serverPassword:null),
				this.defaultNick?this.defaultNick:prefs.get().nicknames[0],
				prefs.get().realname,
				prefs.get().piface
			);
		}	
	}
	catch(e)
	{
		Mojo.Log.logException(e, 'server#connect');
	}
	
}
/*ircServer.prototype.maybeReconnect = function(network)
{
	if (network !== '1x')
	{
		this.reconnect = true;
	}

	this.disconnect();
}
ircServer.prototype.ipDiffers = function(payload)
{
	return (payload && payload.ipAddress && payload.ipAddress !== this.ipAddress);
}
ircServer.prototype.ipMatches = function(payload)
{
	return (payload && payload.ipAddress && payload.ipAddress === this.ipAddress);
}*/

ircServer.prototype.debugPayload = function(event, origin, params_s, visible)
{
	alert('------');
	alert('event: ' + event);
	alert('origin: ' + origin);
	alert('params_s: ' + params_s);
	alert('------');
	if (visible)
		this.newMessage('debug', false, event + ', origin: ' + origin + ', params_s: ' + params_s);
}

ircServer.prototype.runOnConnect = function()
{
	if (this.onConnect && this.onConnect.length > 0)
	{
		for (var c = 0; c < this.onConnect.length; c++)
		{
			// also defer these commands to run one after another when its not busy
			if (this.onConnect[c].charAt(0) != '/') 
				this.newCommand.bind(this).defer('/' + this.onConnect[c]);
			else
				this.newCommand.bind(this).defer(this.onConnect[c]);
		}
	}
	
	this.reJoinChannels.bind(this).defer();
}

ircServer.prototype.reJoinChannels = function()
{
	if (this.channels.length > 0)
	{
		for (var c = 0; c < this.channels.length; c++)
		{
			if (!this.channels[c].joined)
			{
				this.channels[c].reJoin();
			}
		}
	}
}

ircServer.prototype.setNick = function(nick)
{
	plugin.cmd_nick(servers.getServerArrayKey(this.id), nick);
}

ircServer.prototype.away = function(reason)
{
	plugin.cmd_away(servers.getServerArrayKey(this.id), reason);
}
ircServer.prototype.ping = function(val)
{
	var tmpMatch = twoValRegExp.exec(val);
	if (tmpMatch) {
		var tmpNick = this.getNick(tmpMatch[1]);
		if (tmpNick) {
			this.pings[tmpNick.name] = new Date();
			if (tmpMatch[2]) {
				plugin.ctcp_cmd(servers.getServerArrayKey(this.id), tmpNick.name, 'PING '+ tmpMatch[2]);
			} else {
				plugin.ctcp_cmd(servers.getServerArrayKey(this.id), tmpNick.name, 'PING');
			}
		}	
	}
}
ircServer.prototype.topic = function(channel, topic)
{
	plugin.cmd_topic(servers.getServerArrayKey(this.id), channel, topic);
}
ircServer.prototype.whois = function(nick)
{
	
	var tmpNick = this.getNick(nick);
	if (tmpNick) 
	{
		// reset whois
		tmpNick.server = this;
		tmpNick.whois = false;
	}
	plugin.cmd_whois(servers.getServerArrayKey(this.id), nick);
}

ircServer.prototype.disconnect = function(reason)
{
	if (!reason) reason = prefs.get().quitReason;
	this.setState(this.STATE_DISCONNECTING);
	plugin.cmd_quit(servers.getServerArrayKey(this.id), reason);
	this.setState(this.STATE_DISCONNECTED);
	
	if (this.isTemporary) {
		servers.deleteTemporaryServer(this.id);
	}
	
	if (this.channels.length > 0)
	{
		for (var c = 0; c < this.channels.length; c++)
		{
			this.channels[c].disconnectPart();
		}
	}
}

ircServer.prototype.disrupt = function()
{
	this.setState(this.STATE_DISRUPTED);
	plugin.cmd_quit(servers.getServerArrayKey(this.id), "Lost Connection");
	
	if (this.channels.length > 0)
	{
		for (var c = 0; c < this.channels.length; c++)
		{
			this.channels[c].disconnectPart();
		}
	}
}

ircServer.prototype.clearMessages = function()
{
	this.statusMessages = [];
}

ircServer.prototype.showStatusScene = function(popit)
{
	try
	{
		this.stageController = Mojo.Controller.appController.getStageController(this.stageName);
		
		if (!popit && (servers.listAssistant && servers.listAssistant.controller))
		{
	        if (this.stageController && this.stageController.activeScene().sceneName == 'server-status') 
			{
				this.stageController.activate();
			}
			else if (this.stageController && this.stageController.activeScene().sceneName != 'server-status') 
			{
				this.stageController.popScenesTo('server-status');
				this.stageController.activate();
			}
			else 
			{
				servers.listAssistant.controller.stageController.pushScene('server-status', this, false);
			}
		}
		else
		{
			if (servers.listAssistant && servers.listAssistant.controller)
			{
				if (servers.listAssistant.controller.stageController.activeScene().sceneName == 'server-status')
				{
					servers.listAssistant.controller.stageController.popScenesTo('server-list');
				}
			}
			
	        if (this.stageController && this.stageController.activeScene().sceneName == 'server-status')
			{
				this.stageController.activate();
			}
			else if (this.stageController && this.stageController.activeScene().sceneName != 'server-status')
			{
				this.stageController.popScenesTo('server-status');
				this.stageController.activate();
			}
			else
			{
				Mojo.Controller.appController.createStageWithCallback({name: this.stageName, lightweight: true}, this.showStatusStageCallback.bind(this));
			}
		}
	}
	catch (e)
	{
		Mojo.Log.logException(e, "ircServer#showStatus");
	}
}
ircServer.prototype.showStatusStageCallback = function(controller)
{
	controller.pushScene('server-status', this, true);
}
ircServer.prototype.setStatusAssistant = function(assistant)
{
	this.statusAssistant = assistant;
}
ircServer.prototype.setDccListAssistant = function(assistant)
{
	this.dccListAssistant = assistant;
}
ircServer.prototype.updateStatusList = function()
{
	if (this.statusAssistant && this.statusAssistant.controller)
	{
		this.statusAssistant.updateList();
	}
}

ircServer.prototype.list = function(channel)
{
	plugin.cmd_list(servers.getServerArrayKey(this.id), channel);
	this.openListStage();
}
ircServer.prototype.openListStage = function()
{
	try
	{
		this.listStageController = Mojo.Controller.appController.getStageController(this.listStageName);
	
        if (this.listStageController) 
		{
			if (this.listStageController.activeScene().sceneName == 'channel-list') 
			{
				this.listStageController.activate();
			}
			else
			{
				this.listStageController.popScenesTo('channel-list');
				this.listStageController.activate();
			}
		}
		else
		{
			Mojo.Controller.appController.createStageWithCallback({name: this.listStageName, lightweight: true}, this.openListStageCallback.bind(this));
		}
	}
	catch (e)
	{
		Mojo.Log.logException(e, "ircServer#openListStage");
	}
}
ircServer.prototype.openListStageCallback = function(controller)
{
	controller.pushScene('channel-list', this);
}
ircServer.prototype.setListAssistant = function(assistant)
{
	this.listAssistant = assistant;
}
ircServer.prototype.listStart = function()
{
	this.channelList = [];
}
ircServer.prototype.listAddChannel = function(channel, users, topic)
{
	this.channelList.push({channel: channel, users: users, topic: colorize(topic)});
	this.listDisplay++;
	
	if (this.listAssistant && this.listAssistant.controller)
	{
		if (this.listDisplay == 100)
		{
			this.listAssistant.loadedCountUpdate(this.listDisplay);
			this.listDisplay = 0;
		}
	}
}
ircServer.prototype.listEnd = function()
{
	if (this.listAssistant && this.listAssistant.controller)
	{
		this.listAssistant.loadChannels(this.channelList);
		this.listAssistant.doneLoading();
	}
}

ircServer.prototype.getOrCreateChannel = function(name, key)
{
	name = this.formatChannelName(name);
	var tmpChan = this.getChannel(name);
	if (!tmpChan)
	{
		tmpChan = new ircChannel(
		{
			name:	name,
			key:	key,
			server:	this
		});
		this.channels.push(tmpChan);
	}

	return tmpChan;
}
ircServer.prototype.joinChannel = function(name, key)
{
	name = this.formatChannelName(name);
	var tmpChan = this.getOrCreateChannel(name, key);
	if (!tmpChan.containsNick(this.nick))
	{
		plugin.cmd_join(servers.getServerArrayKey(this.id), name, key);
		tmpChan.join();
	}
	else
	{
		tmpChan.openStage();
	}
}

ircServer.prototype.formatChannelName = function(name)
{
	if (name.substr(0, 1) == '#')
		return name;
	else if (name.match(channelRegExp) != null)
		return '#'+name;
	else
		return name;
}
ircServer.prototype.getChannel = function(name)
{
	name = this.formatChannelName(name);
	if (this.channels.length < 1)
		return false;
	for (var c = 0; c < this.channels.length; c++)
	{
		if (this.channels[c].name == name.toLowerCase())
			return this.channels[c];
	}
}

ircServer.prototype.removeChannel = function(channel)
{
	this.channels = this.channels.without(channel);
}

ircServer.prototype.startQuery = function(nick, started, messageType, message)
{
	// started is for if we initiated the query,
	// it should just pop the stage instead of messign with dashboard
	
	var tmpQuery = this.getQuery(nick);
	if (tmpQuery)
	{
		if (started) 
		{
			if (messageType == 'message') tmpQuery.msg(message);
			else if (messageType == 'action') tmpQuery.me(message);
			tmpQuery.openStage();
		}
		else
		{
			if (messageType == 'message') tmpQuery.newMessage('privmsg', nick, message);
			else if (messageType == 'action') tmpQuery.newMessage('action', nick, message);
		}
		return;
	}
	
	var newQuery = new ircQuery(
	{
		nick:	nick,
		server:	this
	});
	if (started) 
	{
		if (messageType == 'message') newQuery.msg(message);
		else if (messageType == 'action') newQuery.me(message);
		newQuery.openStage();
	}
	else 
	{
		if (messageType == 'message') newQuery.newMessage('privmsg', nick, message);
		else if (messageType == 'action') newQuery.newMessage('action', nick, message);
	}
	this.queries.push(newQuery);
}
ircServer.prototype.newQuery = function(name)
{
	var tmpNick = this.getNick(name);
	if (tmpNick) 
	{
		var newQuery = new ircQuery(
		{
			nick:	tmpNick,
			server:	this
		});
		this.queries.push(newQuery);
		newQuery.openStage();
	}
}
ircServer.prototype.getQuery = function(nick)
{
	if (this.queries.length > 0)
	{
		for (var q = 0; q < this.queries.length; q++)
		{
			if (this.queries[q].nick.name == nick.name)
			{
				return this.queries[q];
			}
		}
	}
	return false;
}
ircServer.prototype.removeQuery = function(query)
{
	this.queries = this.queries.without(query);
}

ircServer.prototype.getNick = function(name)
{
	try
	{
		if (name.substr(0, 1) == '#')
			return false;	
		var match = nickParser.exec(name);
		if (match) 
		{
			var getNick = match[1];
		}
		else
		{
			var getNick = name;
		}
		
		if (this.nicks.length > 0)
		{
			for (var n = 0; n < this.nicks.length; n++)
			{
				// check lowercased
				if (this.nicks[n].name.toLowerCase() == getNick.toLowerCase())
				{
					// set what we assume is correct case
					this.nicks[n].name = getNick;
					return this.nicks[n];
				}
			}
		}
		
		var tmpNick = new ircNick({name:getNick});
		this.nicks.push(tmpNick);
		return tmpNick;
	}
	catch (e)
	{
		Mojo.Log.logException(e, "ircServer#getNick");
	}
}
ircServer.prototype.removeNick = function(nick)
{
	if (nick)
	{
		// Remove nick from all the channels
		for (var i = 0; i < this.channels.length; i++)
		{
			this.channels[i].removeNick(nick);
		}

		// Remove nick from server list
		this.nicks = this.nicks.without(nick);
	}
}

ircServer.prototype.openInvite = function(nick, channel)
{
	try
	{
		if (prefs.get().inviteAction == 'prompt') 
		{
			var tmpBannerName = 'invite-' + this.id + '-' + nick + '-' + channel;
			var tmpDashName = 'invitedash-' + this.id + '-' + nick + '-' + channel;
			
			Mojo.Controller.appController.showBanner
			(
				{
					icon: 'icon-invite.png',
					messageText: nick + ' invites you to: ' + channel,
					soundClass: (prefs.get().dashboardInviteSound?"alerts":"")
				},
				{
					type: 'invite',
					server: this.id,
					nick: nick,
					channel: channel
				},
				tmpBannerName
			);
			
			var tmpController = Mojo.Controller.appController.getStageController(tmpDashName);
		    if (tmpController) 
			{
				// do nothing on second invite if dash already exists?
			}
			else
			{
				this.invites.push({nick: nick, channel: channel});
				
				Mojo.Controller.appController.createStageWithCallback({name: tmpDashName, lightweight: true}, this.openInviteCallback.bind(this), "dashboard");
			}
		}
		else if (prefs.get().inviteAction == 'accept')
		{
			this.joinChannel(channel);
		}
	}
	catch (e)
	{
		Mojo.Log.logException(e, "ircServer#openInvite");
	}
}
ircServer.prototype.openInviteCallback = function(controller)
{
	controller.pushScene('invite-dashboard', this, this.invites[this.invites.length-1].nick, this.invites[this.invites.length-1].channel);
}
ircServer.prototype.closeInvite = function(nick, channel)
{
	try
	{
		var tmpBannerName = 'invite-' + this.id + '-' + nick + '-' + channel;
		var tmpDashName = 'invitedash-' + this.id + '-' + nick + '-' + channel;
		
		this.invites = this.invites.without({nick: nick, channel: channel});
		
		Mojo.Controller.appController.removeBanner(tmpBannerName);
		Mojo.Controller.appController.closeStage(tmpDashName);
	}
	catch (e)
	{
		Mojo.Log.logException(e, "ircServer#closeInvite");
	}
}

ircServer.prototype.requestDccChat = function(nick)
{
	var newDcc = new ircDcc({'nick': nick, 'server': this});
	var idx = this.dccs.push(newDcc)-1;
	this.dccs[idx].id = plugin.dcc_chat(servers.getServerArrayKey(this.id), nick.name, prefs.get().useExternalIP, 0);
}
ircServer.prototype.pickDccSend = function(nick)
{
	var f = new filePicker({
		type: 'file',
		onSelect: this.pickedDccSend.bind(this, nick),
		pop: false,
		sceneTitle: 'Select A File to Send to ' + nick.name
	});
}
ircServer.prototype.pickedDccSend = function(nick, value)
{
	if (nick && value)
	{
		//var newDcc = new ircDcc({'nick': nick, 'server': this});
		//var idx = this.dccs.push(newDcc)-1;
		//this.dccs[idx].id = plugin.dcc_sendfile(servers.getServerArrayKey(this.id), nick.name, value);
		var dccid = plugin.dcc_sendfile(servers.getServerArrayKey(this.id), nick.name, value);
		Mojo.Log.error('dccid:', dccid);
	}
}

ircServer.prototype.startDcc = function(params)
{
	Mojo.Log.error('=== START DCC ===');
	Mojo.Log.error('nick:', params.nick.name);
	Mojo.Log.error('address:', params.address);
	
	var newDcc = new ircDcc(params);
	var idx = this.dccs.push(newDcc)-1;
	this.dccs[idx].openRequest();
}
ircServer.prototype.getDcc = function(id)
{
	if (this.dccs.length > 0)
	{
		for (var d = 0; d < this.dccs.length; d++)
		{
			if (this.dccs[d].id == id)
			{
				return this.dccs[d];
			}
		}
	}
	return false;
}
ircServer.prototype.getDccArrayKey = function(id)
{
	if (this.dccs.length > 0)
	{
		for (var d = 0; d < this.dccs.length; d++)
		{
			if (this.dccs[d].id == id)
			{
				return d;
			}
		}
	}
	return false;
}
ircServer.prototype.openDccList = function()
{
	var stageController = Mojo.Controller.appController.getStageController(this.dccListStageName);
	
    if (stageController)
	{
		var scenes = stageController.getScenes();
		if (scenes[0].sceneName == 'dcc-list' && scenes.length > 1)
		{
			stageController.popScenesTo('dcc-list');
		}
		stageController.activate();
	}
	else
	{
		var f = function(controller)
		{
			controller.pushScene('dcc-list', this);
		};
		Mojo.Controller.appController.createStageWithCallback({name: this.dccListStageName, lightweight: true}, f.bind(this));
	}
}
ircServer.prototype.getDccListObjects = function()
{
	var returnArray = [];
	if (this.dccs.length > 0)
	{
		for (var d = 0; d < this.dccs.length; d++)
		{
			if (this.dccs[d]) 
			{
				returnArray.push(this.dccs[d].getListObject());
			}
		}
	}
	return returnArray;
}

ircServer.prototype.getVisibleScene = function()
{
	for (var c = 0; c < this.channels.length; c++)
	{
		if (this.channels[c].chatAssistant &&
			this.channels[c].chatAssistant.isVisible)
			return this.channels[c];
	}
	for (var q = 0; q < this.queries.length; c++)
	{
		if (this.queries[q].chatAssistant &&
			this.queries[q].chatAssistant.isVisible)
			return this.queries[q];
	}
	return this;
}
ircServer.prototype.newMessageAllScenes = function(type, nick, message, dontUpdate)
{
	for (var c = 0; c < this.channels.length; c++)
	{
		if (this.channels[c].chatAssistant)
			this.channels[c].newMessage(type, nick, message);
	}
	for (var q = 0; q < this.queries.length; c++)
	{
		if (this.queries[q].chatAssistant)
			this.queries[q].newMessage(type, nick, message);
	}
	this.newMessage(type, nick, message, dontUpdate);
}

ircServer.prototype.getListObject = function()
{
	var obj =
	{
		key:		servers.getServerArrayKey(this.id),
		id:			this.id,
		alias:		this.alias,
		address:	this.address,
		connected: 	this.isConnected(),	
		spinning:	true,
		rowStyle:	'',
		networkLag:	'',
		temp:		this.isTemporary	
	};
	
	if (this.isTemporary)
		obj.rowStyle = obj.rowStyle + ' temp';
	
	switch (this.state)
	{
		case this.STATE_SERVICE_UNAVAILABLE:
			obj.rowStyle = obj.rowStyle + ' error2';
			break;
		case this.STATE_PIFACE_UNAVAILABLE:
			obj.rowStyle = obj.rowStyle + ' error';
			break;
		case this.STATE_MAX_RETRIES:
			obj.rowStyle = obj.rowStyle + ' warning';
			break;			
		case this.STATE_DISCONNECTED:
			obj.rowStyle = obj.rowStyle + ' disconnected';
			break;
		case this.STATE_CONNECTING:
		case this.STATE_DISCONNECTING:
			obj.rowStyle = obj.rowStyle + ' changing';
			break;
		case this.STATE_CONNECTED:
			obj.rowStyle = obj.rowStyle + ' connected';
			if (prefs.get().lagMeter)
			{
				if (this.sessionInterface == 'wan')
					obj.networkLag = 'network ' + this.sessionNetwork + ' ' + this.lag;
				else
					obj.networkLag = 'network wifi ' + this.lag;
			}
			break;
		case this.STATE_DISRUPTED:
			obj.rowStyle = obj.rowStyle + ' unknown';
			break;
	}

	if (this.alias == '') obj.rowStyle = obj.rowStyle + ' address-title';
	
	return obj;
}
ircServer.prototype.getEditObject = function()
{
	var obj = 
	{
		id:					this.id,
		alias:				this.alias,
		address:			this.address,
		port:				this.port,
		encryption:			this.encryption,
		defaultNick:		this.defaultNick,
		serverUser:			this.serverUser,
		serverPassword:		this.serverPassword,
		proxyNetwork:		this.proxyNetwork,
		autoConnect:		this.autoConnect,
		autoIdentify:		this.autoIdentify,
		identifyService:	this.identifyService,
		identifyPassword:	this.identifyPassword,
		onConnect:			this.onConnect,
		favoriteChannels:	this.favoriteChannels,
		dontPartOnClose:	this.dontPartOnClose,
		autoOpenFavs:		this.autoOpenFavs
	};
	return obj;
}

ircServer.prototype.saveInfo = function(params)
{
	if (ircServer.validateNewServer(params, false, false)) 
	{
		//this.id =				params.id;
		this.alias =			params.alias;
		this.address =			params.address;
		this.serverUser =		params.serverUser;
		this.serverPassword =	params.serverPassword;
		this.port =				params.port;
		this.encryption =		params.encryption;
		this.proxyNetwork =		params.proxyNetwork;
		this.defaultNick =		params.defaultNick;
		this.autoConnect =		params.autoConnect;
		this.autoIdentify =		params.autoIdentify;
		this.identifyService =	params.identifyService;
		this.identifyPassword =	params.identifyPassword;
		this.onConnect =		params.onConnect;
		this.favoriteChannels =	params.favoriteChannels;
		this.dontPartOnClose = 	params.dontPartOnClose;
		this.autoOpenFavs =		params.autoOpenFavs;
		
		var serverCookie = new Mojo.Model.Cookie('server-' + this.id);
		serverCookie.put(params);
	}
}

/* ========================= START OF STATIC METHODS ======================== */

ircServer.getBlankServerObject = function()
{
	var obj = 
	{
		id:					false,
		alias:				'',
		address:			'',
		serverUser:			'',
		serverPassword:		'',
		port:				'',
		encryption:			0,
		defaultNick:		'',
		proxyNetwork:		'',
		autoConnect:		false,
		autoIdentify:		false,
		identifyService:	'NickServ',
		identifyPassword:	'',
		onConnect:			[],
		favoriteChannels:	[],
		dontPartOnClose:	false,
		autoOpenFavs:		true,
	};
	return obj;
}
ircServer.validateNewServer = function(params, assistant, verbose)
{
	/* 
	 * to be fleshed out so someone can't create a server with no address or something like that
	 * 
	 * how it should work:
	 * if no assistant (verbose doesn't matter) simply return a true/false
	 * if assistant and not verbose, simply highlight errors, return true/false
	 * if assistant and verbose, highlight errors and call assistant.alidationError(message), return true/false
	 * 
	 */
	
	// for now, we don't really care about you... don't screw it up!
	return true;
}

/* ========================= END OF STATIC METHODS ========================= */
