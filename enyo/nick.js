function ircNick (params) {
	
	this.name = params.name;
	this.channels = [];
	this.channelModes = [];
	
	this.addChannel = function(channel, mode) {
		if (channel) {
			if (this.channels.indexOf(channel) === -1 || !channel.containsNick(this)) {
				if (!channel.containsNick(this))
					channel.addNick(this);
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
	}
	
}
