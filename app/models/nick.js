function ircNick(params)
{
	ircNick.num++;
	
	this.num =			ircNick.num;
	this.name =			params.name;
	this.server =		false; // set when whois is called, its the only time its needed
	this.colorHex =		ircNick.getRandomColor3(isLightTheme());
	this.channels =		[];
	this.channelModes =	[];
	this.me =			false;
	
	this.mode =			'';
	
	
	this.whoisStageName =			'whois-' + this.num;
	this.whoisStageController =		false;
	this.whois =					false;
}

ircNick.prototype.setMode = function(mode)
{
	plugin.cmd_user_mode(servers.getServerArrayKey(this.server.id), mode);
}

ircNick.prototype.addChannel = function(channel, mode)
{ 
	if (channel) 
	{
		if (this.channels.indexOf(channel) === -1 || !channel.containsNick(this))
		{
			if (!channel.containsNick(this))
				channel.addNick(this);
			if(this.channels.indexOf(channel) === -1)
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
			if (this.channelModes[channel.name])
			{
				this.channelModes[channel.name] = this.channelModes[channel.name].without(mode.substr(1, 1));
			}
			break;
		
		case '+':
			if (!this.channelModes[channel.name])
			{
				this.channelModes[channel.name] = [];
			}
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


ircNick.prototype.whoisEvent = function(event, params)
{
	//Mojo.Log.error('--- ' + event + ' ---');
	//for (var p = 2; p < params.length; p++)	Mojo.Log.error('  ' + p + ': ' + params[p]);
	
	// if no whois object, lets create it
	if (this.whois === false)
	{
		this.whois =
		{
			user:		false,
			host:		false,
			realname:	false,
			away:		false,
			server:		false,
			serverInfo:	false,
			idle:		0,
			signon:		0,
			channels:	[], // {mode, name},
		}
	}
	
	switch(event)
	{
		case '301': // ??? WHOISAWAY?
			this.whois.away = params[2];
			break;
			
		case '311': // WHOISUSER
			this.whois.user = params[2].replace('n=', '');
			this.whois.host = params[3];
			this.whois.realname = params[5];
			break;
			
		case '312': // WHOISSERVER
			this.whois.server = params[2];
			this.whois.serverInfo = params[3];
			break;
			
		case '313': // WHOISOPERATOR
			break;
			
		case '317': // WHOISIDLE
			this.whois.idle = params[2];
			this.whois.signon = params[3];
			break;
			
		case '319': // WHOISCHANNELS
			this.whois.channels = [];
			var channels = params[2].split(" ");
			if (channels.length > 0)
			{
				for (var c = 0; c < channels.length; c++)
				{
					if (channels[c]) 
					{
						if (ircNick.hasPrefix(channels[c]))
						{
							this.whois.channels.push({mode: channels[c].substr(0, 1), channel: channels[c].substr(1)});
						}
						else
						{
							this.whois.channels.push({mode: '&nbsp;', channel: channels[c]});
						}
					}
				}
			}
			break;
			
		case '320': // ??? WHOISIDENT?
			break;
		
		case '318': // ENDOFLIST
			this.openWhoisStage();
			break;
	}
}
ircNick.prototype.openWhoisStage = function()
{
	try
	{
		/* // this code pushes the whois scene on top of the currently active card. Maybe using this should be an option
		var activeCard = Mojo.Controller.appController.getActiveStageController('card');
		if (activeCard) 
		{
			activeCard.pushScene('whois', this);
		}
		*/
		
		this.whoisStageController = Mojo.Controller.appController.getStageController(this.whoisStageName);
	
        if (this.whoisStageController) 
		{
			if (this.whoisStageController.activeScene().sceneName == 'whois') 
			{
				this.whoisStageController.activate();
			}
			else
			{
				this.whoisStageController.popScenesTo('whois');
				this.whoisStageController.activate();
			}
		}
		else
		{
			Mojo.Controller.appController.createStageWithCallback({name: this.whoisStageName, lightweight: true}, this.openWhoisStageCallback.bind(this));
		}
	}
	catch (e)
	{
		Mojo.Log.logException(e, "ircNick#openWhoisStage");
	}
}
ircNick.prototype.openWhoisStageCallback = function(controller)
{
	controller.pushScene('whois', this);
}


ircNick.num = 0;


ircNick.getRandomColor3 = function(lightTheme)
{
	var hue = Math.ceil(Math.random()*360);
	var saturation = 100;
	var value = 100;
	if (lightTheme)
		value = Math.ceil(Math.random()*20)+70;
	else
		saturation = Math.ceil(Math.random()*40)+50;
	var rgb = ColorConverter.toRGB(new HSV(hue,saturation,value));
	return "rgb(" + rgb.r + "," + rgb.b + "," + rgb.g + ")";
}

ircNick.getRandomColor = function()
{
	return '#'+('00000'+(Math.random()*0xFFFFFF+1<<0).toString(16)).substr(-6);
}

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
