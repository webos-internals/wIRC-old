function ServerInfoAssistant(id)
{
	this.serverKey =	false;
	this.server =		false;
	
	if (id)
	{
		this.serverKey = servers.getServerArrayKey(id);
		this.server = servers.servers[this.serverKey].getEditObject();
	}
	
	if (!this.server)
	{
		this.server = ircServer.getBlankServerObject();
	}
	
	this.aliasElement =			false;
	this.addressElement =		false;
	this.portElement =			false;
	this.autoConnectElement =	false;
	this.saveButtonElement =	false;
	
}

ServerInfoAssistant.prototype.setup = function()
{
	
	try 
	{
		this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, { visible: false });
		
		this.aliasElement =			this.controller.get('alias');
		this.addressElement =		this.controller.get('address');
		this.portElement =			this.controller.get('port');
		this.autoConnectElement =	this.controller.get('autoConnect');
		this.saveButtonElement =	this.controller.get('saveButton');
		
		this.textChanged =			this.textChanged.bindAsEventListener(this);
		this.toggleChanged =		this.toggleChanged.bindAsEventListener(this);
		this.saveButtonPressed =	this.saveButtonPressed.bindAsEventListener(this);
		
		this.controller.setupWidget
		(
			'alias',
			{
				multiline: false,
				enterSubmits: false,
				hintText: 'Name Of Connection',
				modelProperty: 'alias',
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.server
		);
		this.controller.setupWidget
		(
			'address',
			{
				multiline: false,
				enterSubmits: false,
				hintText: 'URL Or IP Address',
				modelProperty: 'address',
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.server
		);
		this.controller.setupWidget
		(
			'port',
			{
				multiline: false,
				enterSubmits: false,
				modelProperty: 'port',
				charsAllow: Mojo.Char.isDigit,
				modifierState: Mojo.Widget.numLock,
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.server
		);
		
		this.controller.setupWidget
		(
			'autoConnect',
			{
	  			trueLabel:  'Yes',
	 			falseLabel: 'No',
				modelProperty: 'autoConnect'
			},
			this.server
		);
		
		Mojo.Event.listen(this.aliasElement,		Mojo.Event.propertyChange, this.textChanged);
		Mojo.Event.listen(this.addressElement,		Mojo.Event.propertyChange, this.textChanged);
		Mojo.Event.listen(this.portElement,			Mojo.Event.propertyChange, this.textChanged);
		Mojo.Event.listen(this.autoConnectElement,	Mojo.Event.propertyChange, this.toggleChanged);
		
		if (this.server.id === false) 
		{
			this.controller.setupWidget
			(
				'saveButton',
				this.attributes = 
				{
					type: Mojo.Widget.activityButton
				},
				this.model =
				{
					buttonLabel: 'Add New Server',
					buttonClass: 'palm-button'
				}
			);
			
			Mojo.Event.listen(this.saveButtonElement, Mojo.Event.tap, this.saveButtonPressed);
		}
		
	} 
	catch (e) 
	{
		Mojo.Log.logException(e, 'server-info#setup');
	}
}

ServerInfoAssistant.prototype.toggleChanged = function(event)
{
	// Nothing special here, The model is being changed automatically
}
ServerInfoAssistant.prototype.textChanged = function(event)
{
	// test server validation
	ircServer.validateNewServer(this.server, this, false);
}

ServerInfoAssistant.prototype.saveButtonPressed = function(event)
{
	if (ircServer.validateNewServer(this.server, this, true)) 
	{
		servers.newServer(this.server, this);
	}
}
ServerInfoAssistant.prototype.deactivate = function(event)
{
	if (this.server.id)
	{
		servers.servers[this.serverKey].saveInfo(this.server);
	}
}

ServerInfoAssistant.prototype.validationError = function(error)
{
	this.saveButtonElement.mojo.deactivate();
	alert('Error: ' +  error);
}
ServerInfoAssistant.prototype.doneSaving = function()
{
	this.saveButtonElement.mojo.deactivate();
	this.controller.stageController.popScene();
}

ServerInfoAssistant.prototype.activate = function(event) {}
ServerInfoAssistant.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.aliasElement,			Mojo.Event.propertyChange, this.textChanged);
	Mojo.Event.stopListening(this.addressElement,		Mojo.Event.propertyChange, this.textChanged);
	Mojo.Event.stopListening(this.portElement,			Mojo.Event.propertyChange, this.textChanged);
	Mojo.Event.stopListening(this.autoConnectElement,	Mojo.Event.propertyChange, this.toggleChanged);
	if (this.server.id === false)
	{
		Mojo.Event.stopListening(this.saveButtonElement, Mojo.Event.tap, this.saveButtonPressed);
	}
}
