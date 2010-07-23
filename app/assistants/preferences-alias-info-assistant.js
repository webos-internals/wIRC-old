function PreferencesAliasInfoAssistant(params)
{
	
	if (params)
	{
		this.aliasKey = aliases.getAliasKey(params.alias);
		this.params = params;
	}
	else
	{
		this.aliasKey = false;
		this.params = {alias: '', command: ''};
	}
	
	// setup menu
	this.menuModel =
	{
		visible: true,
		items:
		[
			Mojo.Menu.editItem,
			{
				label: "Help",
				command: 'do-help'
			}
		]
	}
}

PreferencesAliasInfoAssistant.prototype.setup = function()
{
	try
	{
		// setup menu
		this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
		
		// set this scene's default transition
		this.controller.setDefaultTransition(Mojo.Transition.zoomFade);
		
		if (this.aliasKey === false) this.controller.get('header').update('Add Alias');
		else this.controller.get('header').update('Edit Alias');
		
		this.aliasElement =			this.controller.get('alias');
		this.commandElement =		this.controller.get('command');
		this.saveButtonElement =	this.controller.get('saveButton');
		
		this.textChanged =			this.textChanged.bindAsEventListener(this);
		this.saveButtonPressed =	this.saveButtonPressed.bindAsEventListener(this);
		
		this.controller.setupWidget
		(
			'alias',
			{
				multiline: false,
				enterSubmits: false,
				changeOnKeyPress: true,
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode,
				modelProperty: 'alias'
			},
			this.params
		);
		this.controller.setupWidget
		(
			'command',
			{
				multiline: false, // true?
				enterSubmits: false,
				changeOnKeyPress: true,
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode,
				modelProperty: 'command'
			},
			this.params
		);
				
		if (this.aliasKey === false)
		{
			this.controller.setupWidget
			(
				'saveButton',
				{
					type: Mojo.Widget.activityButton
				},
				this.buttonModel =
				{
					buttonLabel: 'Save',
					buttonClass: 'affirmative',
					disabled: (this.params.alias == '' && this.params.command == '')
				}
			);
			
			Mojo.Event.listen(this.aliasElement, Mojo.Event.propertyChange, this.textChanged);
			Mojo.Event.listen(this.commandElement, Mojo.Event.propertyChange, this.textChanged);
			Mojo.Event.listen(this.saveButtonElement, Mojo.Event.tap, this.saveButtonPressed);
		}
		
		// make it so nothing is selected by default (textbox rage)
		this.controller.setInitialFocusedElement(null);
		
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'preferences#setup');
	}

}

PreferencesAliasInfoAssistant.prototype.saveButtonPressed = function(event)
{
	if (this.aliasKey === false)
	{
		if (!aliases.getAliasKey(this.params.alias))
		{
			if (!aliasesModel.commands.include(this.params.alias.toLowerCase()))
			{
				aliases.add(this.params.alias, this.params.command);
				this.doneSaving();
			}
			else
			{
				// tell the user this can't be used as an alias, as its already a hard command
				this.saveButtonElement.mojo.deactivate();
			}
		}
		else
		{
			// tell the user an alias like this already exists
			this.saveButtonElement.mojo.deactivate();
		}
	}
}
PreferencesAliasInfoAssistant.prototype.textChanged = function(event)
{
	if (this.params.alias != '' && this.params.command != '' && !aliasesModel.commands.include(this.params.alias.toLowerCase()))
	{
		this.buttonModel.disabled = false;
		this.controller.modelChanged(this.buttonModel);
	}
	else
	{
		this.buttonModel.disabled = true;
		this.controller.modelChanged(this.buttonModel);
	}
}

PreferencesAliasInfoAssistant.prototype.doneSaving = function()
{
	this.saveButtonElement.mojo.deactivate();
	this.controller.stageController.popScene();
}

PreferencesAliasInfoAssistant.prototype.handleCommand = function(event)
{
	if (event.type == Mojo.Event.command)
	{
		switch (event.command)
		{
			case 'do-help':
				this.controller.stageController.pushScene('help');
				break;
		}
	}
}

PreferencesAliasInfoAssistant.prototype.activate = function(event)
{
}

PreferencesAliasInfoAssistant.prototype.deactivate = function(event)
{
	if (this.aliasKey !== false && this.params.alias != '' && this.params.command != '')
	{
		if (!aliasesModel.commands.include(this.params.alias.toLowerCase()))
		{
			aliases.edit(this.aliasKey, this.params.alias, this.params.command);
		}
		else
		{
			// at this point, we can't really tell them that their alias is already a hard command
		}
	}
}

PreferencesAliasInfoAssistant.prototype.cleanup = function(event)
{
	if (this.serverKey === false)
	{
		Mojo.Event.stopListening(this.aliasElement, Mojo.Event.propertyChange, this.textChanged);
		Mojo.Event.stopListening(this.commandElement, Mojo.Event.propertyChange, this.textChanged);
		Mojo.Event.stopListening(this.saveButtonElement, Mojo.Event.tap, this.saveButtonPressed);
	}
}
