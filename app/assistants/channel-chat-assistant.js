function ChannelChatAssistant(channel)
{
	this.channel = channel;
	this.inputModel = {value:''};
	
	this.titleElement =			false;
	this.inputWidgetElement =	false;
	this.sendButtonElement =	false;
	
	this.channel.setChatAssistant(this);
}

ChannelChatAssistant.prototype.setup = function()
{
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, { visible: false });
	
	this.titleElement =			this.controller.get('title');
	this.inputWidgetElement =	this.controller.get('inputWidget');
	this.sendButtonElement =	this.controller.get('sendButton');
	
	this.inputChanged =			this.inputChanged.bindAsEventListener(this);
	this.sendButtonPressed =	this.sendButtonPressed.bindAsEventListener(this);
	
	this.titleElement.innerHTML = this.channel.name;
	
	this.controller.setupWidget
	(
		'inputWidget',
		{
			modelProperty: 'value',
			//hintText: $L('Message...'),
			focus: false,
			multiline: true,
			enterSubmits: true,
			changeOnKeyPress: true
		},
		this.inputModel
	);
	Mojo.Event.listen(this.inputWidgetElement, Mojo.Event.propertyChange, this.inputChanged);
	
	this.sendButtonElement.style.display = 'none';
	Mojo.Event.listen(this.sendButtonElement, Mojo.Event.tap, this.sendButtonPressed);
	
}

ChannelChatAssistant.prototype.sendButtonPressed = function(event)
{
	alert('Send: ' + this.inputModel.value);
	
	this.inputWidgetElement.mojo.setValue('');
}
ChannelChatAssistant.prototype.inputChanged = function(event)
{
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

ChannelChatAssistant.prototype.activate = function(event) {}
ChannelChatAssistant.prototype.deactivate = function(event) {}
ChannelChatAssistant.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.inputWidgetElement, Mojo.Event.propertyChange, this.inputChanged);
	Mojo.Event.stopListening(this.sendButtonElement, Mojo.Event.tap, this.sendButtonPressed);
}
