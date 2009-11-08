
function ChangeNickDialog(sceneAssistant)
{
	this.sceneAssistant = sceneAssistant;
	
	this.nickNameElement =		false;
	this.changeButtonElement =	false;
	this.cancelButtonElement =	false;
	
	this.changeHandler =		false;
	this.closeHandler =			false;
}
ChangeNickDialog.prototype.setup = function(widget)
{
	this.widget = widget;
	
	this.nickNameElement =		this.sceneAssistant.controller.get('nickName');
	this.changeButtonElement =	this.sceneAssistant.controller.get('changeButton');
	this.cancelButtonElement =	this.sceneAssistant.controller.get('cancelButton');
	
	this.textChangeHandler =	this.textChanged.bindAsEventListener(this);
	this.changeHandler =		this.change.bindAsEventListener(this);
	this.closeHandler =			this.close.bindAsEventListener(this);
	
	
	this.sceneAssistant.controller.setupWidget
	(
		'nickName',
		{
			modelProperty: 'value',
			requiresEnterKey: true,
			autoReplace: false,
			textCase: Mojo.Widget.steModeLowerCase
		},
		{
			value: this.sceneAssistant.server.nick.name
		}
	);
	this.sceneAssistant.controller.setupWidget
	(
		'changeButton',
		{},
		{
			buttonLabel: 'Change',
			buttonClass: 'affirmative'
		}
	);
	this.sceneAssistant.controller.setupWidget
	(
		'cancelButton',
		{},
		{
			buttonLabel: 'Cancel',
			buttonClass: 'negative'
		}
	);
	
	
	Mojo.Event.listen(this.nickNameElement,		Mojo.Event.propertyChange,	this.textChangeHandler);
	Mojo.Event.listen(this.changeButtonElement,	Mojo.Event.tap,				this.changeHandler);
	Mojo.Event.listen(this.cancelButtonElement,	Mojo.Event.tap,				this.closeHandler);
}
ChangeNickDialog.prototype.textChanged = function(event)
{
	if (event.originalEvent && Mojo.Char.isEnterKey(event.originalEvent.keyCode) &&
		event.value != '') 
	{
		this.change(event);
	}
}
ChangeNickDialog.prototype.change = function(event)
{
	event.stop();
	
	this.sceneAssistant.server.newCommand('/nick ' + this.nickNameElement.mojo.getValue());
	
	this.widget.mojo.close();
}
ChangeNickDialog.prototype.close = function(event)
{
	event.stop();
	this.widget.mojo.close();
}
ChangeNickDialog.prototype.activate = function(event)
{
	if (this.sceneAssistant.stopAutoFocus)
	{
		this.sceneAssistant.stopAutoFocus();
	}
	this.nickNameElement.mojo.focus();
}
ChangeNickDialog.prototype.deactivate = function(event)
{
	if (this.sceneAssistant.startAutoFocus)
	{
		this.sceneAssistant.startAutoFocus();
	}
}
ChangeNickDialog.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.nickNameElement,		Mojo.Event.propertyChange,	this.changeHandler);
	Mojo.Event.stopListening(this.changeButtonElement,	Mojo.Event.tap,				this.changeHandler);
	Mojo.Event.stopListening(this.cancelButtonElement,	Mojo.Event.tap,				this.closeHandler);
}



function ChannelchangeDialog(sceneAssistant)
{
	this.sceneAssistant = sceneAssistant;
	
	channelNameElement =		false;
	this.joinButtonElement =	false;
	this.cancelButtonElement =	false;
	
	this.joinHandler =			false;
	this.closeHandler =			false;
}
ChannelJoinDialog.prototype.setup = function(widget)
{
	this.widget = widget;
	
	this.channelNameElement =	this.sceneAssistant.controller.get('channelName');
	this.joinButtonElement =	this.sceneAssistant.controller.get('joinButton');
	this.cancelButtonElement =	this.sceneAssistant.controller.get('cancelButton');
	
	this.textChangeHandler =	this.textChanged.bindAsEventListener(this);
	this.joinHandler =			this.join.bindAsEventListener(this);
	this.closeHandler =			this.close.bindAsEventListener(this);
	
	
	this.sceneAssistant.controller.setupWidget
	(
		'channelName',
		{
			modelProperty: 'value',
			requiresEnterKey: true,
			autoReplace: false,
			textCase: Mojo.Widget.steModeLowerCase
		},
		{
			value: '#'
		}
	);
	this.sceneAssistant.controller.setupWidget
	(
		'joinButton',
		{},
		{
			buttonLabel: 'Join',
			buttonClass: 'affirmative'
		}
	);
	this.sceneAssistant.controller.setupWidget
	(
		'cancelButton',
		{},
		{
			buttonLabel: 'Cancel',
			buttonClass: 'negative'
		}
	);
	
	
	Mojo.Event.listen(this.channelNameElement,	Mojo.Event.propertyChange,	this.textChangeHandler);
	Mojo.Event.listen(this.joinButtonElement,	Mojo.Event.tap,				this.joinHandler);
	Mojo.Event.listen(this.cancelButtonElement,	Mojo.Event.tap,				this.closeHandler);
}
ChannelJoinDialog.prototype.textChanged = function(event)
{
	if (event.originalEvent && Mojo.Char.isEnterKey(event.originalEvent.keyCode) &&
		event.value != '') 
	{
		this.join(event);
	}
}
ChannelJoinDialog.prototype.join = function(event)
{
	event.stop();
	
	this.sceneAssistant.server.newCommand('/j ' + this.channelNameElement.mojo.getValue());
	
	this.widget.mojo.close();
}
ChannelJoinDialog.prototype.close = function(event)
{
	event.stop();
	this.widget.mojo.close();
}
ChannelJoinDialog.prototype.activate = function(event)
{
	if (this.sceneAssistant.stopAutoFocus)
	{
		this.sceneAssistant.stopAutoFocus();
	}
	this.channelNameElement.mojo.focus();
}
ChannelJoinDialog.prototype.deactivate = function(event)
{
	if (this.sceneAssistant.startAutoFocus)
	{
		this.sceneAssistant.startAutoFocus();
	}
}
ChannelJoinDialog.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.channelNameElement,	Mojo.Event.propertyChange,	this.joinHandler);
	Mojo.Event.stopListening(this.joinButtonElement,	Mojo.Event.tap,				this.joinHandler);
	Mojo.Event.stopListening(this.cancelButtonElement,	Mojo.Event.tap,				this.closeHandler);
}



function UserActionDialog(sceneAssistant, item)
{
	this.sceneAssistant = sceneAssistant;
	this.item = item;
	
	this.titleElement =			false;
	this.queryButtonElement =	false;
	this.opButtonElement =		false;
	this.voiceButtonElement =	false;
	this.kickButtonElement =	false;
	this.banButtonElement =		false;
	this.cancelButtonElement =	false;
	
	this.closeHandler =			false;
}
UserActionDialog.prototype.setup = function(widget)
{
	this.widget = widget;
	
	this.titleElement =			this.sceneAssistant.controller.get('dialogTitle');
	this.queryButtonElement =	this.sceneAssistant.controller.get('queryButton');
	this.opButtonElement =		this.sceneAssistant.controller.get('opButton');
	this.voiceButtonElement =	this.sceneAssistant.controller.get('voiceButton');
	this.kickButtonElement =	this.sceneAssistant.controller.get('kickButton');
	this.banButtonElement =		this.sceneAssistant.controller.get('banButton');
	this.cancelButtonElement =	this.sceneAssistant.controller.get('cancelButton');
	
	this.closeHandler =			this.close.bindAsEventListener(this);
	
	this.titleElement.update(this.item.name);
	
	
	this.sceneAssistant.controller.setupWidget
	(
		'queryButton',
		{},
		{
			buttonLabel: 'Query',
			buttonClass: 'palm-button'
		}
	);
	
	this.sceneAssistant.controller.setupWidget
	(
		'opButton',
		{},
		{
			buttonLabel: 'Op',
			buttonClass: 'palm-button'
		}
	);
	this.sceneAssistant.controller.setupWidget
	(
		'voiceButton',
		{},
		{
			buttonLabel: 'Voice',
			buttonClass: 'palm-button'
		}
	);
	
	this.sceneAssistant.controller.setupWidget
	(
		'kickButton',
		{},
		{
			buttonLabel: 'Kick',
			buttonClass: 'palm-button'
		}
	);
	this.sceneAssistant.controller.setupWidget
	(
		'banButton',
		{},
		{
			buttonLabel: 'Ban',
			buttonClass: 'palm-button'
		}
	);
	
	this.sceneAssistant.controller.setupWidget
	(
		'cancelButton',
		{},
		{
			buttonLabel: 'Cancel',
			buttonClass: 'palm-button'
		}
	);
	
	
	Mojo.Event.listen(this.queryButtonElement,	Mojo.Event.tap, this.queryTap.bindAsEventListener(this));
	Mojo.Event.listen(this.opButtonElement,		Mojo.Event.tap, this.closeHandler);
	Mojo.Event.listen(this.voiceButtonElement,	Mojo.Event.tap, this.closeHandler);
	Mojo.Event.listen(this.kickButtonElement,	Mojo.Event.tap, this.closeHandler);
	Mojo.Event.listen(this.banButtonElement,	Mojo.Event.tap, this.closeHandler);
	Mojo.Event.listen(this.cancelButtonElement,	Mojo.Event.tap, this.closeHandler);
}
UserActionDialog.prototype.queryTap = function(event)
{
	event.stop();
	
	this.sceneAssistant.channel.server.newQuery(this.item.name);
	
	this.widget.mojo.close();
}
UserActionDialog.prototype.close = function(event)
{
	event.stop();
	this.widget.mojo.close();
}
UserActionDialog.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.queryButtonElement,	Mojo.Event.tap, this.queryTap.bindAsEventListener(this));
	Mojo.Event.stopListening(this.opButtonElement,		Mojo.Event.tap, this.closeHandler);
	Mojo.Event.stopListening(this.voiceButtonElement,	Mojo.Event.tap, this.closeHandler);
	Mojo.Event.stopListening(this.kickButtonElement,	Mojo.Event.tap, this.closeHandler);
	Mojo.Event.stopListening(this.banButtonElement,		Mojo.Event.tap, this.closeHandler);
	Mojo.Event.stopListening(this.cancelButtonElement,	Mojo.Event.tap, this.closeHandler);
}

