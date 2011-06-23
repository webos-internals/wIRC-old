function PreferencesDccAssistant()
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
	this.currentPage = 'dcc';
	
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

PreferencesDccAssistant.prototype.setup = function()
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
		
		// Add back button functionality for the TouchPad
		this.backElement = this.controller.get('icon');
		this.backTapHandler = this.backTap.bindAsEventListener(this);
		this.controller.listen(this.backElement, Mojo.Event.tap, this.backTapHandler);

		// listener for help toggle
		this.helpTap = this.helpRowTapped.bindAsEventListener(this);
		this.controller.listen(this.controller.get('help-toggle'), Mojo.Event.tap, this.helpButtonTapped.bindAsEventListener(this));
		
		// setup handlers for preferences
		this.toggleChangeHandler = this.toggleChanged.bindAsEventListener(this);
		this.sliderChangeHandler = this.sliderChanged.bindAsEventListener(this);
		this.listChangedHandler  = this.listChanged.bindAsEventListener(this);
		
		
		// chat group
		this.controller.setupWidget
		(
			'dccChatAction',
			{
				label: 'Invite Action',
				choices:
				[
					{label:'Always Accept',	value:'accept'},
					{label:'Prompt',		value:'prompt'},
					{label:'Always Ignore',	value:'ignore'}
				],
				modelProperty: 'dccChatAction'
			},
			this.prefs
		);
		this.controller.setupWidget
		(
			'dccChatInviteSound',
			{
	  			trueLabel:  'Yes',
	 			falseLabel: 'No',
	  			fieldName:  'dccChatInviteSound'
			},
			{
				value : this.prefs.dccChatInviteSound,
	 			disabled: false
			}
		);
		
		this.dccChatActionChanged();
		this.controller.listen('dccChatAction',			Mojo.Event.propertyChange, this.dccChatActionChanged.bindAsEventListener(this));
		this.controller.listen('dccChatInviteSound',	Mojo.Event.propertyChange, this.toggleChangeHandler);
		
		
		// files group
		this.defaultFolderChanged(this.prefs.dccDefaultFolder);
		this.controller.listen('dccDefaultFolderButton',Mojo.Event.tap,				this.defaultFolderTapped.bindAsEventListener(this));
		
		this.controller.setupWidget
		(
			'dccSendAction',
			{
				label: 'Request Action',
				choices:
				[
					{label:'Prompt',		value:'prompt'},
					{label:'Always Ignore',	value:'ignore'}
				],
				modelProperty: 'dccSendAction'
			},
			this.prefs
		);
		this.controller.setupWidget
		(
			'dccSendRequestSound',
			{
	  			trueLabel:  'Yes',
	 			falseLabel: 'No',
	  			fieldName:  'dccSendRequestSound'
			},
			{
				value : this.prefs.dccSendRequestSound,
	 			disabled: false
			}
		);
		this.controller.setupWidget
		(
			'dccSendAlwaysDefault',
			{
	  			trueLabel:  'Yes',
	 			falseLabel: 'No',
	  			fieldName:  'dccSendAlwaysDefault'
			},
			{
				value : this.prefs.dccSendAlwaysDefault,
	 			disabled: false
			}
		);
		
		this.dccSendActionChanged();
		this.controller.listen('dccSendAction',			Mojo.Event.propertyChange, this.dccSendActionChanged.bindAsEventListener(this));
		this.controller.listen('dccSendRequestSound',	Mojo.Event.propertyChange, this.toggleChangeHandler);
		this.controller.listen('dccSendAlwaysDefault',	Mojo.Event.propertyChange, this.toggleChangeHandler);
		
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

PreferencesDccAssistant.prototype.helpButtonTapped = function(event)
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
PreferencesDccAssistant.prototype.helpRowTapped = function(event)
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

PreferencesDccAssistant.prototype.toggleChanged = function(event)
{
	this.prefs[event.target.id] = event.value;
	this.cookie.put(this.prefs);
}
PreferencesDccAssistant.prototype.sliderChanged = function(event)
{
	this.cookie.put(this.prefs);
}
PreferencesDccAssistant.prototype.listChanged = function(event)
{
	this.cookie.put(this.prefs);
}

PreferencesDccAssistant.prototype.dccChatActionChanged = function(event)
{
	if (event) 
	{
		this.listChanged(event);
	}
	if (this.prefs['dccChatAction'] == 'prompt')
	{
		this.controller.get('dccChatInviteContainer').className = 'palm-row first';
		this.controller.get('dccChatInviteSoundRow').style.display = '';
	}
	else
	{
		this.controller.get('dccChatInviteContainer').className = 'palm-row single';
		this.controller.get('dccChatInviteSoundRow').style.display = 'none';
	}
}
PreferencesDccAssistant.prototype.dccSendActionChanged = function(event)
{
	if (event) 
	{
		this.listChanged(event);
	}
	if (this.prefs['dccSendAction'] == 'prompt')
	{
		this.controller.get('dccSendRequestContainer').className = 'palm-row';
		this.controller.get('dccSendRequestSoundRow').style.display = '';
		this.controller.get('dccSendAlwaysDefaultRow').style.display = '';
	}
	else
	{
		this.controller.get('dccSendRequestContainer').className = 'palm-row last';
		this.controller.get('dccSendRequestSoundRow').style.display = 'none';
		this.controller.get('dccSendAlwaysDefaultRow').style.display = 'none';
	}
}
PreferencesDccAssistant.prototype.defaultFolderTapped = function(event)
{
	var f = new filePicker({
		type: 'folder',
		onSelect: this.defaultFolderChanged.bind(this),
		folder: this.prefs.dccDefaultFolder,
		pop: false,
		sceneTitle: 'Select A Default File Save Folder'
	});
}
PreferencesDccAssistant.prototype.defaultFolderChanged = function(value)
{
	if (value)
	{
		this.controller.get('dccDefaultFolderDisplay').update(filePicker.parseFileString(value));
		this.prefs.dccDefaultFolder = value;
		this.cookie.put(this.prefs);
	}
}

PreferencesDccAssistant.prototype.pageSwitch = function(page)
{
	if (page === null || page == "" || page == undefined || page == this.currentPage) return;
	this.controller.stageController.swapScene({name: 'preferences-'+page, transition: Mojo.Transition.crossFade});
}
PreferencesDccAssistant.prototype.pageTap = function(event)
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

PreferencesDccAssistant.prototype.backTap = function(event)
{
    if (Mojo.Environment.DeviceInfo.modelNameAscii == 'TouchPad') {
	this.controller.stageController.popScene();
    }
};

PreferencesDccAssistant.prototype.handleCommand = function(event)
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

PreferencesDccAssistant.prototype.activate = function(event)
{
	if (!this.hasBennActivated)
	{
		this.pageSwitcher(this.currentPage);
	}
	this.hasBennActivated = true;
}
PreferencesDccAssistant.prototype.deactivate = function(event)
{
	// reload global storage of preferences when we get rid of this stage
	var tmp = prefs.get(true);
}

PreferencesDccAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.backElement, Mojo.Event.tap, this.backTapHandler);
	this.controller.stopListening(this.pageSelectorElement, Mojo.Event.tap,			   this.pageTapHandler);
}
