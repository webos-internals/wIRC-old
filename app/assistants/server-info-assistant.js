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
	
	this.aliasElement =				false;
	this.addressElement =			false;
	this.saveButtFonElement =		false;
	
	this.onConnectData = [];
	this.onConnectCount = 0;

	this.nickSelectModel =
	{
		value: (this.server.defaultNick?this.server.defaultNick:prefs.get().nicknames[0]),
		choices: []
	};
	
	if (this.server.onConnect && this.server.onConnect.length > 0)
	{
		for (var c = 0; c < this.server.onConnect.length; c++)
		{
			this.onConnectCount++;
			this.onConnectData.push({id: this.onConnectCount, index: this.onConnectCount-1, value: this.server.onConnect[c]});
		}
	}
		
}

ServerInfoAssistant.prototype.setup = function()
{
	
	try 
	{
		this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, { visible: false });
		
		this.aliasElement =				this.controller.get('alias');
		this.addressElement =			this.controller.get('address');
		this.saveButtonElement =		this.controller.get('saveButton');
		this.advancedButtonElement =		this.controller.get('advancedButton');
		this.defaultNick = 				this.controller.get('defaultNick');
		
		this.textChanged =			this.textChanged.bindAsEventListener(this);
		this.saveButtonPressed =	this.saveButtonPressed.bindAsEventListener(this);
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
					disabled: (this.serverKey === false)
				}
			);
			
			Mojo.Event.listen(this.saveButtonElement, Mojo.Event.tap, this.saveButtonPressed);
		}
		else
		{
			this.saveButtonElement.hide();
		}
		
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
	if (event.type === Mojo.Event.back)
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

ServerInfoAssistant.prototype.onConnectSave = function()
{
	this.server.onConnect = [];
	if (this.onConnectData.length > 0) 
	{
		for (var d = 0; d < this.onConnectData.length; d++) 
		{
			if (this.onConnectData[d].value) 
			{
				this.server.onConnect.push(this.onConnectData[d].value);
			}
		}
	}
}

ServerInfoAssistant.prototype.advancedButtonPressed = function(event)
{
	this.controller.stageController.pushScene('server-advanced', this);
}

ServerInfoAssistant.prototype.saveButtonPressed = function(event)
{
	this.onConnectSave();
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
	this.onConnectSave();
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
	this.controller.stageController.popScene();
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
