function ChannelChatAssistant(channel)
{
	this.channel = channel;
	this.nick = false;
	this.tabText = false;
	this.action = false;
	
	this.titleElement =				false;
	this.userButtonElement =		false;
	this.messageListElement =		false;
	this.inputContainerElement =	false;
	this.inputWidgetElement =		false;
	this.sendButtonElement =		false;
	
	this.listModel =
	{
		items: []
	};
	this.inputModel =
	{
		value:''
	};
	
	this.channel.setChatAssistant(this);
	
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

ChannelChatAssistant.prototype.setup = function()
{
	try
	{
		// set theme
		this.controller.document.body.className = prefs.get().theme;
		
		this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
		
		this.titleElement =				this.controller.get('title');
		this.userButtonElement =		this.controller.get('userButton');
		this.messageListElement =		this.controller.get('messageList');
		this.inputContainerElement =	this.controller.get('inputFooter');
		this.inputWidgetElement =		this.controller.get('inputWidget');
		this.sendButtonElement =		this.controller.get('sendButton');
		
		this.userButtonPressed =	this.userButtonPressed.bindAsEventListener(this);
		this.inputChanged =			this.inputChanged.bindAsEventListener(this);
		this.sendButtonPressed =	this.sendButtonPressed.bindAsEventListener(this);
		
		this.keyHandler = this.keyHandler.bindAsEventListener(this);
		Mojo.Event.listen(this.inputWidgetElement, 'keydown', this.keyHandler);
		Mojo.Event.listen(this.inputWidgetElement, 'keyup', this.keyHandler);
		
		this.titleElement.innerHTML = this.channel.name;
		this.loadPrefs(true);
		
		Mojo.Event.listen(this.userButtonElement, Mojo.Event.tap, this.userButtonPressed);
		
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
		Mojo.Log.logException(e, 'channel-chat#setup');
	}
}


ChannelChatAssistant.prototype.loadPrefs = function(initial)
{
	this.messageListElement.className = prefs.get().messagesStyle + ' fixed-' + prefs.get().messageSplit + ' font-' + prefs.get().fontSize;
}

ChannelChatAssistant.prototype.activate = function(event)
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

ChannelChatAssistant.prototype.updateTitle = function()
{
	this.titleElement.update(this.channel.name + ' (' + this.channel.mode + ')');
}

ChannelChatAssistant.prototype.updateList = function(initial)
{
	try
	{
		if (initial) 
		{
			var newMessages = this.channel.getMessages(0);
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
			var newMessages = this.channel.getMessages(start);
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
		Mojo.Log.logException(e, 'channel-chat#updateList');
	}
}

ChannelChatAssistant.prototype.revealBottom = function()
{
	var height = this.inputContainerElement.clientHeight;
	this.messageListElement.style.paddingBottom = height + 'px';
	
	// palm does this twice in the messaging app to make sure it always reveals the very very bottom
	this.controller.sceneScroller.mojo.revealBottom();
	this.controller.sceneScroller.mojo.revealBottom();
}

ChannelChatAssistant.prototype.sendButtonPressed = function(event)
{
	this.channel.newCommand(this.inputModel.value);
	this.inputWidgetElement.mojo.setValue('');
	
	// this probably isn't needed
	//this.updateList();
}

ChannelChatAssistant.prototype.keyHandler = function(event)
{
	var isActionKey = (event.keyCode === Mojo.Char.metaKey);
	var isTabKey = (event.altKey);

	if (event.type === 'keydown' && isActionKey)
	{
		this.action = true;
	}
	else if (event.type === 'keyup' && isActionKey)
	{
		this.action = false;
	}

	if (this.action && event.type === 'keyup' && isTabKey)
	{
		if (!this.tabText)
		{
			var tmpText = event.target.value.match(/^(.*)[\s]{1}(.*)$/);
			this.tabText = event.target.value;
			if (tmpText)
			{
				this.text = tmpText[1];
				this.tabText = tmpText[2];
			}
		}

		this.nick = this.channel.getNick(this.tabText, this.nick);

		if (this.nick)
		{
			if (this.text)
			{
				event.target.mojo.setText(this.text + " " + this.nick.name + " ");
			}
			else
			{
				event.target.mojo.setText(this.nick.name + prefs.get().tabSuffix + " ");
			}
		}
	}
	else if (!isActionKey && !isTabKey)
	{
		this.tabText = false;
		this.text = false;
		this.nick = false;
	}
}

ChannelChatAssistant.prototype.inputChanged = function(event)
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

ChannelChatAssistant.prototype.userButtonPressed = function(event)
{
	this.controller.stageController.pushScene('channel-users', this.channel);
}

ChannelChatAssistant.prototype.handleCommand = function(event)
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

ChannelChatAssistant.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.userButtonElement, Mojo.Event.tap, this.userButtonPressed);
	Mojo.Event.stopListening(this.inputWidgetElement, Mojo.Event.propertyChange, this.inputChanged);
	Mojo.Event.stopListening(this.sendButtonElement, Mojo.Event.tap, this.sendButtonPressed);
	this.channel.part();
}
