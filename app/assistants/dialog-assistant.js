
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

