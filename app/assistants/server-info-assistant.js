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
	this.onConnectList =		false;
	
	this.onConnectModel =	{items:[]};
	this.onConnectData =	[];
	this.onConnectCount =	0;
	
	if (this.server.onConnect)
	{
		tmpSplit = this.server.onConnect.split(';');
		if (tmpSplit.length > 0)
		{
			for (var s = 0; s < tmpSplit.length; s++)
			{
				this.onConnectCount++;
				this.onConnectData.push({id: this.onConnectCount, index: this.onConnectCount-1, value: tmpSplit[s]});
			}
		}
	}
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
		this.onConnectList =		this.controller.get('onConnect');
		
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
		
		
		
		this.onConnectBuildList();
		this.controller.setupWidget
		(
			'onConnect',
			{
				itemTemplate: "server-info/onConnect-row",
				swipeToDelete: true,
				reorderable: true,
				addItemLabel: 'New',
				
				multiline: false,
				enterSubmits: false,
				modelProperty: 'value',
				changeOnKeyPress: true,
			},
			this.onConnectModel
		);
		
		Mojo.Event.listen(this.onConnectList, Mojo.Event.listAdd,			this.onConnectAdd.bindAsEventListener(this));
		Mojo.Event.listen(this.onConnectList, Mojo.Event.propertyChanged,	this.onConnectChange.bindAsEventListener(this));
		Mojo.Event.listen(this.onConnectList, Mojo.Event.listReorder,		this.onConnectReorder.bindAsEventListener(this));
		Mojo.Event.listen(this.onConnectList, Mojo.Event.listDelete,		this.onConnectDelete.bindAsEventListener(this));
		
		
		
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

ServerInfoAssistant.prototype.onConnectBuildList = function()
{
	this.onConnectModel.items = [];
	if (this.onConnectData.length > 0)
	{
		for (var d = 0; d < this.onConnectData.length; d++)
		{
			this.onConnectModel.items.push(this.onConnectData[d]);
		}
	}
}
ServerInfoAssistant.prototype.onConnectAdd = function(event)
{
	this.onConnectCount++;
	this.onConnectData.push({id: this.onConnectCount, index: this.onConnectData.length, value: ''});
	
	this.onConnectBuildList();
	
	this.onConnectList.mojo.noticeUpdatedItems(0, this.onConnectModel.items);
	this.onConnectList.mojo.setLength(this.onConnectModel.items.length);
	
	this.onConenctSave();
}
ServerInfoAssistant.prototype.onConnectChange = function(event)
{
	this.onConenctSave();
}
ServerInfoAssistant.prototype.onConnectReorder = function(event)
{
	for (var d = 0; d < this.onConnectData.length; d++) 
	{
		if (this.onConnectData[d].index == event.fromIndex) 
		{
			this.onConnectData[d].index = event.toIndex;
		}
		else 
		{
			if (event.fromIndex > event.toIndex) 
			{
				if (this.onConnectData[d].index < event.fromIndex &&
				this.onConnectData[d].index >= event.toIndex) 
				{
					this.onConnectData[d].index++;
				}
			}
			else if (event.fromIndex < event.toIndex) 
			{
				if (this.onConnectData[d].index > event.fromIndex &&
				this.onConnectData[d].index <= event.toIndex) 
				{
					this.onConnectData[d].index--;
				}
			}
		}
	}
	this.onConenctSave();
}
ServerInfoAssistant.prototype.onConnectDelete = function(event)
{
	if (this.onConnectData.length > 0) 
	{
		for (var d = 0; d < this.onConnectData.length; d++) 
		{
			if (this.onConnectData[d].id == event.item.id) 
			{
				this.onConnectData[d] = null;
			}
			else 
			{
				if (this.onConnectData[d].index > event.index) 
				{
					this.onConnectData[d].index--;
				}
			}
		}
		this.onConnectData.compact();
	}
	this.onConenctSave();
}
ServerInfoAssistant.prototype.onConenctSave = function()
{
	if (this.onConnectData.length > 0) 
	{
		this.onConnectData.sort(function(a, b)
		{
			return a.index - b.index;
		});
		
		for (var i = 0; i < this.onConnectModel.items.length; i++) 
		{
			for (var d = 0; d < this.onConnectData.length; d++) 
			{
				if (this.onConnectData[d].id == this.onConnectModel.items[i].id) 
				{
					this.onConnectData[d].value = this.onConnectModel.items[i].value;
				}
			}
		}
	}
	
	this.server.onConnect = '';
	alert('---');
	if (this.onConnectData.length > 0) 
	{
		for (var d = 0; d < this.onConnectData.length; d++) 
		{
			if (this.server.onConnect != '') this.server.onConnect += ';';
			this.server.onConnect += this.onConnectData[d].value;
			
			alert(this.onConnectData[d].id + ' - ' + this.onConnectData[d].value);
		}
	}
}

ServerInfoAssistant.prototype.saveButtonPressed = function(event)
{
	this.onConenctSave();
	if (ircServer.validateNewServer(this.server, this, true)) 
	{
		servers.newServer(this.server, this);
	}
}
ServerInfoAssistant.prototype.deactivate = function(event)
{
	this.onConenctSave();
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
	Mojo.Event.stopListening(this.aliasElement,			Mojo.Event.propertyChange,	this.textChanged);
	Mojo.Event.stopListening(this.addressElement,		Mojo.Event.propertyChange,	this.textChanged);
	Mojo.Event.stopListening(this.portElement,			Mojo.Event.propertyChange,	this.textChanged);
	Mojo.Event.stopListening(this.autoConnectElement,	Mojo.Event.propertyChange,	this.toggleChanged);
	
	Mojo.Event.stopListening(this.onConnectList,		Mojo.Event.listAdd,			this.onConnectAdd.bindAsEventListener(this));
	Mojo.Event.stopListening(this.onConnectList,		Mojo.Event.propertyChanged,	this.onConnectChange.bindAsEventListener(this));
	Mojo.Event.stopListening(this.onConnectList,		Mojo.Event.listReorder,		this.onConnectReorder.bindAsEventListener(this));
	Mojo.Event.stopListening(this.onConnectList,		Mojo.Event.listDelete,		this.onConnectDelete.bindAsEventListener(this));
	
	if (this.server.id === false)
	{
		Mojo.Event.stopListening(this.saveButtonElement, Mojo.Event.tap, this.saveButtonPressed);
	}
}
