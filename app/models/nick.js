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
	var msg;
	if (this.me)
	{
		msg = 'You are ';
	}
	else
	{
		msg = oldName + ' is ';
	}
	msg = msg + 'now known as [' + newName + ']';

	for (var i = 0; i < this.channels.length; i++)
	{
		this.channels[i].newStatusMessage(msg);
	}
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
		mode:	(channel.name ? this.channelModes[channel.name] : '')
	};
	
	return obj;
}

ircNick.prototype.getRandomColor = function()
{
	return '#'+('00000'+(Math.random()*0xFFFFFF+1<<0).toString(16)).substr(-6);
}

ircNick.num = 0;

ircNick.getModeNum = function(mode)
{	// this is for sorting hte nick list
	switch(mode)
	{
		case '@':	return 1;
		case '%':	return 2;
		case '+':	return 3; 
		default:	return 999;
	}
}
