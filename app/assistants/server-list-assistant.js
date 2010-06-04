function ServerListAssistant()
{	
	// subtitle random list
	this.randomSub = 
	[
		{weight: 30, text: 'The webOS IRC Client'},
		{weight: 50, text: 'Coming soon... SSL!'},
		{weight:  5, text: 'Now you can IRC from the crapper'},
		{weight:  2, text: 'You can, but can\'t'},
		{weight:  2, text: 'Random Taglines Are Awesome'}
	];
	
	this.serverListModel =
	{
		items: []
	};
	this.cmdMenuModel =
	{
		label: $L('Menu'),
		items: []
	};
	
	this.versionElement =		false;
	this.subTitleElement =		false;
	this.noServersElement =		false;
	this.serverListElement =	false;
	
	servers.setListAssistant(this);
	
	// setup menu
	this.menuModel =
	{
		visible: true,
		items:
		[
			{
				label: "Identity",
				command: 'do-ident'
			},
			{
				label: "Preferences",
				command: 'do-prefs'
			},
			{
				label: "About",
				command: 'do-about'
			}
		]
	}
}

ServerListAssistant.prototype.tryPlugin = function()
{
	try
	{
		plugin.get_version();
		pluginReady = true;
		this.checkPlugin();
	}
	catch (e)
	{
		this.timerID = setTimeout(this.tryPlugin.bind(this), 100);
	}
	finally
	{
		Mojo.Log.info("#######################################################");
		Mojo.Log.info("PluginReady: ", pluginReady);
		Mojo.Log.info("#######################################################");
	}
}

ServerListAssistant.prototype.setup = function()
{
	try
	{	
		this.tryPlugin();
		
		// set theme
		this.controller.document.body.className = prefs.get().theme;
		
		this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
		
		this.versionElement =		this.controller.get('version');
		this.subTitleElement =		this.controller.get('subTitle');
		this.noServersElement =		this.controller.get('noServers');
		this.serverListElement =	this.controller.get('serverList');
		
		this.listTapHandler =		this.listTapHandler.bindAsEventListener(this);
		this.listDeleteHandler =	this.listDeleteHandler.bindAsEventListener(this);
		
		this.versionElement.innerHTML = "v" + Mojo.Controller.appInfo.version;
		this.subTitleElement.innerHTML = this.getRandomSubTitle();
		
		this.updateList(true);
		this.controller.setupWidget('serverList', 
		{
			itemTemplate: "server-list/server-row",
			swipeToDelete: true,
			reorderable: false,
			spinnerSize: Mojo.Widget.spinnerSmall
		}, this.serverListModel);
		Mojo.Event.listen(this.serverListElement, Mojo.Event.listTap, this.listTapHandler);
		Mojo.Event.listen(this.serverListElement, Mojo.Event.listDelete, this.listDeleteHandler);
		
		this.updateCommandMenu(true);
		this.controller.setupWidget(Mojo.Menu.commandMenu, { menuClass: 'no-fade' }, this.cmdMenuModel);		
		
	} 
	catch (e) 
	{
		Mojo.Log.logException(e, 'server-list#setup');
	}
}

ServerListAssistant.prototype.checkPlugin = function()
{
	if (pluginReady)
	{
		this.controller.get('noPlugin').style.display = 'none';
		this.controller.get('yesPlugin').style.display = '';
		plugin.event_connect = this.event_connect_handler.bind(this);
		plugin.event_nick = this.event_nick_handler.bind(this);
		plugin.event_quit = this.event_quit_handler.bind(this);
		plugin.event_join = this.event_join_handler.bind(this);
		plugin.event_part = this.event_part_handler.bind(this);
		plugin.event_mode = this.event_mode_handler.bind(this);
		plugin.event_umode = this.event_umode_handler.bind(this);
		plugin.event_topic = this.event_topic_handler.bind(this);
		plugin.event_kick = this.event_kick_handler.bind(this);
		plugin.event_channel = this.event_channel_handler.bind(this);
		plugin.event_privmsg = this.event_privmsg_handler.bind(this);
		plugin.event_notice = this.event_notice_handler.bind(this);
		plugin.event_channel_notice = this.event_channel_notice_handler.bind(this);
		plugin.event_invite = this.event_invite_handler.bind(this);
		//plugin.event_ctcp_req = this.event_ctcp_req_handler.bind(this);
		//plugin.event_ctcp_rep = this.event_ctcp_rep_handler.bind(this);
		plugin.event_ctcp_action = this.event_ctcp_action_handler.bind(this);
		plugin.event_unknown = this.event_unknown_handler.bind(this);
		plugin.event_numeric = this.event_numeric_handler.bind(this);
		plugin.auto_ping = this.auto_ping_handler.bind(this);
	}
	else
	{
		this.controller.get('noPlugin').style.display = '';
		this.controller.get('yesPlugin').style.display = 'none';
	}
	this.updateCommandMenu();
}

ServerListAssistant.prototype.activate = function(event)
{
	
	this.checkPlugin();
	
	if (this.alreadyActivated)
	{
		this.updateList();
	}
	this.alreadyActivated = true;
}
ServerListAssistant.prototype.updateList = function(skipUpdate)
{
	try
	{
		this.serverListModel.items = [];
		this.serverListModel.items = servers.getListObjects();
		
		if (this.serverListModel.items.length > 0)
		{
			this.noServersElement.hide();
		}
		else
		{
			this.noServersElement.show();
		}
		
		if (!skipUpdate) 
		{
			this.serverListElement.mojo.noticeUpdatedItems(0, this.serverListModel.items);
			this.serverListElement.mojo.setLength(this.serverListModel.items.length);
		}
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'server-list#updateList');
	}
}
ServerListAssistant.prototype.changeNickPrompt = function()
{
	this.controller.showAlertDialog(
	{
		title:				'wIRC',
		allowHTMLMessage:	true,
		message:			'You should really change your nick away from the "wIRCer" default before connecting to this server.<br><br>' + 
							'You can do so by bringing down the app menu and selecting "Identity" and changing the "Primary" nick to something else.',
		choices:			[{label:$L('Ok'), value:''}],
		onChoose:			function(value){}
	});
}
ServerListAssistant.prototype.listTapHandler = function(event)
{
	if (event.originalEvent.target.className.include('prefs'))
	{
		this.controller.stageController.pushScene('server-info', event.item.id);
	}
	else if (event.originalEvent.target.className.include('status'))
	{		
		//event.originalEvent.target.up('.palm-row-wrapper').addClassName('changing');
		//if (event.item.connected)
		if (servers.servers[event.item.key].state > 0) 
		{
			servers.servers[event.item.key].disconnect();
		}
		else
		{
			//servers.servers[event.item.key].connect();
			servers.servers[event.item.key].init();
		}
	}
	else
	{
		servers.servers[event.item.key].showStatusScene(prefs.get().statusPop);
	}
}
ServerListAssistant.prototype.listDeleteHandler = function(event)
{
	servers.deleteServer(event.item.id);
}

ServerListAssistant.prototype.updateCommandMenu = function(skipUpdate)
{
	try
	{
		this.cmdMenuModel.visible = pluginReady;
		
		this.cmdMenuModel.items = [];
		this.cmdMenuModel.items.push({});
		this.cmdMenuModel.items.push({label: $L('New'), icon: 'new', command: 'new-server'});
		
		if (!skipUpdate)
		{
			this.controller.modelChanged(this.cmdMenuModel);
			this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
		}
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'server-list#updateList');
	}
}

ServerListAssistant.prototype.getRandomSubTitle = function()
{
	// loop to get total weight value
	var weight = 0;
	for (var r = 0; r < this.randomSub.length; r++)
	{
		weight += this.randomSub[r].weight;
	}
	
	// random weighted value
	var rand = Math.floor(Math.random() * weight);
	
	// loop through to find the random title
	for (var r = 0; r < this.randomSub.length; r++)
	{
		if (rand <= this.randomSub[r].weight)
		{
			return this.randomSub[r].text;
		}
		else
		{
			rand -= this.randomSub[r].weight;
		}
	}
	
	// if no random title was found (for whatever reason, wtf?) return first and best subtitle
	return this.randomSub[0].text;
}

ServerListAssistant.prototype.handleCommand = function(event)
{
	if (event.type == Mojo.Event.command)
	{
		switch (event.command)
		{
			case 'do-ident':
				this.controller.stageController.pushScene('identity', false, true);
				break;
				
			case 'do-prefs':
				this.controller.stageController.pushScene('preferences-general');
				break;
				
			case 'do-about':
				this.controller.stageController.pushScene('about');
				break;
				
			case 'new-server':
				//this.controller.stageController.pushScene('server-info');
				this.controller.stageController.pushScene('preconfigured-networks');
				break;
		}
	}
}

ServerListAssistant.prototype.deactivate = function(event) {}
ServerListAssistant.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.serverListElement, Mojo.Event.listTap, this.listTapHandler);
	Mojo.Event.stopListening(this.serverListElement, Mojo.Event.listDelete, this.listDeleteHandler);
}













ServerListAssistant.prototype.event_connect_handler = function(id, event, origin, params_s, ip)
{
	var id = parseInt(id);
	var params = JSON.parse(params_s);
	
	if (event=='MAXRETRIES')
	{
		servers.servers[id].setState(this.STATE_MAX_RETRIES);
		return;	
	}

	servers.servers[id].realServer = origin;
	
	servers.servers[id].nick = servers.servers[id].getNick(params[0]); 
	servers.servers[id].nick.me = true;
	
	servers.servers[id].sessionIpAddress = ip;
	if (connectionInfo.wan.state=='connected' && connectionInfo.wan.ipAddress==servers.servers[id].sessionIpAddress)
	{
		servers.servers[id].sessionInterface = "wan";
		servers.servers[id].sessionNetwork = connectionInfo.wan.network;
	}
	else
	{
		servers.servers[id].sessionInterface = "wifi";
		servers.servers[id].sessionNetwork = '';
	}
	
	servers.servers[id].setState(servers.servers[id].STATE_CONNECTED);

	servers.servers[id].runOnConnect.bind(servers.servers[id]).defer();
}

ServerListAssistant.prototype.event_part_handler = function(id, event, origin, params_s)
{
	var id = parseInt(id);	
	var params = JSON.parse(params_s);
	
	var tmpChan = servers.servers[id].getChannel(params[0]);
	if (tmpChan) 
	{
		var tmpNick = servers.servers[id].getNick(origin);
		tmpNick.removeChannel(tmpChan);
		if (tmpNick.me)
			servers.servers[id].removeChannel(tmpChan);
		tmpChan.newMessage('type5', false, tmpNick.name + ' (' + origin.split("!")[1] + ') has left ' + tmpChan.name + ' (' + params[1] + ')');
	}	
}

ServerListAssistant.prototype.event_invite_handler = function(id, event, origin, params_s)
{
	var id = parseInt(id);
	var params = JSON.parse(params_s);
	
	if (prefs.get().inviteAction != 'ignore') 
	{
		var tmpNick = servers.servers[id].getNick(origin);
		if (tmpNick && params[0].toLowerCase() === servers.servers[id].nick.name.toLowerCase())
		{
			tmpChan = servers.servers[id].getChannel(params[1]);
			if (!tmpChan || !tmpChan.containsNick(servers.servers[id].nick)) 
				servers.servers[id].openInvite(tmpNick.name, params[1]);
		}
	}
}

ServerListAssistant.prototype.event_channel_handler = function(id, event, origin, params_s)
{
	var id = parseInt(id);
	var params = JSON.parse(params_s);
	
	var tmpChan = servers.servers[id].getChannel(params[0]);
	if (tmpChan) 
	{
		var tmpNick = servers.servers[id].getNick(origin);
		tmpNick.addChannel(tmpChan);
		tmpChan.newMessage('privmsg', tmpNick, params[1]);
	}
}

ServerListAssistant.prototype.event_privmsg_handler = function(id, event, origin, params_s)
{
	var id = parseInt(id);
	var params = JSON.parse(params_s);
	
	var tmpNick = servers.servers[id].getNick(origin);
	var tmpQuery = servers.servers[id].getQuery(tmpNick);
	if (tmpQuery)
		tmpQuery.newMessage('privmsg', tmpNick, params[1]);
	else
		servers.servers[id].startQuery(tmpNick, false, 'message', params[1]);
}

ServerListAssistant.prototype.event_nick_handler = function(id, event, origin, params_s)
{
	var id = parseInt(id);
	var params = JSON.parse(params_s);
	
	var tmpNick = servers.servers[id].getNick(origin);
	if (tmpNick === servers.servers[id].nick)
		servers.servers[id].newMessage('type9', false, tmpNick.name + ' is now known as ' + params[0]);
	tmpNick.updateNickName(params[0]);
}

ServerListAssistant.prototype.event_mode_handler = function(id, event, origin, params_s)
{
	var id = parseInt(id);
	var params = JSON.parse(params_s);
	
	var tmpNick = servers.servers[id].getNick(origin);
	var tmpChan = servers.servers[id].getChannel(params[0]);
	if (tmpChan) 
	{
		var modeNick = servers.servers[id].getNick(params[2]);
		if (modeNick)
			modeNick.updateMode(params[1], tmpChan);
		tmpChan.newMessage('type3', false, 'Mode ' + params[0] + ' ' + params[1] + ' ' + params[2] + ' by ' + tmpNick.name);
	}
}

ServerListAssistant.prototype.event_umode_handler = function(id, event, origin, params_s)
{
	var id = parseInt(id);
	var params = JSON.parse(params_s);
	
	servers.servers[id].newMessage('type3', false, 'Mode ' + servers.servers[id].nick.name + ' ' + params[0] + ' by ' + origin);
}
	
ServerListAssistant.prototype.event_join_handler = function(id, event, origin, params_s)
{
	var id = parseInt(id);
	var params = JSON.parse(params_s);
	
	var tmpChan = servers.servers[id].getOrCreateChannel(params[0], null);
	if (tmpChan) 
	{
		var tmpNick = servers.servers[id].getNick(origin);
		if (tmpNick.me)
			tmpChan.openStage();
		tmpNick.addChannel(tmpChan, '');
		tmpChan.newMessage('type4', false, tmpNick.name + ' (' + origin.split("!")[1] + ') has joined ' + tmpChan.name);
	}
}

ServerListAssistant.prototype.event_quit_handler = function(id, event, origin, params_s)
{
	var id = parseInt(id);
	var params = JSON.parse(params_s);
	
	var tmpNick = servers.servers[id].getNick(origin);
	if (tmpNick)
	{
		for (var i = 0; i< tmpNick.channels.length; i++)
			tmpNick.channels[i].newMessage('type5', false, tmpNick.name + ' has quit (' + params + ')');
		servers.servers[id].removeNick(tmpNick);
	}	
}

ServerListAssistant.prototype.event_topic_handler = function(id, event, origin, params_s)
{
	var id = parseInt(id);
	var params = JSON.parse(params_s);
	
	var tmpChan = servers.servers[id].getChannel(params[0]);
	if (tmpChan)
	{
		var tmpNick = servers.servers[id].getNick(origin);
		tmpChan.topicUpdate(params[1]);
		tmpChan.newMessage('type8', false, tmpNick.name + ' changed the topic to: ' + params[1]);
	}
}

/*
 * These are notices that are directed towards the active/signed-on nick.
 * These should probably spawn a query window, but that might get really
 * annoying for commom notices such as those from Nickserv/Chanserv, etc.
 * For now all of these notices will get directed to the server status
 * window until a better solution is implemented.
 */	
ServerListAssistant.prototype.event_notice_handler = function(id, event, origin, params_s)
{
	var id = parseInt(id);
	var params = JSON.parse(params_s);
	
	var tmpNick = servers.servers[id].getNick(origin);
	servers.servers[id].newMessage('type6', tmpNick, params[1]);
}

/*
 * These are notices that are directed towards a specific channel.
 */
ServerListAssistant.prototype.event_channel_notice_handler = function(id, event, origin, params_s)
{
	var id = parseInt(id);
	var params = JSON.parse(params_s);
	
	var tmpNick = servers.servers[id].getNick(origin);
	var tmpChan = servers.servers[id].getChannel(params[0]);
	if (tmpChan) tmpChan.newMessage('type6', tmpNick, params[1]);
	else servers.servers[id].newMessage('type6', tmpNick, params[1]);
}

/*
 * These are actions (generated only by /me it seems). These messages should
 * show up in a channel or query message only (I think).
 */
ServerListAssistant.prototype.event_ctcp_action_handler = function(id, event, origin, params_s)
{
	var id = parseInt(id);
	var params = JSON.parse(params_s);
	
	var tmpNick = servers.servers[id].getNick(origin);
	var tmpChan = servers.servers[id].getChannel(params[0]);
	if (tmpChan)
		tmpChan.newMessage('type7', tmpNick, params[1]);
	else
	{
		var tmpQuery = servers.servers[id].getQuery(tmpNick);
		if (tmpQuery)
			tmpQuery.newMessage('type7', tmpNick, params[1]);
		else
			servers.servers[id].startQuery(tmpNick, false, 'type7', params[1]);
	}					
}

ServerListAssistant.prototype.event_kick_handler = function(id, event, origin, params_s)
{
	var id = parseInt(id);
	var params = JSON.parse(params_s);
	
	var tmpChan = servers.servers[id].getChannel(params[0]);
	if (tmpChan) 
	{
		var tmpNick = servers.servers[id].getNick(params[1]);
		var tmpNick2 = servers.servers[id].getNick(origin);
		var reason = params[2];
		if (tmpNick)
		{
			tmpNick.removeChannel(tmpChan); 
			if (tmpNick.me)
			{
				tmpChan.close();
				servers.servers[id].removeChannel(tmpChan);
			}
			tmpChan.newMessage('type10', false, tmpNick2.name + ' has kicked ' + tmpNick.name + ' from ' + params[0] + ' (' + params[2] + ')');
		}
	}
}

/*
 * We need to figure out a more generic way to handle all these numeric events.
 * There must be some sort of rule/heuristic we can follow to format them.
 */
ServerListAssistant.prototype.event_numeric_handler = function(id, event, origin, params_s)
{
	var id = parseInt(id);
	var params = JSON.parse(params_s);
	
	switch(event)
	{								
		case '324': // CHANNELMODEIS
			var tmpChan = servers.servers[id].getChannel(params[1]);
			if (tmpChan)
				tmpChan.channelMode(params[2]);
			break;

		case '1':		// WELCOME
		case '2':		// YOURHOST
		case '3':		// CREATED
		case '4':		// MYINFO
		case '5':		// BOUNCE
		case '251':		// LUSERCLIENT
		case '255':		// LUSERME
		case '265':		// ???
		case '266':		// ???
		case '250':		// ???
		case '372':		// MOTD
		case '901':		// ???
			servers.servers[id].newMessage('type2', false, params[1], true);
			break;
					
		case '42':		// YOURID					
		case '253':		// LUSERUNKNOWN
		case '252':		// LUSEROP
		case '254':		// LUSERCHANNELS
		case '256':		// ADMINME
			servers.servers[id].newMessage('type2', false, params[1] + ' ' + params[2]);
			break;
					
		case '439':		// TARGETTOOFAST
			servers.servers[id].newMessage('type2', false, params[0] + ' ' + params[1]);
			break;					
					
		case '305':		// NOTAWAY
			servers.servers[id].isAway = false;
			servers.servers[id].newMessage('type2', false, params[1]);
			// update app menu to show "away" option again
			for (var c = 0; c < servers.servers[id].channels.length; c++)
			{
				servers.servers[id].channels[c].updateAppMenu();
			}
			break;
		
		case '306':		// AWAY
			servers.servers[id].isAway = true;
			servers.servers[id].newMessage('type2', false, params[1]);
			// update app menu to show "back" option
			for (var c = 0; c < servers.servers[id].channels.length; c++)
			{
				servers.servers[id].channels[c].updateAppMenu();
			}
			break;
				
		case '301':		// ??? WHOISAWAY?
		case '311':		// WHOISUSER
		case '312':		// WHOISSERVER
		case '313':		// WHOISOPERATOR
		case '317':		// WHOISIDLE
		case '318':		// ENDOFWHOIS
		case '319':		// WHOISCHANNELS
		case '320':		// ??? WHOISIDENT?
			var tmpNick = servers.servers[id].getNick(params[1]);
			if (tmpNick)
				tmpNick.whoisEvent(event, params_s);
			break;
					
		case '321':		// LISTSTART
			servers.servers[id].listStart();
			break;
	
		case '322':		// LIST
			Mojo.Log.info("#######################################################");
			Mojo.Log.info("P1: %s, P2: %s, P3: %s", params[1], params[2], params[3]);
			Mojo.Log.info("#######################################################");
			servers.servers[id].listAddChannel(params[1], params[2], params[3]);
			break;
	
		case '323':		// LISTEND
			servers.servers[id].listEnd();
			break;
				
		case '332':		// TOPIC
			var tmpChan = servers.servers[id].getChannel(params[1]);
			if (tmpChan) 
			{
				tmpChan.topicUpdate(params[2]);
				if (tmpChan.containsNick(servers.servers[id].nick)) 
					tmpChan.newMessage('type8', false, 'Topic for ' + params[1] + ' is "' + params[2] + '"');
			} 
			else 
				servers.servers[id].newMessage('type8', false, 'Topic for ' + params[1] + ' is "' + params[2] + '"');
			break;

		case '333':		// TOPIC SET TIME
			var newDate = new Date();
			newDate.setTime(params[3]*1000);
			dateString = newDate.toUTCString();
			var tmpChan = servers.servers[id].getChannel(params[1]);
			if (tmpChan) 
			{
				if (tmpChan.containsNick(servers.servers[id].nick)) 
					tmpChan.newMessage('type8', false, 'Topic set by ' + params[2] + ' on ' + dateString);
			} 
			else 
				servers.servers[id].newMessage('action', false, 'Topic set by ' + params[2] + ' on ' + dateString);
			break;

		case '329':
			var newDate = new Date();
			newDate.setTime(params[2]*1000);
			dateString = newDate.toUTCString();
			var tmpChan = servers.servers[id].getChannel(params[1]);
			if (tmpChan) 
			{
				if (tmpChan.containsNick(servers.servers[id].nick)) 
					tmpChan.newMessage('type8', false, 'Channel ' + params[1] + ' created on ' + dateString);
			} 
			else 
				servers.servers[id].newMessage('action', false, 'Channel ' + params[1] + ' created on ' + dateString);
			break;					
			
		case '328':		// ???
		case '331':		// NO TOPIC
			//servers.servers[id].debugPayload(payload, false); // XXXXXXXXXXXXXXXXXX
			break;
		
		case '353':		// NAMREPLY
			var nicks = params[3].split(" ");
			var tmpChan = servers.servers[id].getChannel(params[2]);
			var tmpNick;
			if (tmpChan)
			{
				for (var i = 0; i < nicks.length; i++)
				{
					if (nicks[i])
					{
						var prefixNick = '';
						var onlyNick = nicks[i];
						if (ircNick.hasPrefix(onlyNick))
						{
							prefixNick = nicks[i].substr(0, 1);
							onlyNick = nicks[i].substr(1);
						}
								
						tmpNick = servers.servers[id].getNick(onlyNick);
						if (tmpNick)
							tmpNick.addChannel(tmpChan, ircNick.getPrefixMode(prefixNick));
					}
				}
			}
			break;
	
		case '366':		// ENDOFNAMES
			break;
					
		case '375':		// MOTDSTART
		case '376':		// ENDOFMOTD
			servers.servers[id].updateStatusList();
			break;
					
		case '433':		// NAMEINUSE
			servers.servers[id].newMessage('debug', false, params[1] + " : " + params[2]);
			if (servers.servers[id].nextNick < prefs.get().nicknames.length-1)
			{
				servers.servers[id].newMessage('debug', false, 'Trying next nick [' + servers.servers[id].nextNick + '] - ' + prefs.get().nicknames[servers.servers[id].nextNick]);
				servers.servers[id].nextNick = servers.servers[id].nextNick + 1;
				plugin.cmd_nick(null, servers.servers[id].sessionToken, prefs.get().nicknames[servers.servers[id].nextNick]);	
			}
			else {
				servers.servers[id].newMessage('debug', false, 'No more nicks to try!');
				servers.servers[id].disconnect();
			}
			break;
		
		case '477':
		case '482':
			var tmpChan = servers.servers[id].getChannel(params[1]);
			if (tmpChan) 
			{
				if (tmpChan.containsNick(servers.servers[id].nick))
					tmpChan.newMessage('type2', false, params[2]);
			}
			else
				servers.servers[id].newMessage('type2', false, params[2]);
			break;
					
		default:
			//servers.servers[id].debugPayload(payload, true); // XXXXXXXXXXXXXXXXXXXXXXX
			break;
	}
}

ServerListAssistant.prototype.event_unknown_handler = function(id, event, origin, params_s)
{
	/*if (event != 'PONG')
	{
		servers.servers[id].debugPayload(payload, false);
	}*/
}

ServerListAssistant.prototype.auto_ping_handler = function(id, server, rtt)
{
	var id = parseInt(id);
	
	if (prefs.get().lagMeter)
	{
		servers.servers[id].lagHistory.push(parseInt(rtt));
		if (servers.servers[id].lagHistory.length>5)
			servers.servers[id].lagHistory.shift();
		
		var lagSum = 0;
		servers.servers[id].lagHistory.forEach(function(x) {lagSum += x;});
		var aveLag = lagSum / servers.servers[id].lagHistory.length;
			
		if (aveLag<300)
			servers.servers[id].lag = 'lag-5';
		else if (aveLag<600)
			servers.servers[id].lag = 'lag-4';
		else if (aveLag<1200)
			servers.servers[id].lag = 'lag-3';
		else if (aveLag<2400)
			servers.servers[id].lag = 'lag-2';
		else
			servers.servers[id].lag = 'lag-1';
		
		if (servers.listAssistant && servers.listAssistant.controller)
		{
			servers.listAssistant.updateList();	
		}
		if (servers.servers[id].statusAssistant && servers.servers[id].statusAssistant.controller)
		{
			servers.servers[id].statusAssistant.updateLagMeter();
		}
		for (var c = 0; c < servers.servers[id].channels.length; c++)
		{
			servers.servers[id].channels[c].updateLagMeter();
		}
		for (var q = 0; q < servers.servers[id].queries.length; q++)
		{
			servers.servers[id].queries[q].updateLagMeter();
		}
	}
	else
	{
		//servers.servers[id].clearAutoPingSubscription();
	}
}

ServerListAssistant.prototype.clearAutoPingSubscription = function()
{
	servers.servers[id].subscriptions['auto_ping'].cancel();
		
	if (servers.listAssistant && servers.listAssistant.controller)
	{
		servers.listAssistant.updateList();	
	}
	if (servers.servers[id].statusAssistant && servers.servers[id].statusAssistant.controller)
	{
		servers.servers[id].statusAssistant.updateLagMeter();
	}
	for (var c = 0; c < servers.servers[id].channels.length; c++)
	{
		servers.servers[id].channels[c].updateLagMeter();
	}
	for (var q = 0; q < servers.servers[id].queries.length; q++)
	{
		servers.servers[id].queries[q].updateLagMeter();
	}
}
ServerListAssistant.prototype.startAutoPingSubscription = function(skip)
{
	if (prefs.get().lagMeter || skip)
	{
		servers.servers[id].subscriptions['auto_ping']			= plugin.cmd_subscribe(servers.servers[id].errorHandler.bindAsEventListener(servers.servers[id]), servers.servers[id].autoPingHandler.bindAsEventListener(servers.servers[id]),servers.servers[id].sessionToken, 'auto_ping');
	}
}