function ServerListAssistant()
{	
	// subtitle random list
	this.randomSub = 
	[
		{weight: 30, text: 'The webOS IRC Client'},
		{weight: 50, text: 'Coming soon... SSL!'},
		{weight: 30, text: 'Mobile IRC Done Right'},
		{weight: 20, text: 'More features than XChat'},
		{weight:  8, text: 'Now you can IRC from the crapper'},
		{weight:  2, text: 'You can, but can\'t'},
		{weight:  2, text: 'Random Taglines Are Awesome'}
	];
	
	this.serverListModel =
	{
		items: []
	};
	this.cmdMenuModel =
	{
		label: $L('Menu'),
		items: []
	};
	
	this.versionElement =		false;
	this.subTitleElement =		false;
	this.noServersElement =		false;
	this.serverListElement =	false;
	
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
			},
			{
				label: "Help",
				command: 'do-help'
			}
		]
	}
}

ServerListAssistant.prototype.tryPlugin = function()
{
	try
	{
		plugin.get_uid();
		wircPlugin.isReady = true;
		this.checkPlugin();
	}
	catch (e)
	{
		this.timerID = setTimeout(this.tryPlugin.bind(this), 100);
	}
}

ServerListAssistant.prototype.setup = function()
{
	try
	{	
		this.tryPlugin();
		
		// set theme
		this.controller.document.body.className = prefs.get().theme;
		
		this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
		
		this.versionElement =		this.controller.get('version');
		this.subTitleElement =		this.controller.get('subTitle');
		this.noServersElement =		this.controller.get('noServers');
		this.serverListElement =	this.controller.get('serverList');
		
		this.listTapHandler =		this.listTapHandler.bindAsEventListener(this);
		this.listDeleteHandler =	this.listDeleteHandler.bindAsEventListener(this);
		
		this.versionElement.innerHTML = "v" + Mojo.Controller.appInfo.version;
		this.subTitleElement.innerHTML = this.getRandomSubTitle();
		
		this.updateList(true);
		this.controller.setupWidget('serverList', 
		{
			itemTemplate: "server-list/server-row",
			swipeToDelete: true,
			reorderable: false,
			preventDeleteProperty: 'temp',
			spinnerSize: Mojo.Widget.spinnerSmall
		}, this.serverListModel);
		Mojo.Event.listen(this.serverListElement, Mojo.Event.listTap, this.listTapHandler);
		Mojo.Event.listen(this.serverListElement, Mojo.Event.listDelete, this.listDeleteHandler);
		
		this.updateCommandMenu(false);
		this.controller.setupWidget(Mojo.Menu.commandMenu, { menuClass: 'no-fade' }, this.cmdMenuModel);
		
	} 
	catch (e) 
	{
		Mojo.Log.logException(e, 'server-list#setup');
	}
}

ServerListAssistant.prototype.checkPlugin = function()
{
	if (wircPlugin.isReady)
	{
		this.controller.get('noPlugin').style.display = 'none';
		this.controller.get('yesPlugin').style.display = '';
		wircPlugin.registerHandlers();
	}
	else
	{
		this.controller.get('noPlugin').style.display = '';
		this.controller.get('yesPlugin').style.display = 'none';
	}
	this.updateCommandMenu(false);
}

ServerListAssistant.prototype.activate = function(event)
{
	this.controller.stageController.setWindowProperties({blockScreenTimeout: prefs.get().blockScreenTimeout, setSubtleLightbar: prefs.get().dimScreen});
	this.checkPlugin();
	this.updateCommandMenu(false);
	
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
		
		if (this.serverListModel.items.length > 0)
		{
			this.noServersElement.hide();
		}
		else
		{
			this.noServersElement.show();
		}
		
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
ServerListAssistant.prototype.changeNickPrompt = function()
{
	this.controller.showAlertDialog(
	{
		title:				'wIRC',
		allowHTMLMessage:	true,
		message:			'You should really change your nick away from the "wIRCer" default before connecting to this server.<br><br>' + 
							'You can do so by bringing down the app menu and selecting "Identity" and changing the "Primary" nick to something else.',
		choices:			[{label:$L('Ok'), value:''}],
		onChoose:			function(value){}
	});
}
ServerListAssistant.prototype.listTapHandler = function(event)
{
	if (event.originalEvent.target.className.include('prefs'))
	{
		this.controller.stageController.pushScene('server-info', event.item.id);
	}
	else if (event.originalEvent.target.className.include('status'))
	{		
		//event.originalEvent.target.up('.palm-row-wrapper').addClassName('changing');
		//if (event.item.connected)
		if (servers.servers[event.item.key].state > 0) 
		{
			servers.servers[event.item.key].disconnect();
		}
		else
		{
			//servers.servers[event.item.key].connect();
			servers.servers[event.item.key].init();
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
			
		if ((servers.servers.length - 2) < MAX_SERVERS) {
			this.cmdMenuModel.visible = wircPlugin.isReady;
			this.cmdMenuModel.items.push({
				label: $L('New'),
				icon: 'new',
				command: 'new-server'
			});
		} else {
			this.cmdMenuModel.visible = false;
			this.cmdMenuModel.items.push({});
		}
		
		if (!skipUpdate) {
			this.controller.modelChanged(this.cmdMenuModel);
			this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
		}		
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'server-list#updateList');
	}
}

ServerListAssistant.prototype.getRandomSubTitle = function()
{
	// loop to get total weight value
	var weight = 0;
	for (var r = 0; r < this.randomSub.length; r++)
	{
		weight += this.randomSub[r].weight;
	}
	
	// random weighted value
	var rand = Math.floor(Math.random() * weight);
	
	// loop through to find the random title
	for (var r = 0; r < this.randomSub.length; r++)
	{
		if (rand <= this.randomSub[r].weight)
		{
			return this.randomSub[r].text;
		}
		else
		{
			rand -= this.randomSub[r].weight;
		}
	}
	
	// if no random title was found (for whatever reason, wtf?) return first and best subtitle
	return this.randomSub[0].text;
}

ServerListAssistant.prototype.handleCommand = function(event)
{
	if (event.type == Mojo.Event.command)
	{
		switch (event.command)
		{
			case 'do-help':
				this.controller.stageController.pushScene('help');
				break;
				
			case 'do-ident':
				this.controller.stageController.pushScene('identity', false, true);
				break;
				
			case 'do-prefs':
				this.controller.stageController.pushScene('preferences-general');
				break;
				
			case 'new-server':
				//this.controller.stageController.pushScene('server-info');
				this.controller.stageController.pushScene('preconfigured-networks');
				break;
		}
	}
}

ServerListAssistant.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.serverListElement, Mojo.Event.listTap, this.listTapHandler);
	Mojo.Event.stopListening(this.serverListElement, Mojo.Event.listDelete, this.listDeleteHandler);
	
	// hey this works, cool!
	Mojo.Controller.appController.closeAllStages();
}