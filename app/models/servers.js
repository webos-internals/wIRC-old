function ircServers()
{
	this.servers =			[];
	this.listAssistant =	false;
	this.load();
}

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
			returnArray.push(this.servers[s].getListObject());
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
			if (this.servers.id == id)
			{
				return s;
			}
		}
	}
	return false;
}

ircServers.prototype.load = function()
{
	this.servers = [];
	db.getServers(this.loadResponse.bind(this));
}
ircServers.prototype.loadResponse = function(results)
{
	if (results.rows.length > 0)
	{
		for(var s = 0; s < results.rows.length; s++)
		{
			//alert('Loaded Server #' + results.rows.item(s)['id'] + ' - ' + results.rows.item(s)['alias']);
			var newServer = new ircServer(results.rows.item(s));
			this.servers.push(newServer);
		}
	}
	if (this.listAssistant)
	{
		this.listAssistant.updateList();
	}
}

ircServers.prototype.newServer = function(params)
{
	db.saveServer(params, ircServer.newServerResponse);
}
ircServers.prototype.newServerResponse = function(results)
{
	var newServer = new ircServer(results.rows.item(0));
	this.servers.push(newServer);
}
