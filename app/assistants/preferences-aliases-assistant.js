function PreferencesAliasesAssistant()
{
	// setup default preferences in the prefCookie.js model
	this.cookie = new preferenceCookie();
	this.prefs = this.cookie.get();
	
	this.pageList = [
		{label: 'General',			command: 'general'},
		{label: 'Messages',			command: 'messages'},
		{label: 'Events',			command: 'events'},
		//{label: 'Keybindings',		command: 'keybindings'},
		{label: 'Notifications',	command: 'notifications'},
		{label: 'DCC',				command: 'dcc'},
		{label: 'Aliases',			command: 'aliases'}
	];
	this.currentPage = 'aliases';
	
	// setup menu
	this.menuModel =
	{
		visible: true,
		items:
		[
			Mojo.Menu.editItem,
			{
				label: "Help",
				command: 'do-help'
			}
		]
	}
}

PreferencesAliasesAssistant.prototype.setup = function()
{
	try
	{
		// setup menu
		this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
		
		// set this scene's default transition
		this.controller.setDefaultTransition(Mojo.Transition.zoomFade);
		
		// setup page selector
		this.pageSelectorElement =	this.controller.get('pageSelector');
		this.pageNameElement =		this.controller.get('pageName');
		this.aliasListElement =		this.controller.get('aliasList');
		this.pageTapHandler =		this.pageTap.bindAsEventListener(this);
		this.pageSwitcher =			this.pageSwitch.bindAsEventListener(this);
		this.controller.listen(this.pageSelectorElement, Mojo.Event.tap, this.pageTapHandler);
		
		this.pageNameElement.update(this.currentPage);
		
		// Add back button functionality for the TouchPad
		this.backElement = this.controller.get('icon');
		this.backTapHandler = this.backTap.bindAsEventListener(this);
		this.controller.listen(this.backElement, Mojo.Event.tap, this.backTapHandler);

		// listener for help toggle
		this.helpTap = this.helpRowTapped.bindAsEventListener(this);
		this.controller.listen(this.controller.get('help-toggle'), Mojo.Event.tap, this.helpButtonTapped.bindAsEventListener(this));
		
		this.buildAliasList(true);
		this.controller.setupWidget
		(
			'aliasList',
			{
				itemTemplate: "preferences-aliases/alias-row",
				swipeToDelete: true,
				reorderable: true,
				addItemLabel: 'Add'
			},
			this.listModel
		);
		
		this.controller.listen(this.aliasListElement, Mojo.Event.listTap,		this.aliasListTap.bindAsEventListener(this));
		this.controller.listen(this.aliasListElement, Mojo.Event.listAdd,		this.aliasListAdd.bindAsEventListener(this));
		this.controller.listen(this.aliasListElement, Mojo.Event.listReorder,	this.aliasListReorder.bindAsEventListener(this));
		this.controller.listen(this.aliasListElement, Mojo.Event.listDelete,	this.aliasListDelete.bindAsEventListener(this));
		
		// add listeners to all the help-overlays
		var helps = this.controller.get('container').querySelectorAll('div.help-overlay');
		for (var h = 0; h < helps.length; h++) {
			this.controller.listen(helps[h], Mojo.Event.tap, this.helpTap);
		}
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'preferences#setup');
	}

}

PreferencesAliasesAssistant.prototype.helpButtonTapped = function(event)
{
	if (this.controller.get('container').hasClassName('help'))
	{
		this.controller.get('container').removeClassName('help');
		event.target.removeClassName('selected');
	}
	else
	{
		this.controller.get('container').addClassName('help');
		event.target.addClassName('selected');
	}
}
PreferencesAliasesAssistant.prototype.helpRowTapped = function(event)
{
	event.stop();
	event.stopPropagation();
	event.preventDefault();
	
	var lookup = event.target.id.replace(/help-/, '');
	var help = helpData.get(lookup);
	
	if (lookup && help)
	{
		this.controller.stageController.pushScene('help-data', help);
	}
}

PreferencesAliasesAssistant.prototype.buildAliasList = function(initial)
{
	this.listModel = {items:[]};
	this.aliasData = aliases.get();
	
	if (this.aliasData.length > 0)
	{
		for (var d = 0; d < this.aliasData.length; d++)
		{
			this.listModel.items.push({id: this.listModel.items.length+1, index: this.listModel.items.length, alias: this.aliasData[d].alias, command: this.aliasData[d].command});
		}
	}
	
	if (!initial)
	{
		this.aliasListElement.mojo.noticeUpdatedItems(0, this.listModel.items);
	 	this.aliasListElement.mojo.setLength(this.listModel.items.length);
	}
}
PreferencesAliasesAssistant.prototype.aliasListTap = function(event)
{
	this.controller.stageController.pushScene('preferences-alias-info', event.item);
}
PreferencesAliasesAssistant.prototype.aliasListAdd = function(event)
{
	this.controller.stageController.pushScene('preferences-alias-info', false);
}
PreferencesAliasesAssistant.prototype.aliasListReorder = function(event)
{
	for (var i = 0; i < this.listModel.items.length; i++) 
	{
		if (this.listModel.items[i].index == event.fromIndex) 
		{
			this.listModel.items[i].index = event.toIndex;
		}
		else 
		{
			if (event.fromIndex > event.toIndex) 
			{
				if (this.listModel.items[i].index < event.fromIndex &&
					this.listModel.items[i].index >= event.toIndex) 
				{
					this.listModel.items[i].index++;
				}
			}
			else if (event.fromIndex < event.toIndex) 
			{
				if (this.listModel.items[i].index > event.fromIndex &&
					this.listModel.items[i].index <= event.toIndex) 
				{
					this.listModel.items[i].index--;
				}
			}
		}
	}
	this.aliasListSave();
}
PreferencesAliasesAssistant.prototype.aliasListDelete = function(event)
{
	var newData = [];
	if (this.listModel.items.length > 0) 
	{
		for (var i = 0; i < this.listModel.items.length; i++) 
		{
			if (this.listModel.items[i].id == event.item.id) 
			{
				// ignore
			}
			else 
			{
				if (this.listModel.items[i].index > event.index) 
				{
					this.listModel.items[i].index--;
				}
				newData.push(this.listModel.items[i]);
			}
		}
	}
	this.listModel.items = newData;
	this.aliasListElement.mojo.noticeUpdatedItems(0, this.listModel.items);
 	this.aliasListElement.mojo.setLength(this.listModel.items.length);
	this.aliasListSave();
}
PreferencesAliasesAssistant.prototype.aliasListSave = function()
{
	var newData = [];
	if (this.listModel.items.length > 0) 
	{
		if (this.listModel.items.length > 1) 
		{
			this.listModel.items.sort(function(a, b)
			{
				return a.index - b.index;
			});
		}
		
		for (var i = 0; i < this.listModel.items.length; i++) 
		{
			newData.push({alias: this.listModel.items[i].alias, command: this.listModel.items[i].command});
		}
	}
	aliases.aliases = newData;
	aliases.save();
}

PreferencesAliasesAssistant.prototype.pageSwitch = function(page)
{
	if (page === null || page == "" || page == undefined || page == this.currentPage) return;
	this.controller.stageController.swapScene({name: 'preferences-'+page, transition: Mojo.Transition.crossFade});
}

PreferencesAliasesAssistant.prototype.pageTap = function(event)
{
	this.controller.popupSubmenu(
	{
		onChoose: this.pageSwitcher,
		popupClass: 'group-popup',
		toggleCmd: this.currentPage,
		placeNear: event.target,
		items: this.pageList
	});
}

PreferencesAliasesAssistant.prototype.backTap = function(event)
{
    if (Mojo.Environment.DeviceInfo.modelNameAscii == 'TouchPad') {
	this.controller.stageController.popScene();
    }
};

PreferencesAliasesAssistant.prototype.handleCommand = function(event)
{
	if (event.type == Mojo.Event.command)
	{
		switch (event.command)
		{
			case 'do-help':
				this.controller.stageController.pushScene('help');
				break;
		}
	}
}

PreferencesAliasesAssistant.prototype.activate = function(event)
{
	if (!this.hasBennActivated)
	{
		this.pageSwitcher(this.currentPage);
	}
	else
	{
		this.buildAliasList();
	}
	this.hasBennActivated = true;
}

PreferencesAliasesAssistant.prototype.deactivate = function(event)
{
	this.aliasListSave();
}

PreferencesAliasesAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.backElement, Mojo.Event.tap, this.backTapHandler);
	this.controller.stopListening(this.pageSelectorElement, Mojo.Event.tap,			   this.pageTapHandler);
}
