function ircNick (params) {
	
	this.name = params.name;
	this.channels = [];
	this.channelModes = [];
	
	this.addChannel = function(channel, mode) {
		if (channel) {
			if (this.channels.indexOf(channel) === -1 || !channel.containsNick(this)) {
				if (!channel.containsNick(this)) {
					channel.addNick(this);
					enyo.log('adding nick',this.name,channel)
				}
				if(this.channels.indexOf(channel) === -1)
					this.channels.push(channel);
				if (mode) this.channelModes[channel.name] = [mode];
				else this.channelModes[channel.name] = [];
			}
		}
	};

	this.removeChannel = function(channel) {
		if (channel) {
			channel.removeNick(this);
			this.channels = this.channels.without(channel);
			this.channelModes[channel.name] = null;
		}
	};

	this.getHighestMode = function(channel) {
		if (this.channelModes[channel.name].length < 1)
			return '';
		if (this.channelModes[channel.name].length > 1)
			this.channelModes[channel.name].sort(function(a, b) {
				return ircNick.getModeNum(a) - ircNick.getModeNum(b);
			});
		return this.channelModes[channel.name][0];
	};

	this.getListObject = function(channel) {
		var objMode = this.getHighestMode(channel);
		var obj = {
			name:	this.name,
			prefix:	(channel.name ? ircNick.getModePrefix(objMode) : ''),
			mode:	(channel.name ? objMode : '')
		};
		return obj;
	};
	
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
