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
		
		this.titleElement =				this.controller.get('title');
		this.userListElement =			this.controller.get('userList');
		
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
		this.listModel.items = this.channel.getNicks();
		
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

