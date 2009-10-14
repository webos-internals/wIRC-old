function ircServer(params)
{
	this.id =				params.id;
	this.alias =			params.alias;
	this.server =			params.server;
	this.port =				params.port;
	this.autoConnect =		params.autoConnect;
	this.connected =		false;
	this.statusAssistant =	false;
	this.channels =			[];
}

ircServer.prototype.setStatusAssistant = function(assistant)
{
	this.statusAssistant = assistant;
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
		key:	servers.getServerArrayKey(this.id),
		id:		this.id,
		alias:	this.alias,
		status:	(this.connected?'Connected':'Disconnected')
	};
	return obj;
}
