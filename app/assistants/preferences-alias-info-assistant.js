function PreferencesAliasInfoAssistant(params)
{
	
	if (params)
	{
		this.isAdd = false;
		this.params = params;
	}
	else
	{
		this.isAdd = true;
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
		
		if (this.isAdd) this.controller.get('header').update('Add Alias');
		else this.controller.get('header').update('Edit Alias');
		
		this.controller.setupWidget
		(
			'alias',
			{
				multiline: false,
				enterSubmits: false,
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
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode,
				modelProperty: 'command'
			},
			this.params
		);
		
		if (this.isAdd)
		{
			this.controller.setupWidget
			(
				'saveButton',
				{
					type: Mojo.Widget.activityButton
				},
				{
					buttonLabel: 'Save',
					buttonClass: 'affirmative',
					disabled: (this.params.alias == '' && this.params.command == '')
				}
			);
			
			//Mojo.Event.listen(this.saveButtonElement, Mojo.Event.tap, this.saveButtonPressed);
		}
		
		// make it so nothing is selected by default (textbox rage)
		this.controller.setInitialFocusedElement(null);
		
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'preferences#setup');
	}

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
}

PreferencesAliasInfoAssistant.prototype.cleanup = function(event)
{
}
