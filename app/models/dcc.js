function ircDcc(params)
{
	this.id =			params.dcc_id;
	this.nick =			params.nick;
	this.params =		params;
	this.server =		params.server;
	this.address =		params.address;
	this.filename =		params.filename;
	this.size =			params.size;
	
	this.messages =		[];
	
	
	this.requestBannerName =	'dcc-' + this.server.id + '-' + this.id;
	this.requestDashName =		'dccdash-' + this.server.id + '-' + this.id;
	
	
	this.chatBannerName =		'dccchatbanner-' + this.server.id + '-' + this.id;
	this.chatDashName =			'dccchatdash-' + this.server.id + '-' + this.id;
	this.chatDashController =	false;
	this.chatDashAssistant =	false;
	this.chatStageName =		'dccchat-' + this.server.id + '-' + this.id;
	this.chatStageController =	false;
	this.chatAssistant =		false;
}


ircDcc.prototype.isChat = function()
{
	return (this.filename && this.size ? false : true);
}
ircDcc.prototype.isFile = function()
{
	return (this.filename && this.size ? true : false);
}

ircDcc.prototype.openRequest = function()
{
	try
	{
		
		if (this.isFile()) {
			var msgText = this.nick.name + ' wants to send: ' + this.filename;
			var icon = 'icon-dcc-send.png';
		}
		else {
			var msgText = this.nick.name + ' wants to chat';
			var icon = 'icon-dcc-chat.png';
		}
		
		Mojo.Controller.appController.showBanner
		(
			{
				icon: icon,
				messageText: msgText,
				soundClass: (prefs.get().dashboardInviteSound?"alerts":"")
			},
			{
				type: 'dcc',
				server: this.server.id,
				id: this.id
			},
			this.requestBannerName
		);
					
		var tmpController = Mojo.Controller.appController.getStageController(this.requestDashName);
	    if (tmpController) 
		{
			// do nothing on second invite if dash already exists?
		}
		else
		{
			Mojo.Controller.appController.createStageWithCallback({name: this.requestDashName, lightweight: true}, this.openRequestCallback.bind(this), "dashboard");
		}
		
	}
	catch (e)
	{
		Mojo.Log.logException(e, "ircDcc#openRequest");
	}
}
ircDcc.prototype.openRequestCallback = function(controller)
{
	controller.pushScene('dcc-request-dashboard', this);
}
ircDcc.prototype.closeRequest = function()
{
	try
	{
		Mojo.Controller.appController.removeBanner(this.requestBannerName);
		Mojo.Controller.appController.closeStage(this.requestDashName);
	}
	catch (e)
	{
		Mojo.Log.logException(e, "ircDcc#closeRequest");
	}
}

ircDcc.prototype.accept = function()
{
	plugin.dcc_accept(servers.getServerArrayKey(this.server.id), this.id);
	if (this.isFile())
	{
		// do file send dash popup
	}
	else
	{
		this.openChatStage();
	}
}

ircDcc.prototype.handleEvent = function(status, length, data)
{
	alert('=======================');
	alert('status: ' + status);
	alert('length: ' + length);
	alert('data: ' + data);
	
	if (this.isChat())
	{
		alert('handleChatEvent');
	}
	else
	{
		alert('handleFileEvent');
	}
}


ircQuery.prototype.newCommand = function(message)
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

ircQuery.prototype.msg = function(message)
{
	var sid = servers.getServerArrayKey(this.server.id);
	var n = Math.ceil(message.length / 255);
	var i = 0;
	var msg = '';
	//alert('Message length: ' + message.length + ', n: ' + n);
	for (;i<n;i++) {
		if (i < (n - 1)) {
			msg = message.substring(i * 255, (i + 1) * 255)
		}
		else {
			msg = message.substring(i * 255);
		}
		plugin.dcc_msg(sid, this.id, msg);
		this.newMessage('privmsg', this.server.nick, msg);
	}
}

ircDcc.prototype.newMessage = function(type, nick, message)
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
ircDcc.prototype.getMessages = function(start)
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
ircDcc.prototype.getLastMessage = function()
{
	return this.messages[this.messages.length-1];
}

ircDcc.prototype.clearMessages = function()
{
	this.messages = [];
}

ircDcc.prototype.openChatDash = function()
{
	try
	{
		var lastMessage = this.getLastMessage().getNotificationObject();
		if (lastMessage.nick !== this.server.nick.name) // if its not from us, do dash junk
		{
			Mojo.Controller.appController.showBanner
			(
				{
					icon: 'icon-dcc-chat.png',
					messageText: lastMessage.nick + ': ' + lastMessage.message,
					soundClass: (prefs.get().dashboardQuerySound?"alerts":"")
				},
				{
					type: 'dccchat',
					server: this.server.id,
					dcc: this.dcc
				},
				this.chatBannerName
			);
			
			this.chatDashController = Mojo.Controller.appController.getStageController(this.chatDashName);
		    if (this.dashController) 
			{
				this.dashController.delegateToSceneAssistant("updateMessage", lastMessage.nick, lastMessage.message);
			}
			else
			{
				Mojo.Controller.appController.createStageWithCallback({name: this.chatDashName, lightweight: true}, this.openChatDashCallback.bind(this), "dashboard");
			}
		}
	}
	catch (e)
	{
		Mojo.Log.logException(e, "ircDcc#openDash");
	}
}
ircDcc.prototype.openChatDashCallback = function(controller)
{
	controller.pushScene('dcc-chat-dashboard', this);
}
ircDcc.prototype.closeChatDash = function()
{
	Mojo.Controller.appController.removeBanner(this.chatBannerName);
	Mojo.Controller.appController.closeStage(this.chatDashName);
}

ircDcc.prototype.openChatStage = function()
{
	try
	{
		this.chatStageController = Mojo.Controller.appController.getStageController(this.chatStageName);
	
        if (this.chatStageController) 
		{
			if (this.chatStageController.activeScene().sceneName == 'dcc-chat') 
			{
				this.chatStageController.activate();
			}
			else
			{
				this.chatStageController.popScenesTo('dcc-chat');
				this.chatStageController.activate();
			}
		}
		else
		{
			Mojo.Controller.appController.createStageWithCallback({name: this.chatStageName, lightweight: true}, this.openChatStageCallback.bind(this));
		}
	}
	catch (e)
	{
		Mojo.Log.logException(e, "ircDcc#openStage");
	}
}
ircDcc.prototype.openChatStageCallback = function(controller)
{
	controller.pushScene('dcc-chat', this);
}
ircDcc.prototype.closeChatStage = function()
{
	if (this.chatAssistant && this.chatAssistant.controller)
	{
		this.chatAssistant.controller.window.close();
	}
}

ircDcc.prototype.setChatDashAssistant = function(assistant)
{
	this.chatDashAssistant = assistant;
}
ircDcc.prototype.setChatAssistant = function(assistant)
{
	this.chatAssistant = assistant;
}

ircDcc.prototype.updateChatList = function()
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

