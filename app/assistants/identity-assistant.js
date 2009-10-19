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
			'nick1',
			{
				multiline: false,
				enterSubmits: false,
				hintText: '',
				modelProperty: 'nick1',
				textCase: Mojo.Widget.steModeLowerCase
			},
			this.prefs
		);
		this.controller.setupWidget
		(
			'nick2',
			{
				multiline: false,
				enterSubmits: false,
				hintText: '',
				modelProperty: 'nick2',
				textCase: Mojo.Widget.steModeLowerCase
			},
			this.prefs
		);
		this.controller.setupWidget
		(
			'nick3',
			{
				multiline: false,
				enterSubmits: false,
				hintText: '',
				modelProperty: 'nick3',
				textCase: Mojo.Widget.steModeLowerCase
			},
			this.prefs
		);
		
		this.controller.listen('nick1', Mojo.Event.propertyChange, this.textChanged);
		this.controller.listen('nick2', Mojo.Event.propertyChange, this.textChanged);
		this.controller.listen('nick3', Mojo.Event.propertyChange, this.textChanged);
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'preferences#setup');
	}

}

IdentityAssistant.prototype.textChanged = function(event)
{
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
	this.controller.stopListening('nick1', Mojo.Event.propertyChange, this.textChanged);
	this.controller.stopListening('nick2', Mojo.Event.propertyChange, this.textChanged);
	this.controller.stopListening('nick3', Mojo.Event.propertyChange, this.textChanged);
}
