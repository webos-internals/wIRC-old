function ircServer(params)
{
	this.id =				params.id;
	this.alias =			params.alias;
	this.address =			params.address;
	this.serverUser =		params.serverUser;
	this.serverPassword =	params.serverPassword;
	this.port =				params.port;
	this.autoConnect =		(params.autoConnect=='true'?true:false);
	this.autoIdentify =		(params.autoIdentify=='true'?true:false);
	this.identifyService =	params.identifyService;
	this.identifyPassword =	params.identifyPassword;
	this.onConnect =		params.onConnect;
	
	this.connected =		false;
	this.channels =			[];
	this.queries =			[];
	this.nick =				false;
	this.nicks =			[];
	this.statusMessages =	[];
	
	this.sessionToken =		false;
	this.subscription =		false;
	
	this.stageName =		'status-' + this.id;
	this.stageController =	false;
	this.statusAssistant =	false;
	
	if (this.autoConnect)
	{
		this.connect();
	}
}

ircServer.prototype.newCommand = function(message)
{
	if (this.connected)
	{
		var cmdRegExp =		new RegExp(/^\/([^\s]*)[\s]*(.*)$/);
		var twoValRegExp =	new RegExp(/^([^\s]*)[\s]{1}(.*)$/);
		var match = cmdRegExp.exec(message);
		if (match)
		{
			var cmd = match[1];
			var val = match[2];
			
			switch (cmd.toLowerCase())
			{
				case 'nick':
					wIRCd.nick(null, this.sessionToken, val)
					break;
					
				case 'j':
				case 'join':
					this.joinChannel(val);
					break;
					
				case 'msg':
				case 'query':
					var tmpMatch = twoValRegExp.exec(val);
					if (tmpMatch) 
					{
						this.startQuery(this.getNick(tmpMatch[1]), true, 'message', tmpMatch[2]);
					}
					break;
					
				case 'topic':
					if (val) {
						var tmpMatch = twoValRegExp.exec(val);
						if (tmpMatch) {
							this.topic(tmpMatch[1],tmpMatch[2]);
						} else {
							this.topic(val,null);
						}
					}
					break;					
					
				case 'quit':
					this.disconnect(val);
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
		this.newMessage('status', false, 'Not Connected.');
	}
}

ircServer.prototype.newMessage = function(type, nick, message)
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
	this.updateStatusList();
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
	// connecting...
	this.subscription = wIRCd.connect
	(
		this.connectionHandler.bindAsEventListener(this),
		this.address,
		this.port,
		(this.serverUser?this.serverUser:null),
		(this.serverPassword?this.serverPassword:null),
		prefs.get().nick1,
		prefs.get().realname
	);
}
ircServer.prototype.connectionHandler = function(payload)
{
	try
	{
		if (!payload.returnValue) 
		{
			switch(payload.event)
			{
				case 'CONNECT':
					this.sessionToken = payload.sessionToken;
					this.nick = this.getNick(payload.params[0]); 
					this.nick.me = true;
					
					this.connected = true;
					
					if (servers.listAssistant && servers.listAssistant.controller)
					{
						servers.listAssistant.updateList();
					}
					
					// perform onconnect when mojo isn't busy
					this.runOnConnect.bind(this).defer();
					
					break;
								
				case 'JOIN':
					var tmpChan = this.getChannel(payload.params[0]);
					if (tmpChan) 
					{
						var tmpNick = this.getNick(payload.origin);
						tmpNick.addChannel(tmpChan, '');
						tmpChan.newMessage('join-event', false, tmpNick.name + ' has joined ' + tmpChan.name);
					}
					break;
					
				case 'KICK':
					var tmpChan = this.getChannel(payload.params[0]);
					if (tmpChan) 
					{
						this.nick.removeChannel(tmpChan); 
						this.removeChannel(tmpChan);
						this.newMessage('status', false, "You have been kicked from " + tmpChan.name);
						tmpChan.close();
					}
					break;
					
				case 'PART':
					var tmpChan = this.getChannel(payload.params[0]);
					if (tmpChan) 
					{
						var tmpNick = this.getNick(payload.origin);
						tmpNick.removeChannel(tmpChan);
						if (tmpNick.me)
						{
							this.removeChannel(tmpChan);
						}
						tmpChan.newMessage('part-event', false, tmpNick.name + ' has left ' + tmpChan.name + ' (' + payload.params[1] + ')');
					}
					break;
					
				case 'QUIT':
					var tmpNick = this.getNick(payload.origin);
					if (tmpNick)
					{
						for (var i = 0; i< this.channels.length; i++)
						{
							this.channels[i].newMessage('channel-event', false, tmpNick.name + ' has quit (' + payload.params + ')');
						}

						this.removeNick(tmpNick);
					}
				break;

				case 'PRIVMSG':
					if (payload.params[0].substr(0, 1) == '#') // it's a channel
					{
						var tmpChan = this.getChannel(payload.params[0]);
						if (tmpChan) 
						{
							var tmpNick = this.getNick(payload.origin);
							tmpNick.addChannel(tmpChan);
							tmpChan.newMessage('channel-message', tmpNick, payload.params[1]);
						}
					}
					else if (payload.params[0].toLowerCase() == this.nick.name.toLowerCase()) // it's a query
					{
						var tmpNick = this.getNick(payload.origin);
						var tmpQuery = this.getQuery(tmpNick);
						if (tmpQuery)
						{
							tmpQuery.newMessage('channel-message', tmpNick, payload.params[1]);
						}
						else
						{
							this.startQuery(tmpNick, false, 'message', payload.params[1]);
						}
					}
					break;
					
				case 'ACTION':
					if (payload.params[0].substr(0, 1) == '#') // it's a channel
					{
						var tmpChan = this.getChannel(payload.params[0]);
						if (tmpChan)
						{
							var tmpNick = this.getNick(payload.origin);
							tmpNick.addChannel(tmpChan);
							tmpChan.newMessage('channel-action', tmpNick, payload.params[1]);
						}
					}
					else if (payload.params[0].toLowerCase() == this.nick.name.toLowerCase()) // it's a query
					{
						var tmpNick = this.getNick(payload.origin);
						var tmpQuery = this.getQuery(tmpNick);
						if (tmpQuery)
						{
							tmpQuery.newMessage('server-action', tmpNick, payload.params[1]);
						}
						else
						{
							this.startQuery(tmpNick, false, 'action', payload.params[1]);
						}
					}
					break;
					
				case 'NOTICE':
					if (payload.params[0].substr(0, 1) == '#') // it's a channel
					{
						var tmpChan = this.getChannel(payload.params[0]);
						if (tmpChan) 
						{
							var tmpNick = this.getNick(payload.origin);
							tmpChan.newNotice(tmpNick, payload.params[1]);
						}
					}
					else
					{
						this.newMessage('notice', false, payload.params);
					}
					break;					
					
				case 'NICK':
					var tmpNick = this.getNick(payload.origin);
					if (tmpNick === this.nick)
					{
						this.newMessage('status', false, 'You are now known as [' + tmpNick.name + ']');
					}
					tmpNick.updateNickName(payload.params[0]);
					break;
					
				case '324': // CHANNELMODEIS
					var tmpChan = this.getChannel(payload.params[1]);
					if (tmpChan)
					{
						tmpChan.channelMode(payload.params[2]);
					}
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
					this.newMessage('action', false, payload.params[1]);
					break;
					
				case '253':		// LUSERUNKNOWN
				case '252':		// LUSEROP
				case '254':		// LUSERCHANNELS
				case '256':		// ADMINME
					this.newMessage('action', false, payload.params[1] + ' ' + payload.params[2]);
					break;
					
				case '332':		// TOPIC
					this.newMessage('action', false, 'Topic for ' + payload.params[1] + ' is "' + payload.params[2] + '"');
					break;
				case '333':		// TOPIC SET TIME
					var newDate = new Date();
					newDate.setTime(payload.params[3]*1000);
					dateString = newDate.toUTCString();
					this.newMessage('action', false, 'Topic set by ' + payload.params[2] + ' on ' + dateString);
					break;
					
				case '328':		// ???
				case '329':		// ???
				case '331':		// NO TOPIC
					this.debugPayload(payload, false);
					break;
				case '353':		// NAMREPLY
					var nicks = payload.params[3].split(" ");
					var tmpChan = this.getChannel(payload.params[2]);
					var tmpNick;
					if (tmpChan)
					{
						for (var i = 0; i < nicks.length; i++)
						{
							if (nicks[i])
							{
								var onlyNick = nicks[i];
								var modeNick = nicks[i].substr(0, 1);
								if (modeNick == '@' ||	// op
									modeNick == '%' ||	// hop
									modeNick == '+')		// v
								{
									onlyNick = nicks[i].substr(1);
								}
								else
								{
									modeNick = '';
								}
								
								tmpNick = this.getNick(onlyNick);
								if (tmpNick)
								{
									tmpNick.addChannel(tmpChan, modeNick);
								}
							}
						}
					}
					break;
				case '366':		// ENDOFNAMES
					this.debugPayload(payload, false);
					break;
					
				case '375':		// MOTDSTART
				case '376':		// ENDOFMOTD
					this.newMessage('action', false, payload.params[1]);
					break;
					
				case '433':		// NAMEINUSE
					this.newMessage('debug', false, payload.params[1] + " : " + payload.params[2]);
					break;
					
				default:
					this.debugPayload(payload, true);
					break;
			}
		}
		else
		{
			// hmm
		}
		
		// for debugging all messages
		//this.debugPayload(payload, false);
	}
	catch (e)
	{
		Mojo.Log.logException(e, "ircServer#connectionHandler");
	}
}
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
	if (this.onConnect)
	{
		var tmpSplit = this.onConnect.split(';');
		if (tmpSplit.length > 0)
		{
			for (var s = 0; s < tmpSplit.length; s++)
			{
				// also defer these commands to run one after another when its not busy
				this.newCommand.bind(this).defer(tmpSplit[s]);
			}
		}
	}
}

ircServer.prototype.topic = function(channel, topic)
{
	wIRCd.topicSet(this.topicHandler.bindAsEventListener(this), this.sessionToken, channel, topic);
}
ircServer.prototype.topicHandler = function(payload)
{
	// idk what to do here if anything
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

ircServer.prototype.disconnect = function(reason)
{
	// disconnecting...
	// TODO: Jump to server status scene and display disconnecting
	if (!reason) reason = 'wIRC FTW';
	wIRCd.quit(this.disconnectHandler.bindAsEventListener(this), this.sessionToken, reason);
}
ircServer.prototype.disconnectHandler = function(payload)
{
	if (payload.returnValue == 0)
	{
		this.removeNick(this.nick);
		this.connected = false;
		this.subscription.cancel();
		if (servers.listAssistant && servers.listAssistant.controller)
		{
			servers.listAssistant.updateList();
		}
	}
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

ircServer.prototype.joinChannel = function(name)
{
	var tmpChannel = this.getChannel(name);
	if (tmpChannel)
	{
		// Do nothing if already in this channel
		if (!tmpChannel.containsNick(this.nick))
		{
			// Open the stage and join the channel
			tmpChannel.openStage();
			tmpChannel.join();
		}
		return;
	}
	
	var newChannel = new ircChannel(
	{
		name:	name,
		server:	this
	});
	newChannel.join();
	this.channels.push(newChannel);
}
ircServer.prototype.getChannel = function(name)
{
	if (this.channels.length > 0)
	{
		for (var c = 0; c < this.channels.length; c++)
		{
			if (this.channels[c].name == name)
			{
				return this.channels[c];
			}
		}
	}
	return false;
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
			if (messageType == 'message') tmpQuery.newMessage('channel-message', nick, message);
			else if (messageType == 'action') tmpQuery.newMessage('channel-action', nick, message);
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
		if (messageType == 'message') newQuery.newMessage('channel-message', nick, message);
		else if (messageType == 'action') newQuery.newMessage('channel-action', nick, message);
	}
	this.queries.push(newQuery);
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
		var cmdRegExp = new RegExp(/^([^\s]*)!(.*)$/);
		var match = cmdRegExp.exec(name);
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
				if (this.nicks[n].name == getNick)
				{
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

ircServer.prototype.getListObject = function()
{
	var obj =
	{
		key:		servers.getServerArrayKey(this.id),
		id:			this.id,
		alias:		this.alias,
		address:	this.address,
		connected:	this.connected,
		rowStyle:	''
	};
	
	if (this.connected) obj.rowStyle = obj.rowStyle + ' connected';
	else obj.rowStyle = obj.rowStyle + ' disconnected';
	
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
		this.id =				params.id;
		this.alias =			params.alias;
		this.address =			params.address;
		this.serverUser =		params.serverUser;
		this.serverPassword =	params.serverPassword;
		this.port =				params.port;
		this.autoConnect =		params.autoConnect;
		this.autoIdentify =		params.autoIdentify;
		this.identifyService =	params.identifyService;
		this.identifyPassword =	params.identifyPassword;
		this.onConnect =		params.onConnect;		
		
		db.saveServer(this, this.saveInfoResponse.bind(this));
	}
}
ircServer.prototype.saveInfoResponse = function(results) {}

ircServer.getBlankServerObject = function()
{
	var obj = 
	{
		id:					false,
		alias:				'',
		address:			'',
		serverUser:			'wIRCuser',
		serverPassword:		'',
		port:				6667,
		autoConnect:		false,
		autoIdentify:		false,
		identifyService:	'NickServ',
		identifyPassword:	'',
		onConnect:			''
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
