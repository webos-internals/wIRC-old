function ChannelChatAssistant(channel)
{
	this.channel = channel;
	this.nick = false;
	this.tabText = false;
	this.action = false;
	
	this.documentElement =			false;
	this.sceneScroller =			false;
	this.headerElement =			false;
	this.titleElement =				false;
	this.userButtonElement =		false;
	this.userCountElement =			false;
	this.topicContainerElement =	false;
	this.topicElement =				false;
	this.messageListElement =		false;
	this.inputContainerElement =	false;
	this.inputWidgetElement =		false;
	this.sendButtonElement =		false;
	
	this.autoScroll =				true;
	this.topicVisible =				false;
	this.isVisible = 				false;
	this.lastFocusMessage =			false;
	
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
		
		this.documentElement =			this.controller.stageController.document;
		this.sceneScroller =			this.controller.sceneScroller;
		this.headerElement =			this.controller.get('header');
		this.titleElement =				this.controller.get('title');
		this.userButtonElement =		this.controller.get('userButton');
		this.userCountElement =			this.controller.get('userCount');
		this.topicContainerElement =	this.controller.get('topicContainer');
		this.topicElement =				this.controller.get('topic');
		this.messageListElement =		this.controller.get('messageList');
		this.inputContainerElement =	this.controller.get('inputFooter');
		this.inputWidgetElement =		this.controller.get('inputWidget');
		this.sendButtonElement =		this.controller.get('sendButton');
		
		this.scrollHandler =			this.onScrollStarted.bindAsEventListener(this);
		this.visibleWindowHandler =		this.visibleWindow.bindAsEventListener(this);
		this.invisibleWindowHandler =	this.invisibleWindow.bindAsEventListener(this);
		this.keyHandler =				this.keyHandler.bindAsEventListener(this);
		this.headerTapped =				this.headerTap.bindAsEventListener(this);
		this.topicToggled =				this.topicToggle.bindAsEventListener(this);
		this.userButtonPressed =		this.userButtonPressed.bindAsEventListener(this);
		this.inputChanged =				this.inputChanged.bindAsEventListener(this);
		this.sendButtonPressed =		this.sendButtonPressed.bindAsEventListener(this);
		
		Mojo.Event.listen(this.sceneScroller,	Mojo.Event.scrollStarting,	this.scrollHandler);
		Mojo.Event.listen(this.documentElement, Mojo.Event.stageActivate,   this.visibleWindowHandler);
		Mojo.Event.listen(this.documentElement, Mojo.Event.stageDeactivate, this.invisibleWindowHandler);
		Mojo.Event.listen(this.inputWidgetElement, 'keydown', this.keyHandler);
		Mojo.Event.listen(this.inputWidgetElement, 'keyup', this.keyHandler);
		this.isVisible = true;
		
		Mojo.Event.listen(this.headerElement, Mojo.Event.tap, this.headerTapped);
		this.updateTitle();
		this.updateTopic();
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

ChannelChatAssistant.prototype.onScrollStarted = function(event)
{
	event.addListener(this);
}
ChannelChatAssistant.prototype.moved = function(stopped, position)
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

ChannelChatAssistant.prototype.updateUserCount = function()
{
	this.userCountElement.update(this.channel.nicks.length);
}
ChannelChatAssistant.prototype.updateTitle = function()
{
	this.titleElement.update(this.channel.name + (this.channel.mode?' (' + this.channel.mode + ')':''));
}
ChannelChatAssistant.prototype.updateTopic = function()
{
	this.topicElement.update(this.channel.topic);
}

ChannelChatAssistant.prototype.headerTap = function(event)
{
	if (event.target.id == 'header') // we don't want to toggle topic if the header is not tapped right on
	{
		if (this.topicVisible)
		{
			var from = 0;
			var to   = 0 - this.topicContainerElement.getHeight();
		}
		else
		{
			var from = 0 - this.topicContainerElement.getHeight();
			var to   = 0;
		}
		
		Mojo.Animation.animateStyle
		(
			this.topicContainerElement,
			'top',
			'zeno', // linear/bezier/zeno
			{
				from:       from,
				to:         to,
				duration:   0.5,
				onComplete: this.topicToggled
			}
		);
	}
}
ChannelChatAssistant.prototype.topicToggle = function()
{
	this.topicVisible = !this.topicVisible;
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
			if (!this.isVisible && this.lastFocusMessage && !this.lastFocusMessage.hasClassName('lostFocus'))
			{
				this.lastFocusMessage.addClassName('lostFocus');
			}
			
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
	if (this.autoScroll) 
	{
		var height = this.inputContainerElement.clientHeight;
		this.messageListElement.style.paddingBottom = height + 'px';
		
		// palm does this twice in the messaging app to make sure it always reveals the very very bottom
		this.sceneScroller.mojo.revealBottom();
		this.sceneScroller.mojo.revealBottom();
	}
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

		this.nick = this.channel.tabNick(this.tabText, this.nick);

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

ChannelChatAssistant.prototype.visibleWindow = function(event)
{
	if (!this.isVisible)
	{
		this.isVisible = true;
	}
	this.channel.closeDash();
}
ChannelChatAssistant.prototype.invisibleWindow = function(event)
{
	this.isVisible = false;
	
	if (this.lastFocusMessage && this.lastFocusMessage.hasClassName('lostFocus'))
	{
		this.lastFocusMessage.removeClassName('lostFocus');
	}
	this.lastFocusMessage = this.messageListElement.mojo.getNodeByIndex(this.messageListElement.mojo.getLength()-1);
}

ChannelChatAssistant.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.sceneScroller,		Mojo.Event.scrollStarting,	this.scrollHandler);
	Mojo.Event.stopListening(this.documentElement,		Mojo.Event.stageActivate,   this.visibleWindowHandler);
	Mojo.Event.stopListening(this.documentElement,		Mojo.Event.stageDeactivate,	this.invisibleWindowHandler);
	Mojo.Event.stopListening(this.userButtonElement,	Mojo.Event.tap,				this.userButtonPressed);
	Mojo.Event.stopListening(this.inputWidgetElement,	Mojo.Event.propertyChange,	this.inputChanged);
	Mojo.Event.stopListening(this.sendButtonElement,	Mojo.Event.tap,				this.sendButtonPressed);
	if (this.channel.containsNick(this.channel.server.nick))
	{
		this.channel.part();
	}
}
