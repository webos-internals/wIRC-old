function MasterListAssistant()
{	
	// subtitle random list
	this.randomSub = 
	[
		{weight: 30, text: 'The webOS IRC Client'},
		{weight: 30, text: 'Mobile IRC Done Right'},
		{weight:  8, text: 'It\'s pronounced "werk"'},
		{weight:  8, text: 'Now you can IRC from the crapper'},
		{weight:  8, text: 'Now you can IRC from the bar'},
		{weight:  2, text: 'In Windows on Cygwin'},
		{weight:  2, text: 'You can, but can\'t'},
		{weight:  2, text: 'Random Taglines Are Awesome'}
	];
	
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

MasterListAssistant.prototype.tryPlugin = function()
{
	try
	{
		githash = plugin.get_githash();
		wircPlugin.isReady = true;
		this.checkPlugin();
	}
	catch (e)
	{
		this.timerID = setTimeout(this.tryPlugin.bind(this), 100);
	}
}

MasterListAssistant.prototype.setup = function()
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
		
		this.versionElement.innerHTML = "v" + Mojo.Controller.appInfo.version;
		this.subTitleElement.innerHTML = this.getRandomSubTitle();
		
		this.updateList(true);
		
		this.updateCommandMenu(false);
		this.controller.setupWidget(Mojo.Menu.commandMenu, { menuClass: 'no-fade' }, this.cmdMenuModel);
		
	} 
	catch (e) 
	{
		Mojo.Log.logException(e, 'server-list#setup');
	}
}

MasterListAssistant.prototype.checkPlugin = function()
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

MasterListAssistant.prototype.activate = function(event)
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
MasterListAssistant.prototype.updateList = function(skipInstantiate)
{
	try
	{
		var serverList = servers.getListObjects();
		var html = '';
		
		if (serverList.length > 0)
		{
			for (var s = 0; s < serverList.length; s++)
			{
				html += Mojo.View.render({object: serverList[s], template: 'master-list/server-row'});
			}
		
			this.serverListElement.update(html);
			
			for (var s = 0; s < serverList.length; s++)
			{
				this.controller.listen('server-'+serverList[s].id, Mojo.Event.tap, this.listTapHandler.bindAsEventListener(this, serverList[s]));
				this.controller.setupWidget('server-spinner-'+serverList[s].id, {spinnerSize: Mojo.Widget.spinnerSmall}, {spinning: serverList[s].spinning});
			}
			
			if (!skipInstantiate) this.controller.instantiateChildWidgets(this.serverListElement);
			
			this.noServersElement.hide();
		}
		else
		{
			this.serverListElement.update('');
			this.noServersElement.show();
		}
		
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'server-list#updateList');
	}
}
MasterListAssistant.prototype.listTapHandler = function(event, item)
{
	if (event.target.className.include('prefs'))
	{
		this.controller.stageController.pushScene('server-info', item.id);
	}
	else if (event.target.className.include('status'))
	{		
		//event.originalEvent.target.up('.palm-row-wrapper').addClassName('changing');
		//if (item.connected)
		if (servers.servers[item.key].state > 0) 
		{
			servers.servers[item.key].disconnect();
		}
		else
		{
			//servers.servers[item.key].connect();
			servers.servers[item.key].init();
		}
	}
	else
	{
		servers.servers[item.key].showStatusScene(prefs.get().statusPop);
	}
}
MasterListAssistant.prototype.listDeleteHandler = function(event)
{
	servers.deleteServer(event.item.id);
}

MasterListAssistant.prototype.updateCommandMenu = function(skipUpdate)
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

MasterListAssistant.prototype.getRandomSubTitle = function()
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

MasterListAssistant.prototype.handleCommand = function(event)
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

MasterListAssistant.prototype.changeNickPrompt = function()
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

MasterListAssistant.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.serverListElement, Mojo.Event.listTap, this.listTapHandler);
	Mojo.Event.stopListening(this.serverListElement, Mojo.Event.listDelete, this.listDeleteHandler);
	
	// hey this works, cool!
	Mojo.Controller.appController.closeAllStages();
}