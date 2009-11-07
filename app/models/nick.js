function ircNick(params)
{
	ircNick.num++;
	
	this.num =			ircNick.num;
	this.name =			params.name;
	this.colorHex =		this.getRandomColor();
	this.channels =		[];
	this.channelModes =	[];
	this.me =			false;
	
}

ircNick.prototype.addChannel = function(channel, mode)
{ 
	if (channel) 
	{ 
		if (this.channels.indexOf(channel) === -1) 
		{ 
			channel.addNick(this);
			this.channels.push(channel);
			this.channelModes[channel.name] = mode;
		} 
	}
}
ircNick.prototype.removeChannel = function(channel)
{
	if (channel)
	{
		channel.removeNick(this);
		this.channels = this.channels.without(channel);
		this.channelModes[channel.name] = '';
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
ircNick.prototype.updateNickPrefix = function(newPrefix, channel)
{
	this.channelModes[channel.name] = ircNick.getModePrefix(newPrefix);
}
ircNick.prototype.updateNickMode = function(newMode, channel)
{
	this.channelModes[channel.name] = newMode;
}

ircNick.prototype.getListObject = function(channel)
{
	var obj =
	{
		name:	this.name,
		prefix:	(channel.name ? ircNick.getModePrefix(this.channelModes[channel.name]) : ''),
		mode:	(channel.name ? this.channelModes[channel.name] : '')
	};
	
	return obj;
}

ircNick.prototype.getRandomColor = function()
{
	return '#'+('00000'+(Math.random()*0xFFFFFF+1<<0).toString(16)).substr(-6);
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
