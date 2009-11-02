function ircQuery(params)
{
	this.nick =				params.nick;
	this.server =			params.server;
	
	this.messages =			[];
	
	this.dashName =			'querydash-' + this.server.id + '-' + this.nick.name;
	this.dashController =	false;
	this.dashAssistant =	false;
	this.stageName =		'query-' + this.server.id + '-' + this.nick.name;
	this.stageController =	false;
	this.chatAssistant =	false;
}

ircQuery.prototype.newCommand = function(message)
{
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

ircQuery.prototype.me = function(message)
{
	wIRCd.me(this.meHandler.bindAsEventListener(this), this.server.sessionToken, this.nick.name, message);
	this.newAction(this.server.nick, message);
}
ircQuery.prototype.meHandler = function(payload)
{
	// this apparently doesn't return anything of importance
}

ircQuery.prototype.msg = function(message)
{
	wIRCd.msg(this.msgHandler.bindAsEventListener(this), this.server.sessionToken, this.nick.name, message);
	this.newMessage(this.server.nick, message);
}
ircQuery.prototype.msgHandler = function(payload)
{
	// this apparently doesn't return anything of importance
}

ircQuery.prototype.newMessage = function(nick, message)
{
	var m = new ircMessage({type:'channel-message', nick:nick, message:message});
	this.messages.push(m);
	this.updateChatList();
}
ircQuery.prototype.newAction = function(nick, message)
{
	var m = new ircMessage({type:'channel-action', nick:nick, message:message});
	this.messages.push(m);
	this.updateChatList();
}
ircQuery.prototype.newStatusMessage = function(message)
{
	var m = new ircMessage({type:'status', message:message});
	this.messages.push(m);
	this.updateChatList();
}
ircQuery.prototype.newEventMessage = function(message)
{
	var m = new ircMessage({type:'channel-event', message:message});
	this.messages.push(m);
	this.updateChatList();
}
ircQuery.prototype.newDebugMessage = function(message)
{
	var m = new ircMessage({type:'debug', message:message});
	this.messages.push(m);
	this.updateChatList();
}
ircQuery.prototype.getMessages = function(start)
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
ircQuery.prototype.getLastMessage = function()
{
	return this.messages[this.messages.length-1].getListObject();
}

ircQuery.prototype.openDash = function()
{
	var lastMessage = this.getLastMessage();
	if (lastMessage.nick !== this.server.nick.name) // if its not from us, do dash junk
	{
		Mojo.Controller.appController.showBanner({messageText: lastMessage.nick + ': ' + lastMessage.message}, {type: 'query', server: this.server.id, nick: this.nick.name}, 'query-' + this.nick.name);
		
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
ircQuery.prototype.openDashCallback = function(controller)
{
	controller.pushScene('query-dashboard', this);
}
ircQuery.prototype.closeDash = function()
{
	Mojo.Controller.appController.removeBanner('query-' + this.nick.name);
	Mojo.Controller.appController.closeStage(this.dashName);
}

ircQuery.prototype.openStage = function()
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
		Mojo.Log.logException(e, "ircQuery#openStage");
	}
}
ircQuery.prototype.openStageCallback = function(controller)
{
	controller.pushScene('query-chat', this);
}
ircQuery.prototype.setDashAssistant = function(assistant)
{
	this.dashAssistant = assistant;
}
ircQuery.prototype.setChatAssistant = function(assistant)
{
	this.chatAssistant = assistant;
}
ircQuery.prototype.updateChatList = function()
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
