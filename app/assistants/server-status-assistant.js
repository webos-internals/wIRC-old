function ServerStatusAssistant(server, popped)
{
	this.server = server;
	this.popped = popped;
	
	this.sceneScroller =			false;
	this.titleElement =				false;
	this.popButtonElement =			false;
	this.messageListElement =		false;
	this.inputContainerElement =	false;
	this.inputWidgetElement =		false;
	this.inputElement =				false;
	this.sendButtonElement =		false;
	
	this.autoScroll =				true;
	
	this.listModel =
	{
		items: []
	};
	this.inputModel =
	{
		value:''
	};
	
	this.server.setStatusAssistant(this);
	
	// setup menu
	this.menuModel =
	{
		visible: true,
		items: []
	}
	if (this.popped) this.menuModel.items.push({ label: 'Server List',	command: 'server-list' });
	this.menuModel.items.push({ label: 'Preferences',	command: 'do-prefs' });
	this.menuModel.items.push({ label: 'Change Nick',	command: 'change-nick' });
	this.menuModel.items.push({ label: 'Channel List',	command: 'channel-list' });
	this.menuModel.items.push({ label: 'Join Channel',	command: 'join-channel' });
}

ServerStatusAssistant.prototype.setup = function()
{
	try
	{
		// set theme
		this.controller.document.body.className = prefs.get().theme;
		
		this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
		
		this.sceneScroller =			this.controller.sceneScroller;
		this.titleElement =				this.controller.get('title');
		this.popButtonElement =			this.controller.get('popButton');
		this.messageListElement =		this.controller.get('messageList');
		this.inputContainerElement =	this.controller.get('inputFooter');
		this.inputWidgetElement =		this.controller.get('inputWidget');
		this.sendButtonElement =		this.controller.get('sendButton');
		
		this.scrollHandler =			this.onScrollStarted.bindAsEventListener(this);
		this.popButtonPressed =			this.popButtonPressed.bindAsEventListener(this);
		this.inputChanged =				this.inputChanged.bindAsEventListener(this);
		this.inputElementLoseFocus =	this.inputFocus.bind(this);
		this.sendButtonPressed =		this.sendButtonPressed.bindAsEventListener(this);
		
		Mojo.Event.listen(this.sceneScroller, Mojo.Event.scrollStarting, this.scrollHandler);
		
		this.titleElement.update((this.server.alias?this.server.alias:this.server.address));
		this.loadPrefs(true);
		
		if (this.popped)	this.popButtonElement.style.display = 'none';
		else				Mojo.Event.listen(this.popButtonElement, Mojo.Event.tap, this.popButtonPressed);
		
		this.updateList(true);
		this.controller.setupWidget
		(
			'messageList', 
			{
				itemTemplate: "message/message-row",
				swipeToDelete: false,
				reorderable: false,
				renderLimit: 50
			},
			this.listModel
		);
		this.revealBottom();
		
		this.controller.setupWidget
		(
			'inputWidget',
			{
				modelProperty: 'value',
				//hintText: $L('Message...'),
				inputName: 'inputElement',
				focus: false,
				multiline: true,
				enterSubmits: true,
				changeOnKeyPress: true,
				autoReplace: prefs.get().autoReplace,
				textCase: (prefs.get().autoCap ? Mojo.Widget.steModeSentenceCase : Mojo.Widget.steModeLowerCase)
			},
			this.inputModel
		);
		Mojo.Event.listen(this.inputWidgetElement, Mojo.Event.propertyChange, this.inputChanged);
		
		this.sendButtonElement.style.display = 'none';
		Mojo.Event.listen(this.sendButtonElement, Mojo.Event.tap, this.sendButtonPressed);
	} 
	catch (e) 
	{
		Mojo.Log.logException(e, 'server-status#setup');
	}
}

ServerStatusAssistant.prototype.loadPrefs = function(initial)
{
	this.messageListElement.className = prefs.get().messagesStyle + ' fixed-' + prefs.get().messageSplit + ' font-' + prefs.get().fontSize;
}
ServerStatusAssistant.prototype.activate = function(event)
{
	if (this.alreadyActivated)
	{
		this.loadPrefs();
		this.updateList();
	}
	else
	{
		this.inputElement = this.inputWidgetElement.querySelector('[name=inputElement]');
		this.startAutoFocus();
	}
	this.alreadyActivated = true;
	this.revealBottom();
}
ServerStatusAssistant.prototype.updateList = function(initial)
{
	try
	{
		if (initial) 
		{
			var newMessages = this.server.getStatusMessages(0);
			if (newMessages.length > 0)
			{
				for (var m = 0; m < newMessages.length; m++) 
				{
					this.listModel.items.push(newMessages[m]);	
				}
			}
		}
		else
		{
			var start = this.messageListElement.mojo.getLength();
			var newMessages = this.server.getStatusMessages(start);
			if (newMessages.length > 0)
			{
				for (var m = 0; m < newMessages.length; m++) 
				{
					this.listModel.items.push(newMessages[m]);	
				}
			}
			this.messageListElement.mojo.noticeUpdatedItems(start, newMessages);
			this.messageListElement.mojo.setLength(start + newMessages.length);
			this.revealBottom();
		}
		
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'server-status#updateList');
	}
}

ServerStatusAssistant.prototype.startAutoFocus = function()
{
	Mojo.Event.listen(this.inputElement, 'blur', this.inputElementLoseFocus);
	this.inputWidgetElement.mojo.focus();
}
ServerStatusAssistant.prototype.stopAutoFocus = function()
{
	Mojo.Event.stopListening(this.inputElement, 'blur', this.inputElementLoseFocus);
}

ServerStatusAssistant.prototype.onScrollStarted = function(event)
{
	event.addListener(this);
}
ServerStatusAssistant.prototype.moved = function(stopped, position)
{
	if (this.sceneScroller.scrollHeight - this.sceneScroller.scrollTop > this.sceneScroller.clientHeight) 
	{
		this.autoScroll = false;
	}
	else
	{
		this.autoScroll = true;
	}
}
ServerStatusAssistant.prototype.revealBottom = function()
{
	if (this.autoScroll) 
	{
		var height = this.inputContainerElement.clientHeight;
		this.messageListElement.style.paddingBottom = height + 'px';
		
		// palm does this twice in the messaging app to make sure it always reveals the very very bottom
		this.sceneScroller.mojo.revealBottom();
		this.sceneScroller.mojo.revealBottom();
	}
}

ServerStatusAssistant.prototype.popButtonPressed = function(event)
{
	this.server.showStatusScene(true);
}
ServerStatusAssistant.prototype.sendButtonPressed = function(event)
{
	this.server.newCommand(this.inputModel.value);
	this.inputWidgetElement.mojo.setValue('');
	
	// this probably isn't needed
	this.updateList();
}
ServerStatusAssistant.prototype.inputChanged = function(event)
{
	this.revealBottom();
	
	if (event.originalEvent && Mojo.Char.isEnterKey(event.originalEvent.keyCode) &&
		event.value != '') 
	{
		this.sendButtonPressed();
	}
	else
	{
		if (event.value == '') 
		{
			this.sendButtonElement.style.display = 'none';
		}
		else 
		{
			this.sendButtonElement.style.display = '';
		}
	}
}
ServerStatusAssistant.prototype.inputFocus = function(event)
{
	if (this.inputElement)
	{
		this.inputElement.focus();
	}
}

ServerStatusAssistant.prototype.alertDialog = function(message)
{
	this.controller.showAlertDialog(
	{
	    title:				this.server.alias,
		allowHTMLMessage:	true,
	    message:			message,
	    choices:			[{label:$L('Ok'), value:''}],
		onChoose:			function(value){}
    });
}

ServerStatusAssistant.prototype.handleCommand = function(event)
{
	if (event.type == Mojo.Event.command)
	{
		switch (event.command)
		{
			case 'do-prefs':
				this.controller.stageController.pushScene('preferences');
				break;
				
			case 'change-nick':
				if (this.server.isConnected()) 
				{
					SingleLineCommandDialog.pop
					(
						this,
						{
							command:		'nick',
							onSubmit:		this.server.newCommand.bind(this.server),
							dialogTitle:	'Change Nick',
							textLabel:		'Nick',
							textDefault:	this.server.nick.name,
							okText:			'change',
							onActivate:		this.stopAutoFocus.bind(this),
							onDeactivate:	this.startAutoFocus.bind(this)
						}
					);
				}
				else
				{
					this.alertDialog('You must be connected to change your nick.');
				}
				break;
				
			case 'channel-list':
				if (this.server.isConnected()) 
				{
					this.server.newCommand('/list');
				}
				else
				{
					this.alertDialog('You must be connected to get the channel list.');
				}
				break;
				
			case 'join-channel':
				if (this.server.isConnected()) 
				{
					SingleLineCommandDialog.pop
					(
						this,
						{
							command:		'join',
							onSubmit:		this.server.newCommand.bind(this.server),
							dialogTitle:	'Join Channel',
							textLabel:		'Channel',
							textDefault:	'#',
							okText:			'Join',
							onActivate:		this.stopAutoFocus.bind(this),
							onDeactivate:	this.startAutoFocus.bind(this)
						}
					);
				}
				else
				{
					this.alertDialog('You must be connected to join a channel.');
				}
				break;
				
			case 'server-list':
				this.alertDialog('This doesn\'t work yet.');
				break;
		}
	}
}

ServerStatusAssistant.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.sceneScroller,		Mojo.Event.scrollStarting,	this.scrollHandler);
	if (!this.popped) 
	{
		Mojo.Event.stopListening(this.popButtonElement, Mojo.Event.tap, 			this.popButtonPressed);
	}
	Mojo.Event.stopListening(this.inputWidgetElement,	Mojo.Event.propertyChange,	this.inputChanged);
	Mojo.Event.stopListening(this.inputElement,			'blur',						this.inputElementLoseFocus);
	Mojo.Event.stopListening(this.sendButtonElement,	Mojo.Event.tap, 			this.sendButtonPressed);
}
