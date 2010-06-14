function ircDccChat(params)
{
	this.nick =				params.nick;
	this.server =			params.server;
	this.params =			params;
	
	this.messages =			[];
	
	this.dashName =			'querydash-' + this.server.id + '-' + this.nick.name;
	this.dashController =	false;
	this.dashAssistant =	false;
	this.stageName =		'query-' + this.server.id + '-' + this.nick.name;
	this.stageController =	false;
	this.chatAssistant =	false;
}

ircDccChat.prototype.newCommand = function(message)
{
	if (this.server.isConnected())
	{
		
		cmdHistoryIndex = 0;
		cmdHistory.push(message);
		if (cmdHistory.length>prefs.get().cmdHistoryMax)
			cmdHistory.pop();
		
		var cmdRegExp = new RegExp(/^\/([^\s]*)[\s]*(.*)$/);
		var match = cmdRegExp.exec(message);
		if (match)
		{
			var cmd = match[1];
			var val = match[2];
			
			switch(cmd.toLowerCase())
			{
				case 'me':
					this.me(val);
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

ircDccChat.prototype.me = function(message)
{
	plugin.cmd_me(servers.getServerArrayKey(this.server.id), this.nick.name, message);
	this.newMessage('action', this.server.nick, message);
}

ircDccChat.prototype.msg = function(message)
{
	var sid = servers.getServerArrayKey(this.server.id);
	var n = Math.ceil(message.length / 255);
	var i = 0;
	var msg = '';
	alert('Message length: ' + message.length + ', n: ' + n);
	for (;i<n;i++) {
		if (i < (n - 1)) {
			msg = message.substring(i * 255, (i + 1) * 255)
		}
		else {
			msg = message.substring(i * 255);
		}
		plugin.cmd_msg(servers.getServerArrayKey(this.server.id), this.nick.name, msg);
		this.newMessage('privmsg', this.server.nick, msg);
	}
}

ircDccChat.prototype.newMessage = function(type, nick, message)
{
	var obj =
	{
		type:		type,
		nick:		nick,
		message:	message,
		me:			this.server.nick.name
	};
	var newMsg = new ircMessage(obj);
	this.messages.push(newMsg);
	this.updateChatList();
}
ircDccChat.prototype.getMessages = function(start)
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
ircDccChat.prototype.getLastMessage = function()
{
	return this.messages[this.messages.length-1];
}

ircDccChat.prototype.clearMessages = function()
{
	this.messages = [];
}

ircDccChat.prototype.openDash = function()
{
	try
	{
		var lastMessage = this.getLastMessage().getNotificationObject();
		if (lastMessage.nick !== this.server.nick.name) // if its not from us, do dash junk
		{
			Mojo.Controller.appController.showBanner
			(
				{
					icon: 'icon-query.png',
					messageText: lastMessage.nick + ': ' + lastMessage.message,
					soundClass: (prefs.get().dashboardQuerySound?"alerts":"")
				},
				{
					type: 'query',
					server: this.server.id,
					nick: this.nick.name
				},
				'query-' + this.nick.name
			);
			
			this.dashController = Mojo.Controller.appController.getStageController(this.dashName);
		    if (this.dashController) 
			{
				this.dashController.delegateToSceneAssistant("updateMessage", lastMessage.nick, lastMessage.message);
			}
			else
			{
				Mojo.Controller.appController.createStageWithCallback({name: this.dashName, lightweight: true}, this.openDashCallback.bind(this), "dashboard");
			}
		}
	}
	catch (e)
	{
		Mojo.Log.logException(e, "ircDccChat#openDash");
	}
}
ircDccChat.prototype.openDashCallback = function(controller)
{
	controller.pushScene('query-dashboard', this);
}
ircDccChat.prototype.closeDash = function()
{
	Mojo.Controller.appController.removeBanner('query-' + this.nick.name);
	Mojo.Controller.appController.closeStage(this.dashName);
}

ircDccChat.prototype.openStage = function()
{
	try
	{
		this.stageController = Mojo.Controller.appController.getStageController(this.stageName);
	
        if (this.stageController) 
		{
			if (this.stageController.activeScene().sceneName == 'query-chat') 
			{
				this.stageController.activate();
			}
			else
			{
				this.stageController.popScenesTo('query-chat');
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
		Mojo.Log.logException(e, "ircDccChat#openStage");
	}
}
ircDccChat.prototype.openStageCallback = function(controller)
{
	controller.pushScene('query-chat', this);
}
ircDccChat.prototype.closeStage = function()
{
	if (this.chatAssistant && this.chatAssistant.controller)
	{
		this.chatAssistant.controller.window.close();
	}
}

ircDccChat.prototype.setDashAssistant = function(assistant)
{
	this.dashAssistant = assistant;
}
ircDccChat.prototype.setChatAssistant = function(assistant)
{
	this.chatAssistant = assistant;
}

ircDccChat.prototype.updateChatList = function()
{
	if (this.chatAssistant && this.chatAssistant.controller)
	{
		this.chatAssistant.updateList();
		if (!this.chatAssistant.isVisible)
		{
			this.openDash();
		}
	}
	else // if there is no window to update, push/update banner/dash
	{
		this.openDash();
	}
}
ircDccChat.prototype.updateLagMeter = function()
{
	if (this.chatAssistant && this.chatAssistant.controller)
	{
		this.chatAssistant.updateLagMeter();
	}
}
