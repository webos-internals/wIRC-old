function HelpAssistant()
{
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
};

HelpAssistant.prototype.setup = function()
{
	this.controller.get('help-title').innerHTML = $L("Help");
	this.controller.get('help-support').innerHTML = $L("Support");
	
    this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	this.controller.get('appname').innerHTML = Mojo.appInfo.title;
	this.controller.get('appdetails').innerHTML = Mojo.appInfo.version + '-' + githash;
	
	// Add back button functionality for the TouchPad
	this.backElement = this.controller.get('icon');
	this.backTapHandler = this.backTap.bindAsEventListener(this);
	this.controller.listen(this.backElement, Mojo.Event.tap, this.backTapHandler);

	this.usageModel = 
	{
		items: []
	};
	
	this.usageModel.items.push({
		text: $L("Available Commands"),
		detail: 'availableCommands',
		type: 'help'
	});
	
	this.controller.setupWidget
	(
		'usageList', 
		{
			itemTemplate: "help/rowTemplate",
			swipeToDelete: false,
			reorderable: false
		},
		this.usageModel
	);
	
	this.controller.listen('usageList', Mojo.Event.listTap, this.listTapHandler.bindAsEventListener(this));
	
	this.supportModel = 
	{
		items: []
	};
	
	this.supportModel.items.push({
		text: $L("WebOS Internals Wiki"),
		detail: 'http://www.webos-internals.org/wiki/Application:WIRC',
		Class: 'img_web',
		type: 'web'
	});
	this.supportModel.items.push({
		text: $L("Bug Reports"),
		detail: 'http://redmine.webos-internals.org/projects/wirc/issues',
		Class: 'img_web',
		type: 'web'
	});
	this.supportModel.items.push({
		text:'#wirc on Freenode',
		Class:'img_wirc',
		type:'wirc'
	});
	this.supportModel.items.push({
		text:'Send Email',
		address:'wirc-support@webos-internals.org',
		subject:'wIRC Support',
		Class:'img_email',
		type:'email'
	});
	this.supportModel.items.push({
		text: $L('Changelog'),
		Class: 'img_changelog',
		type: 'changelog'
	});
	
	this.controller.setupWidget
	(
		'supportList', 
		{
			itemTemplate: "help/rowTemplate",
			swipeToDelete: false,
			reorderable: false
		},
		this.supportModel
	);
	
	this.controller.listen('supportList', Mojo.Event.listTap, this.listTapHandler.bindAsEventListener(this));
	
};
HelpAssistant.prototype.listTapHandler = function(event)
{
	switch (event.item.type)
	{
		case 'web':
			this.controller.serviceRequest("palm://com.palm.applicationManager", 
			{
				method: "open",
				parameters: 
				{
					id: 'com.palm.app.browser',
					params: 
					{
						target: event.item.detail
					}
				}
			});
			break;
			
		case 'email':
			this.controller.serviceRequest('palm://com.palm.applicationManager', 
			{
				method: 'open',
				parameters: 
				{
					target: 'mailto:' + event.item.address + "?subject=" + Mojo.appInfo.title + " " + event.item.subject
				}
			});
			break;
			
		case 'changelog':
			this.controller.stageController.pushScene('startup', true);
			break;
			
		case 'scene':
			this.controller.stageController.pushScene(event.item.detail);
			break;
			
		case 'help':
			this.controller.stageController.pushScene('help-data', helpData.get(event.item.detail));
			break;
			
		case 'wirc':
			if (servers.getServerArrayKey('help') === false)
			{
				var helpServerObject = 
				{
					id:					'help',
					alias:				'wIRC Help',
					address:			'irc.freenode.net',
					serverUser:			'',
					serverPassword:		'',
					port:				'',
					autoConnect:		true,
					autoIdentify:		false,
					identifyService:	'',
					identifyPassword:	'',
					onConnect:			['/join #wirc'],
					favoriteChannels:	[],
					defaultNick:		(prefs.get().nicknames[0]?prefs.get().nicknames[0]:'wIRCer_'+Math.floor(Math.random()*9999)),
					isTemporary:		true
				};
				servers.loadTemporaryServer(helpServerObject);
				this.controller.stageController.popScene();
			}
			break;
	}
};

HelpAssistant.prototype.backTap = function(event)
{
    if (Mojo.Environment.DeviceInfo.modelNameAscii == 'TouchPad') {
	this.controller.stageController.popScene();
    }
};

HelpAssistant.prototype.handleCommand = function(event)
{
    if (event.type == Mojo.Event.command)
	{
	    switch (event.command)
		{
			case 'do-prefs':
				this.controller.stageController.pushScene('preferences-general');
				break;
								
			case 'do-help':
				this.controller.stageController.swapScene('help');
				break;		
		}
	}
};

HelpAssistant.prototype.activate = function(event) {};
HelpAssistant.prototype.deactivate = function(event) {};
HelpAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.backElement, Mojo.Event.tap, this.backTapHandler);
	this.controller.stopListening('supportList', Mojo.Event.listTap, this.listTapHandler.bindAsEventListener(this));
};

// Local Variables:
// tab-width: 4
// End:
