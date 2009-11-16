function ircServer(params)
{
	this.STATE_DISCONNECTED =	0; 
	this.STATE_CONNECTING =		1; 
	this.STATE_CONNECTED =		2; 
	this.STATE_DISCONNECTING =	3;

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
	
	if (this.autoConnect)
	{
		//this.connect();
		this.init();
	}
}

ircServer.prototype.setState = function(state)
{
	var message = '';
	switch (state)
	{
		case this.STATE_CONNECTING: message = "Connecting..."; break;
		case this.STATE_CONNECTED: message = "Connected!"; break;
		case this.STATE_DISCONNECTING: message = "Disconnecting..."; break;
		case this.STATE_DISCONNECTED: message = "Disconnected!"; break;  
	}	
	this.state = state;
	this.newMessage('type3', false, message);
	if (servers.listAssistant && servers.listAssistant.controller)
		servers.listAssistant.updateList();
}

ircServer.prototype.eventConnectHandler = function(payload)
{
	this.nick		= this.getNick(payload.params[0]); 
	this.nick.me	= true;
	
	this.setState(this.STATE_CONNECTED);

	this.runOnConnect.bind(this).defer();
}

ircServer.prototype.eventPartHandler = function(payload)
{
	var tmpChan = this.getChannel(payload.params[0]);
	if (tmpChan) 
	{
		var tmpNick = this.getNick(payload.origin);
		tmpNick.removeChannel(tmpChan);
		if (tmpNick.me)
			this.removeChannel(tmpChan);
		tmpChan.newMessage('type5', false, tmpNick.name + ' (' + payload.origin.split("!")[1] + ') has left ' + tmpChan.name + ' (' + payload.params[1] + ')');
	}	
}

ircServer.prototype.eventInviteHandler = function(payload)
{
	if (prefs.get().inviteAction != 'ignore') 
	{
		var tmpNick = this.getNick(payload.origin);
		if (tmpNick && payload.params[0].toLowerCase() === this.nick.name.toLowerCase())
		{
			tmpChan = this.getChannel(payload.params[1]);
			if (!tmpChan || !tmpChan.containsNick(this.nick)) 
				this.openInvite(tmpNick.name, payload.params[1]);
		}
	}
}

ircServer.prototype.eventChannelHandler = function(payload)
{
	var tmpChan = this.getChannel(payload.params[0]);
	if (tmpChan) 
	{
		var tmpNick = this.getNick(payload.origin);
		tmpNick.addChannel(tmpChan);
		tmpChan.newMessage('privmsg', tmpNick, payload.params[1]);
	}
}

ircServer.prototype.eventPrivmsgHandler = function(payload)
{
	var tmpNick = this.getNick(payload.origin);
	var tmpQuery = this.getQuery(tmpNick);
	if (tmpQuery)
		tmpQuery.newMessage('privmsg', tmpNick, payload.params[1]);
	else
		this.startQuery(tmpNick, false, 'message', payload.params[1]);
}

ircServer.prototype.eventNickHandler = function(payload)
{
	var tmpNick = this.getNick(payload.origin);
	if (tmpNick === this.nick)
		this.newMessage('type9', false, tmpNick.name + ' is now known as ' + payload.params[0]);
	tmpNick.updateNickName(payload.params[0]);
}

ircServer.prototype.eventModeHandler = function(payload)
{
	var tmpNick = this.getNick(payload.origin);
	var tmpChan = this.getChannel(payload.params[0]);
	if (tmpChan) 
	{
		var modeNick = this.getNick(payload.params[2]);
		if (modeNick)
			modeNick.updateMode(payload.params[1], tmpChan);
		tmpChan.newMessage('type3', false, 'Mode ' + payload.params[0] + ' ' + payload.params[1] + ' ' + payload.params[2] + ' by ' + tmpNick.name);
	}
}

ircServer.prototype.eventUmodeHandler = function(payload)
{
	this.newMessage('type3', false, 'Mode ' + this.nick.name + ' ' + payload.params[0] + ' by ' + payload.origin);
}
	
ircServer.prototype.eventJoinHandler = function(payload)
{
	var tmpChan = this.getOrCreateChannel(payload.params[0], null);
	if (tmpChan) 
	{
		var tmpNick = this.getNick(payload.origin);
		if (tmpNick.me)
			tmpChan.openStage();
		tmpNick.addChannel(tmpChan, '');
		tmpChan.newMessage('type4', false, tmpNick.name + ' (' + payload.origin.split("!")[1] + ') has joined ' + tmpChan.name);
	}
}

ircServer.prototype.eventQuitHandler = function(payload)
{
	var tmpNick = this.getNick(payload.origin);
	if (tmpNick)
	{
		for (var i = 0; i< tmpNick.channels.length; i++)
			tmpNick.channels[i].newMessage('type5', false, tmpNick.name + ' has quit (' + payload.params + ')');
		this.removeNick(tmpNick);
	}	
}

ircServer.prototype.eventNoticeHandler = function(payload)
{
	if (payload.origin=='NULL')
		this.newMessage('type1', false, payload.params);
	else if (payload.params[0] == this.nick.name)
		this.newMessage('type6', tmpNick, payload.params[1]);	
}

ircServer.prototype.eventKickHandler = function(payload)
{
	var tmpChan = this.getChannel(payload.params[0]);
	if (tmpChan) 
	{
		var tmpNick = this.getNick(payload.params[1]);
		var tmpNick2 = this.getNick(payload.origin);
		var reason = payload.params[2];
		if (tmpNick)
		{
			tmpNick.removeChannel(tmpChan); 
			if (tmpNick.me)
			{
				tmpChan.close();
				this.removeChannel(tmpChan);
			}
			tmpChan.newMessage('type10', false, tmpNick2.name + ' has kicked ' + tmpNick.name + ' from ' + payload.params[0] + ' (' + payload.params[2] + ')');
		}
	}
}

ircServer.prototype.eventUnknownHandler = function(payload)
{
	if (payload.params[0].include('Closing Link'))
		this.setState(this.STATE_DISCONNECTED);
}

ircServer.prototype.setupSubscriptions = function()
{
	this.subscriptions['event_connect']			= wIRCd.subscribe(this.eventConnectHandler.bindAsEventListener(this),this.sessionToken, 'event_connect');
	this.subscriptions['event_nick']			= wIRCd.subscribe(this.eventNickHandler.bindAsEventListener(this),this.sessionToken, 'event_nick');
	this.subscriptions['event_quit']			= wIRCd.subscribe(this.eventQuitHandler.bindAsEventListener(this),this.sessionToken, 'event_quit');
	this.subscriptions['event_join']			= wIRCd.subscribe(this.eventJoinHandler.bindAsEventListener(this),this.sessionToken, 'event_join');
	this.subscriptions['event_part']			= wIRCd.subscribe(this.eventPartHandler.bindAsEventListener(this),this.sessionToken, 'event_part');
	this.subscriptions['event_mode']			= wIRCd.subscribe(this.eventModeHandler.bindAsEventListener(this),this.sessionToken, 'event_mode');
	this.subscriptions['event_umode']			= wIRCd.subscribe(this.eventUmodeHandler.bindAsEventListener(this),this.sessionToken, 'event_umode');
	this.subscriptions['event_topic']			= wIRCd.subscribe(this.connectionHandler.bindAsEventListener(this),this.sessionToken, 'event_topic');
	this.subscriptions['event_kick']			= wIRCd.subscribe(this.eventKickHandler.bindAsEventListener(this),this.sessionToken, 'event_kick');
	this.subscriptions['event_channel']			= wIRCd.subscribe(this.eventChannelHandler.bindAsEventListener(this),this.sessionToken, 'event_channel');
	this.subscriptions['event_privmsg']			= wIRCd.subscribe(this.eventPrivmsgHandler.bindAsEventListener(this),this.sessionToken, 'event_privmsg');
	this.subscriptions['event_notice']			= wIRCd.subscribe(this.eventNoticeHandler.bindAsEventListener(this),this.sessionToken, 'event_notice');
	this.subscriptions['event_channel_notice']	= wIRCd.subscribe(this.connectionHandler.bindAsEventListener(this),this.sessionToken, 'event_channel_notice');
	this.subscriptions['event_invite']			= wIRCd.subscribe(this.eventInviteHandler.bindAsEventListener(this),this.sessionToken, 'event_invite');
	this.subscriptions['event_ctcp_req']		= wIRCd.subscribe(this.connectionHandler.bindAsEventListener(this),this.sessionToken, 'event_ctcp_req');
	this.subscriptions['event_ctcp_rep']		= wIRCd.subscribe(this.connectionHandler.bindAsEventListener(this),this.sessionToken, 'event_ctcp_rep');
	this.subscriptions['event_ctcp_action']		= wIRCd.subscribe(this.connectionHandler.bindAsEventListener(this),this.sessionToken, 'event_ctcp_action');
	this.subscriptions['event_unknown']			= wIRCd.subscribe(this.eventUnknownHandler.bindAsEventListener(this),this.sessionToken, 'event_unknown');
	this.subscriptions['event_numeric']			= wIRCd.subscribe(this.connectionHandler.bindAsEventListener(this),this.sessionToken, 'event_numeric');
}

ircServer.prototype.initHandler = function(payload)
{
	if (payload && payload.sessionToken)
	{
		this.sessionToken = payload.sessionToken;
		this.setupSubscriptions();
		this.connect();
	}
}

ircServer.prototype.init = function()
{
	this.setState(this.STATE_CONNECTING);
	wIRCd.init(this.initHandler.bindAsEventListener(this));
}

ircServer.prototype.isConnected = function(message)
{
	return (this.state === this.STATE_CONNECTED);
}

ircServer.prototype.newCommand = function(message)
{
	if (this.isConnected())
	{
		var cmdRegExp =			new RegExp(/^\/([^\s]*)[\s]*(.*)$/);
		var twoValRegExp =		new RegExp(/^([^\s]*)[\s]{0,1}(.*)$/);
		var threeValRegExp =	new RegExp(/^([^\s]*)[\s]{1}([^\s]*)[\s]{0,1}(.*)$/);
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
					var vals = val.split(" ");
					this.joinChannel(vals[0],vals[1]);
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
					
				case 'ping':
					if (val) this.ping(val);
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
					wIRCd.raw(null, this.sessionToken, val);
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
		this.newMessage('status', false, 'Not Connected.');
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
			this.newMessage('type3', false, 'Preferred interface is not avaliable and use fallbacks is false... not connecting.');
			return;
		}
	}

	wIRCd.connect
	(
		null,
		this.sessionToken,
		this.address,
		this.port,
		(this.serverUser?this.serverUser:null),
		(this.serverPassword?this.serverPassword:null),
		this.defaultNick?this.defaultNick:prefs.get().nicknames[this.nextNick],
		prefs.get().realname,
		prefs.get().piface
	);
}
ircServer.prototype.maybeReconnect = function(network)
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
}

ircServer.prototype.connectionHandler = function(payload)
{
	try
	{
		if (!payload.returnValue) 
		{

			/*if (payload.returnValue === 0)
			{
				this.newMessage('type3', false, 'Disconnected!');
				this.subscription.cancel();
				this.sessionToken = false;
				this.ipAddress = false;
				this.state = this.STATE_DISCONNECTED;
				this.removeNick(this.nick);
				if (servers.listAssistant && servers.listAssistant.controller)
				{
					servers.listAssistant.updateList();
				}
				if (this.autoReconnect && this.reconnect)
				{
					this.newMessage('status', false, 'Reconnecting...');
					//this.connect();
					this.init();
				}
				return;
			}*/
			
			switch(payload.event)
			{								
					
				case 'ACTION':
					if (payload.params[0].substr(0, 1) == '#') // it's a channel
					{
						var tmpChan = this.getChannel(payload.params[0]);
						if (tmpChan)
						{
							var tmpNick = this.getNick(payload.origin);
							tmpNick.addChannel(tmpChan);
							tmpChan.newMessage('type7', tmpNick, payload.params[1]);
						}
					}
					else if (payload.params[0].toLowerCase() == this.nick.name.toLowerCase()) // it's a query
					{
						var tmpNick = this.getNick(payload.origin);
						var tmpQuery = this.getQuery(tmpNick);
						if (tmpQuery)
						{
							tmpQuery.newMessage('type7', tmpNick, payload.params[1]);
						}
						else
						{
							this.startQuery(tmpNick, false, 'type7', payload.params[1]);
						}
					}
					break;
					
				case 'NOTICE':
					var tmpNick = this.getNick(payload.origin);

					if (payload.params[0].substr(0, 1) == '#') // it's a channel
					{
						var tmpChan = this.getChannel(payload.params[0]);
						if (tmpChan) 
						{
							tmpChan.newMessage('type6', tmpNick, payload.params[1]);
						}
					}
					else
					{
						//if (payload.origin=='services')
							this.newMessage('type3', false, payload.params[1]);					
					}
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
				case '901':		// ???
					this.newMessage('type2', false, payload.params[1], true);
					break;
					
				case '253':		// LUSERUNKNOWN
				case '252':		// LUSEROP
				case '254':		// LUSERCHANNELS
				case '256':		// ADMINME
					this.newMessage('debug', false, payload.params[1] + ' ' + payload.params[2]);
					break;
					
				case '305':		// NOTAWAY
					this.isAway = false;
					this.newMessage('debug', false, payload.params[1]);
					break;
				case '306':		// AWAY
					this.isAway = true;
					this.newMessage('debug', false, payload.params[1]);
					break;
				
				case '301':		// ??? WHOISAWAY?
				case '311':		// WHOISUSER
				case '312':		// WHOISSERVER
				case '313':		// WHOISOPERATOR
				case '317':		// WHOISIDLE
				case '318':		// ENDOFWHOIS
				case '319':		// WHOISCHANNELS
				case '320':		// ??? WHOISIDENT?
					var tmpNick = this.getNick(payload.params[1]);
					if (tmpNick)
					{
						// forward all whois stuff to nick object for parsing/display
						tmpNick.whoisEvent(payload.event, payload.params);
					}
					break;
					
				case '321':		// LISTSTART
					this.listStart();
					break;
				case '322':		// LIST
					this.listAddChannel(payload.params[1], payload.params[2], payload.params[3]);
					break;
				case '323':		// LISTEND
					this.listEnd();
					break;
				
				case '332':		// TOPIC
					var tmpChan = this.getChannel(payload.params[1]);
					if (tmpChan) 
					{
						tmpChan.topicUpdate(payload.params[2]);
						if (tmpChan.containsNick(this.nick)) 
						{
							tmpChan.newMessage('type8', false, 'Topic for ' + payload.params[1] + ' is "' + payload.params[2] + '"');
						}
					} 
					else 
					{
						this.newMessage('type8', false, 'Topic for ' + payload.params[1] + ' is "' + payload.params[2] + '"');
					}
					break;

				case '333':		// TOPIC SET TIME
					var newDate = new Date();
					newDate.setTime(payload.params[3]*1000);
					dateString = newDate.toUTCString();
					var tmpChan = this.getChannel(payload.params[1]);
					if (tmpChan) 
					{
						if (tmpChan.containsNick(this.nick)) 
						{
							tmpChan.newMessage('type8', false, 'Topic set by ' + payload.params[2] + ' on ' + dateString);
						}
					} 
					else 
					{
						this.newMessage('action', false, 'Topic set by ' + payload.params[2] + ' on ' + dateString);
					}
					break;
					
				case 'TOPIC': 	// TOPIC CHANGED
					var tmpChan = this.getChannel(payload.params[0]);
					if (tmpChan)
					{
						var tmpNick = this.getNick(payload.origin);
						tmpChan.topicUpdate(payload.params[1]);
						tmpChan.newMessage('action', false, tmpNick&&tmpNick.name + ' changed the topic to: ' + payload.params[1]);
					}
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
								var prefixNick = '';
								var onlyNick = nicks[i];
								if (ircNick.hasPrefix(onlyNick))
								{
									prefixNick = nicks[i].substr(0, 1);
									onlyNick = nicks[i].substr(1);
								}
								
								tmpNick = this.getNick(onlyNick);
								if (tmpNick)
								{
									tmpNick.addChannel(tmpChan, ircNick.getPrefixMode(prefixNick));
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
					this.updateStatusList();
					//this.newMessage('action', false, payload.params[1]);
					break;
					
				case '433':		// NAMEINUSE
					this.newMessage('debug', false, payload.params[1] + " : " + payload.params[2]);
					this.nextNick = (this.nextNick < prefs.get().nicknames.length - 1) ? this.nextNick + 1 : 0;
					this.newMessage('debug', false, 'try next nick [' + this.nextNick + '] - ' + prefs.get().nicknames[this.nextNick]);
					wIRCd.nick(null, this.sessionToken, prefs.get().nicknames[this.nextNick])

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
	wIRCd.away(this.genericHandler.bindAsEventListener(this), this.sessionToken, reason);
}
ircServer.prototype.ping = function(server)
{
	wIRCd.ping(this.genericHandler.bindAsEventListener(this), this.sessionToken, server);
}
ircServer.prototype.topic = function(channel, topic)
{
	wIRCd.topic(this.genericHandler.bindAsEventListener(this), this.sessionToken, channel, topic);
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
	wIRCd.whois(this.genericHandler.bindAsEventListener(this), this.sessionToken, nick);
}
ircServer.prototype.genericHandler = function(payload)
{
	// idk what to do here if anything
}

ircServer.prototype.disconnect = function(reason)
{
	// disconnecting...
	// TODO: Jump to server status scene and display disconnecting
	
	this.setState(this.STATE_DISCONNECTING);
	if (reason)
	{
		this.reconnect = false;
		this.newMessage('type3', false, 'Quitting (' + reason + ')...');
		wIRCd.quit(this.disconnectHandler.bindAsEventListener(this), this.sessionToken, reason);
	}
	else
	{
		this.newMessage('type3', false, 'Disconnecting...');
		wIRCd.quit(this.disconnectHandler.bindAsEventListener(this), this.sessionToken, reason);
		//wIRCd.disconnect(null, this.sessionToken);
	}
}
ircServer.prototype.disconnectHandler = function(payload)
{
	//this.newMessage('status', false, 'dc handler');
	/*
	if (payload.returnValue == 0)
	{
		this.state = this.STATE_DISCONNECTED;
		this.ipAddress = false;
		this.reconnect = false;
		this.removeNick(this.nick);
		if (servers.listAssistant && servers.listAssistant.controller)
		{
			servers.listAssistant.updateList();
		}
	}
	this.subscription.cancel();
	if (this.autoReconnect && this.reconnect)
	{
		this.connect();
	}
	*/
	//this.newMessage('status', false, 'ending dc handle');
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
	wIRCd.list(this.listHandler.bindAsEventListener(this), this.sessionToken, channel);
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
	if (this.channels.length > 0)
	{
		for (var c = 0; c < this.channels.length; c++)
		{
			if (this.channels[c].name == name.toLowerCase())
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
		rowStyle:	''
	};
	
	switch (this.state)
	{
		case this.STATE_DISCONNECTED:
			obj.rowStyle = obj.rowStyle + ' disconnected';
			break;
		case this.STATE_CONNECTING:
		case this.STATE_DISCONNECTING:
			obj.rowStyle = obj.rowStyle + ' changing';
			break;
		case this.STATE_CONNECTED:
			obj.rowStyle = obj.rowStyle + ' connected';
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
