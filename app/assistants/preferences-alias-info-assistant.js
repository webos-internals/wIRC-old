function PreferencesAliasInfoAssistant(param)
{
	
	alert(param);
	if (param)
		for (var p in param)
			alert(p+': '+param[p]);
	
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
