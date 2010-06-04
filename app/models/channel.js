function ircChannel(params)
{
	this.name =				params.name.toLowerCase();
	this.key = 				params.key;
	this.server =			params.server;
	this.nicks = [];
	
	this.messages =			[];
	
	this.mode = 			'';
	this.topic =			'';
	
	this.dashName =			'channeldash-' + this.server.id + '-' + this.name;
	this.dashMessage =		false;
	this.dashController =	false;
	this.dashAssistant =	false;
	this.stageName =		'channel-' + this.server.id + '-' + this.name;
	this.stageController =	false;
	this.chatAssistant =	false;
	this.usersAssistant =	false;
}

ircChannel.prototype.newCommand = function(message)
{
	if (this.server.isConnected())
	{
		var match = cmdRegExp.exec(message);
		if (match)
		{
			var cmd = match[1];
			var val = match[2];
			
			switch(cmd.toLowerCase())
			{
				case 'part':
				case 'leave':
					this.part();
					break;
					
				case 'me':
					this.me(val);
					break;
					
				case 'j':
				case 'join':
					var vals = val.split(" ");
					this.server.joinChannel(vals[0],vals[1]);
					break;				
				
				case 'topic':
					if (val) 
					{
						tmpMatch = twoValRegExp.exec(val);
						if (tmpMatch) 
						{
							this.server.topic(tmpMatch[1],tmpMatch[2]);
						}
						else
						{
							if (val.substr(0, 1) == '#') 
							{
								this.server.topic(val);
							}
							else 
							{
								this.server.topic(this.name, val);
							}
						}
					} 
					else 
					{
						this.server.topic(this.name);
					}			
					
					case 'away':
						this.server.away(val?val:null);
						break;
						
					case 'ping':
						if (val) this.server.ping(val);
						break;				
					
				default:
					// forward unknown to the server object
					this.server.newCommand(message);
					break;
			}
		}
		else
		{
			// normal message
			this.msg(message);
		}
	}
	else
	{
		// not connected
		this.newMessage('type3', false, $L('Not Connected.'));
		if (this.chatAssistant && this.chatAssistant.controller) 
		{
			this.chatAssistant.controller.showAlertDialog(
			{
			    title:				this.server.alias,
				allowHTMLMessage:	true,
			    message:			$L('Not Connected.'),
			    choices:			[{label:$L('Ok'), value:''}],
				onChoose:			function(value){}
		    });
		}
	}
}

ircChannel.prototype.topicUpdate = function(topic)
{
	this.topic = topic;
	if (this.chatAssistant && this.chatAssistant.controller) 
	{
		this.chatAssistant.updateTopic();
	}
}

ircChannel.prototype.me = function(message)
{
	plugin.cmd_me(servers.getServerArrayKey(this.server.id), this.name, message);
	this.newMessage('type7', this.server.nick, message);
}
ircChannel.prototype.meHandler = function(payload)
{
	// this apparently doesn't return anything of importance
}

ircChannel.prototype.msg = function(message)
{
	plugin.cmd_msg(servers.getServerArrayKey(this.server.id), this.name, message);
	this.newMessage('privmsg', this.server.nick, message);
}
ircChannel.prototype.msgHandler = function(payload)
{
	// this apparently doesn't return anything of importance
}

ircChannel.prototype.newMessage = function(type, nick, message)
{
	var obj =
	{
		type:		type,
		nick:		nick,
		message:	message,
		me:			this.server.nick.name,
		// pass this channel for mention dash pop reasons 
		channel:	this
	};
	var newMsg = new ircMessage(obj);
	this.messages.push(newMsg);
	this.updateChatList();
}
ircChannel.prototype.getMessages = function(start)
{
	var returnArray = [];
	if (!start) start = 0;
	
	if (this.messages.length > 0 && start < this.messages.length)
	{
		for (var m = start; m < this.messages.length; m++)
		{
			returnArray.push(this.messages[m].getListObject());
		}
	}
	
	return returnArray;
}

ircChannel.prototype.addNick = function(nick)
{
	if (this.nicks.indexOf(nick) === -1)
	{
		this.nicks.push(nick);
		this.updateUserCount();
	}
}
ircChannel.prototype.removeNick = function(nick)
{
	if (this.nicks.indexOf(nick) !== -1)
	{
		this.nicks = this.nicks.without(nick);
		if (!nick.me)
		{
			this.updateUserCount();
		}
	}
}
ircChannel.prototype.containsNick = function(nick)
{
	return (this.nicks.indexOf(nick) !== -1);
}
ircChannel.prototype.getListNicks = function()
{
	try
	{
		var returnArray = [];
		
		if (this.server.nicks.length > 0)
		{
			for (var n = 0; n < this.server.nicks.length; n++)
			{
				if (this.server.nicks[n].channels.indexOf(this) > -1) 
				{
					returnArray.push(this.server.nicks[n].getListObject(this));
				}
			}
		}
		
		return returnArray;
	}
	catch (e)
	{
		Mojo.Log.logException(e, "ircChannel#getNick");
	}
}
ircChannel.prototype.tabNick = function(tabText, nick)
{
	var start = this.nicks.indexOf(nick) + 1;
	
	if (!tabText)
	{
		return nick;
	}

	for (var i = start; i < this.nicks.length; i++)
	{
		if (this.nicks[i].name.toLowerCase().startsWith(tabText.toLowerCase()))
		{
			return this.nicks[i];
		}
	}

	if (start > 0)
	{
		for (var i = 0; i < start; i++)
		{
			if (this.nicks[i].name.toLowerCase().startsWith(tabText.toLowerCase()))
			{
				return this.nicks[i]
			}
		}
	}

	return false;
}

ircChannel.prototype.setMode = function(mode)
{	// i would just call this "mode" but thats the name of the variable that holds the mode for this channel
	if (mode)
	{
		plugin.cmd_channel_mode(servers.getServerArrayKey(this.server.id), this.name, mode);
	}
}
ircChannel.prototype.modeHandler = function(payload)
{
	// this doesn't really need anything
}

ircChannel.prototype.kick = function(nick, reason)
{
	if (!reason) reason = 'No Reason';
	if (nick && this.containsNick(nick))
	{
		plugin.cmd_kick(servers.getServerArrayKey(this.server.id), this.name, nick.name, reason);
	}
}
ircChannel.prototype.kickHandler = function(payload)
{
	// this doesn't really need anything
}

ircChannel.prototype.join = function()
{
	plugin.cmd_join(servers.getServerArrayKey(this.server.id), this.name, this.key?this.key:null);
	plugin.cmd_channel_mode(servers.getServerArrayKey(this.server.id), this.name, null);
	this.openStage();
}
ircChannel.prototype.joinHandler = function(payload)
{
	/*
	if (payload.returnValue == 0)
	{
		this.openStage();
	}
	*/
}

ircChannel.prototype.channelMode = function(mode)
{
	this.mode = mode;
	if (this.chatAssistant && this.chatAssistant.controller) 
	{
		this.chatAssistant.updateTitle();
	}
}
ircChannel.prototype.channelModeHandler = function(payload)
{
	if (payload.returnValue == 0)
	{
		// Do something ?
	}
}

ircChannel.prototype.part = function()
{
	plugin.cmd_part(servers.getServerArrayKey(this.server.id), this.name);
	this.close();
}

ircChannel.prototype.clearMessages = function()
{
	this.messages = [];
}

ircChannel.prototype.close = function()
{
	if (this.chatAssistant && this.chatAssistant.controller)
	{
		this.chatAssistant.controller.window.close();
	}
}

ircChannel.prototype.openDash = function(message)
{
	try
	{
		Mojo.Controller.appController.showBanner
		(
			{
				icon: 'icon-channel.png',
				messageText: (this.server.channels.length>1?this.name+' / ':'') + message.nick + ': ' + message.message,
				soundClass: (prefs.get().dashboardChannelSound?"alerts":"")
			},
			{
				type: 'channel',
				server: this.server.id,
				channel: this.name
			},
			'channel-' + this.name
		);
		
		this.dashController = Mojo.Controller.appController.getStageController(this.dashName);
	    if (this.dashController) 
		{
			this.dashController.delegateToSceneAssistant("updateMessage", message.nick, message.message);
		}
		else
		{
			this.dashMessage = message;
			Mojo.Controller.appController.createStageWithCallback({name: this.dashName, lightweight: true}, this.openDashCallback.bind(this), "dashboard");
		}
	}
	catch (e)
	{
		Mojo.Log.logException(e, "ircChannel#openDash");
	}
}
ircChannel.prototype.openDashCallback = function(controller)
{
	controller.pushScene('channel-dashboard', this, this.dashMessage);
}
ircChannel.prototype.closeDash = function()
{
	Mojo.Controller.appController.removeBanner('channel-' + this.name);
	Mojo.Controller.appController.closeStage(this.dashName);
}

ircChannel.prototype.openStage = function()
{
	try
	{
		this.stageController = Mojo.Controller.appController.getStageController(this.stageName);
	
        if (this.stageController) 
		{
			if (this.stageController.activeScene().sceneName == 'channel-chat') 
			{
				this.stageController.activate();
			}
			else
			{
				this.stageController.popScenesTo('channel-chat');
				this.stageController.activate();
			}
		}
		else
		{
			Mojo.Controller.appController.createStageWithCallback({name: this.stageName, lightweight: true}, this.openStageCallback.bind(this));
		}
	}
	catch (e)
	{
		Mojo.Log.logException(e, "ircChannel#openStage");
	}
}
ircChannel.prototype.openStageCallback = function(controller)
{
	controller.pushScene('channel-chat', this);
}

ircChannel.prototype.setDashAssistant = function(assistant)
{
	this.dashAssistant = assistant;
}
ircChannel.prototype.setChatAssistant = function(assistant)
{
	this.chatAssistant = assistant;
}
ircChannel.prototype.setUsersAssistant = function(assistant)
{
	this.usersAssistant = assistant;
}

ircChannel.prototype.updateUserCount = function()
{
	if (this.chatAssistant && this.chatAssistant.controller)
	{
		this.chatAssistant.updateUserCount();
	}
	
	// users assistant may also need to be updated (for mode changes/kicks/etc)
	if (this.usersAssistant && this.usersAssistant.controller)
	{
		this.usersAssistant.updateList();
	}
}
ircChannel.prototype.updateChatList = function()
{
	if (this.chatAssistant && this.chatAssistant.controller)
	{
		this.chatAssistant.updateList();
	}
	
	// users assistant may also need to be updated (for mode changes/kicks/etc)
	if (this.usersAssistant && this.usersAssistant.controller)
	{
		this.usersAssistant.updateList();
	}
}
ircChannel.prototype.updateAppMenu = function()
{
	if (this.chatAssistant && this.chatAssistant.controller)
	{
		this.chatAssistant.updateAppMenu();
	}
}
ircChannel.prototype.updateLagMeter = function()
{
	if (this.chatAssistant && this.chatAssistant.controller)
	{
		this.chatAssistant.updateLagMeter();
	}
}
