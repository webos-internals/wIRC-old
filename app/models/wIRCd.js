wIRCd.identifier = 'palm://us.ryanhope.wIRCd';

function wIRCd() {}

wIRCd.subscribe = function(onFailure, onSuccess, sessionToken, type)
{
	
	var method = '';
	
	switch (type) {
	case 'event_connect': method = 'event_connect'; break;
	case 'event_nick': method = 'event_nick'; break;
	case 'event_quit': method = 'event_quit'; break;
	case 'event_join': method = 'event_join'; break;
	case 'event_part': method = 'event_part'; break;
	case 'event_mode': method = 'event_mode'; break;
	case 'event_umode': method = 'event_umode'; break;
	case 'event_topic': method = 'event_topic'; break;
	case 'event_kick': method = 'event_kick'; break;
	case 'event_channel': method = 'event_channel'; break;
	case 'event_privmsg': method = 'event_privmsg'; break;
	case 'event_notice': method = 'event_notice'; break;
	case 'event_channel_notice': method = 'event_channel_notice'; break;
	case 'event_invite': method = 'event_invite'; break;
	case 'event_ctcp_req': method = 'event_ctcp_req'; break;
	case 'event_ctcp_rep': method = 'event_ctcp_rep'; break;
	case 'event_ctcp_action': method = 'event_ctcp_action'; break;
	case 'event_unknown': method = 'event_unknown'; break;
	case 'event_numeric': method = 'event_numeric'; break;
	case 'auto_ping': method = 'auto_ping'; break;
	}

	var request = new Mojo.Service.Request(wIRCd.identifier+'/subscriptions',
	{
		method: method,
		parameters: {
			"sessionToken": sessionToken,
			"subscribe": true
		},
		onSuccess: onSuccess,
		onFailure: onFailure
	});
	return request;
	
}

wIRCd.init = function(callback)
{
	var request = new Mojo.Service.Request(wIRCd.identifier,
	{
		method: 'client_init',
		parameters: {},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
}

wIRCd.connect = function(callback, sessionToken, server, port, username, password, nick, realname, interfaces)
{
	var iface = null;
	if (interfaces && interfaces.length > 0) iface = interfaces;
	var request = new Mojo.Service.Request(wIRCd.identifier,
	{
		method: 'client_connect',
		parameters: {
			"sessionToken": sessionToken,
			"server": server,
			"username": username,
			"server_password": password,
			"nick": nick,
			"port": port,
			"realname": realname,
			"interface": iface,
		},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
}
wIRCd.quit = function(callback, sessionToken, reason)
{
	var request = new Mojo.Service.Request(wIRCd.identifier,
	{
		method: 'client_cmd_quit',
		parameters: {
			"sessionToken": sessionToken,
			"reason": reason
		},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
}

wIRCd.nick = function(callback, sessionToken, nick)
{
	var request = new Mojo.Service.Request(wIRCd.identifier,
	{
		method: 'client_cmd_nick',
		parameters: {
			"sessionToken": sessionToken,
			"nick": nick
		},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
}
wIRCd.user_mode = function(callback, sessionToken, mode)
{
	var request = new Mojo.Service.Request(wIRCd.identifier,
	{
		method: 'client_cmd_user_mode',
		parameters: {
			"sessionToken": sessionToken,
			"mode": mode
		},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
}
wIRCd.whois = function(callback, sessionToken, nick)
{
	var request = new Mojo.Service.Request(wIRCd.identifier,
	{
		method: 'client_cmd_whois',
		parameters: {
			"sessionToken": sessionToken,
			"nick": nick
		},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
}

wIRCd.join = function(callback, sessionToken, channel, key)
{
	var request = new Mojo.Service.Request(wIRCd.identifier,
	{
		method: 'client_cmd_join',
		parameters: {
			"sessionToken": sessionToken,
			"channel": channel,
			"key": key
		},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
}
wIRCd.part = function(callback, sessionToken, channel)
{
	var request = new Mojo.Service.Request(wIRCd.identifier,
	{
		method: 'client_cmd_part',
		parameters: {
			"sessionToken": sessionToken,
			"channel": channel
		},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
}
wIRCd.invite = function(callback, sessionToken, channel, nick)
{
	var request = new Mojo.Service.Request(wIRCd.identifier,
	{
		method: 'client_cmd_invite',
		parameters: {
			"sessionToken": sessionToken,
			"channel": channel,
			"nick": nick
		},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
}
wIRCd.names = function(callback, sessionToken, channel)
{
	var request = new Mojo.Service.Request(wIRCd.identifier,
	{
		method: 'client_cmd_names',
		parameters: {
			"sessionToken": sessionToken,
			"channel": channel
		},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
}
wIRCd.list = function(callback, sessionToken, channel)
{
	var request = new Mojo.Service.Request(wIRCd.identifier,
	{
		method: 'client_cmd_list',
		parameters: {
			"sessionToken": sessionToken,
			"channel": channel
		},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
}

wIRCd.msg = function(callback, sessionToken, nch, text)
{
	var request = new Mojo.Service.Request(wIRCd.identifier,
	{
		method: 'client_cmd_msg',
		parameters: {
			"sessionToken": sessionToken,
			"nch": nch,
			"text": text
		},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
}
wIRCd.me = function(callback, sessionToken, nch, text)
{
	var request = new Mojo.Service.Request(wIRCd.identifier,
	{
		method: 'client_cmd_me',
		parameters: {
			"sessionToken": sessionToken,
			"nch": nch,
			"text": text
		},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
}
wIRCd.notice = function(callback, sessionToken, nch, text)
{
	var request = new Mojo.Service.Request(wIRCd.identifier,
	{
		method: 'client_cmd_notice',
		parameters: {
			"sessionToken": sessionToken,
			"nch": nch,
			"text": text
		},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
}
wIRCd.kick = function(callback, sessionToken, channel, nick, reason)
{
	var request = new Mojo.Service.Request(wIRCd.identifier,
	{
		method: 'client_cmd_kick',
		parameters: {
			"sessionToken": sessionToken,
			"channel": channel,
			"nick": nick,
			"reason": reason
		},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
}
wIRCd.topic = function(callback, sessionToken, channel, topic)
{
	var request = new Mojo.Service.Request(wIRCd.identifier,
	{
		method: 'client_cmd_topic',
		parameters: {
			"sessionToken": sessionToken,
			"channel": channel,
			"topic": topic
		},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
}
wIRCd.channel_mode = function(callback, sessionToken, channel, mode)
{
	var request = new Mojo.Service.Request(wIRCd.identifier,
	{
		method: 'client_cmd_channel_mode',
		parameters: {
			"sessionToken": sessionToken,
			"channel": channel,
			"mode": mode
		},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
}
wIRCd.ping = function(callback, sessionToken, server)
{
	var request = new Mojo.Service.Request(wIRCd.identifier,
	{
		method: 'client_cmd_ping',
		parameters: {
			"sessionToken": sessionToken,
			"server": server,
		},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
}
wIRCd.away = function(callback, sessionToken, reason)
{
	var request = new Mojo.Service.Request(wIRCd.identifier,
	{
		method: 'client_cmd_away',
		parameters: {
			"sessionToken": sessionToken,
			"reason": reason,
		},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
}
wIRCd.raw = function(callback, sessionToken, command)
{
	var request = new Mojo.Service.Request(wIRCd.identifier,
	{
		method: 'client_send_raw',
		parameters: {
			"sessionToken": sessionToken,
			"command": command,
		},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
}

wIRCd.disconnect = function(callback, sessionToken)
{
	var request = new Mojo.Service.Request(wIRCd.identifier,
	{
		method: 'client_cmd_disconnect',
		parameters: {
			"sessionToken": sessionToken,
		},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
}
wIRCd.version = function(callback)
{
	var request = new Mojo.Service.Request(wIRCd.identifier,
	{
		method: 'client_get_version',
		parameters: {},
		onSuccess: callback,
		onFailure: callback
	});
	return request;
}