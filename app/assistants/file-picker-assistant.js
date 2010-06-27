function FilePickerAssistant(picker)
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
	
	this.cmdMenuModel =
	{
		label: $L('Menu'),
		items: []
	};
	
	this.selectedFile = false;
	this.selected = false;
	this.folderTree = [];
}
FilePickerAssistant.prototype.setup = function()
{
	// set theme
	this.controller.document.body.className = prefs.get().theme;

	this.picker.setAssistant(this);

	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	if (this.picker.sceneTitle) this.controller.get('header').update(this.picker.sceneTitle);
	
	this.folderHolder = this.controller.get('folderHolder');
	
	this.updateCommandMenu(true);
	this.controller.setupWidget(Mojo.Menu.commandMenu, { menuClass: 'no-fade' }, this.cmdMenuModel);
	
	this.initialData();
}

FilePickerAssistant.prototype.initialData = function()
{
	try
	{
		this.addFolder(this.picker.topLevel, this.folderHolder, true);
	}
	catch (e) 
	{
		Mojo.Log.logException(e, 'file-picker#initialData');
	}
}
FilePickerAssistant.prototype.activate = function(event)
{
	if (!this.alreadyActivated)
	{
		
	}
	this.alreadyActivated = true;
}

FilePickerAssistant.prototype.addFolder = function(folder, parent, initial)
{
	var tpl = 'file-picker/folder-container';
	var folderId = this.fixPathForId(folder);
	
	var html = Mojo.View.render({object: {folder: folderId, left: (initial?0:321)}, template: tpl});
	parent.insert({bottom: html});
	this.folderTree.push(folder);
	
	var data = this.picker.getDirectory(folder);
	if (data.length > 0)
	{
		for (var d = 0; d < data.length; d++)
		{
			this.addRow({name: data[d].name, location: data[d].location, isFolder: (data[d].st_size == 32768 ? true : false), rowClass: (d == data.length-1?'last':'')}, this.controller.get('list' + folderId));
		}
	}
	
	if (!initial)
	{
		Mojo.Animation.animateStyle(
		    this.controller.get('folder' + this.fixPathForId(this.folderTree[this.folderTree.length-2])),
		    'left',
		    'linear',
			{from: 0, to: -321, duration: .15}
		);
		Mojo.Animation.animateStyle(
		    this.controller.get('folder' + folderId),
		    'left',
		    'linear',
			{from: 321, to: 0, duration: .15, currentValue: 321}
		);
	}
}
FilePickerAssistant.prototype.addRow = function(data, parent)
{
	var tpl = 'file-picker/file-row';
	var fileId = this.fixPathForId(data.location);
	
	var html = Mojo.View.render({object: {name: data.name + ' ('+(data.isFolder?'folder':'file')+')', file: fileId, rowClass: data.rowClass}, template: tpl});
	parent.insert({bottom: html});
	
	if (data.isFolder)
	{
		this.controller.listen('file' + fileId, Mojo.Event.tap, this.folderTap.bindAsEventListener(this, data.location));
	}
	else
	{
		this.controller.listen('file' + fileId, Mojo.Event.tap, this.fileTap.bindAsEventListener(this, data.location));
	}
}
FilePickerAssistant.prototype.fixPathForId = function(location)
{
	return location.toLowerCase().replace(/\//g, '-').replace(/ /g, '-').replace(/\./g, '-');
}

FilePickerAssistant.prototype.folderTap = function(event, location)
{
	alert('====== FOLDER-TAP ======');
	alert(location);
	this.addFolder(location+'/', this.folderHolder);
}
FilePickerAssistant.prototype.fileTap = function(event, location)
{
	alert('====== FILE-TAP ======');
	alert(location);
}

FilePickerAssistant.prototype.updateCommandMenu = function(skipUpdate)
{
	this.cmdMenuModel.items = [];
	this.cmdMenuModel.items.push({});
	
	if (this.selectedFile)
	{
		this.cmdMenuModel.items.push({
			label: 'Ok',
			command: 'ok',
			width: 100
		});
	}
	else
	{
		this.cmdMenuModel.items.push({
			label: 'Ok',
			disabled: true,
			command: 'ok',
			width: 100
		});
	}
	
	this.cmdMenuModel.items.push({
		label: 'Cancel',
		command: 'cancel',
		width: 100
	});
	
	this.cmdMenuModel.items.push({});
	
	if (!skipUpdate)
	{
		this.controller.modelChanged(this.cmdMenuModel);
		this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
	}		
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
				
			case 'ok':
				this.selected = true;
				this.picker.ok(this.selectedFile);
				this.picker.close();
				break;
				
			case 'cancel':
				this.selected = true;
				this.picker.cancel();
				this.picker.close();
				break;
		}
	}
}
FilePickerAssistant.prototype.cleanup = function(event)
{
	if (!this.selected)
		this.picker.cancel();
}
