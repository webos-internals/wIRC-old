function ChannelChatAssistant(channel)
{
	this.channel = channel;
	this.inputModel = {value:''};
	
	this.titleElement =				false;
	this.messageListElement =		false;
	this.inputContainerElement =	false;
	this.inputWidgetElement =		false;
	this.sendButtonElement =		false;
	
	this.listModel =
	{
		items: []
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
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	this.titleElement =				this.controller.get('title');
	this.messageListElement =		this.controller.get('messageList');
	this.inputContainerElement =	this.controller.get('inputFooter');
	this.inputWidgetElement =		this.controller.get('inputWidget');
	this.sendButtonElement =		this.controller.get('sendButton');
	
	this.messageListElement.className = prefs.get().messagesStyle;
	this.messageListElement.style.fontSize = prefs.get().fontSize + 'px';
	
	this.inputChanged =			this.inputChanged.bindAsEventListener(this);
	this.sendButtonPressed =	this.sendButtonPressed.bindAsEventListener(this);
	
	this.titleElement.innerHTML = this.channel.name;
	
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
			textCase: Mojo.Widget.steModeLowerCase
		},
		this.inputModel
	);
	Mojo.Event.listen(this.inputWidgetElement, Mojo.Event.propertyChange, this.inputChanged);
	
	this.sendButtonElement.style.display = 'none';
	Mojo.Event.listen(this.sendButtonElement, Mojo.Event.tap, this.sendButtonPressed);
}

ChannelChatAssistant.prototype.activate = function(event)
{
	// load prefs
	this.messageListElement.className = prefs.get().messagesStyle + ' ' + 'font-' + prefs.get().fontSize;
	
	if (this.alreadyActivated)
	{
		this.updateList();
	}
	this.alreadyActivated = true;
	this.revealBottom();
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
	this.updateList();
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

ChannelChatAssistant.prototype.deactivate = function(event)
{
	// put something here to part a channel
}

ChannelChatAssistant.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.inputWidgetElement, Mojo.Event.propertyChange, this.inputChanged);
	Mojo.Event.stopListening(this.sendButtonElement, Mojo.Event.tap, this.sendButtonPressed);
}
