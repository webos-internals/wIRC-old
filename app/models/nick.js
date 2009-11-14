function ircNick(params)
{
	ircNick.num++;
	
	this.num =			ircNick.num;
	this.name =			params.name;
	this.colorHex =		this.getRandomColor();
	this.channels =		[];
	this.channelModes =	[];
	this.me =			false;
	
	this.whois =
	{
		user:		false,
		host:		false,
		realname:	false,
		channels:	[], // {mode, name},
		idle:		0,
		signon:		0,
	}
}

ircNick.prototype.addChannel = function(channel, mode)
{ 
	if (channel) 
	{ 
		if (this.channels.indexOf(channel) === -1) 
		{ 
			channel.addNick(this);
			this.channels.push(channel);
			
			if (mode) this.channelModes[channel.name] = [mode];
			else this.channelModes[channel.name] = [];
		} 
	}
}
ircNick.prototype.removeChannel = function(channel)
{
	if (channel)
	{
		channel.removeNick(this);
		this.channels = this.channels.without(channel);
		this.channelModes[channel.name] = null;
	}
}

ircNick.prototype.updateNickName = function(newName)
{
	var oldName = this.name;
	this.name = newName;
	var msg = oldName + ' is now known as '+ newName;

	for (var i = 0; i < this.channels.length; i++)
	{
		this.channels[i].newMessage('type9', false, msg);
	}
}
ircNick.prototype.updateMode = function(mode, channel)
{
	switch (mode.substr(0, 1))
	{
		case '-':
			this.channelModes[channel.name] = this.channelModes[channel.name].without(mode.substr(1, 1));
			break;
		
		case '+':
			this.channelModes[channel.name].push(mode.substr(1, 1));
			break;
	}
}
ircNick.prototype.hasMode = function(mode, channel)
{
	return (this.channelModes[channel.name].indexOf(mode) !== -1);
}

ircNick.prototype.getHighestMode = function(channel)
{
	if (this.channelModes[channel.name].length < 1)
	{
		return '';
	}
	if (this.channelModes[channel.name].length > 1) 
	{
		this.channelModes[channel.name].sort(function(a, b)
		{
			return ircNick.getModeNum(a) - ircNick.getModeNum(b);
		});
	}
	
	return this.channelModes[channel.name][0];
}

ircNick.prototype.getListObject = function(channel)
{
	var objMode = this.getHighestMode(channel);
	var obj =
	{
		name:	this.name,
		prefix:	(channel.name ? ircNick.getModePrefix(objMode) : ''),
		mode:	(channel.name ? objMode : '')
	};
	
	return obj;
}

ircNick.prototype.getRandomColor = function()
{
	return '#'+('00000'+(Math.random()*0xFFFFFF+1<<0).toString(16)).substr(-6);
}

ircNick.prototype.whoisEvent = function(event, params)
{
	//alert('--- ' + event + ' ---');
	//for (var p = 2; p < params.length; p++)	alert('  ' + p + ': ' + params[p]);
	
	switch(event)
	{
		case '311': // WHOISUSER
			this.whois.user = params[2].replace('n=', '');
			this.whois.host = params[3];
			this.whois.realname = params[5];
			break;
			
		case '312': // WHOISSERVER
			break;
			
		case '313': // WHOISOPERATOR
			break;
			
		case '317': // WHOISIDLE
			this.whois.idle = params[2];
			this.whois.signon = params[3];
			break;
			
		case '319': // WHOISCHANNELS
			break;
			
		case '320': // ???
			break;
		
		case '318': // ENDOFLIST
			var message = '';
			for (w in this.whois)
			{
				message += '<b>'+w+'</b>: '+this.whois[w]+'<br />';
			}
			// find active card & scene to push the alert dialog to:
			var activeCard = Mojo.Controller.appController.getActiveStageController('card');
			if (activeCard) 
			{
				var activeScene = activeCard.activeScene();
				if (activeScene)
				{
					activeScene.showAlertDialog(
					{
						onChoose: function(value){},
						allowHTMLMessage: true,
						title: "Whois: " + this.name,
						message: message,
						choices: [{label: "OK", value: ""}]
					});
				}
			}
			break;
	}
}

ircNick.num = 0;

ircNick.hasPrefix = function(nick)
{
	if (ircNick.getPrefixMode(nick.substr(0, 1)) != '') return true;
	return false;
}
ircNick.getPrefixMode = function(prefix)
{
	switch(prefix)
	{
		case '!':	return '!'; 
		case '.':	return 'u';
		case '@':	return 'o';
		case '%':	return 'h';
		case '+':	return 'v';
		default:	return '';
	}
}
ircNick.getModePrefix = function(mode)
{
	switch(mode)
	{
		case '!':	return '!'; 
		case 'u':	return '.';
		case 'O':	return '@';
		case 'o':	return '@';
		case 'h':	return '%';
		case 'v':	return '+';
		default:	return '';
	}
}
ircNick.getModeNum = function(mode)
{	// this is for sorting the nick list
	switch(mode)
	{
		case '!':	return 1; 
		case 'u':	return 2;
		case 'O':	return 3;
		case 'o':	return 4;
		case 'h':	return 5;
		case 'v':	return 6;
		default:	return 7;
	}
}
