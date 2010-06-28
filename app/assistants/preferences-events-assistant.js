function PreferencesEventsAssistant()
{
	// setup default preferences in the prefCookie.js model
	this.cookie = new preferenceCookie();
	this.prefs = this.cookie.get();
	
	this.pageList = [
		{label: 'General',			command: 'general'},
		{label: 'Messages',			command: 'messages'},
		{label: 'Events',			command: 'events'},
		{label: 'Keybindings',		command: 'keybindings'},
		{label: 'Notifications',	command: 'notifications'},
		{label: 'DCC',				command: 'dcc'},
		{label: 'Aliases',			command: 'aliases'}
	];
	this.currentPage = 'events';
	
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

PreferencesEventsAssistant.prototype.setup = function()
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
		this.textChangeHandler  = this.textChanged.bindAsEventListener(this);
		
		// Reasons Group
		this.controller.setupWidget
		(
			'partReason',
			{
				multiline: false,
				enterSubmits: false,
				//changeOnKeyPress: true,
				maxLength: 128,
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode,
				modelProperty: 'partReason'
			},
			this.prefs
		);
		this.controller.setupWidget
		(
			'quitReason',
			{
				multiline: false,
				enterSubmits: false,
				//changeOnKeyPress: true,
				maxLength: 128,
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode,
				modelProperty: 'quitReason'
			},
			this.prefs
		);
		this.controller.setupWidget
		(
			'kickReason',
			{
				multiline: false,
				enterSubmits: false,
				//changeOnKeyPress: true,
				maxLength: 128,
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode,
				modelProperty: 'kickReason'
			},
			this.prefs
		);
		this.controller.listen('partReason', Mojo.Event.propertyChange, this.textChangeHandler);
		this.controller.listen('quitReason', Mojo.Event.propertyChange, this.textChangeHandler);
		this.controller.listen('kickReason', Mojo.Event.propertyChange, this.textChangeHandler);
		
		
		
		// Visibility Group
		this.controller.setupWidget
		(
			'eventJoin',
			{
	  			trueLabel:  'Show',
	  			trueValue:	true,
	 			falseLabel: 'Hide',
	 			falseValue: false,
	  			fieldName:  'eventJoin'
			},
			{
				value : this.prefs.eventJoin,
	 			disabled: false
			}
		);
		this.controller.setupWidget
		(
			'eventPart',
			{
	  			trueLabel:  'Show',
	  			trueValue:	true,
	 			falseLabel: 'Hide',
	 			falseValue: false,
	  			fieldName:  'eventPart'
			},
			{
				value : this.prefs.eventPart,
	 			disabled: false
			}
		);
		this.controller.setupWidget
		(
			'eventQuit',
			{
	  			trueLabel:  'Show',
	  			trueValue:	true,
	 			falseLabel: 'Hide',
	 			falseValue: false,
	  			fieldName:  'eventQuit'
			},
			{
				value : this.prefs.eventQuit,
	 			disabled: false
			}
		);
		this.controller.setupWidget
		(
			'eventMode',
			{
	  			trueLabel:  'Show',
	  			trueValue:	true,
	 			falseLabel: 'Hide',
	 			falseValue: false,
	  			fieldName:  'eventMode'
			},
			{
				value : this.prefs.eventMode,
	 			disabled: false
			}
		);
		
		this.controller.listen('eventJoin',	Mojo.Event.propertyChange, this.toggleChangeHandler);
		this.controller.listen('eventPart',	Mojo.Event.propertyChange, this.toggleChangeHandler);
		this.controller.listen('eventQuit',	Mojo.Event.propertyChange, this.toggleChangeHandler);
		this.controller.listen('eventMode',	Mojo.Event.propertyChange, this.toggleChangeHandler);
		
		
		
		// make it so nothing is selected by default (textbox rage)
		this.controller.setInitialFocusedElement(null);
				
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'preferences#setup');
	}

}

PreferencesEventsAssistant.prototype.toggleChanged = function(event)
{
	this.prefs[event.target.id] = event.value;
	this.cookie.put(this.prefs);
}
PreferencesEventsAssistant.prototype.sliderChanged = function(event)
{
	this.cookie.put(this.prefs);
}
PreferencesEventsAssistant.prototype.listChanged = function(event)
{
	this.cookie.put(this.prefs);
}
PreferencesEventsAssistant.prototype.textChanged = function(event)
{
	this.cookie.put(this.prefs);
}

PreferencesEventsAssistant.prototype.pageSwitch = function(page)
{
	if (page === null || page == "" || page == undefined || page == this.currentPage) return;
	this.controller.stageController.swapScene({name: 'preferences-'+page, transition: Mojo.Transition.crossFade});
}

PreferencesEventsAssistant.prototype.pageTap = function(event)
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

PreferencesEventsAssistant.prototype.handleCommand = function(event)
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

PreferencesEventsAssistant.prototype.activate = function(event)
{
	if (!this.hasBennActivated)
	{
		this.pageSwitcher(this.currentPage);
	}
	this.hasBennActivated = true;
}

PreferencesEventsAssistant.prototype.deactivate = function(event)
{
	this.alertListSave();
	
	// reload global storage of preferences when we get rid of this stage
	var tmp = prefs.get(true);
}

PreferencesEventsAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.pageSelectorElement, Mojo.Event.tap,			   this.pageTapHandler);
	this.controller.stopListening(this.partReason, 			Mojo.Event.propertyChange, this.textChangeHandler);
	this.controller.stopListening(this.quitReason, 			Mojo.Event.propertyChange, this.textChangeHandler);
	this.controller.stopListening(this.kickReason, 			Mojo.Event.propertyChange, this.textChangeHandler);
	this.controller.stopListening('eventJoin',				Mojo.Event.propertyChange, this.toggleChangeHandler);
	this.controller.stopListening('eventPart',				Mojo.Event.propertyChange, this.toggleChangeHandler);
	this.controller.stopListening('eventQuit',				Mojo.Event.propertyChange, this.toggleChangeHandler);
	this.controller.stopListening('eventMode',				Mojo.Event.propertyChange, this.toggleChangeHandler);
}
