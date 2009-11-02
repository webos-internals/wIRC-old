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
