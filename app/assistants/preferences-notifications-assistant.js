function PreferencesNotificationsAssistant()
{
	// setup default preferences in the prefCookie.js model
	this.cookie = new prefCookie();
	this.prefs = this.cookie.get();
	
	this.pageList = [
		{label: 'General',			command: 'general'},
		{label: 'Messages',			command: 'messages'},
		{label: 'Notifications',	command: 'notifications'}
	];
	this.currentPage = 'notifications';
	
	// setup menu
	this.menuModel =
	{
		visible: true,
		items:
		[
			{
				label: "Help",
				command: 'do-help'
			}
		]
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
}
