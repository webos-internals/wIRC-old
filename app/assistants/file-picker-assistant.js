function FilePickerAssistant(filePicker)
{
	this.filePicker = filePicker;
	
	// setup menu
	this.menuModel =
	{
		visible: true,
		items:
		[
			Mojo.Menu.editItem,
			{
				label: "Preferences",
				command: 'do-prefs'
			},
			{
				label: "Help",
				command: 'do-help'
			}
		]
	};
}

FilePickerAssistant.prototype.setup = function()
{
	// set theme
	this.controller.document.body.className = prefs.get().theme;

	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
}

FilePickerAssistant.prototype.activate = function(event)
{
	
}

FilePickerAssistant.prototype.updateData = function()
{
	
}
	
FilePickerAssistant.prototype.listTap = function(event, channel)
{
}

FilePickerAssistant.prototype.handleCommand = function(event)
{
	if (event.type == Mojo.Event.command)
	{
		switch (event.command)
		{
			case 'do-help':
				this.controller.stageController.pushScene('help');
				break;
				
			case 'do-prefs':
				this.controller.stageController.pushScene('preferences-general');
				break;
		}
	}
}