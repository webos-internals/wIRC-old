function IdentityAssistant()
{
	// setup default preferences in the prefCookie.js model
	this.cookie = new prefCookie();
	this.prefs = this.cookie.get();
	
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

IdentityAssistant.prototype.setup = function()
{
	try
	{
		// setup menu
		this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
		
		// set this scene's default transition
		this.controller.setDefaultTransition(Mojo.Transition.zoomFade);
		
		// setup handler
		this.textChanged = this.textChanged.bindAsEventListener(this);
		
		this.controller.setupWidget
		(
			'realname',
			{
				multiline: false,
				enterSubmits: false,
				//changeOnKeyPress: true,
				hintText: '',
				modelProperty: 'realname',
				maxLength: 128,
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.prefs
		);		
		this.controller.setupWidget
		(
			'nick1',
			{
				multiline: false,
				enterSubmits: false,
				//changeOnKeyPress: true,
				hintText: '',
				modelProperty: 'nick1',
				charsAllow: this.validChars,
				maxLength: 16,
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.prefs
		);
		this.controller.setupWidget
		(
			'nick2',
			{
				multiline: false,
				enterSubmits: false,
				//changeOnKeyPress: true,
				hintText: '',
				modelProperty: 'nick2',
				charsAllow: this.validChars,
				maxLength: 16,
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.prefs
		);
		this.controller.setupWidget
		(
			'nick3',
			{
				multiline: false,
				enterSubmits: false,
				//changeOnKeyPress: true,
				hintText: '',
				modelProperty: 'nick3',
				charsAllow: this.validChars,
				maxLength: 16,
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.prefs
		);
		
		this.controller.listen('realname', Mojo.Event.propertyChange, this.textChanged);
		this.controller.listen('nick1', Mojo.Event.propertyChange, this.textChanged);
		this.controller.listen('nick2', Mojo.Event.propertyChange, this.textChanged);
		this.controller.listen('nick3', Mojo.Event.propertyChange, this.textChanged);
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'preferences#setup');
	}

}

IdentityAssistant.prototype.validChars = function(test)
{
//	if (String.fromCharCode(test).match(/^[\x41-\x7D][-\d\x41-\x7D]*$/)) 
//	Allow 0(x30)-9(x39), A(x41)-Z(x5A), [(x5B), ](x5D), ^(x5E), _(x5F), `(x60), a(x61)-z(x7A), {(x7B), |(x7C), }(x7D), ~(x7E), -(x2D)
	if (String.fromCharCode(test).match(/^[\x30-\x39\x41-\x5B\x5D-\x7E\x2D]*$/))
	{
		return true;
	}
	else
	{
		return false;
	}
}

IdentityAssistant.prototype.textChanged = function(event)
{
//	var error = false;
//	if (!event.value.match(/^[\x41-\x7D][-\d\x41-\x7D]*$/)) error = true;
	
	this.cookie.put(this.prefs);
}

IdentityAssistant.prototype.activate = function(event) {}
IdentityAssistant.prototype.deactivate = function(event)
{
	// reload global storage of preferences when we get rid of this stage
	var tmp = prefs.get(true);
}
IdentityAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening('realname', Mojo.Event.propertyChange, this.textChanged);
	this.controller.stopListening('nick1', Mojo.Event.propertyChange, this.textChanged);
	this.controller.stopListening('nick2', Mojo.Event.propertyChange, this.textChanged);
	this.controller.stopListening('nick3', Mojo.Event.propertyChange, this.textChanged);
}
