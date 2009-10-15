function ServerInfoAssistant(id)
{
	if (id)
	{
		this.server = servers.getServerForId(id);
	}
	else
	{
		this.server = false;
	}
	
	// if no server, we need defaults
	if (!this.server)
	{
		this.server = 
		{
			id:				false,
			alias:			'',
			address:		'',
			port:			6667,
			autoConnect:	false
		};
	}
}

ServerInfoAssistant.prototype.setup = function()
{
	
	try 
	{
		this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, { visible: false });
		
		this.toggleChangeHandler =	this.toggleChanged.bindAsEventListener(this);
		this.textChangeHandler =	this.textChanged.bindAsEventListener(this);
		
		this.controller.setupWidget
		(
			'alias',
			{
				multiline: false,
				enterSubmits: false,
				hintText: 'Name Of Connection',
				modelProperty: 'alias'
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
				textCase: Mojo.Widget.steModeLowerCase
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
				charsAllow: Mojo.Char.isDigit
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
		
		Mojo.Event.listen(this.controller.get('alias'),			Mojo.Event.propertyChange, this.textChangeHandler);
		Mojo.Event.listen(this.controller.get('address'),		Mojo.Event.propertyChange, this.textChangeHandler);
		Mojo.Event.listen(this.controller.get('port'),			Mojo.Event.propertyChange, this.textChangeHandler);
		
		Mojo.Event.listen(this.controller.get('autoConnect'),	Mojo.Event.propertyChange, this.toggleChangeHandler);
		
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
			Mojo.Event.listen(this.controller.get('saveButton'), Mojo.Event.tap, this.saveButtonPressed.bindAsEventListener(this));
		}
		
		
	} 
	catch (e) 
	{
		Mojo.Log.logException(e, 'server-info#setup');
	}
}

ServerInfoAssistant.prototype.toggleChanged = function(event)
{
	//alert('------');
	//alert(event.target.id);
	//alert(event.value);
}
ServerInfoAssistant.prototype.textChanged = function(event)
{
	//alert('------');
	//alert(event.target.id);
	//alert(event.value);
}

ServerInfoAssistant.prototype.saveButtonPressed = function(event)
{
	servers.newServer(this.server, this);
}
ServerInfoAssistant.prototype.doneSaving = function()
{
	this.controller.get('saveButton').mojo.deactivate();
	this.controller.stageController.popScene();
}

ServerInfoAssistant.prototype.deactivate = function(event)
{
	if (this.server.id) 
	{
		this.server.saveInfo();
	}
}

ServerInfoAssistant.prototype.activate = function(event) {}
ServerInfoAssistant.prototype.cleanup = function(event) {}
