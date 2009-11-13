function ChannelListAssistant(server)
{
	this.server = server;
	
	this.server.setListAssistant(this);
	
	this.listModel =
	{
		items: []
	};
}

ChannelListAssistant.prototype.setup = function()
{
	
	this.titleElement =		this.controller.get('title');
	this.listElement =		this.controller.get('channelList');
	this.listTapHandler =	this.listTapHandler.bindAsEventListener(this);
	
	this.titleElement.update((this.server.alias?this.server.alias:this.server.address) + ' - Channel List');
	
	this.controller.setupWidget
	(
		'channelList',
		{
			itemTemplate: "channel-list/channel-row",
			swipeToDelete: false,
			reorderable: false
		},
		this.listModel
	);
	
	Mojo.Event.listen(this.listElement, Mojo.Event.listTap, this.listTapHandler);
}

ChannelListAssistant.prototype.loadChannels = function(channels)
{
	this.listModel.items = [];
	
	if (channels.length > 0)
	{
		for (var c = 0; c < channels.length; c++) 
		{
			this.listModel.items.push({channel: channels[c].channel, users: channels[c].users, topic: channels[c].topic});
		}
	}
	
	/*
	// sorts by name
	this.listModel.items.sort(function(a, b)
	{
		aName = a.channel.toLowerCase();
		bName = b.channel.toLowerCase();
		return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
	});
	*/
	
	// sorts by usercount
	this.listModel.items.sort(function(a, b)
	{
		return b.users - a.users;
	});
	
	this.listElement.mojo.noticeUpdatedItems(0, this.listModel.items);
	this.listElement.mojo.setLength(this.listModel.items.length);
}

ChannelListAssistant.prototype.doneLoading = function()
{
	alert('done!');
}

ChannelListAssistant.prototype.listTapHandler = function(event)
{
	alert('tapped');
}

ChannelListAssistant.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.listElement, Mojo.Event.listDelete, this.listTapHandler);
}
