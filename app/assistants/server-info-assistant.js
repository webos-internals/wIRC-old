function ServerInfoAssistant(param)
{
	this.serverKey =	false;
	this.server =		false;
	
	if (typeof(param) == 'number')
	{
		this.serverKey = servers.getServerArrayKey(param);
		this.server = servers.servers[this.serverKey].getEditObject();
	}
	else if (typeof(param) == 'object')
	{
		this.server = ircServer.getBlankServerObject();
		Object.keys(param).each(function(key)
		{
			this.server[key] = param[key];
		}, this);
	}
	
	if (!this.server)
	{
		this.server = ircServer.getBlankServerObject();
	}
	
	this.aliasElement =				false;
	this.addressElement =			false;
	this.saveButtFonElement =		false;
	
	this.nickSelectModel =
	{
		value: (this.server.defaultNick?this.server.defaultNick:prefs.get().nicknames[0]),
		choices: []
	};
	
	// setup menu
	this.menuModel =
	{
		visible: true,
		items:
		[
			Mojo.Menu.editItem,
			{
				label: "Preferences",
				command: 'do-prefs'
			},
			{
				label: "Help",
				command: 'do-help'
			}
		]
	};
}

ServerInfoAssistant.prototype.setup = function()
{
	
	try 
	{
		this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
		
		this.aliasElement =				this.controller.get('alias');
		this.addressElement =			this.controller.get('address');
		this.saveButtonElement =		this.controller.get('saveButton');
		this.advancedButtonElement =	this.controller.get('advancedButton');
		this.defaultNick = 				this.controller.get('defaultNick');
		
		this.textChanged =				this.textChanged.bindAsEventListener(this);
		this.saveButtonPressed =		this.saveButtonPressed.bindAsEventListener(this);
		this.advancedButtonPressed =	this.advancedButtonPressed.bindAsEventListener(this);
		
		this.controller.setupWidget
		(
			'alias',
			{
				multiline: false,
				enterSubmits: false,
				hintText: 'Optional',
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
				hintText: 'Required',
				modelProperty: 'address',
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.server
		);

		if (this.serverKey === false)
		{
			Mojo.Event.listen(this.addressElement, 'keyup', this.textChanged);
		}
		
		
		this.updateDefaultNickChoices(true);
		this.controller.setupWidget
		(
			'defaultNick',
			{
				modelProperty: 'value'
			},
			this.nickSelectModel
		);
		Mojo.Event.listen(this.defaultNick, Mojo.Event.propertyChange, this.nickDefaultChanged.bindAsEventListener(this));
		this.controller.setupWidget
		(
			'advancedButton',
			this.attributes = 
			{
			},
			this.model =
			{
				buttonLabel: 'Advanced',
			}
		);
			
		Mojo.Event.listen(this.advancedButtonElement, Mojo.Event.tap, this.advancedButtonPressed);
		
		if (this.serverKey === false)
		{
			this.controller.setupWidget
			(
				'saveButton',
				this.attributes = 
				{
					type: Mojo.Widget.activityButton
				},
				this.buttonModel =
				{
					buttonLabel: 'Save',
					buttonClass: 'affirmative',
					disabled: (this.server.address == '')
				}
			);
			
			Mojo.Event.listen(this.saveButtonElement, Mojo.Event.tap, this.saveButtonPressed);
		}
		else
		{
			this.saveButtonElement.hide();
		}
		
		
		// make it so nothing is selected by default (textbox rage)
		this.controller.setInitialFocusedElement(null);
		
	} 
	catch (e) 
	{
		Mojo.Log.logException(e, 'server-info#setup');
	}
}

ServerInfoAssistant.prototype.updateDefaultNickChoices = function(skipUpdate)
{
	this.nickSelectModel.choices = [];
	var valFound = false;
	
	for (var n = 0; n < prefs.get().nicknames.length; n++) 
	{
		this.nickSelectModel.choices.push({label: prefs.get().nicknames[n], value: prefs.get().nicknames[n]});
		if (prefs.get().nicknames[n] == this.nickSelectModel.value) valFound = true;
	}
	this.nickSelectModel.choices.push({label: 'New...', value: '_new'});
	if (!valFound) this.nickSelectModel.value = prefs.get().nicknames[0];
	
	if (!skipUpdate)
	{
		this.controller.modelChanged(this.nickSelectModel);
	}
}
ServerInfoAssistant.prototype.nickDefaultChanged = function(event)
{
	if (this.nickSelectModel.value === '_new')
	{
		this.controller.stageController.pushScene('identity');
	}
	else
	{
		this.server.defaultNick = this.nickSelectModel.value;
	}
}

ServerInfoAssistant.prototype.toggleChanged = function(event)
{
	// Nothing special here, The model is being changed automatically
}
ServerInfoAssistant.prototype.handleCommand = function(event)
{
	if (event.type === Mojo.Event.back && this.serverKey !== false)
	{
		if (this.addressElement.mojo.getValue().length <= 0)
		{
			this.controller.showAlertDialog(
			{
				title: 'wIRC',
				message: 'Valid Server Address is Required',
				choices: [{label:$L('OK'), value:''}]
			});
			event.stop();
		}
	}
}
ServerInfoAssistant.prototype.textChanged = function(event)
{
	// test server validation
	if (event.target.value && ircServer.validateNewServer(this.server, this, false))
	{
		if (this.buttonModel.disabled)
		{
			this.buttonModel.disabled = false;
			this.controller.modelChanged(this.buttonModel);
		}
	}
	else
	{
		if (!this.buttonModel.disabled)
		{
			this.buttonModel.disabled = true;
			this.controller.modelChanged(this.buttonModel);
		}
	}
}

ServerInfoAssistant.prototype.autoIdentifyChanged = function(event)
{
	if (this.server.autoIdentify)
	{
		this.autoIdentifyWrapper.className = 'palm-row first';
		this.controller.get('identifyInfo').style.display = '';
	}
	else
	{
		this.autoIdentifyWrapper.className = 'palm-row single';
		this.controller.get('identifyInfo').style.display = 'none';
	}
}

ServerInfoAssistant.prototype.advancedButtonPressed = function(event)
{
	this.controller.stageController.pushScene('server-advanced', this.server);
}

ServerInfoAssistant.prototype.saveButtonPressed = function(event)
{
	if (this.serverKey === false)
	{
		if (ircServer.validateNewServer(this.server, this, true)) 
		{
			servers.newServer(this.server, this);
		}
	}
	else
	{
		servers.servers[this.serverKey].saveInfo(this.server);
		this.doneSaving();
	}
}
ServerInfoAssistant.prototype.deactivate = function(event)
{
	if (this.serverKey !== false)
	{
		if (ircServer.validateNewServer(this.server, this, true)) 
		{
			if (this.addressElement.mojo.getValue().length > 0)
			{
				servers.servers[this.serverKey].saveInfo(this.server);
			}
		}
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
	this.controller.stageController.popScenesTo('server-list');
}

ServerInfoAssistant.prototype.handleCommand = function(event)
{
	if (event.type == Mojo.Event.command)
	{
		switch (event.command)
		{
			case 'do-help':
				this.controller.stageController.pushScene('help');
				break;
				
			case 'do-prefs':
				this.controller.stageController.pushScene('preferences-general');
				break;
		}
	}
}

ServerInfoAssistant.prototype.activate = function(event)
{
	this.updateDefaultNickChoices();
}
ServerInfoAssistant.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.addressElement, 'keyup', this.textChanged);
	Mojo.Event.stopListening(this.defaultNick, Mojo.Event.propertyChange, this.nickDefaultChanged.bindAsEventListener(this));
	Mojo.Event.stopListening(this.advancedButtonElement, Mojo.Event.tap, this.advancedButtonPressed);

	if (this.serverKey === false)
	{
		Mojo.Event.stopListening(this.saveButtonElement, Mojo.Event.tap, this.saveButtonPressed);
	}
}
