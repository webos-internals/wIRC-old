function ircServers()
{
	
	this.cmSubscription =	connectionmanager.watchStatus(this.cmHandler.bindAsEventListener(this));
	
	this.cookie =			new Mojo.Model.Cookie('servers');
	this.cookieData =		false;
	
	this.servers =			[];
	this.listAssistant =	false;
}

ircServers.prototype.cmHandler = function(payload)
{	
	if (payload.returnValue)
	{
		connectionInfo = payload;
		this.load();
		return;	
	}
	
	var connectionInfoOld = connectionInfo;
	connectionInfo = payload;
	
	for (var s=0; s<this.servers.length; s++)
	{
		if (!connectionInfo.isInternetConnectionAvailable)
		{
			if (this.servers[s].isConnected())
				this.servers[s].disrupt();	
		}
		else
		{
			if (this.servers[s].isDisrupted())
				this.servers[s].init();
		}
	}
		
}

/*ircServers.prototype.cmHandler = function(payload)
{
	connectionInfo = payload;
	if (payload.returnValue)
	{
		this.load();
	}
	return;
	
	// Needs a lot of testing
	if (!payload.returnValue)
	{
		this.newMessage('status', false, 'ip ' + this.ipAddress);
		if (this.ipAddress)
		{ 
			if (!this.ipMatches(payload.wifi) && !this.ipMatches(payload.wan))
			{
				if (payload.isInternetConnectionAvailable)
				{
					if (this.timerId)
					{
						this.reconnect = true;
						this.newMessage('status', false, 'disconnecting, but mark alternate connection' + this.dcThreshold);
					}
					else
					{
						this.reconnect = false;
						this.timerId = setTimeout(this.maybeReconnect.bind(this), this.dcThreshold);
						this.newMessage('status', false, 'reconnect after threshold ' + this.dcThreshold);
					}
					return;
				}
				else
				{
					// disconnect in 5 seconds if connection doesn't come back
					this.reconnect = false;
					this.newMessage('status', false, 'disconnect after threshold ' + this.dcThreshold);
					this.timerId = setTimeout(this.disconnect.bind(this), this.dcThreshold);
				}
				return;
			}

			if (this.timerId)
			{
				clearTimeout(this.timerId);
				this.timerId = false;
			}

			if (this.reconnectOnBetter)
			{
				if (this.ipDiffers(payload.wifi))
				{
					this.maybeReconnect();
				}
				else if (this.ipDiffers(payload.wan))
				{
					this.maybeReconnect(payload.wan.network);
				}
				return;
			}
		}
		else
		{
			if (payload.isInternetConnectionAvailable)
			{
				clearTimeout(this.timerId);
				this.timerId = false;
				this.newMessage('status', false, 'connected or connect... ' + this.connected);
				this.connected || this.connect();
			}
		}

		this.newMessage('status', false, '--- CM f ---');
	}
}*/

ircServers.prototype.setListAssistant = function(assistant)
{
	this.listAssistant = assistant;
}

ircServers.prototype.getListObjects = function()
{
	var returnArray = [];
	if (this.servers.length > 0)
	{
		for (var s = 0; s < this.servers.length; s++)
		{
			if (this.servers[s]) 
			{
				returnArray.push(this.servers[s].getListObject());
			}
		}
	}
	return returnArray;
}
ircServers.prototype.getServerArrayKey = function(id)
{
	if (this.servers.length > 0)
	{
		for (var s = 0; s < this.servers.length; s++)
		{
			if (this.servers[s].id == id)
			{
				return s;
			}
		}
	}
	return false;
}
ircServers.prototype.getServerForId = function(id)
{
	if (this.servers.length > 0)
	{
		for (var s = 0; s < this.servers.length; s++)
		{
			if (this.servers[s].id == id)
			{
				return this.servers[s];
			}
		}
	}
	return false;
}

ircServers.prototype.load = function()
{
	this.cookieData = this.cookie.get();
	if (this.cookieData)
	{
		if (this.cookieData.servers && this.cookieData.servers.length > 0) 
		{
			for (var s = 0; s < this.cookieData.servers.length; s++) 
			{
				this.loadServer(this.cookieData.servers[s]);
			}
		}
	}
	else
	{
		this.cookieData = 
		{
			serial: 0,
			servers: []
		};
	}
	
	if (this.listAssistant)
	{
		this.listAssistant.updateList();
	}
}
ircServers.prototype.loadServer = function(id)
{
	var serverCookie = new Mojo.Model.Cookie('server-' + id);
	var serverParams = serverCookie.get();
	if (serverParams)
	{
		var newServer = new ircServer(serverParams);
		this.servers.push(newServer);
		if (newServer.autoConnect) newServer.init();
	}
	if (this.listAssistant)
	{
		this.listAssistant.updateList();
	}
}
ircServers.prototype.loadTemporaryServer = function(serverParams)
{
	if (serverParams)
	{
		var newServer = new ircServer(serverParams);
		this.servers.push(newServer);
		newServer.init();
	}
	if (this.listAssistant)
	{
		this.listAssistant.updateList();
	}
}
ircServers.prototype.newServer = function(params, assistant)
{
	this.cookieData.serial++;
	this.cookieData.servers.push(this.cookieData.serial);
	this.cookie.put(this.cookieData);
	
	params.id = this.cookieData.serial;
	var serverCookie = new Mojo.Model.Cookie('server-' + params.id);
	serverCookie.put(params);
	
	this.loadServer(params.id);
	assistant.doneSaving();
}
ircServers.prototype.deleteServer = function(id)
{
	this.cookieData.servers = this.cookieData.servers.without(id);
	this.cookie.put(this.cookieData);
	
	var serverCookie = new Mojo.Model.Cookie('server-' + id);
	serverCookie.remove();
	
	var key = this.getServerArrayKey(id);
	if (this.servers[key].connected)
	{
		this.servers[key].disconnect();
	}
	this.servers[key] = false;
}
ircServers.prototype.deleteTemporaryServer = function(id)
{
	var key = this.getServerArrayKey(id);
	if (this.servers[key])
	{
		alert(key);
		this.servers[key] = false;
	}
	if (this.listAssistant)
	{
		this.listAssistant.updateList();
	}
}
