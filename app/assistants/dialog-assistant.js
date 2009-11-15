
function SingleLineCommandDialog(sceneAssistant, params)
{
	this.sceneAssistant =	sceneAssistant;
	this.params =			params;
	
	/* 
	 * "params" object
	 * 
	 * - REQUIRED 
	 * command		- without the slash or trailing space - example: 'nick', 'join', etc
	 * onSubmit		- callback function to send the command string to, its diffent in server/channel/query assistants
	 * 
	 * - OPTIONAL
	 * dialogTitle	- title of dialog - default: "Dialog"
	 * textLabel	- label next to text field
	 * textDefault	- default in text field
	 * okText		- text on ok button - default: "Ok"
	 * cancelText	- text on cancel button - defalt: "Cancel"
	 * postCommand	- string to append to end of command dialog (after a space)
	 * onActivate	- callback fnction to call on dialog activation
	 * onDeactivate	- callback function to call on dialog deactivation
	 * 
	 */
	
	this.dialogTitle =	false;
	this.textLabel =	false;
	this.textField =	false;
	this.okButton =		false;
	this.cancelButton =	false;
	
	this.okHandler =	false;
	this.closeHandler =	false;
}
SingleLineCommandDialog.pop = function(sceneAssistant, params)
{
	sceneAssistant.controller.showDialog(
	{
		template: 'dialog/single-line-dialog',
		assistant: new SingleLineCommandDialog(sceneAssistant, params)
	});
}
SingleLineCommandDialog.prototype.setup = function(widget)
{
	this.widget = widget;
	
	// load elements
	this.dialogTitle =	this.sceneAssistant.controller.get('dialogTitle');
	this.textLabel =	this.sceneAssistant.controller.get('textLabel');
	this.textField =	this.sceneAssistant.controller.get('textField');
	this.okButton =		this.sceneAssistant.controller.get('okButton');
	this.cancelButton =	this.sceneAssistant.controller.get('cancelButton');
	
	// update strings
	this.dialogTitle.update((this.params.dialogTitle?this.params.dialogTitle:'Dialog'));
	this.textLabel.update((this.params.textLabel?this.params.textLabel:''));
	
	// load handlers
	this.textChanged =	this.text.bindAsEventListener(this);
	this.okTapped =		this.ok.bindAsEventListener(this);
	this.cancelTapped =	this.cancel.bindAsEventListener(this);
	
	// setup widgets
	this.sceneAssistant.controller.setupWidget
	(
		'textField',
		{
			modelProperty: 'value',
			requiresEnterKey: true,
			autoReplace: false,
			textCase: Mojo.Widget.steModeLowerCase
		},
		{
			value: (this.params.textDefault?this.params.textDefault:'')
		}
	);
	this.sceneAssistant.controller.setupWidget
	(
		'okButton',
		{},
		{
			buttonLabel: (this.params.okText?this.params.okText:'Ok'),
			buttonClass: 'affirmative'
		}
	);
	this.sceneAssistant.controller.setupWidget
	(
		'cancelButton',
		{},
		{
			buttonLabel: (this.params.cancelText?this.params.cancelText:'Cancel'),
			buttonClass: 'negative'
		}
	);
	
	// start listeners
	Mojo.Event.listen(this.textField,		Mojo.Event.propertyChange,	this.textChanged);
	Mojo.Event.listen(this.okButton,		Mojo.Event.tap,				this.okTapped);
	Mojo.Event.listen(this.cancelButton,	Mojo.Event.tap,				this.cancelTapped);
}
SingleLineCommandDialog.prototype.text = function(event)
{
	// if enter, act as-if ok was pressed
	if (event.originalEvent && Mojo.Char.isEnterKey(event.originalEvent.keyCode) &&
		event.value != '') 
	{
		this.ok(event);
	}
}
SingleLineCommandDialog.prototype.ok = function(event)
{
	// stop event
	event.stop();
	// we need the required parameters to actually send a command
	if (this.params.onSubmit && this.params.command) 
	{
		this.params.onSubmit('/' + this.params.command + ' ' + this.textField.mojo.getValue() + (this.params.postCommand?' '+this.params.postCommand:''));
	}
	// close dialog
	this.widget.mojo.close();
}
SingleLineCommandDialog.prototype.cancel = function(event)
{
	// stop event and close dialog
	event.stop();
	this.widget.mojo.close();
}
SingleLineCommandDialog.prototype.activate = function(event)
{
	// if onActivate callback, lets call it
	if (this.params.onActivate)
	{
		this.params.onActivate();
	}
	// focus text field
	this.textField.mojo.focus();
}
SingleLineCommandDialog.prototype.deactivate = function(event)
{
	// if onDeactivate callback, lets call it
	if (this.params.onDeactivate)
	{
		this.params.onDeactivate();
	}
}
SingleLineCommandDialog.prototype.cleanup = function(event)
{
	// kill listeners
	Mojo.Event.stopListening(this.textField,	Mojo.Event.propertyChange,	this.textChanged);
	Mojo.Event.stopListening(this.okButton,		Mojo.Event.tap,				this.okTapped);
	Mojo.Event.stopListening(this.cancelButton,	Mojo.Event.tap,				this.cancelTapped);
}



function UserActionDialog(sceneAssistant, item)
{
	this.sceneAssistant = sceneAssistant;
	this.item = item;
	
	this.nick = this.sceneAssistant.channel.server.getNick(this.item.name);
	
	this.titleElement =			false;
	this.queryButtonElement =	false;
	this.whoisButtonElement =	false;
	this.inviteButtonElement =	false;
	this.ignoreButtonElement =	false;
	this.opButtonElement =		false;
	this.halfButtonElement =	false;
	this.voiceButtonElement =	false;
	this.kickButtonElement =	false;
	this.banButtonElement =		false;
	this.cancelButtonElement =	false;
	
	this.closeHandler =			false;
	this.opHandler =			false;
	this.halfHandler =			false;
	this.closeHandler =			false;
}
UserActionDialog.prototype.setup = function(widget)
{
	this.widget = widget;
	
	this.titleElement =			this.sceneAssistant.controller.get('dialogTitle');
	this.queryButtonElement =	this.sceneAssistant.controller.get('queryButton');
	this.whoisButtonElement =	this.sceneAssistant.controller.get('whoisButton');
	this.inviteButtonElement =	this.sceneAssistant.controller.get('inviteButton');
	this.ignoreButtonElement =	this.sceneAssistant.controller.get('ignoreButton');
	this.opButtonElement =		this.sceneAssistant.controller.get('opButton');
	this.halfButtonElement =	this.sceneAssistant.controller.get('halfButton');
	this.voiceButtonElement =	this.sceneAssistant.controller.get('voiceButton');
	this.kickButtonElement =	this.sceneAssistant.controller.get('kickButton');
	this.banButtonElement =		this.sceneAssistant.controller.get('banButton');
	this.cancelButtonElement =	this.sceneAssistant.controller.get('cancelButton');
	
	this.closeHandler =			this.close.bindAsEventListener(this);
	this.opHandler =			(this.nick.hasMode('o', this.sceneAssistant.channel)?this.deopTap.bindAsEventListener(this):this.opTap.bindAsEventListener(this));
	this.halfHandler =			(this.nick.hasMode('h', this.sceneAssistant.channel)?this.dehalfTap.bindAsEventListener(this):this.halfTap.bindAsEventListener(this));
	this.voiceHandler =			(this.nick.hasMode('v', this.sceneAssistant.channel)?this.devoiceTap.bindAsEventListener(this):this.voiceTap.bindAsEventListener(this));
	
	this.titleElement.update(this.item.name);
	
	
	this.sceneAssistant.controller.setupWidget
	(
		'queryButton',
		{},
		{
			buttonLabel: 'Private Message',
			buttonClass: 'palm-button'
		}
	);
	
	this.sceneAssistant.controller.setupWidget
	(
		'whoisButton',
		{},
		{
			buttonLabel: 'Whois',
			buttonClass: 'palm-button'
		}
	);
	this.sceneAssistant.controller.setupWidget
	(
		'inviteButton',
		{},
		{
			disabled: true,
			buttonLabel: 'Invite',
			buttonClass: 'palm-button'
		}
	);
	this.sceneAssistant.controller.setupWidget
	(
		'ignoreButton',
		{},
		{
			disabled: true,
			buttonLabel: 'Ignore',
			buttonClass: 'palm-button'
		}
	);
	
	this.sceneAssistant.controller.setupWidget
	(
		'opButton',
		{},
		{
			buttonLabel: (this.nick.hasMode('o', this.sceneAssistant.channel)?'DeOp':'Op'),
			buttonClass: 'palm-button'
		}
	);
	this.sceneAssistant.controller.setupWidget
	(
		'halfButton',
		{},
		{
			buttonLabel: (this.nick.hasMode('h', this.sceneAssistant.channel)?'DeHalfOp':'HalfOp'),
			buttonClass: 'palm-button'
		}
	);
	this.sceneAssistant.controller.setupWidget
	(
		'voiceButton',
		{},
		{
			buttonLabel: (this.nick.hasMode('v', this.sceneAssistant.channel)?'DeVoice':'Voice'),
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
			disabled: true,
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
			buttonClass: 'negative'
		}
	);
	
	
	Mojo.Event.listen(this.queryButtonElement,	Mojo.Event.tap, this.queryTap.bindAsEventListener(this));
	Mojo.Event.listen(this.whoisButtonElement,	Mojo.Event.tap, this.whoisTap.bindAsEventListener(this));
	//Mojo.Event.listen(this.inviteButtonElement,	Mojo.Event.tap, this.closeHandler);
	//Mojo.Event.listen(this.ignoreButtonElement,	Mojo.Event.tap, this.closeHandler);
	Mojo.Event.listen(this.opButtonElement,		Mojo.Event.tap, this.opHandler);
	Mojo.Event.listen(this.halfButtonElement,	Mojo.Event.tap, this.halfHandler);
	Mojo.Event.listen(this.voiceButtonElement,	Mojo.Event.tap, this.voiceHandler);
	Mojo.Event.listen(this.kickButtonElement,	Mojo.Event.tap, this.kickTap.bindAsEventListener(this));
	//Mojo.Event.listen(this.banButtonElement,	Mojo.Event.tap, this.closeHandler);
	Mojo.Event.listen(this.cancelButtonElement,	Mojo.Event.tap, this.closeHandler);
}
UserActionDialog.prototype.queryTap = function(event)
{
	this.sceneAssistant.channel.server.newQuery(this.item.name);
	this.close(event);
}
UserActionDialog.prototype.whoisTap = function(event)
{
	this.sceneAssistant.channel.server.whois(this.item.name);
	this.close(event);
}
UserActionDialog.prototype.opTap = function(event)
{
	this.sceneAssistant.channel.newCommand('/mode ' + this.sceneAssistant.channel.name + ' +o ' + this.item.name);
	this.close(event);
}
UserActionDialog.prototype.deopTap = function(event)
{
	this.sceneAssistant.channel.newCommand('/mode ' + this.sceneAssistant.channel.name + ' -o ' + this.item.name);
	this.close(event);
}
UserActionDialog.prototype.halfTap = function(event)
{
	this.sceneAssistant.channel.newCommand('/mode ' + this.sceneAssistant.channel.name + ' +h ' + this.item.name);
	this.close(event);
}
UserActionDialog.prototype.dehalfTap = function(event)
{
	this.sceneAssistant.channel.newCommand('/mode ' + this.sceneAssistant.channel.name + ' -h ' + this.item.name);
	this.close(event);
}
UserActionDialog.prototype.voiceTap = function(event)
{
	this.sceneAssistant.channel.newCommand('/mode ' + this.sceneAssistant.channel.name + ' +v ' + this.item.name);
	this.close(event);
}
UserActionDialog.prototype.devoiceTap = function(event)
{
	this.sceneAssistant.channel.newCommand('/mode ' + this.sceneAssistant.channel.name + ' -v ' + this.item.name);
	this.close(event);
}
UserActionDialog.prototype.kickTap = function(event)
{
	SingleLineCommandDialog.pop
	(
		this.sceneAssistant,
		{
			command:		'kick ' + this.sceneAssistant.channel.name + ' ' + this.item.name,
			onSubmit:		this.sceneAssistant.channel.newCommand.bind(this.sceneAssistant.channel),
			dialogTitle:	'Kick ' + this.item.name,
			textLabel:		'Reason',
			textDefault:	'',
			okText:			'Kick'
		}
	);
	this.close(event);
}
UserActionDialog.prototype.close = function(event)
{
	event.stop();
	this.widget.mojo.close();
}
UserActionDialog.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.queryButtonElement,	Mojo.Event.tap, this.queryTap.bindAsEventListener(this));
	Mojo.Event.stopListening(this.whoisButtonElement,	Mojo.Event.tap, this.whoisTap.bindAsEventListener(this));
	//Mojo.Event.stopListening(this.inviteButtonElement,	Mojo.Event.tap, this.closeHandler);
	//Mojo.Event.stopListening(this.ignoreButtonElement,	Mojo.Event.tap, this.closeHandler);
	Mojo.Event.stopListening(this.opButtonElement,		Mojo.Event.tap, this.opHandler);
	Mojo.Event.stopListening(this.halfButtonElement,	Mojo.Event.tap, this.halfHandler);
	Mojo.Event.stopListening(this.voiceButtonElement,	Mojo.Event.tap, this.voiceHandler);
	Mojo.Event.stopListening(this.kickButtonElement,	Mojo.Event.tap, this.kickTap.bindAsEventListener(this));
	//Mojo.Event.stopListening(this.banButtonElement,		Mojo.Event.tap, this.closeHandler);
	Mojo.Event.stopListening(this.cancelButtonElement,	Mojo.Event.tap, this.closeHandler);
}

