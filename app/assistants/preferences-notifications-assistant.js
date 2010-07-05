function PreferencesNotificationsAssistant()
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
	this.currentPage = 'notifications';
	
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

	this.alertList =		false;
	this.alertListModel =	{items:[]};
	this.alertListData =	[];
	this.alertListCount =	0;
	
	if (this.prefs.alertWords && this.prefs.alertWords.length > 0)
	{
		for (var n = 0; n < this.prefs.alertWords.length; n++)
		{
			this.alertListCount++;
			this.alertListData.push({id: this.alertListCount, index: this.alertListCount-1, value: this.prefs.alertWords[n]});
		}
	}
}

PreferencesNotificationsAssistant.prototype.setup = function()
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
		this.pageTapHandler =		this.pageTap.bindAsEventListener(this);
		this.pageSwitcher =			this.pageSwitch.bindAsEventListener(this);
		this.controller.listen(this.pageSelectorElement, Mojo.Event.tap, this.pageTapHandler);
		
		this.pageNameElement.update(this.currentPage);
		
		// setup handlers for preferences
		this.toggleChangeHandler = this.toggleChanged.bindAsEventListener(this);
		this.sliderChangeHandler = this.sliderChanged.bindAsEventListener(this);
		this.listChangedHandler  = this.listChanged.bindAsEventListener(this);
		
		
		
		
		// Dashboard/Banner Group
		this.controller.setupWidget
		(
			'dashboardChannel',
			{
	  			trueLabel:  'Yes',
	 			falseLabel: 'No',
	  			fieldName:  'dashboardChannel'
			},
			{
				value : this.prefs.dashboardChannel,
	 			disabled: false
			}
		);
		this.controller.setupWidget
		(
			'dashboardChannelSound',
			{
	  			trueLabel:  'Yes',
	 			falseLabel: 'No',
	  			fieldName:  'dashboardChannelSound'
			},
			{
				value : this.prefs.dashboardChannelSound,
	 			disabled: false
			}
		);
		this.controller.setupWidget
		(
			'dashboardQuerySound',
			{
	  			trueLabel:  'Yes',
	 			falseLabel: 'No',
	  			fieldName:  'dashboardQuerySound'
			},
			{
				value : this.prefs.dashboardQuerySound,
	 			disabled: false
			}
		);
		
		this.controller.setupWidget
		(
			'inviteAction',
			{
				label: 'Invite Action',
				choices:
				[
					{label:'Always Accept',	value:'accept'},
					{label:'Prompt',		value:'prompt'},
					{label:'Always Ignore',	value:'ignore'}
				],
				modelProperty: 'inviteAction'
			},
			this.prefs
		);
		this.controller.setupWidget
		(
			'dashboardInviteSound',
			{
	  			trueLabel:  'Yes',
	 			falseLabel: 'No',
	  			fieldName:  'dashboardInviteSound'
			},
			{
				value : this.prefs.dashboardInviteSound,
	 			disabled: false
			}
		);
		
		this.dashboardChannelChanged();
		this.controller.listen('dashboardChannel',		Mojo.Event.propertyChange, this.dashboardChannelChanged.bindAsEventListener(this));
		
		this.controller.listen('dashboardChannelSound',	Mojo.Event.propertyChange, this.toggleChangeHandler);
		this.controller.listen('dashboardQuerySound',	Mojo.Event.propertyChange, this.toggleChangeHandler);
		
		this.inviteActionChanged();
		this.controller.listen('inviteAction',			Mojo.Event.propertyChange, this.inviteActionChanged.bindAsEventListener(this));
		this.controller.listen('dashboardInviteSound',	Mojo.Event.propertyChange, this.toggleChangeHandler);
		
		
		
		
		this.alertList	= this.controller.get('alertList');
		
		this.alertListBuildList();
		this.controller.setupWidget
		(
			'alertList',
			{
				itemTemplate: "preferences-notifications/alert-row",
				swipeToDelete: true,
				reorderable: true,
				addItemLabel: 'Add',
				
				multiline: false,
				enterSubmits: false,
				modelProperty: 'value',
				changeOnKeyPress: true,
				charsAllow: this.validChars,
				maxLength: 16,
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.alertListModel
		);
		this.controller.setupWidget
		(
			'alertField',
			{
				multiline: false,
				enterSubmits: false,
				modelProperty: 'value',
				changeOnKeyPress: true,
				charsAllow: this.validChars,
				maxLength: 16,
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode
			}
		);
		
		this.controller.listen(this.alertList, Mojo.Event.listAdd,			this.alertListAdd.bindAsEventListener(this));
		this.controller.listen(this.alertList, Mojo.Event.propertyChanged,	this.alertListChange.bindAsEventListener(this));
		this.controller.listen(this.alertList, Mojo.Event.listReorder,		this.alertListReorder.bindAsEventListener(this));
		this.controller.listen(this.alertList, Mojo.Event.listDelete,		this.alertListDelete.bindAsEventListener(this));
		
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'preferences#setup');
	}

}

PreferencesNotificationsAssistant.prototype.toggleChanged = function(event)
{
	this.prefs[event.target.id] = event.value;
	this.cookie.put(this.prefs);
}
PreferencesNotificationsAssistant.prototype.sliderChanged = function(event)
{
	this.cookie.put(this.prefs);
}
PreferencesNotificationsAssistant.prototype.listChanged = function(event)
{
	this.cookie.put(this.prefs);
}

PreferencesNotificationsAssistant.prototype.dashboardChannelChanged = function(event)
{
	if (event) 
	{
		this.toggleChanged(event);
	}
	if (this.prefs['inviteAction'])
	{
		this.controller.get('dashboardChannelSoundRow').style.display = '';
	}
	else
	{
		this.controller.get('dashboardChannelSoundRow').style.display = 'none';
	}
}
PreferencesNotificationsAssistant.prototype.inviteActionChanged = function(event)
{
	if (event) 
	{
		this.listChanged(event);
	}
	if (this.prefs['inviteAction'] == 'prompt')
	{
		this.controller.get('inviteContainer').className = 'palm-row';
		this.controller.get('dashboardInviteSoundRow').style.display = '';
	}
	else
	{
		this.controller.get('inviteContainer').className = 'palm-row last';
		this.controller.get('dashboardInviteSoundRow').style.display = 'none';
	}
}

PreferencesNotificationsAssistant.prototype.sliderGetPrefValue = function(min, max, slider)
{
	return Math.round(min + (slider * (max - min)));
}
PreferencesNotificationsAssistant.prototype.sliderGetSlideValue = function(min, max, pref)
{
	return ((pref - min) / (max - min));
}

PreferencesNotificationsAssistant.prototype.pageSwitch = function(page)
{
	if (page === null || page == "" || page == undefined || page == this.currentPage) return;
	this.controller.stageController.swapScene({name: 'preferences-'+page, transition: Mojo.Transition.crossFade});
}
PreferencesNotificationsAssistant.prototype.pageTap = function(event)
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

PreferencesNotificationsAssistant.prototype.handleCommand = function(event)
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


PreferencesNotificationsAssistant.prototype.alertListBuildList = function()
{
	this.alertListModel.items = [];
	if (this.alertListData.length > 0)
	{
		for (var d = 0; d < this.alertListData.length; d++)
		{
			this.alertListModel.items.push(this.alertListData[d]);
		}
	}
}
PreferencesNotificationsAssistant.prototype.alertListAdd = function(event)
{
	this.alertListCount++;
	this.alertListData.push({id: this.alertListCount, index: this.alertListData.length, value: ''});
	
	this.alertListBuildList();
	
	this.alertList.mojo.noticeUpdatedItems(0, this.alertListModel.items);
	this.alertList.mojo.setLength(this.alertListModel.items.length);
	
	this.alertList.mojo.focusItem(this.alertListModel.items[this.alertListModel.items.length-1]);
	
	this.alertListSave();
}
PreferencesNotificationsAssistant.prototype.alertListChange = function(event)
{
	this.alertListSave();
}
PreferencesNotificationsAssistant.prototype.alertListReorder = function(event)
{
	for (var d = 0; d < this.alertListData.length; d++) 
	{
		if (this.alertListData[d].index == event.fromIndex) 
		{
			this.alertListData[d].index = event.toIndex;
		}
		else 
		{
			if (event.fromIndex > event.toIndex) 
			{
				if (this.alertListData[d].index < event.fromIndex &&
				this.alertListData[d].index >= event.toIndex) 
				{
					this.alertListData[d].index++;
				}
			}
			else if (event.fromIndex < event.toIndex) 
			{
				if (this.alertListData[d].index > event.fromIndex &&
				this.alertListData[d].index <= event.toIndex) 
				{
					this.alertListData[d].index--;
				}
			}
		}
	}
	this.alertListSave();
}
PreferencesNotificationsAssistant.prototype.alertListDelete = function(event)
{
	var newData = [];
	if (this.alertListData.length > 0) 
	{
		for (var d = 0; d < this.alertListData.length; d++) 
		{
			if (this.alertListData[d].id == event.item.id) 
			{
				// ignore
			}
			else 
			{
				if (this.alertListData[d].index > event.index) 
				{
					this.alertListData[d].index--;
				}
				newData.push(this.alertListData[d]);
			}
		}
	}
	this.alertListData = newData;
	this.alertListSave();
}
PreferencesNotificationsAssistant.prototype.alertListSave = function()
{
	if (this.alertListData.length > 0) 
	{
		if (this.alertListData.length > 1) 
		{
			this.alertListData.sort(function(a, b)
			{
				return a.index - b.index;
			});
		}
		
		for (var i = 0; i < this.alertListModel.items.length; i++) 
		{
			for (var d = 0; d < this.alertListData.length; d++) 
			{
				if (this.alertListData[d].id == this.alertListModel.items[i].id) 
				{
					this.alertListData[d].value = this.alertListModel.items[i].value;
				}
			}
		}
	}
	
	this.prefs.alertWords = [];
	if (this.alertListData.length > 0) 
	{
		for (var d = 0; d < this.alertListData.length; d++) 
		{
			if (this.alertListData[d].value) 
			{
				this.prefs.alertWords.push(this.alertListData[d].value);
			}
		}
	}
	
	this.cookie.put(this.prefs);
}




PreferencesNotificationsAssistant.prototype.activate = function(event)
{
	if (!this.hasBennActivated)
	{
		this.pageSwitcher(this.currentPage);
	}
	this.hasBennActivated = true;
}

PreferencesNotificationsAssistant.prototype.deactivate = function(event)
{
	this.alertListSave();
	
	// reload global storage of preferences when we get rid of this stage
	var tmp = prefs.get(true);
}

PreferencesNotificationsAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.pageSelectorElement, Mojo.Event.tap,			   this.pageTapHandler);
	
	this.controller.stopListening('dashboardChannel',		Mojo.Event.propertyChange, this.dashboardChannelChanged.bindAsEventListener(this));
	this.controller.stopListening('dashboardChannelSound',	Mojo.Event.propertyChange, this.toggleChangeHandler);
	this.controller.stopListening('dashboardQuerySound',	Mojo.Event.propertyChange, this.toggleChangeHandler);
	
	this.controller.stopListening('inviteAction',			Mojo.Event.propertyChange, this.inviteActionChanged.bindAsEventListener(this));
	this.controller.stopListening('dashboardInviteSound',	Mojo.Event.propertyChange, this.toggleChangeHandler);
	
	
	this.controller.stopListening(this.alertList, Mojo.Event.listAdd,			this.alertListAdd.bindAsEventListener(this));
	this.controller.stopListening(this.alertList, Mojo.Event.propertyChanged,	this.alertListChange.bindAsEventListener(this));
	this.controller.stopListening(this.alertList, Mojo.Event.listReorder,		this.alertListReorder.bindAsEventListener(this));
	this.controller.stopListening(this.alertList, Mojo.Event.listDelete,			this.alertListDelete.bindAsEventListener(this));
}
