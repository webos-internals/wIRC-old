function ServerStatusAssistant(server, popped)
{
	this.server = server;
	this.popped = popped;
	this.inputModel = {value:''};
	
	this.titleElement =			false;
	this.popButtonElement =		false;
	this.inputWidgetElement =	false;
	this.sendButtonElement =	false;
	
	this.server.setStatusAssistant(this);
}

ServerStatusAssistant.prototype.setup = function()
{
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, { visible: false });
	
	this.titleElement =			this.controller.get('title');
	this.popButtonElement =		this.controller.get('popButton');
	this.inputWidgetElement =	this.controller.get('inputWidget');
	this.sendButtonElement =	this.controller.get('sendButton');
	
	this.popButtonPressed =		this.popButtonPressed.bindAsEventListener(this);
	this.inputChanged =			this.inputChanged.bindAsEventListener(this);
	this.sendButtonPressed =	this.sendButtonPressed.bindAsEventListener(this);
	
	this.titleElement.innerHTML = this.server.alias;
	
	if (this.popped)	this.popButtonElement.style.display = 'none';
	else				Mojo.Event.listen(this.popButtonElement, Mojo.Event.tap, this.popButtonPressed);
	
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

ServerStatusAssistant.prototype.popButtonPressed = function(event)
{
	this.server.showStatusScene(true);
}
ServerStatusAssistant.prototype.sendButtonPressed = function(event)
{
	alert('Send: ' + this.inputModel.value);
	
	this.inputWidgetElement.mojo.setValue('');
}
ServerStatusAssistant.prototype.inputChanged = function(event)
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

ServerStatusAssistant.prototype.activate = function(event) {}
ServerStatusAssistant.prototype.deactivate = function(event) {}
ServerStatusAssistant.prototype.cleanup = function(event)
{
	if (!this.popped) Mojo.Event.stopListening(this.popButtonElement, Mojo.Event.tap, this.popButtonPressed);
	Mojo.Event.stopListening(this.inputWidgetElement, Mojo.Event.propertyChange, this.inputChanged);
	Mojo.Event.stopListening(this.sendButtonElement, Mojo.Event.tap, this.sendButtonPressed);
}
