function ServerListAssistant()
{
	this.serverListModel =
	{
		items: []
	};
	this.cmdMenuModel =
	{
		label: $L('Menu'),
		items: []
	};
	
	this.versionElement =			false;
	this.serverListElement =		false;
	
	servers.setListAssistant(this);
	
	// setup menu
	this.menuModel =
	{
		visible: true,
		items:
		[
			{
				label: "Identity",
				command: 'do-ident'
			},
			{
				label: "Preferences",
				command: 'do-prefs'
			}
		]
	}
}

ServerListAssistant.prototype.setup = function()
{
	try
	{
		// set theme
		this.controller.document.body.className = prefs.get().theme;
		
		this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
		
		this.versionElement =		this.controller.get('version');
		this.serverListElement =	this.controller.get('serverList');
		
		this.listTapHandler =		this.listTapHandler.bindAsEventListener(this);
		this.listDeleteHandler =	this.listDeleteHandler.bindAsEventListener(this);
		
		this.versionElement.innerHTML = "- v" + Mojo.Controller.appInfo.version;
		
		this.updateList(true);
		this.controller.setupWidget('serverList', 
		{
			itemTemplate: "server-list/server-row",
			swipeToDelete: true,
			reorderable: false
		}, this.serverListModel);
		Mojo.Event.listen(this.serverListElement, Mojo.Event.listTap, this.listTapHandler);
		Mojo.Event.listen(this.serverListElement, Mojo.Event.listDelete, this.listDeleteHandler);
		
		this.updateCommandMenu(true);
		this.controller.setupWidget(Mojo.Menu.commandMenu, { menuClass: 'no-fade' }, this.cmdMenuModel);
	} 
	catch (e) 
	{
		Mojo.Log.logException(e, 'server-list#setup');
	}
}

ServerListAssistant.prototype.activate = function(event)
{
	if (this.alreadyActivated)
	{
		this.updateList();
	}
	this.alreadyActivated = true;
}
ServerListAssistant.prototype.updateList = function(skipUpdate)
{
	try
	{
		this.serverListModel.items = [];
		this.serverListModel.items = servers.getListObjects();
		
		if (!skipUpdate) 
		{
			this.serverListElement.mojo.noticeUpdatedItems(0, this.serverListModel.items);
			this.serverListElement.mojo.setLength(this.serverListModel.items.length);
		}
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'server-list#updateList');
	}
}
ServerListAssistant.prototype.listTapHandler = function(event)
{
	if (event.originalEvent.target.className.include('prefs'))
	{
		this.controller.stageController.pushScene('server-info', event.item.id);
	}
	else if (event.originalEvent.target.className.include('status'))
	{
		if (event.item.connected) 
		{
			servers.servers[event.item.key].disconnect();
		}
		else
		{
			servers.servers[event.item.key].connect();
		}
	}
	else
	{
		servers.servers[event.item.key].showStatusScene(prefs.get().statusPop);
	}
}
ServerListAssistant.prototype.listDeleteHandler = function(event)
{
	servers.deleteServer(event.item.id);
}

ServerListAssistant.prototype.updateCommandMenu = function(skipUpdate)
{
	try
	{
		this.cmdMenuModel.items = [];
		this.cmdMenuModel.items.push({});
		this.cmdMenuModel.items.push({label: $L('New'), icon: 'new', command: 'new-server'});
		
		if (!skipUpdate)
		{
			this.controller.modelChanged(this.cmdMenuModel);
			this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
		}
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'server-list#updateList');
	}
}

ServerListAssistant.prototype.handleCommand = function(event)
{
	if (event.type == Mojo.Event.command)
	{
		switch (event.command)
		{
			case 'do-ident':
				this.controller.stageController.pushScene('identity');
				break;
				
			case 'do-prefs':
				this.controller.stageController.pushScene('preferences');
				break;
				
			case 'new-server':
				this.controller.stageController.pushScene('server-info');
				break;
		}
	}
}

ServerListAssistant.prototype.deactivate = function(event) {}
ServerListAssistant.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.serverListElement, Mojo.Event.listTap, this.listTapHandler);
	Mojo.Event.stopListening(this.serverListElement, Mojo.Event.listDelete, this.listDeleteHandler);
}
