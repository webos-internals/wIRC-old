function PreferencesAssistant()
{
	// setup default preferences in the prefCookie.js model
	this.cookie = new prefCookie();
	this.prefs = this.cookie.get();
	
	// for secret group
	this.secretString = '';
	this.secretAnswer = 'iknowwhatimdoing';
	
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

PreferencesAssistant.prototype.setup = function()
{
	try
	{
		// setup menu
		this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
		
		// set this scene's default transition
		this.controller.setDefaultTransition(Mojo.Transition.zoomFade);
		
		// setup handlers for preferences
		this.toggleChangeHandler = this.toggleChanged.bindAsEventListener(this);
		this.listChangedHandler  = this.listChanged.bindAsEventListener(this);
		
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
			//this.prefs
			{
				theme: 'palm-default',
        		disabled: true
			}
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
		
		
		
		// Messages Group
		this.controller.setupWidget
		(
			'messagesStyle',
			{
				label: 'Message Style',
				choices:
				[
					{label:'Left Aligned',	value:'lefta'}, // 'left' is special and adds padding we don't want
					{label:'Fixed Columns',	value:'fixed'}
				],
				modelProperty: 'messagesStyle'
			},
			this.prefs
		);
		this.controller.setupWidget
		(
			'fontSize',
			{
				minValue: 9,
				maxValue: 22,
				round: true,
				modelProperty: 'fontSize'
			},
			this.prefs
		);
		this.fontSizeChanged({value:this.prefs.fontSize});
		
		this.controller.listen('messagesStyle',	Mojo.Event.propertyChange, this.listChangedHandler);
		this.controller.listen('fontSize',		Mojo.Event.propertyChange, this.fontSizeChanged.bindAsEventListener(this));
		
		
		
		// hide secret group
		this.controller.get('secretPreferences').style.display = 'none';
		
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'preferences#setup');
	}

}

PreferencesAssistant.prototype.listChanged = function(event)
{
	this.cookie.put(this.prefs);
}

PreferencesAssistant.prototype.themeChanged = function(event)
{
	// set the theme right away with the body class
	this.controller.document.body.className = event.value;
	this.cookie.put(this.prefs);
}

PreferencesAssistant.prototype.toggleChanged = function(event)
{
	this.prefs[event.target.id] = event.value;
	this.cookie.put(this.prefs);
}

PreferencesAssistant.prototype.fontSizeChanged = function(event)
{
	// set the font size of the preview message
	this.controller.get('fontSizeTest').innerHTML = 'Size ' + event.value + ' Preview';
	this.controller.get('fontSizeTest').style.fontSize = event.value + 'px';
	this.cookie.put(this.prefs);
}

PreferencesAssistant.prototype.handleCommand = function(event)
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

PreferencesAssistant.prototype.keyPress = function(event)
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

PreferencesAssistant.prototype.activate = function(event) {}

PreferencesAssistant.prototype.deactivate = function(event)
{
	// reload global storage of preferences when we get rid of this stage
	var tmp = prefs.get(true);
}

PreferencesAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening('theme',			Mojo.Event.propertyChange, this.themeChanged.bindAsEventListener(this));
	this.controller.stopListening('statusPop',		Mojo.Event.propertyChange, this.toggleChangeHandler);
	this.controller.stopListening('messagesStyle',	Mojo.Event.propertyChange, this.listChangedHandler);
	this.controller.stopListening('fontSize',		Mojo.Event.propertyChange, this.fontSizeChanged.bindAsEventListener(this));
}
