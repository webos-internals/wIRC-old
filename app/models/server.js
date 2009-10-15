function ircServer(params)
{
	this.id =				params.id;
	this.alias =			params.alias;
	this.address =			params.address;
	this.port =				params.port;
	this.autoConnect =		(params.autoConnect=='true'?true:false);
	this.connected =		false;
	this.statusAssistant =	false;
	this.channels =			[];
	
	if (this.autoConnect)
	{
		this.connect();
	}
}

ircServer.prototype.connect = function()
{
	this.connected = true;
}
ircServer.prototype.disconnect = function()
{
	this.connected = false;
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

ircServer.prototype.saveInfo = function()
{
	db.saveServer(this, this.saveInfoResponse.bind(this));
}
ircServer.prototype.saveInfoResponse = function(results) {}
