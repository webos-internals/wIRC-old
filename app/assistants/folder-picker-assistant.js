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
		this.addRow({name: 'USB Partition', location: this.picker.topLevel, rowClass: ''}, this.list, false);
		var data = this.picker.getDirectory(this.picker.topLevel);
		if (data.length > 0)
		{
			var top = this.controller.get('list' + this.fixPathForId(this.picker.topLevel));
			for (var d = 0; d < data.length; d++)
			{
				if (data[d].st_size == 32768)
				{
					this.addRow({name: data[d].name, location: data[d].location+'/', rowClass: ''}, top, false);
				}
			}
		}
	}
	catch (e)
	{
		Mojo.Log.logException(e, "FolderPicker#initialData");
	}
}

FolderPickerAssistant.prototype.addRow = function(data, parent, alreadyOpen)
{
	var tpl = 'folder-picker/folder-row';
	var folderId = this.fixPathForId(data.location);
	var html = Mojo.View.render({object: {name: data.name, folder: folderId, rowClass: data.rowClass}, template: tpl});
	parent.insert({after: html});
	this.controller.setupWidget('list' + folderId, {modelProperty: 'open', unstyled: false}, {open: alreadyOpen});
	this.controller.listen('folder' + folderId, Mojo.Event.tap, this.tap.bindAsEventListener(this, data.location));
	this.controller.instantiateChildWidgets(parent);
}
FolderPickerAssistant.prototype.fixPathForId = function(folder)
{
	return folder.replace('/', '-');
}

FolderPickerAssistant.prototype.tap = function(event, folder)
{
	var folderId = this.fixPathForId(folder);
	var drawer = this.controller.get('list' + folderId);
	
	alert('================');
	alert(folder);
	alert(drawer.innerHTML);
	
	var data = this.picker.getDirectory(folder);
	if (data.length > 0)
	{
		for (var d = 0; d < data.length; d++)
		{
			if (data[d].st_size == 32768)
			{
				this.addRow({name: data[d].name, location: data[d].location+'/', rowClass: ''}, drawer, false);
			}
		}
		this.controller.get('list' + folderId).mojo.setOpenState(true);
	}
	else
	{
		alert('EMPTY!!!');
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