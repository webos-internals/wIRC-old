function PreferencesGeneralAssistant()
{
	// setup default preferences in the prefCookie.js model
	this.cookie = new prefCookie();
	this.prefs = this.cookie.get();
	
	// for secret group
	this.secretString = '';
	this.secretAnswer = 'iknowwhatimdoing';
	
	this.interfaceWrapper =		false;
	
	this.pageList = [
		{label: 'General',			command: 'general'},
		{label: 'Messages',			command: 'messages'},
		{label: 'Notifications',	command: 'notifications'}
	];
	this.currentPage = 'general';
	
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

PreferencesGeneralAssistant.prototype.setup = function()
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
		
		this.pifaceChangedHandler = this.pifaceChanged.bindAsEventListener(this);
		
		
		
		// Global Group
		this.controller.setupWidget
		(
			'theme',
			{
				label: 'Theme',
				choices:
				[
					{label:'Palm Default',	value:'palm-default'},
					{label:'Palm Dark',		value:'palm-dark'}
				],
				modelProperty: 'theme'
			},
			this.prefs
		);
		
		this.controller.listen('theme',	Mojo.Event.propertyChange, this.themeChanged.bindAsEventListener(this));
		
		
		
		// Server Status Group
		this.controller.setupWidget
		(
			'statusPop',
			{
	  			trueLabel:  'Yes',
	 			falseLabel: 'No',
	  			fieldName:  'statusPop'
			},
			{
				value : this.prefs.statusPop,
	 			disabled: false
			}
		);
		
		this.controller.listen('statusPop',	Mojo.Event.propertyChange, this.toggleChangeHandler);
		
		// Connection details group
		this.interfaceWrapper =		this.controller.get('interfaceWrapper');
		this.pifaceChanged();
		this.controller.setupWidget
		(
			'piface',
			{
				label: 'Interface',
				choices:
				[
					{label:'None', value:''},
					{label:'Wan (ppp0)', value:'ppp0'},
					{label:'Wifi (eth0)', value:'eth0'}
				],
				modelProperty: 'piface'
			},
			this.prefs
		);
		this.controller.listen('piface',		Mojo.Event.propertyChange, this.pifaceChangedHandler);
		this.controller.setupWidget
		(
			'aiface',
			{
	  			trueLabel:  'Yes',
	  			trueValue:	true,
	 			falseLabel: 'No',
	 			falseValue: false,
	  			fieldName:  'aiface'
			},
			{
				value : this.prefs.aiface,
	 			disabled: false
			}
		);
		this.controller.listen('aiface',		Mojo.Event.propertyChange, this.toggleChangeHandler);
		
		
		
		// hide secret group
		this.controller.get('secretPreferences').style.display = 'none';
		
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'preferences#setup');
	}

}

PreferencesGeneralAssistant.prototype.toggleChanged = function(event)
{
	this.prefs[event.target.id] = event.value;
	this.cookie.put(this.prefs);
}
PreferencesGeneralAssistant.prototype.sliderChanged = function(event)
{
	this.cookie.put(this.prefs);
}
PreferencesGeneralAssistant.prototype.listChanged = function(event)
{
	this.cookie.put(this.prefs);
}

PreferencesGeneralAssistant.prototype.senderColoringChanged = function(event)
{
	if (event) 
	{
		this.toggleChanged(event);
	}
	if (this.prefs['senderColoring'])
	{
		this.controller.get('OtherNicksWrapper').style.display = 'none';
	}
	else
	{
		this.controller.get('OtherNicksWrapper').style.display = '';
	}	
}
PreferencesGeneralAssistant.prototype.themeChanged = function(event)
{
	// set the theme right away with the body class
	this.controller.document.body.className = event.value;
	this.listChanged();
}
PreferencesGeneralAssistant.prototype.pifaceChanged = function(event)
{
	if (event) 
	{
		this.listChanged(event);
	}
	if (this.prefs['piface']=='')
	{
		this.interfaceWrapper.className = 'palm-row single';
		this.controller.get('fallbackInfo').style.display = 'none';
	}
	else
	{
		this.interfaceWrapper.className = 'palm-row first';
		this.controller.get('fallbackInfo').style.display = '';
	}
}

PreferencesGeneralAssistant.prototype.sliderGetPrefValue = function(min, max, slider)
{
	return Math.round(min + (slider * (max - min)));
}
PreferencesGeneralAssistant.prototype.sliderGetSlideValue = function(min, max, pref)
{
	return ((pref - min) / (max - min));
}


PreferencesGeneralAssistant.prototype.pageSwitch = function(page)
{
	if (page === null || page == "" || page == undefined || page == this.currentPage) return;
	this.controller.stageController.swapScene({name: 'preferences-'+page, transition: Mojo.Transition.crossFade});
}
PreferencesGeneralAssistant.prototype.pageTap = function(event)
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

PreferencesGeneralAssistant.prototype.handleCommand = function(event)
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

PreferencesGeneralAssistant.prototype.keyPress = function(event)
{
	this.secretString += String.fromCharCode(event.originalEvent.charCode);
	
	if (event.originalEvent.charCode == 8)
	{
		this.secretString = '';
	}
	
	if (this.secretString.length == this.secretAnswer.length)
	{
		if (this.secretString === this.secretAnswer)
		{
			//this.controller.get('secretPreferences').style.display = '';
			//this.controller.getSceneScroller().mojo.revealElement(this.controller.get('secretPreferences'));
			this.secretString = '';
		}
	}
	else if (this.secretString.length > this.secretAnswer.length)
	{
		this.secretString = '';
	}
}

PreferencesGeneralAssistant.prototype.activate = function(event)
{
	if (!this.hasBennActivated)
	{
		this.pageSwitcher(this.currentPage);
	}
	this.hasBennActivated = true;
}

PreferencesGeneralAssistant.prototype.deactivate = function(event)
{
	// reload global storage of preferences when we get rid of this stage
	var tmp = prefs.get(true);
}

PreferencesGeneralAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.pageSelectorElement, Mojo.Event.tap,			   this.pageTapHandler);
	
	this.controller.stopListening('theme',					Mojo.Event.propertyChange, this.themeChanged.bindAsEventListener(this));
	
	this.controller.stopListening('statusPop',				Mojo.Event.propertyChange, this.toggleChangeHandler);
	
	this.controller.stopListening('piface',					Mojo.Event.propertyChange, this.pifaceChangedHandler);
	this.controller.stopListening('aiface',					Mojo.Event.propertyChange, this.listChangedHandler);
	
}
