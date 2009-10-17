function ircServer(params)
{
	this.id =				params.id;
	this.alias =			params.alias;
	this.address =			params.address;
	this.port =				params.port;
	this.autoConnect =		(params.autoConnect=='true'?true:false);
	this.connected =		false;
	this.channels =			[];
	this.nicks =			[];
	this.statusMessages =	[];
	
	this.stageName =		'status-' + this.id;
	this.stageController =	false;
	this.statusAssistant =	false;
	
	if (this.autoConnect)
	{
		this.connect();
	}
	
	// for testing
	this.loadStatusMessages();
}

ircServer.prototype.loadStatusMessages = function()
{
	var n = new ircNick({name:'test'});
	this.nicks.push(n);
	var n = new ircNick({name:'tester'});
	this.nicks.push(n);
	var n = new ircNick({name:'really_long_name'});
	this.nicks.push(n);
	
	
	this.newMessage({type: 'channel-message', nick: this.nicks[1], message: 'channel-message'});
	this.newMessage({type: 'channel-action', nick: this.nicks[1], message: 'is action-message'});
	this.newMessage({type: 'channel-event', message: 'channel-event'});
	this.newMessage({type: 'status', message: 'status'});
	this.newMessage({type: 'channel-message', nick: this.nicks[2], message: 'channel-message'});
	
	for (var m = 1; m <= 40; m++) 
	{
		this.newMessage({type: 'channel-message', nick: this.nicks[1], message: 'message #' + m});
	}
}
ircServer.prototype.newMessage = function(params)
{
	var m = new ircMessage(params);
	this.statusMessages.push(m);
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
	this.connected = true;
	
	if (servers.listAssistant)
	{
		servers.listAssistant.updateList();
	}
}
ircServer.prototype.disconnect = function()
{
	this.connected = false;
	
	if (servers.listAssistant)
	{
		servers.listAssistant.updateList();
	}
}

ircServer.prototype.setStatusAssistant = function(assistant)
{
	this.statusAssistant = assistant;
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

ircServer.prototype.joinChannel = function(name)
{
	var newChannel = new ircChannel(
	{
		name:	name,
		server:	this
	});
	newChannel.openStage();
	this.channels.push(newChannel);
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
		id:				this.id,
		alias:			this.alias,
		address:		this.address,
		port:			this.port,
		autoConnect:	this.autoConnect
	};
	return obj;
}

ircServer.prototype.saveInfo = function(params)
{
	if (ircServer.validateNewServer(params, false, false)) 
	{
		this.id =			params.id;
		this.alias =		params.alias;
		this.address =		params.address;
		this.port =			params.port;
		this.autoConnect =	params.autoConnect;
		
		db.saveServer(this, this.saveInfoResponse.bind(this));
	}
}
ircServer.prototype.saveInfoResponse = function(results) {}

ircServer.getBlankServerObject = function()
{
	var obj = 
	{
		id:				false,
		alias:			'',
		address:		'',
		port:			6667,
		autoConnect:	false
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

