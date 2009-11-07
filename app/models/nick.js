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
	alert(this.name + ': ' + this.channelModes[channel.name]);
	
	switch (mode.substr(0, 1))
	{
		case '-':
			this.channelModes[channel.name] = this.channelModes[channel.name].without(mode.substr(1, 1));
			break;
		
		case '+':
			this.channelModes[channel.name].push(mode.substr(1, 1));
			break;
	}
	
	alert(this.name + ': ' + this.channelModes[channel.name]);
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
