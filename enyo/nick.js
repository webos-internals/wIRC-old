function ircNick (params) {
	
	this.name = params.name;
	this.channels = {};
	this.channelModes = [];
};

ircNick.prototype.addChannel = function(channel, mode) {
	if (channel) {
		if (!this.channels[channel.name] || !channel.containsNick(this)) {
			if (!channel.containsNick(this))
				channel.addNick(this);
			if(!this.channels[channel.name])
				this.channels[channel.name] = channel;
			if (mode) this.channelModes[channel.name] = [mode];
			else this.channelModes[channel.name] = [];
		}
	}
};

ircNick.prototype.removeChannel = function(channel) {
	if (channel) {
		channel.removeNick(this);
		delete this.channels[channel.name];
		this.channelModes[channel.name] = null;
	}
};

ircNick.prototype.getHighestMode = function(channel) {
	if (this.channelModes[channel.name].length < 1)
		return '';
	if (this.channelModes[channel.name].length > 1)
		this.channelModes[channel.name].sort(function(a, b) {
			return ircNick.getModeNum(a) - ircNick.getModeNum(b);
		});
	return this.channelModes[channel.name][0];
};

ircNick.prototype.getListObject = function(channel) {
	var objMode = this.getHighestMode(channel);
	var obj = {
		name:	this.name,
		prefix:	(channel.name ? ircNick.getModePrefix(objMode) : ''),
		mode:	(channel.name ? objMode : '')
	};
	return obj;
};

ircNick.hasPrefix = function(nick) {
	if (ircNick.getPrefixMode(nick.substr(0, 1)) != '') return true;
	return false;
};

ircNick.getPrefixMode = function(prefix) {
	switch(prefix) {
		case '!':	return '!';
		case '.':	return 'u';
		case '@':	return 'o';
		case '%':	return 'h';
		case '+':	return 'v';
		default:	return '';
	}
};

ircNick.getModePrefix = function(mode) {
	switch(mode) {
		case '!':	return '!';
		case 'u':	return '.';
		case 'O':	return '@';
		case 'o':	return '@';
		case 'h':	return '%';
		case 'v':	return '+';
		default:	return '';
	}
};

ircNick.getModeNum = function(mode) {
	switch(mode) {
		case '!':	return 1;
		case 'u':	return 2;
		case 'O':	return 3;
		case 'o':	return 4;
		case 'h':	return 5;
		case 'v':	return 6;
		default:	return 7;
	}
};

ircNick.sortByName = function(a,b) {
	if (a > b)
		return 1;
	else if (a < b)
		return -1;
	else
		return 0;
};
	
ircNick.sortByMode = function(a,b) {
	if (ircNick.getModeNum(a.mode) < ircNick.getModeNum(b.mode))
		return -1;
	if (ircNick.getModeNum(a.mode) > ircNick.getModeNum(b.mode))
		return 1;
	else
		return ircNick.sortByName(a.name.toLowerCase(),b.name.toLowerCase())
};