function ircNick(params)
{
	ircNick.num++;
	
	this.num =		ircNick.num;
	this.name =		params.name;
	this.colorHex =	'#'+('00000'+(Math.random()*0xFFFFFF+1<<0).toString(16)).substr(-6); // random color
	this.channels = [];
	
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


