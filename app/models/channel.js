function ircChannel(params)
{
	this.name =				params.name;
	this.server =			params.server;
	
	this.nicks =			[];
	this.messages =			[];
	
	this.stageName =		'channel-' + this.server.id + '-' + this.name;
	this.stageController =	false;
	this.chatAssistant =	false;
}

ircChannel.prototype.newCommand = function(message)
{
	var cmdRegExp = new RegExp(/^\/([^\s]*)[\s]*(.*)$/);
	var match = cmdRegExp.exec(message);
	if (match)
	{
		var cmd = match[1];
		var val = match[2];
		
		switch(cmd.toLowerCase())
		{
			case 'nick':
			case 'j':
			case 'join':
				// forward these messages to the server object
				this.server.newCommand(message);
				break;
				
			case 'me':
				this.newAction(val);
				break;
				
			default: // this could probably be left out later
				this.newStatusMessage('Unknown Command: ' + cmd);
				break;
		}
	}
	else
	{
		// normal message
		this.newMessage(message);
	}
}

ircChannel.prototype.newAction = function(message)
{
	var m = new ircMessage({type:'channel-action', nick:this.server.nick, message:message});
	this.messages.push(m);
}
ircChannel.prototype.newMessage = function(message)
{
	var m = new ircMessage({type:'channel-message', nick:this.server.nick, message:message});
	this.messages.push(m);
}
ircChannel.prototype.newStatusMessage = function(message)
{
	var m = new ircMessage({type:'status', message:message});
	this.messages.push(m);
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

ircChannel.prototype.setChatAssistant = function(assistant)
{
	this.chatAssistant = assistant;
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
