function wircPlugin(){

    this.isReady = false;
    
    this.pluginObj = window.document.createElement("object");
    
    this.pluginObj.id = "wircPlugin";
    this.pluginObj.type = "application/x-palm-remote";
    this.pluginObj.width = 0;
    this.pluginObj.height = 0;
    this.pluginObj['x-palm-pass-event'] = true;
    
    var param1 = window.document.createElement("param");
    param1.name = "appid";
    param1.value = "org.webosinternals.wirc";
    
    var param2 = window.document.createElement("param");
    param2.name = "exe";
    param2.value = "wirc";
    
    var param3 = window.document.createElement("param");
    param3.name = "Param1"; // MAX_SERVERS
    param3.value = MAX_SERVERS;
    
    this.pluginObj.appendChild(param1);
    this.pluginObj.appendChild(param2);
    this.pluginObj.appendChild(param3);
    
    this.df = window.document.createDocumentFragment();
    this.df.appendChild(this.pluginObj);
}

wircPlugin.prototype.registerHandlers = function() {
	
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
    plugin.event_ctcp_req = this.event_ctcp_req_handler.bind(this);
    plugin.event_ctcp_rep = this.event_ctcp_rep_handler.bind(this);
    plugin.event_ctcp_action = this.event_ctcp_action_handler.bind(this);
    plugin.event_unknown = this.event_unknown_handler.bind(this);
    plugin.event_numeric = this.event_numeric_handler.bind(this);
    plugin.event_rtt = this.event_rtt_handler.bind(this);

}

wircPlugin.prototype.event_connect_handler = function(id, event, origin, params_s, ip)
{
	var id = parseInt(id);
	var params = JSON.parse(params_s);
	
	if (event=='MAXRETRIES')
	{
		servers.servers[id].setState(servers.servers[id].STATE_MAX_RETRIES);
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

wircPlugin.prototype.event_part_handler = function(id, event, origin, params_s)
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
		if (prefs.get().eventPart)
			tmpChan.newMessage('type5', false, tmpNick.name + ' (' + origin.split("!")[1] + ') has left ' + tmpChan.name + ' (' + params[1] + ')');
	}	
}

wircPlugin.prototype.event_invite_handler = function(id, event, origin, params_s)
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

wircPlugin.prototype.event_channel_handler = function(id, event, origin, params_s)
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

wircPlugin.prototype.event_privmsg_handler = function(id, event, origin, params_s)
{
	var id = parseInt(id);
	var params = JSON.parse(params_s);
	
	var tmpNick = servers.servers[id].getNick(origin);
	var tmpQuery = servers.servers[id].getQuery(tmpNick);
	if (tmpQuery)
	{
		tmpQuery.newMessage('privmsg', tmpNick, params[1]);
	}
	else
	{
		servers.servers[id].startQuery(tmpNick, false, 'message', params[1]);
	}
}

wircPlugin.prototype.event_nick_handler = function(id, event, origin, params_s)
{
	var id = parseInt(id);
	var params = JSON.parse(params_s);
	
	var tmpNick = servers.servers[id].getNick(origin);
	if (tmpNick === servers.servers[id].nick)
		servers.servers[id].newMessage('type9', false, tmpNick.name + ' is now known as ' + params[0]);
	tmpNick.updateNickName(params[0]);
}

wircPlugin.prototype.event_mode_handler = function(id, event, origin, params_s)
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
		if (prefs.get().eventMode)
			tmpChan.newMessage('type3', false, 'Mode ' + params[0] + ' ' + params[1] + ' by ' + tmpNick.name);
	}
}

wircPlugin.prototype.event_umode_handler = function(id, event, origin, params_s)
{
	var id = parseInt(id);
	var params = JSON.parse(params_s);
	
	var tmpNick = servers.servers[id].getNick(origin);
	if (tmpNick) {
		tmpNick.mode = params[0];
		servers.servers[id].newMessage('type3', false, 'Mode ' + origin + ' ' + params[0] + ' by ' + origin);
	}
}
	
wircPlugin.prototype.event_join_handler = function(id, event, origin, params_s)
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
		if (prefs.get().eventJoin)
			tmpChan.newMessage('type4', false, tmpNick.name + ' (' + origin.split("!")[1] + ') has joined ' + tmpChan.name);
	}
}

wircPlugin.prototype.event_quit_handler = function(id, event, origin, params_s)
{
	var id = parseInt(id);
	var params = JSON.parse(params_s);
	
	var tmpNick = servers.servers[id].getNick(origin);
	if (tmpNick)
	{
		for (var i = 0; i< tmpNick.channels.length; i++)
		{
			if (prefs.get().eventQuit)
			{
				tmpNick.channels[i].newMessage('type5', false, tmpNick.name + ' has quit (' + params + ')');
			}
		}
		servers.servers[id].removeNick(tmpNick);
	}	
}

wircPlugin.prototype.event_topic_handler = function(id, event, origin, params_s)
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
wircPlugin.prototype.event_notice_handler = function(id, event, origin, params_s)
{
	var id = parseInt(id);
	var params = JSON.parse(params_s);
	
	var tmpNick = servers.servers[id].getNick(origin);
	servers.servers[id].getVisibleScene().newMessage('type6', tmpNick, params[1]);
}

/*
 * These are notices that are directed towards a specific channel.
 */
wircPlugin.prototype.event_channel_notice_handler = function(id, event, origin, params_s)
{
	var id = parseInt(id);
	var params = JSON.parse(params_s);
	
	var tmpNick = servers.servers[id].getNick(origin);
	var tmpChan = servers.servers[id].getChannel(params[0]);
	if (tmpChan) tmpChan.newMessage('type6', tmpNick, params[1]);
	else servers.servers[id].newMessage('type6', tmpNick, params[1]);
}

wircPlugin.prototype.ctcp_rep = function(id, nick, reply)
{
	alert('CTCP REP: ' + id + ' ' + nick + ' ' + reply);
	plugin.ctcp_rep(id, nick, reply);
}

wircPlugin.prototype.event_ctcp_req_handler = function(id, event, origin, params_s) {
	
	var id = parseInt(id);
	var params = JSON.parse(params_s);
	servers.servers[id].newMessage('type2', false, 'Received ' + event + ' ' + params[0] + ' request by '+ ' ' + origin, true);
	
	var nick = servers.servers[id].getNick(origin);
	var reply = false;
		
	switch (params[0]) {
		case 'FINGER':		// Returns the user's full name, and idle time.
			break;
		case 'VERSION': 	// The version and type of the client.
			alert('CTCP VERSION');
			reply = '0.3.0'; //'\001VERSION wIRC:' + Mojo.Controller.appInfo.version + ':webOS\001';
			break;
		case 'SOURCE':		// Where to obtain a copy of a client.
			break;
		case 'USERINFO':	// A string set by the user (never the client coder)
			break;
		case 'CLIENTINFO':	// Dynamic master index of what a client knows.
			break;
		case 'ERRMSG':		// Used when an error needs to be replied with.
			break;
		case 'PING':		// Used to measure the delay of the IRC network between clients.
			break;
		case 'TIME':		// Gets the local date and time from other clients.
			break;
	}
	
	if (reply) {
		var ctcp_rep_func = this.ctcp_rep.bind(this, id, nick.name, reply);
		setTimeout(ctcp_rep_func, 100);
	}
	
}
wircPlugin.prototype.event_ctcp_rep_handler = function(id, event, origin, params_s) {
	servers.servers[id].debugPayload(event, origin, params_s, true);
}

/*
 * These are actions (generated only by /me it seems). These messages should
 * show up in a channel or query message only (I think).
 */
wircPlugin.prototype.event_ctcp_action_handler = function(id, event, origin, params_s)
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

wircPlugin.prototype.event_kick_handler = function(id, event, origin, params_s)
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
				tmpChan.closeStage();
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
wircPlugin.prototype.event_numeric_handler = function(id, event, origin, params_s)
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
			clearTimeout(servers.servers[id].connectionTimeout);
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

		case '404':
			var tmpChan = servers.servers[id].getChannel(params[2]);
			if (tmpChan)
			{
				if (tmpChan.containsNick(servers.servers[id].nick))
					tmpChan.newMessage('type2', false, params[3]);
			}
			else
				servers.servers[id].newMessage('type2', false, params[3]);
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
			
		case '396':
			tmpNick = servers.servers[id].getNick(params[0]);
			if (tmpNick) {
				tmpNick.hiddenHost = params[1];
				servers.servers[id].newMessage('type2', false, params[1] + ' ' + params[2], true);
			}
			break;
			
		case '221':
			tmpNick = servers.servers[id].getNick(params[0]);
			if (tmpNick) {
				tmpNick.hiddenHost = params[1];
				servers.servers[id].newMessage('type2', false, params[1], true);
			}
			break;
					
		default:
			var out = event + ' ' + params[1];
			if (params.length>2) {
				for (var i=2; i<params.length; i++)
					out = out +	' ' + params[i];
			}
			servers.servers[id].newMessage('type2', false, out, true);
			break;
	}
}

wircPlugin.prototype.event_unknown_handler = function(id, event, origin, params_s)
{
	var params = JSON.parse(params_s);
	
	switch (event) {
		case 'PONG':
			if (!prefs.get().lagMeter)
				servers.servers[id].newMessage('type77', false, event + ' ' + params[0] + ' ' + params[1]);
			break;
		default:
			servers.servers[id].debugPayload(params, false);
			break;	
	}
}

wircPlugin.prototype.event_rtt_handler = function(id, rtt)
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
	
}