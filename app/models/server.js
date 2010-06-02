function ircServer(params)
{
	//this.STATE_SERVICE_UNAVAILABLE	= -3;
	this.STATE_PIFACE_UNAVAILABLE	= -2;
	this.STATE_MAX_RETRIES			= -1;
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
	this.autoConnect =			params.autoConnect;
	this.autoIdentify =			params.autoIdentify;
	this.identifyService =		params.identifyService;
	this.identifyPassword =		params.identifyPassword;
	this.onConnect =			params.onConnect;
	this.defaultNick =			params.defaultNick;
	this.nextNick =				0;

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
	
	this.listStageName =		'channel-list-' + this.id;
	this.listStageController =	false;
	this.listsAssistant =		false;
	this.listDisplay =			0;
	this.channelList =			[];
	
	plugin.event_connect = this.event_connect_handler.bind(this);
	plugin.event_nick = this.event_nick_handler.bind(this);
	plugin.event_quit = this.event_quit_handler.bind(this);
	plugin.event_join = this.event_join_handler.bind(this);
	plugin.event_part = this.event_part_handler.bind(this);
	plugin.event_mode = this.event_mode_handler.bind(this);
	plugin.event_umode = this.event_umode_handler.bind(this);
	plugin.event_topic = this.event_topic_handler.bind(this);
	plugin.event_kick = this.event_kick_handler.bind(this);
	plugin.event_channel = this.event_channel_handler.bind(this);
	plugin.event_privmsg = this.event_privmsg_handler.bind(this);
	plugin.event_notice = this.event_notice_handler.bind(this);
	plugin.event_channel_notice = this.event_channel_notice_handler.bind(this);
	plugin.event_invite = this.event_invite_handler.bind(this);
	//plugin.event_ctcp_req = this.event_ctcp_req_handler.bind(this);
	//plugin.event_ctcp_rep = this.event_ctcp_rep_handler.bind(this);
	plugin.event_ctcp_action = this.event_ctcp_action_handler.bind(this);
	plugin.event_unknown = this.event_unknown_handler.bind(this);
	plugin.event_numeric = this.event_numeric_handler.bind(this);
	
	if (this.autoConnect) this.init();
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
	}	
	this.state = state;
	if (message.length>0) {
		this.newMessage('type3', false, message);
	}
	if (servers.listAssistant && servers.listAssistant.controller)
		servers.listAssistant.updateList();		
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
	if (this.isConnected())
	{
		var match = cmdRegExp.exec(message);
		if (match)
		{
			var cmd = match[1];
			var val = match[2];
			
			switch (cmd.toLowerCase())
			{
				case 'nick':
					plugin.cmd_nick(val);
					break;
						
				case 'j':
				case 'join':
					var vals = val.split(" ");
					plugin.cmd_join(vals[0],vals[1]);
					break;
					
				case 'msg':
				case 'query':
					var tmpMatch = twoValRegExp.exec(val);
					if (tmpMatch) 
					{
						this.startQuery(this.getNick(tmpMatch[1]), true, 'message', tmpMatch[2]);
					}
					break;
					
				case 'kick':
					var tmpMatch = threeValRegExp.exec(val);
					if (tmpMatch) 
					{
						tmpChan = this.getChannel(tmpMatch[1]);
						if (tmpChan)
						{
							tmpChan.kick(this.getNick(tmpMatch[2]), tmpMatch[3]);
						}
					}
					break;
					
				case 'mode':
					var tmpMatch = twoValRegExp.exec(val);
					if (tmpMatch) 
					{
						tmpChan = this.getChannel(tmpMatch[1]);
						if (tmpChan)
						{
							tmpChan.setMode(tmpMatch[2]);
						}
					}
					else
					{
						// if no 2 values, its to set user mode
					}
					break;
					
				case 'list':
					this.list(val?val:null);
					break;
					
				case 'away':
					this.away(val?val:null);
					break;
					
				/*case 'ping':
					if (val) this.ping(val);
					break;*/
					
				case 'notice':
					var tmpMatch = twoValRegExp.exec(val);
					if (tmpMatch[2].length>0)
					{
						var tmpNick = this.getNick(tmpMatch[1]);
						var tmpChan = this.getChannel(tmpMatch[1]);
						if (tmpChan)
						{
							tmpChan.newMessage('type6', this.nick, tmpMatch[2]);
							plugin.cmd_notice(tmpMatch[1], tmpMatch[2]);	
						}
						else if (tmpNick)
						{
							this.startQuery(tmpNick, true, 'type6', tmpMatch[2]);
							plugin.cmd_notice(tmpMatch[1], tmpMatch[2]);	
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
					
				case 'raw':
				case 'quote':
					plugin.send_raw(val);
					break;
					
				case 'whois':
					this.whois(val);
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
	if (!dontUpdate) 
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
		plugin.connect(
			this.address,
			(this.port?this.port:6667),
			(this.serverUser?this.serverUser:"wicer"),
			(this.serverPassword?this.serverPassword:null),
			this.defaultNick?this.defaultNick:prefs.get().nicknames[this.nextNick],
			prefs.get().realname,
			prefs.get().piface
		);	
	}
	catch(e)
	{
		Mojo.Log.info("########################################################");
		Mojo.Log.info(e);
		Mojo.Log.info("########################################################");
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

ircServer.prototype.debugPayload = function(payload, visible)
{
	alert('------');
	for (p in payload) 
	{
		alert(p + ': ' + payload[p]);
		if (visible) 
		{
			this.newMessage('debug', false, p + ': ' + payload[p]);
		}
	}
}
ircServer.prototype.runOnConnect = function()
{
	if (this.onConnect && this.onConnect.length > 0)
	{
		for (var c = 0; c < this.onConnect.length; c++)
		{
			// also defer these commands to run one after another when its not busy
			this.newCommand.bind(this).defer(this.onConnect[c]);
		}
	}
}

ircServer.prototype.away = function(reason)
{
	plugin.cmd_away(reason);
}
ircServer.prototype.ping = function(server)
{
	plugin.cmd_ping(server);
}
ircServer.prototype.topic = function(channel, topic)
{
	plugin.cmd_topic(channel, topic);
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
	plugin.cmd_whois(nick);
}

ircServer.prototype.disconnect = function(reason)
{
	this.setState(this.STATE_DISCONNECTING);
	plugin.cmd_quit(reason);
	this.setState(this.STATE_DISCONNECTED);
}

ircServer.prototype.disrupt = function()
{
	this.setState(this.STATE_DISRUPTED);
	plugin.cmd_quit(false);
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
ircServer.prototype.updateStatusList = function()
{
	if (this.statusAssistant && this.statusAssistant.controller)
	{
		this.statusAssistant.updateList();
	}
}

ircServer.prototype.list = function(channel)
{
	plugin.cmd_list(channel);
}
ircServer.prototype.listHandler = function(payload)
{
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
	this.channelList.push({channel: channel, users: users, topic: topic});
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
	var tmpChan = this.getOrCreateChannel(name, key);
	if (!tmpChan.containsNick(this.nick))
	{
		tmpChan.join();
	}
}

ircServer.prototype.getChannel = function(name)
{
	if (name.substr(0, 1) != '#')
		return false;
	else if (this.channels.length < 1)
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
		networkLag:	''
	};
	
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
		defaultNick:		this.defaultNick,
		serverUser:			this.serverUser,
		serverPassword:		this.serverPassword,
		autoConnect:		this.autoConnect,
		autoIdentify:		this.autoIdentify,
		identifyService:	this.identifyService,
		identifyPassword:	this.identifyPassword,
		onConnect:			this.onConnect
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
		this.defaultNick =		params.defaultNick;
		this.autoConnect =		params.autoConnect;
		this.autoIdentify =		params.autoIdentify;
		this.identifyService =	params.identifyService;
		this.identifyPassword =	params.identifyPassword;
		this.onConnect =		params.onConnect;
		
		var serverCookie = new Mojo.Model.Cookie('server-' + this.id);
		serverCookie.put(params);
	}
}

/* ==================== START OF CALLBACK SUBSCRIPTIONS ==================== */

ircServer.prototype.event_connect_handler = function(event, origin, params, ip)
{
	if (event=='MAXRETRIES')
	{
		this.setState(this.STATE_MAX_RETRIES);
		return;	
	}

	this.realServer = origin;
	
	this.nick		= this.getNick(params[0]); 
	this.nick.me	= true;
	
	this.sessionIpAddress = ip;
	if (connectionInfo.wan.state=='connected' && connectionInfo.wan.ipAddress==this.sessionIpAddress)
	{
		this.sessionInterface = "wan";
		this.sessionNetwork = connectionInfo.wan.network;
	}
	else
	{
		this.sessionInterface = "wifi";
		this.sessionNetwork = '';
	}
	
	this.setState(this.STATE_CONNECTED);

	this.runOnConnect.bind(this).defer();
}

ircServer.prototype.event_part_handler = function(event, origin, params)
{
	var tmpChan = this.getChannel(params[0]);
	if (tmpChan) 
	{
		var tmpNick = this.getNick(origin);
		tmpNick.removeChannel(tmpChan);
		if (tmpNick.me)
			this.removeChannel(tmpChan);
		tmpChan.newMessage('type5', false, tmpNick.name + ' (' + origin.split("!")[1] + ') has left ' + tmpChan.name + ' (' + params[1] + ')');
	}	
}

ircServer.prototype.event_invite_handler = function(event, origin, params)
{
	if (prefs.get().inviteAction != 'ignore') 
	{
		var tmpNick = this.getNick(origin);
		if (tmpNick && params[0].toLowerCase() === this.nick.name.toLowerCase())
		{
			tmpChan = this.getChannel(params[1]);
			if (!tmpChan || !tmpChan.containsNick(this.nick)) 
				this.openInvite(tmpNick.name, params[1]);
		}
	}
}

ircServer.prototype.event_channel_handler = function(event, origin, params)
{
	var tmpChan = this.getChannel(params[0]);
	if (tmpChan) 
	{
		var tmpNick = this.getNick(origin);
		tmpNick.addChannel(tmpChan);
		tmpChan.newMessage('privmsg', tmpNick, params[1]);
	}
}

ircServer.prototype.event_privmsg_handler = function(event, origin, params)
{
	var tmpNick = this.getNick(origin);
	var tmpQuery = this.getQuery(tmpNick);
	if (tmpQuery)
		tmpQuery.newMessage('privmsg', tmpNick, params[1]);
	else
		this.startQuery(tmpNick, false, 'message', params[1]);
}

ircServer.prototype.event_nick_handler = function(event, origin, params)
{
	var tmpNick = this.getNick(origin);
	if (tmpNick === this.nick)
		this.newMessage('type9', false, tmpNick.name + ' is now known as ' + params[0]);
	tmpNick.updateNickName(params[0]);
}

ircServer.prototype.event_mode_handler = function(event, origin, params)
{
	var tmpNick = this.getNick(origin);
	var tmpChan = this.getChannel(params[0]);
	if (tmpChan) 
	{
		var modeNick = this.getNick(params[2]);
		if (modeNick)
			modeNick.updateMode(params[1], tmpChan);
		tmpChan.newMessage('type3', false, 'Mode ' + params[0] + ' ' + params[1] + ' ' + params[2] + ' by ' + tmpNick.name);
	}
}

ircServer.prototype.event_umode_handler = function(event, origin, params)
{
	this.newMessage('type3', false, 'Mode ' + this.nick.name + ' ' + params[0] + ' by ' + origin);
}
	
ircServer.prototype.event_join_handler = function(event, origin, params)
{
	var tmpChan = this.getOrCreateChannel(params[0], null);
	if (tmpChan) 
	{
		var tmpNick = this.getNick(origin);
		if (tmpNick.me)
			tmpChan.openStage();
		tmpNick.addChannel(tmpChan, '');
		tmpChan.newMessage('type4', false, tmpNick.name + ' (' + origin.split("!")[1] + ') has joined ' + tmpChan.name);
	}
}

ircServer.prototype.event_quit_handler = function(event, origin, params)
{
	var tmpNick = this.getNick(origin);
	if (tmpNick)
	{
		for (var i = 0; i< tmpNick.channels.length; i++)
			tmpNick.channels[i].newMessage('type5', false, tmpNick.name + ' has quit (' + params + ')');
		this.removeNick(tmpNick);
	}	
}

ircServer.prototype.event_topic_handler = function(event, origin, params)
{
	var tmpChan = this.getChannel(params[0]);
	if (tmpChan)
	{
		var tmpNick = this.getNick(origin);
		tmpChan.topicUpdate(params[1]);
		tmpChan.newMessage('type8', false, tmpNick.name + ' changed the topic to: ' + params[1]);
	}
}

/*
 * These are notices that are directed towards the active/signed-on nick.
 * These should probably spawn a query window, but that might get really
 * annoying for commom notices such as those from Nickserv/Chanserv, etc.
 * For now all of these notices will get directed to the server status
 * window until a better solution is implemented.
 */	
ircServer.prototype.event_notice_handler = function(event, origin, params)
{
	var tmpNick = this.getNick(origin);
	this.newMessage('type6', tmpNick, params[1]);
}

/*
 * These are notices that are directed towards a specific channel.
 */
ircServer.prototype.event_channel_notice_handler = function(event, origin, params)
{
	var tmpNick = this.getNick(origin);
	var tmpChan = this.getChannel(params[0]);
	if (tmpChan) tmpChan.newMessage('type6', tmpNick, params[1]);
	else this.newMessage('type6', tmpNick, params[1]);
}

/*
 * These are actions (generated only by /me it seems). These messages should
 * show up in a channel or query message only (I think).
 */
ircServer.prototype.event_ctcp_action_handler = function(event, origin, params)
{
	var tmpNick = this.getNick(origin);
	var tmpChan = this.getChannel(params[0]);
	if (tmpChan)
		tmpChan.newMessage('type7', tmpNick, params[1]);
	else
	{
		var tmpQuery = this.getQuery(tmpNick);
		if (tmpQuery)
			tmpQuery.newMessage('type7', tmpNick, params[1]);
		else
			this.startQuery(tmpNick, false, 'type7', params[1]);
	}					
}

ircServer.prototype.event_kick_handler = function(event, origin, params)
{
	var tmpChan = this.getChannel(params[0]);
	if (tmpChan) 
	{
		var tmpNick = this.getNick(params[1]);
		var tmpNick2 = this.getNick(origin);
		var reason = params[2];
		if (tmpNick)
		{
			tmpNick.removeChannel(tmpChan); 
			if (tmpNick.me)
			{
				tmpChan.close();
				this.removeChannel(tmpChan);
			}
			tmpChan.newMessage('type10', false, tmpNick2.name + ' has kicked ' + tmpNick.name + ' from ' + params[0] + ' (' + params[2] + ')');
		}
	}
}

/*
 * We need to figure out a more generic way to handle all these numeric events.
 * There must be some sort of rule/heuristic we can follow to format them.
 */
ircServer.prototype.event_numeric_handler = function(event, origin, params)
{
	switch(event)
	{								
		case '324': // CHANNELMODEIS
			var tmpChan = this.getChannel(params[1]);
			if (tmpChan)
				tmpChan.channelMode(params[2]);
			break;

		case '1':		// WELCOME
		case '2':		// YOURHOST
		case '3':		// CREATED
		case '4':		// MYINFO
		case '5':		// BOUNCE
		case '251':		// LUSERCLIENT
		case '255':		// LUSERME
		case '265':		// ???
		case '266':		// ???
		case '250':		// ???
		case '372':		// MOTD
		case '901':		// ???
			this.newMessage('type2', false, params[1], true);
			break;
					
		case '42':		// YOURID					
		case '253':		// LUSERUNKNOWN
		case '252':		// LUSEROP
		case '254':		// LUSERCHANNELS
		case '256':		// ADMINME
			this.newMessage('type2', false, params[1] + ' ' + params[2]);
			break;
					
		case '439':		// TARGETTOOFAST
			this.newMessage('type2', false, params[0] + ' ' + params[1]);
			break;					
					
		case '305':		// NOTAWAY
			this.isAway = false;
			this.newMessage('type2', false, params[1]);
			// update app menu to show "away" option again
			for (var c = 0; c < this.channels.length; c++)
			{
				this.channels[c].updateAppMenu();
			}
			break;
		
		case '306':		// AWAY
			this.isAway = true;
			this.newMessage('type2', false, params[1]);
			// update app menu to show "back" option
			for (var c = 0; c < this.channels.length; c++)
			{
				this.channels[c].updateAppMenu();
			}
			break;
				
		case '301':		// ??? WHOISAWAY?
		case '311':		// WHOISUSER
		case '312':		// WHOISSERVER
		case '313':		// WHOISOPERATOR
		case '317':		// WHOISIDLE
		case '318':		// ENDOFWHOIS
		case '319':		// WHOISCHANNELS
		case '320':		// ??? WHOISIDENT?
			var tmpNick = this.getNick(params[1]);
			if (tmpNick)
				tmpNick.whoisEvent(event, params);
			break;
					
		case '321':		// LISTSTART
			this.listStart();
			break;
	
		case '322':		// LIST
			this.listAddChannel(params[1], params[2], params[3]);
			break;
	
		case '323':		// LISTEND
			this.listEnd();
			break;
				
		case '332':		// TOPIC
			var tmpChan = this.getChannel(params[1]);
			if (tmpChan) 
			{
				tmpChan.topicUpdate(params[2]);
				if (tmpChan.containsNick(this.nick)) 
					tmpChan.newMessage('type8', false, 'Topic for ' + params[1] + ' is "' + params[2] + '"');
			} 
			else 
				this.newMessage('type8', false, 'Topic for ' + params[1] + ' is "' + params[2] + '"');
			break;

		case '333':		// TOPIC SET TIME
			var newDate = new Date();
			newDate.setTime(params[3]*1000);
			dateString = newDate.toUTCString();
			var tmpChan = this.getChannel(params[1]);
			if (tmpChan) 
			{
				if (tmpChan.containsNick(this.nick)) 
					tmpChan.newMessage('type8', false, 'Topic set by ' + params[2] + ' on ' + dateString);
			} 
			else 
				this.newMessage('action', false, 'Topic set by ' + params[2] + ' on ' + dateString);
			break;

		case '329':
			var newDate = new Date();
			newDate.setTime(params[2]*1000);
			dateString = newDate.toUTCString();
			var tmpChan = this.getChannel(params[1]);
			if (tmpChan) 
			{
				if (tmpChan.containsNick(this.nick)) 
					tmpChan.newMessage('type8', false, 'Channel ' + params[1] + ' created on ' + dateString);
			} 
			else 
				this.newMessage('action', false, 'Channel ' + params[1] + ' created on ' + dateString);
			break;					
			
		case '328':		// ???
		case '331':		// NO TOPIC
			//this.debugPayload(payload, false); // XXXXXXXXXXXXXXXXXX
			break;
		
		case '353':		// NAMREPLY
			var nicks = params[3].split(" ");
			var tmpChan = this.getChannel(params[2]);
			var tmpNick;
			if (tmpChan)
			{
				for (var i = 0; i < nicks.length; i++)
				{
					if (nicks[i])
					{
						var prefixNick = '';
						var onlyNick = nicks[i];
						if (ircNick.hasPrefix(onlyNick))
						{
							prefixNick = nicks[i].substr(0, 1);
							onlyNick = nicks[i].substr(1);
						}
								
						tmpNick = this.getNick(onlyNick);
						if (tmpNick)
							tmpNick.addChannel(tmpChan, ircNick.getPrefixMode(prefixNick));
					}
				}
			}
			break;
	
		case '366':		// ENDOFNAMES
			break;
					
		case '375':		// MOTDSTART
		case '376':		// ENDOFMOTD
			this.updateStatusList();
			break;
					
		case '433':		// NAMEINUSE
			this.newMessage('debug', false, params[1] + " : " + params[2]);
			if (this.nextNick < prefs.get().nicknames.length-1)
			{
				this.newMessage('debug', false, 'Trying next nick [' + this.nextNick + '] - ' + prefs.get().nicknames[this.nextNick]);
				this.nextNick = this.nextNick + 1;
				plugin.cmd_nick(null, this.sessionToken, prefs.get().nicknames[this.nextNick]);	
			}
			else {
				this.newMessage('debug', false, 'No more nicks to try!');
				this.disconnect();
			}
			break;
		
		case '477':
		case '482':
			var tmpChan = this.getChannel(params[1]);
			if (tmpChan) 
			{
				if (tmpChan.containsNick(this.nick))
					tmpChan.newMessage('type2', false, params[2]);
			}
			else
				this.newMessage('type2', false, params[2]);
			break;
					
		default:
			//this.debugPayload(payload, true); // XXXXXXXXXXXXXXXXXXXXXXX
			break;
	}
}

ircServer.prototype.event_unknown_handler = function(event, origin, params)
{
	/*if (event != 'PONG')
	{
		this.debugPayload(payload, false);
	}*/
}

ircServer.prototype.autoPingHandler = function(payload)
{
	if (prefs.get().lagMeter)
	{
		this.lagHistory.push(payload.rtt);
		if (this.lagHistory.length>5)
			this.lagHistory.shift();
		
		var lagSum = 0;
		this.lagHistory.forEach(function(x) {lagSum += x;});
		var aveLag = lagSum / this.lagHistory.length;
			
		if (aveLag<300)
			this.lag = 'lag-5';
		else if (aveLag<600)
			this.lag = 'lag-4';
		else if (aveLag<1200)
			this.lag = 'lag-3';
		else if (aveLag<2400)
			this.lag = 'lag-2';
		else
			this.lag = 'lag-1';
		
		if (servers.listAssistant && servers.listAssistant.controller)
		{
			servers.listAssistant.updateList();	
		}
		if (this.statusAssistant && this.statusAssistant.controller)
		{
			this.statusAssistant.updateLagMeter();
		}
		for (var c = 0; c < this.channels.length; c++)
		{
			this.channels[c].updateLagMeter();
		}
		for (var q = 0; q < this.queries.length; q++)
		{
			this.queries[q].updateLagMeter();
		}
	}
	else
	{
		this.clearAutoPingSubscription();
	}
}

ircServer.prototype.clearAutoPingSubscription = function()
{
	this.subscriptions['auto_ping'].cancel();
		
	if (servers.listAssistant && servers.listAssistant.controller)
	{
		servers.listAssistant.updateList();	
	}
	if (this.statusAssistant && this.statusAssistant.controller)
	{
		this.statusAssistant.updateLagMeter();
	}
	for (var c = 0; c < this.channels.length; c++)
	{
		this.channels[c].updateLagMeter();
	}
	for (var q = 0; q < this.queries.length; q++)
	{
		this.queries[q].updateLagMeter();
	}
}
ircServer.prototype.startAutoPingSubscription = function(skip)
{
	if (prefs.get().lagMeter || skip)
	{
		this.subscriptions['auto_ping']			= plugin.cmd_subscribe(this.errorHandler.bindAsEventListener(this), this.autoPingHandler.bindAsEventListener(this),this.sessionToken, 'auto_ping');
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
		defaultNick:		'',
		autoConnect:		false,
		autoIdentify:		false,
		identifyService:	'NickServ',
		identifyPassword:	'',
		onConnect:			[]
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