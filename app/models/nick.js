function ircNick(params)
{
	ircNick.num++;
	
	this.num =		ircNick.num;
	this.name =		params.name;
	this.colorHex =	'#'+('00000'+(Math.random()*0xFFFFFF+1<<0).toString(16)).substr(-6); // random color
	this.channels = [];
	this.me = false;
	
}

ircNick.num = 0;

ircNick.prototype.addChannel = function(channel)
{ 
	if (channel) 
	{ 
		if (this.channels.indexOf(channel) === -1) 
		{ 
			this.channels.push(channel); 
		} 
	}
}

ircNick.prototype.removeChannel = function(channel)
{
	if (channel)
	{
		this.channels = this.channels.without(channel); 
	}
}

ircNick.prototype.updateNick = function(newName)
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
