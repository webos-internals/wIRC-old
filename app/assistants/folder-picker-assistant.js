function FolderPickerAssistant(picker)
{
	this.picker = picker;
	
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
	
	this.loadedFolders = [];
}

FolderPickerAssistant.prototype.setup = function()
{
	// set theme
	this.controller.document.body.className = prefs.get().theme;

	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	this.list = this.controller.get('list');
	
	this.initialData();
}

FolderPickerAssistant.prototype.initialData = function()
{
	try
	{
		this.addRow({name: 'USB Partition', location: this.picker.topLevel, rowClass: 'single'}, this.list);
	}
	catch (e)
	{
		Mojo.Log.logException(e, "FolderPicker#initialData");
	}
}
FolderPickerAssistant.prototype.activate = function(event)
{
	if (!this.alreadyActivated)
	{
		this.tap(false, this.picker.topLevel);
	}
	this.alreadyActivated = true;
}

FolderPickerAssistant.prototype.addRow = function(data, parent)
{
	var tpl = 'folder-picker/folder-row';
	var folderId = this.fixPathForId(data.location);
	
	var html = Mojo.View.render({object: {name: data.name, folder: folderId, rowClass: data.rowClass}, template: tpl});
	parent.insert({bottom: html});
	
	this.controller.listen('folder' + folderId, Mojo.Event.tap, this.tap.bindAsEventListener(this, data.location));
}
FolderPickerAssistant.prototype.fixPathForId = function(folder)
{
	return folder.replace(/\//g, '-');
}

FolderPickerAssistant.prototype.tap = function(event, folder)
{
	if (event) event.stop();
	var folderId = this.fixPathForId(folder);
	var drawer = this.controller.get('list' + folderId);
	
	alert('================');
	alert(this.loadedFolders.include(folder));
	alert(folder);
	
	if (!this.loadedFolders.include(folder))
	{
		var data = this.picker.getDirectories(folder);
		if (data.length > 0)
		{
			for (var d = 0; d < data.length; d++)
			{
				this.addRow({name: data[d].name, location: data[d].location+'/', rowClass: (d == data.length-1 ?'last':'')}, drawer, false);
			}
			this.loadedFolders.push(folder);
			this.controller.setupWidget('list' + folderId, {modelProperty: 'open', unstyled: true}, {open: false});
			this.controller.instantiateChildWidgets(this.list);
			this.controller.get('list' + folderId).mojo.setOpenState(true);
			//alert('LOADED!!!');
		}
		else
		{
			//alert('EMPTY!!!');
		}
	}
	else
	{
		this.controller.get('list' + folderId).mojo.toggleState();
		//alert('TOGGLED!!!');
	}
}

FolderPickerAssistant.prototype.handleCommand = function(event)
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