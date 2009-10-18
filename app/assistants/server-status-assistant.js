function ServerStatusAssistant(server, popped)
{
	this.server = server;
	this.popped = popped;
	this.inputModel = {value:''};
	
	this.titleElement =				false;
	this.popButtonElement =			false;
	this.messageListElement =		false;
	this.inputContainerElement =	false;
	this.inputWidgetElement =		false;
	this.sendButtonElement =		false;
	
	this.listModel =
	{
		items: []
	};
	
	this.server.setStatusAssistant(this);
}

ServerStatusAssistant.prototype.setup = function()
{
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, { visible: false });
	
	this.titleElement =				this.controller.get('title');
	this.popButtonElement =			this.controller.get('popButton');
	this.messageListElement =		this.controller.get('messageList');
	this.inputContainerElement =	this.controller.get('inputFooter');
	this.inputWidgetElement =		this.controller.get('inputWidget');
	this.sendButtonElement =		this.controller.get('sendButton');
	
	this.popButtonPressed =		this.popButtonPressed.bindAsEventListener(this);
	this.inputChanged =			this.inputChanged.bindAsEventListener(this);
	this.sendButtonPressed =	this.sendButtonPressed.bindAsEventListener(this);
	
	this.titleElement.innerHTML = this.server.alias;
	
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

ServerStatusAssistant.prototype.activate = function(event)
{
	if (this.alreadyActivated)
	{
		this.updateList();
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

ServerStatusAssistant.prototype.revealBottom = function()
{
	var height = this.inputContainerElement.clientHeight;
	this.messageListElement.style.paddingBottom = height + 'px';
	
	// palm does this twice in the messaging app to make sure it always reveals the very very bottom
	this.controller.sceneScroller.mojo.revealBottom();
	this.controller.sceneScroller.mojo.revealBottom();
}

ServerStatusAssistant.prototype.popButtonPressed = function(event)
{
	this.server.showStatusScene(true);
}
ServerStatusAssistant.prototype.sendButtonPressed = function(event)
{
	alert('Send: ' + this.inputModel.value);
	
	this.server.newMessage({type:'channel-message', nick:this.server.nicks[0], message:this.inputModel.value});
	
	this.inputWidgetElement.mojo.setValue('');
	
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

ServerStatusAssistant.prototype.deactivate = function(event) {}
ServerStatusAssistant.prototype.cleanup = function(event)
{
	if (!this.popped) Mojo.Event.stopListening(this.popButtonElement, Mojo.Event.tap, this.popButtonPressed);
	Mojo.Event.stopListening(this.inputWidgetElement, Mojo.Event.propertyChange, this.inputChanged);
	Mojo.Event.stopListening(this.sendButtonElement, Mojo.Event.tap, this.sendButtonPressed);
}
