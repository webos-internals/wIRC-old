function PreferencesKeybindingsAssistant()
{
	// setup default preferences in the prefCookie.js model
	this.cookie = new preferenceCookie();
	this.prefs = this.cookie.get();
	
	this.pageList = [
		{label: 'General',			command: 'general'},
		{label: 'Messages',			command: 'messages'},
		{label: 'Events'		,	command: 'events'},
		{label: 'Keybindings'	,	command: 'keybindings'},
		{label: 'Notifications',	command: 'notifications'}
	];
	this.currentPage = 'keybindings';
	
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

PreferencesKeybindingsAssistant.prototype.setup = function()
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
				
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'preferences#setup');
	}

}

PreferencesKeybindingsAssistant.prototype.toggleChanged = function(event)
{
	this.prefs[event.target.id] = event.value;
	this.cookie.put(this.prefs);
}
PreferencesKeybindingsAssistant.prototype.sliderChanged = function(event)
{
	this.cookie.put(this.prefs);
}
PreferencesKeybindingsAssistant.prototype.listChanged = function(event)
{
	this.cookie.put(this.prefs);
}

PreferencesKeybindingsAssistant.prototype.pageSwitch = function(page)
{
	if (page === null || page == "" || page == undefined || page == this.currentPage) return;
	this.controller.stageController.swapScene({name: 'preferences-'+page, transition: Mojo.Transition.crossFade});
}

PreferencesKeybindingsAssistant.prototype.pageTap = function(event)
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

PreferencesKeybindingsAssistant.prototype.handleCommand = function(event)
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

PreferencesKeybindingsAssistant.prototype.activate = function(event)
{
	if (!this.hasBennActivated)
	{
		this.pageSwitcher(this.currentPage);
	}
	this.hasBennActivated = true;
}

PreferencesKeybindingsAssistant.prototype.deactivate = function(event)
{
	this.alertListSave();
	
	// reload global storage of preferences when we get rid of this stage
	var tmp = prefs.get(true);
}

PreferencesKeybindingsAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.pageSelectorElement, Mojo.Event.tap,			   this.pageTapHandler);
}
