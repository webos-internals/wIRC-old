function ServerAdvancedAssistant(serverobj)
{
	this.server = serverobj;
	
	this.aliasElement =				false;
	this.addressElement =			false;
	this.portElement =				false;
	this.encryptionElement = 		false;
	this.serverUserElement =		false;
	this.serverPasswordElement =	false;
	this.networkElement =			false;
	this.autoConnectElement =		false;
	this.autoIdentifyWrapper =		false;
	this.autoIdentifyElement =		false;
	this.identifyService =			false;
	this.identifyPassword =			false;
	this.saveButtFonElement =		false;
	this.onConnectList =			false;
	this.favoriteChannelsList = 	false;
	this.dontPartOnCloseElement =	false;
	this.autoOpenFavsElement =		false;
	
	this.onConnectData =			[];
	this.onConnectCount =			0;
	this.onConnectModel =			{items:[]};
	
	this.favoriteChannelsData =		[];
	this.favoriteChannelsCount = 	0;
	this.favoriteChannelsModel =	{items:[]};
	
	if (this.server.onConnect && this.server.onConnect.length > 0)
	{
		for (var c = 0; c < this.server.onConnect.length; c++)
		{
			this.onConnectCount++;
			this.onConnectData.push({id: this.onConnectCount, index: this.onConnectCount-1, value: this.server.onConnect[c]});
		}
	}
	
	if (this.server.favoriteChannels && this.server.favoriteChannels.length > 0)
	{
		for (var c = 0; c < this.server.favoriteChannels.length; c++)
		{
			this.favoriteChannelsCount++;
			this.favoriteChannelsData.push({id: this.favoriteChannelsCount, index: this.favoriteChannelsCount-1, value: this.server.favoriteChannels[c]});
		}
	}
	
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

ServerAdvancedAssistant.prototype.setup = function()
{
	
	try 
	{
		this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
		
		this.aliasElement =				this.controller.get('alias');
		this.addressElement =			this.controller.get('address');
		this.portElement =				this.controller.get('port');
		this.encryptionElement =		this.controller.get('encryption');
		this.encryptionContainer =		this.controller.get('encryptionContainer');
		this.serverUserElement =		this.controller.get('serverUser');
		this.networkElement =			this.controller.get('proxyNetwork');
		this.serverPasswordElement =	this.controller.get('serverPassword');
		this.autoConnectElement =		this.controller.get('autoConnect');
		this.autoIdentifyWrapper =		this.controller.get('autoIdentifyWrapper');
		this.autoIdentifyElement =		this.controller.get('autoIdentify');
		this.identifyServiceElement =	this.controller.get('identifyService');
		this.identifyPasswordElement =	this.controller.get('identifyPassword');
		this.onConnectList =			this.controller.get('onConnect');
		this.favoriteChannelsList =		this.controller.get('favoriteChannels');
		this.dontPartOnCloseElement =	this.controller.get('dontPartOnClose');
		this.autoOpenFavsElement =		this.controller.get('autoOpenFavs');
		
		// Add back button functionality for the TouchPad
		this.backElement = this.controller.get('icon');
		this.backTapHandler = this.backTap.bindAsEventListener(this);
		this.controller.listen(this.backElement, Mojo.Event.tap, this.backTapHandler);

		// listener for help toggle
		this.helpTap = this.helpRowTapped.bindAsEventListener(this);
		this.controller.listen(this.controller.get('help-toggle'), Mojo.Event.tap, this.helpButtonTapped.bindAsEventListener(this));
		
		this.textChanged =			this.textChanged.bindAsEventListener(this);
		this.toggleChanged =		this.toggleChanged.bindAsEventListener(this);
		
		this.autoIdentifyChanged();
		this.autoIdentifyChanged =	this.autoIdentifyChanged.bindAsEventListener(this);
		
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
		this.controller.setupWidget
		(
			'port',
			{
				multiline: false,
				enterSubmits: false,
				modelProperty: 'port',
				hintText: 'Optional',
				charsAllow: Mojo.Char.isDigit,
				modifierState: Mojo.Widget.numLock,
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.server
		);
		if (plugin.has_ssl() == '1')
		{
			this.encryptionContainer.show();
			this.controller.setupWidget
			(
				'encryption',
				{
					label: 'Encryption',
					choices:
					[
						{label:'None',	value:0},
						{label:'SSL',	value:1},
						{label:'TLS',	value:2}
					],
					modelProperty: 'encryption'
				},
				this.server
			);
			Mojo.Event.listen(this.encryptionElement,		Mojo.Event.propertyChange,	this.textChanged);
		}
		this.controller.setupWidget
		(
			'serverUser',
			{
				multiline: false,
				enterSubmits: false,
				hintText: 'Optional',
				modelProperty: 'serverUser',
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.server
		);
		this.controller.setupWidget
		(
			'serverPassword',
			{
				multiline: false,
				enterSubmits: false,
				hintText: 'Optional',
				modelProperty: 'serverPassword',
				textCase: Mojo.Widget.steModeLowerCase,
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
		
		this.controller.setupWidget
		(
			'proxyNetwork',
			{
				multiline: false,
				enterSubmits: false,
				hintText: 'Optional',
				modelProperty: 'proxyNetwork',
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.server
		);
		
		this.controller.setupWidget
		(
			'dontPartOnClose',
			{
	  			trueLabel:  'Yes',
	 			falseLabel: 'No',
				modelProperty: 'dontPartOnClose'
			},
			this.server
		);
		
		this.controller.setupWidget
		(
			'autoOpenFavs',
			{
	  			trueLabel:  'Yes',
	 			falseLabel: 'No',
				modelProperty: 'autoOpenFavs'
			},
			this.server
		);
		
		Mojo.Event.listen(this.aliasElement,			Mojo.Event.propertyChange,	this.textChanged);
		Mojo.Event.listen(this.addressElement,			Mojo.Event.propertyChange,	this.textChanged);
		Mojo.Event.listen(this.portElement,				Mojo.Event.propertyChange,	this.textChanged);
		Mojo.Event.listen(this.serverUserElement,		Mojo.Event.propertyChange,	this.textChanged);
		Mojo.Event.listen(this.serverPasswordElement,	Mojo.Event.propertyChange,	this.textChanged);
		Mojo.Event.listen(this.autoConnectElement,		Mojo.Event.propertyChange,	this.toggleChanged);
		Mojo.Event.listen(this.dontPartOnCloseElement,	Mojo.Event.propertyChange,	this.toggleChanged);
		Mojo.Event.listen(this.autoOpenFavsElement,		Mojo.Event.propertyChange,	this.toggleChanged);
		
		this.controller.setupWidget
		(
			'autoIdentify',
			{
	  			trueLabel:  'Yes',
	 			falseLabel: 'No',
				modelProperty: 'autoIdentify'
			},
			this.server
		);
		this.controller.setupWidget
		(
			'identifyService',
			{
				multiline: false,
				enterSubmits: false,
				modelProperty: 'identifyService',
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.server
		);
		this.controller.setupWidget
		(
			'identifyPassword',
			{
				multiline: false,
				enterSubmits: false,
				modelProperty: 'identifyPassword',
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.server
		);
		
		Mojo.Event.listen(this.autoIdentifyElement,		Mojo.Event.propertyChange,	this.autoIdentifyChanged);
		Mojo.Event.listen(this.identifyServiceElement,	Mojo.Event.propertyChange,	this.textChanged);
		Mojo.Event.listen(this.identifyPasswordElement,	Mojo.Event.propertyChange,	this.textChanged);
		

		this.onConnectBuildList();
		this.controller.setupWidget
		(
			'onConnect',
			{
				itemTemplate: "server-advanced/onConnect-row",
				swipeToDelete: true,
				reorderable: true,
				addItemLabel: 'New',
				
				multiline: false,
				enterSubmits: false,
				modelProperty: 'value',
				changeOnKeyPress: true,
				textCase: Mojo.Widget.steModeLowerCase,
			},
			this.onConnectModel
		);				

		Mojo.Event.listen(this.onConnectList, Mojo.Event.listAdd,			this.onConnectAdd.bindAsEventListener(this));
		Mojo.Event.listen(this.onConnectList, Mojo.Event.propertyChanged,	this.onConnectChange.bindAsEventListener(this));
		Mojo.Event.listen(this.onConnectList, Mojo.Event.listReorder,		this.onConnectReorder.bindAsEventListener(this));
		Mojo.Event.listen(this.onConnectList, Mojo.Event.listDelete,		this.onConnectDelete.bindAsEventListener(this));
				
		this.favoriteChannelsBuildList();
		this.controller.setupWidget
		(
			'favoriteChannels',
			{
				itemTemplate: "server-advanced/onConnect-row",
				swipeToDelete: true,
				reorderable: true,
				addItemLabel: 'New',
				
				multiline: false,
				enterSubmits: false,
				modelProperty: 'value',
				changeOnKeyPress: true,
				textCase: Mojo.Widget.steModeLowerCase,
			},
			this.favoriteChannelsModel
		);
		
		Mojo.Event.listen(this.favoriteChannelsList, Mojo.Event.listAdd,			this.favoriteChannelsAdd.bindAsEventListener(this));
		Mojo.Event.listen(this.favoriteChannelsList, Mojo.Event.propertyChanged,	this.favoriteChannelsChange.bindAsEventListener(this));
		Mojo.Event.listen(this.favoriteChannelsList, Mojo.Event.listReorder,		this.favoriteChannelsReorder.bindAsEventListener(this));
		Mojo.Event.listen(this.favoriteChannelsList, Mojo.Event.listDelete,			this.favoriteChannelsDelete.bindAsEventListener(this));
		
		
		
		// make it so nothing is selected by default (textbox rage)
		this.controller.setInitialFocusedElement(null);
		
		// add listeners to all the help-overlays
		var helps = this.controller.get('container').querySelectorAll('div.help-overlay');
		for (var h = 0; h < helps.length; h++) {
			this.controller.listen(helps[h], Mojo.Event.tap, this.helpTap);
		}
	} 
	catch (e) 
	{
		Mojo.Log.logException(e, 'server-advanced#setup');
	}
}

ServerAdvancedAssistant.prototype.helpButtonTapped = function(event)
{
	if (this.controller.get('container').hasClassName('help'))
	{
		this.controller.get('container').removeClassName('help');
		event.target.removeClassName('selected');
	}
	else
	{
		this.controller.get('container').addClassName('help');
		event.target.addClassName('selected');
	}
}
ServerAdvancedAssistant.prototype.helpRowTapped = function(event)
{
	event.stop();
	event.stopPropagation();
	event.preventDefault();
	
	var lookup = event.target.id.replace(/help-/, '');
	var help = helpData.get(lookup);
	
	if (lookup && help)
	{
		this.controller.stageController.pushScene('help-data', help);
	}
}

ServerAdvancedAssistant.prototype.toggleChanged = function(event)
{
	// Nothing special here, The model is being changed automatically
}
ServerAdvancedAssistant.prototype.textChanged = function(event)
{
	// test server validation
	/*
	ircServer.validateNewServer(this.server, this, false);
	*/
}

ServerAdvancedAssistant.prototype.autoIdentifyChanged = function(event)
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

ServerAdvancedAssistant.prototype.onConnectBuildList = function()
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
ServerAdvancedAssistant.prototype.onConnectAdd = function(event)
{
	this.onConnectCount++;
	this.onConnectData.push({id: this.onConnectCount, index: this.onConnectData.length, value: ''});
	
	this.onConnectBuildList();
	
	this.onConnectList.mojo.noticeUpdatedItems(0, this.onConnectModel.items);
	this.onConnectList.mojo.setLength(this.onConnectModel.items.length);
	
	this.onConnectList.mojo.focusItem(this.onConnectModel.items[this.onConnectModel.items.length-1]);
	
	this.onConnectSave();
}
ServerAdvancedAssistant.prototype.onConnectChange = function(event)
{
	this.onConnectSave();
}
ServerAdvancedAssistant.prototype.onConnectReorder = function(event)
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
	this.onConnectSave();
}
ServerAdvancedAssistant.prototype.onConnectDelete = function(event)
{
	var newData = [];
	if (this.onConnectData.length > 0) 
	{
		for (var d = 0; d < this.onConnectData.length; d++) 
		{
			if (this.onConnectData[d].id == event.item.id) 
			{
				// ignore
			}
			else 
			{
				if (this.onConnectData[d].index > event.index) 
				{
					this.onConnectData[d].index--;
				}
				newData.push(this.onConnectData[d]);
			}
		}
	}
	this.onConnectData = newData;
	this.onConnectSave();
}
ServerAdvancedAssistant.prototype.onConnectSave = function()
{
	if (this.onConnectData.length > 0) 
	{
		if (this.onConnectData.length > 1) 
		{
			this.onConnectData.sort(function(a, b)
			{
				return a.index - b.index;
			});
		}
		
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

ServerAdvancedAssistant.prototype.favoriteChannelsBuildList = function()
{
	this.favoriteChannelsModel.items = [];
	if (this.favoriteChannelsData.length > 0)
	{
		for (var d = 0; d < this.favoriteChannelsData.length; d++)
		{
			this.favoriteChannelsModel.items.push(this.favoriteChannelsData[d]);
		}
	}
}
ServerAdvancedAssistant.prototype.favoriteChannelsAdd = function(event)
{
	this.favoriteChannelsCount++;
	this.favoriteChannelsData.push({id: this.favoriteChannelsCount, index: this.favoriteChannelsData.length, value: ''});
	
	this.favoriteChannelsBuildList();
	
	this.favoriteChannelsList.mojo.noticeUpdatedItems(0, this.favoriteChannelsModel.items);
	this.favoriteChannelsList.mojo.setLength(this.favoriteChannelsModel.items.length);
	
	this.favoriteChannelsList.mojo.focusItem(this.favoriteChannelsModel.items[this.favoriteChannelsModel.items.length-1]);
	
	this.favoriteChannelsSave();
}
ServerAdvancedAssistant.prototype.favoriteChannelsChange = function(event)
{
	this.favoriteChannelsSave();
}
ServerAdvancedAssistant.prototype.favoriteChannelsReorder = function(event)
{
	for (var d = 0; d < this.favoriteChannelsData.length; d++) 
	{
		if (this.favoriteChannelsData[d].index == event.fromIndex) 
		{
			this.favoriteChannelsData[d].index = event.toIndex;
		}
		else 
		{
			if (event.fromIndex > event.toIndex) 
			{
				if (this.favoriteChannelsData[d].index < event.fromIndex &&
				this.favoriteChannelsData[d].index >= event.toIndex) 
				{
					this.favoriteChannelsData[d].index++;
				}
			}
			else if (event.fromIndex < event.toIndex) 
			{
				if (this.favoriteChannelsData[d].index > event.fromIndex &&
				this.favoriteChannelsData[d].index <= event.toIndex) 
				{
					this.favoriteChannelsData[d].index--;
				}
			}
		}
	}
	this.favoriteChannelsSave();
}
ServerAdvancedAssistant.prototype.favoriteChannelsDelete = function(event)
{
	var newData = [];
	if (this.favoriteChannelsData.length > 0) 
	{
		for (var d = 0; d < this.favoriteChannelsData.length; d++) 
		{
			if (this.favoriteChannelsData[d].id == event.item.id) 
			{
				// ignore
			}
			else 
			{
				if (this.favoriteChannelsData[d].index > event.index) 
				{
					this.favoriteChannelsData[d].index--;
				}
				newData.push(this.favoriteChannelsData[d]);
			}
		}
	}
	this.favoriteChannelsData = newData;
	this.favoriteChannelsSave();
}
ServerAdvancedAssistant.prototype.favoriteChannelsSave = function()
{
	if (this.favoriteChannelsData.length > 0) 
	{
		if (this.favoriteChannelsData.length > 1) 
		{
			this.favoriteChannelsData.sort(function(a, b)
			{
				return a.index - b.index;
			});
		}
		
		for (var i = 0; i < this.favoriteChannelsModel.items.length; i++) 
		{
			for (var d = 0; d < this.favoriteChannelsData.length; d++) 
			{
				if (this.favoriteChannelsData[d].id == this.favoriteChannelsModel.items[i].id) 
				{
					this.favoriteChannelsData[d].value = this.favoriteChannelsModel.items[i].value;
				}
			}
		}
	}
	
	this.server.favoriteChannels = [];
	if (this.favoriteChannelsData.length > 0) 
	{
		for (var d = 0; d < this.favoriteChannelsData.length; d++) 
		{
			if (this.favoriteChannelsData[d].value) 
			{
				this.server.favoriteChannels.push(this.favoriteChannelsData[d].value);
			}
		}
	}
	
}

ServerAdvancedAssistant.prototype.deactivate = function(event)
{
	this.favoriteChannelsSave();
	/*
	if (this.serverKey !== false)
	{
		servers.servers[this.serverKey].saveInfo(this.server);
	}
	*/
}

ServerAdvancedAssistant.prototype.validationError = function(error)
{
	alert('Error: ' +  error);
}

ServerAdvancedAssistant.prototype.backTap = function(event)
{
    if (Mojo.Environment.DeviceInfo.modelNameAscii == 'TouchPad') {
	this.controller.stageController.popScene();
    }
};

ServerAdvancedAssistant.prototype.handleCommand = function(event)
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

ServerAdvancedAssistant.prototype.activate = function(event)
{
}
ServerAdvancedAssistant.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.portElement,				Mojo.Event.propertyChange,	this.textChanged);
	Mojo.Event.stopListening(this.encryptionElement,		Mojo.Event.propertyChange,	this.textChanged);
	Mojo.Event.stopListening(this.serverUserElement,		Mojo.Event.propertyChange,	this.textChanged);
	Mojo.Event.stopListening(this.serverPasswordElement,	Mojo.Event.propertyChange,	this.textChanged);
	Mojo.Event.stopListening(this.autoConnectElement,		Mojo.Event.propertyChange,	this.toggleChanged);
	Mojo.Event.stopListening(this.dontPartOnCloseElement,	Mojo.Event.propertyChange,	this.toggleChanged);
	Mojo.Event.stopListening(this.autoOpenFavsElement,		Mojo.Event.propertyChange,	this.toggleChanged);
	
	Mojo.Event.stopListening(this.autoIdentifyElement,		Mojo.Event.propertyChange,	this.autoIdentifyChanged);
	Mojo.Event.stopListening(this.identifyServiceElement,	Mojo.Event.propertyChange,	this.textChanged);
	Mojo.Event.stopListening(this.identifyPasswordElement,	Mojo.Event.propertyChange,	this.textChanged);

	Mojo.Event.stopListening(this.onConnectList,			Mojo.Event.listAdd,			this.onConnectAdd.bindAsEventListener(this));
	Mojo.Event.stopListening(this.onConnectList,			Mojo.Event.propertyChanged,	this.onConnectChange.bindAsEventListener(this));
	Mojo.Event.stopListening(this.onConnectList,			Mojo.Event.listReorder,		this.onConnectReorder.bindAsEventListener(this));
	Mojo.Event.stopListening(this.onConnectList,			Mojo.Event.listDelete,		this.onConnectDelete.bindAsEventListener(this));
	
	Mojo.Event.stopListening(this.favoriteChannelsList,		Mojo.Event.listAdd,			this.favoriteChannelsAdd.bindAsEventListener(this));
	Mojo.Event.stopListening(this.favoriteChannelsList,		Mojo.Event.propertyChanged,	this.favoriteChannelsChange.bindAsEventListener(this));
	Mojo.Event.stopListening(this.favoriteChannelsList,		Mojo.Event.listReorder,		this.favoriteChannelsReorder.bindAsEventListener(this));
	Mojo.Event.stopListening(this.favoriteChannelsList,		Mojo.Event.listDelete,		this.favoriteChannelsDelete.bindAsEventListener(this));

	Mojo.Event.stopListening(this.backElement,			Mojo.Event.tap,			this.backTapHandler);
}
