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
		template: 'channel-users/user-dialog',
		assistant: new UserDialogAssistant(this, event.item)
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




function UserDialogAssistant(sceneAssistant, item)
{
	this.sceneAssistant = sceneAssistant;
	this.item = item;
	
	this.titleElement =			false;
	this.queryButtonElement =	false;
	this.opButtonElement =		false;
	this.voiceButtonElement =	false;
	this.kickButtonElement =	false;
	this.banButtonElement =		false;
	this.cancelButtonElement =	false;
	
	this.closeHandler =			false;
}

UserDialogAssistant.prototype.setup = function(widget)
{
	this.widget = widget;
	
	this.titleElement =			this.sceneAssistant.controller.get('dialogTitle');
	this.queryButtonElement =	this.sceneAssistant.controller.get('queryButton');
	this.opButtonElement =		this.sceneAssistant.controller.get('opButton');
	this.voiceButtonElement =	this.sceneAssistant.controller.get('voiceButton');
	this.kickButtonElement =	this.sceneAssistant.controller.get('kickButton');
	this.banButtonElement =		this.sceneAssistant.controller.get('banButton');
	this.cancelButtonElement =	this.sceneAssistant.controller.get('cancelButton');
	
	this.closeHandler =			this.close.bindAsEventListener(this);
	
	this.titleElement.update(this.item.name);
	
	
	this.sceneAssistant.controller.setupWidget
	(
		'queryButton',
		{},
		{
			buttonLabel: 'Query',
			buttonClass: 'palm-button'
		}
	);
	
	this.sceneAssistant.controller.setupWidget
	(
		'opButton',
		{},
		{
			buttonLabel: 'Op',
			buttonClass: 'palm-button'
		}
	);
	this.sceneAssistant.controller.setupWidget
	(
		'voiceButton',
		{},
		{
			buttonLabel: 'Voice',
			buttonClass: 'palm-button'
		}
	);
	
	this.sceneAssistant.controller.setupWidget
	(
		'kickButton',
		{},
		{
			buttonLabel: 'Kick',
			buttonClass: 'palm-button'
		}
	);
	this.sceneAssistant.controller.setupWidget
	(
		'banButton',
		{},
		{
			buttonLabel: 'Ban',
			buttonClass: 'palm-button'
		}
	);
	
	this.sceneAssistant.controller.setupWidget
	(
		'cancelButton',
		{},
		{
			buttonLabel: 'Cancel',
			buttonClass: 'palm-button'
		}
	);
	
	
	Mojo.Event.listen(this.queryButtonElement,	Mojo.Event.tap, this.closeHandler);
	Mojo.Event.listen(this.opButtonElement,		Mojo.Event.tap, this.closeHandler);
	Mojo.Event.listen(this.voiceButtonElement,	Mojo.Event.tap, this.closeHandler);
	Mojo.Event.listen(this.kickButtonElement,	Mojo.Event.tap, this.closeHandler);
	Mojo.Event.listen(this.banButtonElement,	Mojo.Event.tap, this.closeHandler);
	Mojo.Event.listen(this.cancelButtonElement,	Mojo.Event.tap, this.closeHandler);
}

UserDialogAssistant.prototype.close = function(event)
{
	event.stop();
	this.widget.mojo.close();
}

UserDialogAssistant.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.queryButtonElement,	Mojo.Event.tap, this.closeHandler);
	Mojo.Event.stopListening(this.opButtonElement,		Mojo.Event.tap, this.closeHandler);
	Mojo.Event.stopListening(this.voiceButtonElement,	Mojo.Event.tap, this.closeHandler);
	Mojo.Event.stopListening(this.kickButtonElement,	Mojo.Event.tap, this.closeHandler);
	Mojo.Event.stopListening(this.banButtonElement,	Mojo.Event.tap, this.closeHandler);
	Mojo.Event.stopListening(this.cancelButtonElement,	Mojo.Event.tap, this.closeHandler);
}


