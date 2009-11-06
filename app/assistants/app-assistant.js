function AppAssistant() {}

// our main stage
var serverStage = 'serverStage';

// load our database object
var db = new database();

// holds the preferences cookie
var prefs = new prefCookie();

// holds the servers
var servers = new ircServers();

AppAssistant.prototype.handleLaunch = function(params)
{
	try
	{
		var serverController = this.controller.getStageController(serverStage);
		
		if (!params)
		{
	        if (serverController)
			{
				serverController.popScenesTo('server-list');
				serverController.activate();
			}
			else
			{
				var f = function(controller)
				{
					controller.pushScene('server-list');
				};
				this.controller.createStageWithCallback({name: serverStage, lightweight: true}, f);
			}
		}
		else if (params.type == 'query')
		{
			var tmpServer = servers.getServerForId(params.server);
			if (tmpServer)
			{
				var tmpNick = tmpServer.getNick(params.nick);
				if (tmpNick) 
				{
					var tmpQuery = tmpServer.getQuery(tmpNick);
					if (tmpQuery)
					{
						tmpQuery.closeDash();
						tmpQuery.openStage();
					}
				}
			}
		}
		else if (params.type == 'channel')
		{
			var tmpServer = servers.getServerForId(params.server);
			if (tmpServer)
			{
				var tmpChannel = tmpServer.getChannel(params.channel);
				if (tmpChannel)
				{
					tmpChannel.closeDash();
					tmpChannel.openStage();
				}
			}
		}
		else
		{
			// for debug
			/*
			alert('---');
			for (var p in params)
			{
				alert(p + ': ' + params[p]);
			}
			*/
		}
	}
	catch (e)
	{
		Mojo.Log.logException(e, "AppAssistant#handleLaunch");
	}
}

AppAssistant.prototype.cleanup = function()
{
  if (servers.servers)
  {
    servers.servers.each(function(s){
        s && s.disconnect();
    });
  }
}


AppAssistant.prototype.getStageCount = function()
{
	var count = 0;
	
	// test server list stage
	if (this.controller.getStageController(serverStage)) count++;
	
	if (servers.servers.length > 0)
	{
		for (var s = 0; s < servers.servers.length; s++)
		{
			// test server status stage
			if (this.controller.getStageController(servers.servers[s].stageName)) count++;
			
			if (servers.servers[s].channels.length > 0)
			{
				for (var c = 0; c < servers.servers[s].channels.length; c++) 
				{
					// test channel chat stage
					if (this.controller.getStageController(servers.servers[s].channels[c].stageName)) count++;
					
					// test channel dashboard stage
					if (this.controller.getStageController(servers.servers[s].channels[c].dashName)) count++;
				}
			}
			
			if (servers.servers[s].queries.length > 0)
			{
				for (var q = 0; q < servers.servers[s].queries.length; q++) 
				{
					// test query chat stage
					if (this.controller.getStageController(servers.servers[s].queries[q].stageName)) count++;
					
					// test query dashboard stage
					if (this.controller.getStageController(servers.servers[s].queries[q].dashName)) count++;
				}
			}
		}
	}
	
	return count;
}
