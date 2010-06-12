// our main stage
var serverStage = 'serverStage';

// load our database object
var db = new database();

// get the cookies
var prefs = new preferenceCookie();
var vers =  new versionCookie();

// holds the servers
var servers = new ircServers();

// Command History
var cmdHistory = [];
var cmdHistoryIndex = 0;

// max servers
var MAX_SERVERS = 3;

// the plugin
var plugin = null;

var wircPlugin;

function AppAssistant() {
	wircPlugin = new wircPlugin();
}

AppAssistant.prototype.handleLaunch = function(params)
{	
	try
	{
		var serverController = this.controller.getStageController(serverStage);
		
		if (!params || params.type == 'connect')
		{
	        if (serverController)
			{
				var scenes = serverController.getScenes();
				if (scenes[0].sceneName == 'server-list' && scenes.length > 1)
				{
					serverController.popScenesTo('server-list');
				}
				serverController.activate();
			}
			else
			{
				var f = function(controller)
				{
					vers.init();
					controller.window.document.body.appendChild(wircPlugin.df);
					plugin = controller.get('wircPlugin');
					
					if (vers.showStartupScene())
						controller.pushScene('startup');
					else if (prefs.get().realname.length==0 || prefs.get().nicknames.length==0)
						controller.pushScene('identity', true, true);
					else
						controller.pushScene('server-list');
				};
				this.controller.createStageWithCallback({name: serverStage, lightweight: true}, f.bind(this));
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
		else if (params.type == 'invite')
		{
			var tmpServer = servers.getServerForId(params.server);
			if (tmpServer)
			{
				tmpServer.closeInvite(params.nick, params.channel);
				tmpServer.joinChannel(params.channel);
			}
		}
		
		if (params.type == 'connect' && params.address && params.join)
		{
			/* 
			 * this will connect to and temporary server and join a channel
			 * 
			 * required params:
			 * 	type: 'connect'
			 *  address: address of irc server to connect to
			 *  join: channel to join on connect
			 *  
			 * optional params:
			 *  alias: will be displayed in the server-list
			 *  nick: a nick to default the user to if one isn't setup
			 */
			var tmpServerId = 'temp'+Math.round(new Date().getTime()/1000.0);
			if (servers.getServerArrayKey(tmpServerId) === false)
			{
				var tempServer = 
				{
					id:					tmpServerId,
					alias:				(params.alias?params.alias:'Temporary Server'),
					address:			params.address,
					serverUser:			'',
					serverPassword:		'',
					port:				'',
					autoConnect:		true,
					autoIdentify:		false,
					identifyService:	'',
					identifyPassword:	'',
					onConnect:			['/j '+params.join],
					favoriteChannels:	[],
					defaultNick:		(prefs.get().nicknames[0]?prefs.get().nicknames[0]:(params.nick?params.nick:'wIRCer_'+Math.floor(Math.random()*9999))),
					isTemporary:		true
				};
				servers.loadTemporaryServer(tempServer);
				if (servers.listAssistant)
				{
					servers.servers[servers.getServerArrayKey(tmpServerId)].init();
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
	alert('AppAssistant#cleanup');
	//this.controller.closeAllStages();
}


AppAssistant.prototype.getStages = function()
{
	var stages = [];
	
	// test server list stage
	if (this.controller.getStageController(serverStage)) stages.push(serverStage);
	
	if (servers.servers.length > 0)
	{
		for (var s = 0; s < servers.servers.length; s++)
		{
			// test server status stage
			if (this.controller.getStageController(servers.servers[s].stageName)) stages.push(servers.servers[s].stageName);
			
			// test server channel list stage
			if (this.controller.getStageController(servers.servers[s].listStageName)) stages.push(servers.servers[s].listStageName);

			// test channel chat stages
			if (servers.servers[s].channels.length > 0)
			{
				for (var c = 0; c < servers.servers[s].channels.length; c++) 
				{
					if (this.controller.getStageController(servers.servers[s].channels[c].stageName)) stages.push(servers.servers[s].channels[c].stageName);
				}
			}

			// test query chat stages
			if (servers.servers[s].queries.length > 0)
			{
				for (var q = 0; q < servers.servers[s].queries.length; q++) 
				{
					if (this.controller.getStageController(servers.servers[s].queries[q].stageName)) stages.push(servers.servers[s].queries[q].stageName);
				}
			}

			// test nick whois stages
			if (servers.servers[s].nicks.length > 0)
			{
				for (var n = 0; n < servers.servers[s].nicks.length; n++) 
				{
					if (this.controller.getStageController(servers.servers[s].nicks[n].whoisStageName)) stages.push(servers.servers[s].nicks[n].whoisStageName);
				}
			}
		}
	}
	
	return stages;
}
AppAssistant.prototype.updateTheme = function(theme)
{
	stages = this.getStages();
	if (stages.length > 0)
	{
		for (var s = 0; s < stages.length; s++)
		{
			try
			{
				this.controller.getStageController(stages[s]).activeScene().assistant.controller.document.body.className = theme;
			}
			catch (e) {}
		}
	}
}
