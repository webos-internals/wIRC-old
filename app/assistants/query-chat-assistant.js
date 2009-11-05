function QueryChatAssistant(query)
{
	this.query = query;
	
	this.documentElement =			false;
	this.sceneScroller =			false;
	this.titleElement =				false;
	this.messageListElement =		false;
	this.inputContainerElement =	false;
	this.inputWidgetElement =		false;
	this.sendButtonElement =		false;
	
	this.autoScroll =				true;
	this.isVisible = 				false;
	
	this.listModel =
	{
		items: []
	};
	this.inputModel =
	{
		value:''
	};
	
	this.query.setChatAssistant(this);
	
	// setup menu
	this.menuModel =
	{
		visible: true,
		items:
		[
			{
				label: "Preferences",
				command: 'do-prefs'
			}
		]
	}
}

QueryChatAssistant.prototype.setup = function()
{
	try
	{
		// set theme
		this.controller.document.body.className = prefs.get().theme;
		
		this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
		
		this.documentElement =			this.controller.stageController.document;
		this.sceneScroller =			this.controller.sceneScroller;
		this.titleElement =				this.controller.get('title');
		this.messageListElement =		this.controller.get('messageList');
		this.inputContainerElement =	this.controller.get('inputFooter');
		this.inputWidgetElement =		this.controller.get('inputWidget');
		this.sendButtonElement =		this.controller.get('sendButton');
		
		this.scrollHandler =			this.onScrollStarted.bindAsEventListener(this);
		this.visibleWindowHandler =		this.visibleWindow.bindAsEventListener(this);
		this.invisibleWindowHandler =	this.invisibleWindow.bindAsEventListener(this);
		this.inputChanged =				this.inputChanged.bindAsEventListener(this);
		this.sendButtonPressed =		this.sendButtonPressed.bindAsEventListener(this);
		
		Mojo.Event.listen(this.sceneScroller,	Mojo.Event.scrollStarting,	this.scrollHandler);
		Mojo.Event.listen(this.documentElement, Mojo.Event.stageActivate,   this.visibleWindowHandler);
		Mojo.Event.listen(this.documentElement, Mojo.Event.stageDeactivate, this.invisibleWindowHandler);
		this.isVisible = true;
		
		this.titleElement.innerHTML = this.query.nick.name;
		this.loadPrefs(true);
		
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
		Mojo.Log.logException(e, 'query-chat#setup');
	}
}

QueryChatAssistant.prototype.onScrollStarted = function(event)
{
	event.addListener(this);
}
QueryChatAssistant.prototype.moved = function(stopped, position)
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

QueryChatAssistant.prototype.loadPrefs = function(initial)
{
	this.messageListElement.className = prefs.get().messagesStyle + ' fixed-' + prefs.get().messageSplit + ' font-' + prefs.get().fontSize;
}

QueryChatAssistant.prototype.activate = function(event)
{
	this.loadPrefs();
	if (this.alreadyActivated)
	{
		this.updateList();
	}
	this.alreadyActivated = true;
	this.revealBottom();
	this.inputWidgetElement.mojo.focus();
}

QueryChatAssistant.prototype.updateList = function(initial)
{
	try
	{
		if (initial) 
		{
			var newMessages = this.query.getMessages(0);
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
			var newMessages = this.query.getMessages(start);
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
		Mojo.Log.logException(e, 'query-chat#updateList');
	}
}

QueryChatAssistant.prototype.revealBottom = function()
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

QueryChatAssistant.prototype.sendButtonPressed = function(event)
{
	this.query.newCommand(this.inputModel.value);
	this.inputWidgetElement.mojo.setValue('');
	
	// this probably isn't needed
	//this.updateList();
}
QueryChatAssistant.prototype.inputChanged = function(event)
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

QueryChatAssistant.prototype.handleCommand = function(event)
{
	if (event.type == Mojo.Event.command)
	{
		switch (event.command)
		{
			case 'do-prefs':
				this.controller.stageController.pushScene('preferences');
				break;
		}
	}
}

QueryChatAssistant.prototype.visibleWindow = function(event)
{
	if (!this.isVisible)
	{
		this.isVisible = true;
	}
	this.query.closeDash();
}
QueryChatAssistant.prototype.invisibleWindow = function(event)
{
	this.isVisible = false;
}

QueryChatAssistant.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.sceneScroller,		Mojo.Event.scrollStarting,	this.scrollHandler);
	Mojo.Event.stopListening(this.documentElement,		Mojo.Event.stageActivate,   this.visibleWindowHandler);
	Mojo.Event.stopListening(this.documentElement,		Mojo.Event.stageDeactivate,	this.invisibleWindowHandler);
	Mojo.Event.stopListening(this.inputWidgetElement,	Mojo.Event.propertyChange,	this.inputChanged);
	Mojo.Event.stopListening(this.sendButtonElement,	Mojo.Event.tap,				this.sendButtonPressed);
}
