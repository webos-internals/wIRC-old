function ChannelUsersAssistant(channel)
{
	this.channel = channel;
	
	this.titleElement =				false;
	this.userListElement =			false;
	
	this.listModel =
	{
		items: []
	};
	
	// setup menu
	this.menuModel =
	{
		visible: true,
		items:
		[
			{
				label: "Preferences",
				command: 'do-prefs'
			}
		]
	}
}

ChannelUsersAssistant.prototype.setup = function()
{
	try
	{
		this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
		
		this.titleElement =		this.controller.get('title');
		this.userListElement =	this.controller.get('userList');
		
		this.listTapHandler =	this.listTap.bindAsEventListener(this);
		
		this.titleElement.innerHTML = this.channel.name;
		
		this.updateList(true);
		this.controller.setupWidget
		(
			'userList',
			{
				itemTemplate: "channel-users/user-row",
				swipeToDelete: false,
				reorderable: false,
				renderLimit: 50
			},
			this.listModel
		);
		
		Mojo.Event.listen(this.userListElement, Mojo.Event.listTap, this.listTapHandler);
		
	} 
	catch (e) 
	{
		Mojo.Log.logException(e, 'channel-users#setup');
	}
}

ChannelUsersAssistant.prototype.updateList = function(skipUpdate)
{
	try
	{
		this.listModel.items = [];
		this.listModel.items = this.channel.getListNicks();
		
		this.listModel.items.sort(function(a, b)
		{
			var toReturn = 0;
			
			toReturn = ircNick.getModeNum(a.mode) - ircNick.getModeNum(b.mode);
			
			if (toReturn == 0)
			{	// if mode is the same, sort by date
				aName = a.name.toLowerCase();
				bName = b.name.toLowerCase();
				toReturn = ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
			}
			
			return toReturn
		});
		
		if (!skipUpdate) 
		{
			this.listElement.mojo.noticeUpdatedItems(0, this.listModel.items);
			this.listElement.mojo.setLength(this.listModel.items.length);
		}
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'channel-users#updateList');
	}
}

ChannelUsersAssistant.prototype.listTap = function(event)
{
	event.stop();
	this.controller.showDialog(
	{
		template: 'channel-dialogs/user-dialog',
		assistant: new UserActionDialog(this, event.item)
	});
}

ChannelUsersAssistant.prototype.handleCommand = function(event)
{
	if (event.type == Mojo.Event.command)
	{
		switch (event.command)
		{
			case 'do-prefs':
				this.controller.stageController.pushScene('preferences');
				break;
		}
	}
}

ChannelUsersAssistant.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.userListElement, Mojo.Event.listTap, this.listTapHandler);
}

