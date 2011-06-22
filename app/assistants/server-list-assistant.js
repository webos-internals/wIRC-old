function ServerListAssistant()
{	
	// subtitle random list
	this.randomSub = 
	[
		{weight: 30, text: 'The webOS IRC Client'},
		{weight: 30, text: 'Mobile IRC Done Right'},
		{weight: 10, text: 'Finally in the catalog!'},
		{weight:  8, text: 'It\'s pronounced "werk"'},
		{weight:  8, text: 'Whistle while you wIRC'},
		{weight:  8, text: 'Now you can IRC from the crapper'},
		{weight:  8, text: 'Now you can IRC from the bar'},
		{weight:  8, text: 'Damn you autocorrect!', title: 'Wire'},
		{weight:  2, text: 'In Windows on Cygwin'},
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
	
	// setup menu
	this.menuModel =
	{
		visible: true,
		items:
		[
			Mojo.Menu.editItem,
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

ServerListAssistant.prototype.setup = function()
{
	try
	{
		// set theme
		setTheme(this.controller.document);
		
		this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
		
		this.versionElement =		this.controller.get('version');
		this.appTitleElement =		this.controller.get('appTitle');
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
		
		this.tryPlugin();
	} 
	catch (e) 
	{
		Mojo.Log.logException(e, 'server-list#setup');
	}
}

ServerListAssistant.prototype.tryPlugin = function()
{
	try
	{
		if (wircPlugin.isReady)
		{
			githash = plugin.get_githash();
			wircPlugin.registerHandlers();
			this.controller.get('noPlugin').style.display = 'none';
			this.controller.get('yesPlugin').style.display = '';
		}
		else
		{
			this.controller.get('noPlugin').style.display = '';
			this.controller.get('yesPlugin').style.display = 'none';
			this.timerID = setTimeout(this.tryPlugin.bind(this), 100);
		}
		this.updateCommandMenu(false);
	}
	catch (e)
	{
		//Mojo.Log.logException(e, 'server-list#tryPlugin');
		this.timerID = setTimeout(this.tryPlugin.bind(this), 100);
	}
}

ServerListAssistant.prototype.activate = function(event)
{
	this.controller.stageController.setWindowProperties({blockScreenTimeout: prefs.get().blockScreenTimeout});
	this.updateCommandMenu(false);
	
	if (this.alreadyActivated)
	{
		this.updateList();
	}
	else
	{
		servers.setListAssistant(this);
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
	else if (event.originalEvent.target.className.include('list'))
	{
		var popupList = [];
		
		if (event.item.alias)	popupList.push({label: event.item.alias});
		else					popupList.push({label: event.item.address});
		
		var favorites = [];
    	if (servers.servers[event.item.key].favoriteChannels && servers.servers[event.item.key].favoriteChannels.length > 0) {
        	for (var c = 0; c < servers.servers[event.item.key].favoriteChannels.length; c++) {
	            favorites.push({label: ' ' + servers.servers[event.item.key].favoriteChannels[c],	command: 'join-' + servers.servers[event.item.key].favoriteChannels[c]});
        	}
    	}
		if (favorites.length > 0) {
	    	popupList.push({label: "Favorite Channels",	items: favorites});
		}
		
		popupList.push({label: 'Join Channel',		command: 'channel-join'});
		popupList.push({label: 'Channel List',		command: 'channel-list'});
		
    	if (servers.servers[event.item.key].dccs && servers.servers[event.item.key].dccs.length > 0) {
			popupList.push({label: 'DCC List',			command: 'dcc-list'});
		}
		
		popupList.push({label: 'Settings',			command: 'settings',	secondaryIcon: 'menu-prefs-icon'});
		
		this.controller.popupSubmenu(
		{
			onChoose: this.listTapListHandler.bindAsEventListener(this, event.item),
			popupClass: 'group-popup',
			placeNear: event.originalEvent.target,
			items: popupList
		});
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
ServerListAssistant.prototype.listTapListHandler = function(choice, item)
{
	if (choice)
	{
		if (choice.substring(0,5) == 'join-')
		{
			servers.servers[item.key].joinChannel(choice.substring(5));
		}
		else
		{
			switch(choice)
			{
				case 'channel-join':
					SingleLineCommandDialog.pop
					(
						this,
						{
							command:		'join',
							onSubmit:		servers.servers[item.key].newCommand.bind(servers.servers[item.key]),
							dialogTitle:	'Join Channel',
							textLabel:		'Channel',
							textDefault:	'#',
							okText:			'Join'
						}
					);
					break;
					
				case 'channel-list':
					servers.servers[item.key].newCommand('/list');
					break;
					
				case 'dcc-list':
					servers.servers[item.key].openDccList();
					break;
					
				case 'settings':
					this.controller.stageController.pushScene('server-info', item.id);
					break;
			}
		}
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
			this.controller.setMenuVisible(Mojo.Menu.commandMenu, wircPlugin.isReady);
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
			if (this.randomSub[r].title) this.appTitleElement.innerHTML = this.randomSub[r].title;
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
				
			case 'do-dcc-list':
				servers.openDccList();
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

ServerListAssistant.prototype.deactivate = function(event)
{
	//Mojo.Log.error('ServerListAssistant#deactivate');
}
ServerListAssistant.prototype.cleanup = function(event)
{
	try
	{
		//Mojo.Log.error('ServerListAssistant#cleanup');
		Mojo.Event.stopListening(this.serverListElement, Mojo.Event.listTap, this.listTapHandler);
		Mojo.Event.stopListening(this.serverListElement, Mojo.Event.listDelete, this.listDeleteHandler);
	
		servers.cmSubscription.cancel();
		plugin.kill();
		
		// hey this works, cool!
		Mojo.Controller.appController.closeAllStages();
		
		//Mojo.Log.error('ServerListAssistant#cleanedup');
	} 
	catch (e) 
	{
		Mojo.Log.logException(e, 'server-list#cleanup');
	}
		
}
