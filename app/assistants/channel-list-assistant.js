function ChannelListAssistant(server)
{
	this.server = server;
	this.currentSort = 'count';
	
	this.server.setListAssistant(this);
	
	this.channels =		[];
	this.listModel =	{items:[]};
	this.cmdMenuModel =	{items:[]};
	this.searchModel =	{value:''};
	
	this.loadCount =	0;
	
	this.searchTimer =	false;
	this.searching =	false;
	this.searchText =	'';
	
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

ChannelListAssistant.prototype.setup = function()
{
	// set theme
	this.controller.document.body.className = prefs.get().theme;
	
	this.headerElement =		this.controller.get('listHeader');
	this.searchElement =		this.controller.get('searchText');
	this.searchSpinnerElement =	this.controller.get('searchSpinner');
	this.titleElement =			this.controller.get('title');
	this.spinnerElement =		this.controller.get('spinner');
	this.loadedCountElement =	this.controller.get('loadedCount');
	this.listElement =			this.controller.get('channelList');
	
	this.listTapHandler =		this.listTapHandler.bindAsEventListener(this);
	this.filterDelayHandler =	this.filterDelay.bindAsEventListener(this);
	this.keyHandler =			this.keyTest.bindAsEventListener(this);
	this.searchFunction =		this.filter.bind(this);
	
	this.titleElement.update((this.server.alias?this.server.alias:this.server.address) + ': Channel List');
	
	this.controller.setupWidget('spinner', {spinnerSize: 'large'}, {spinning:true});
	
	this.controller.setupWidget
	(
		'channelList',
		{
			itemTemplate: "channel-list/channel-row",
			swipeToDelete: false,
			reorderable: false
		},
		this.listModel
	);
	
	Mojo.Event.listen(this.listElement, Mojo.Event.listTap, this.listTapHandler);
	
    this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	this.controller.setupWidget(Mojo.Menu.commandMenu, { menuClass: 'no-fade' }, this.cmdMenuModel);
	
	
	this.controller.setupWidget('searchSpinner', {spinnerSize: 'small'}, {spinning: false});
	
	this.searchModel = {value:this.searchText};
	
	// setup search widget
	this.controller.setupWidget
	(
		'searchText',
		{
			focus: false,
			autoFocus: false,
			changeOnKeyPress: true
		},
		this.searchModel
	);
	
	Mojo.Event.listen(this.searchElement, Mojo.Event.propertyChange, this.filterDelayHandler);
	Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keypress, this.keyHandler);
}

ChannelListAssistant.prototype.activate = function(event)
{
	this.controller.stageController.setWindowProperties({blockScreenTimeout: prefs.get().blockScreenTimeout});
}

ChannelListAssistant.prototype.loadChannels = function(channels)
{
	if (channels.length > 0)
	{
		for (var c = 0; c < channels.length; c++) 
		{
			this.channels.push({channel: channels[c].channel, users: channels[c].users, topic: channels[c].topic});
		}
	}
	
	this.updateList();
}

ChannelListAssistant.prototype.updateList = function(skipUpdate)
{
	if (this.currentSort == 'alpha') 
	{
		this.channels.sort(function(a, b)
		{
			aName = a.channel.toLowerCase().replace('#', '');
			bName = b.channel.toLowerCase().replace('#', '');
			return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
		});
	}
	else if (this.currentSort == 'count')
	{
		this.channels.sort(function(a, b)
		{
			return b.users - a.users;
		});
	}
	
	this.filter(skipUpdate);
}

ChannelListAssistant.prototype.keyTest = function(event)
{
	if (Mojo.Char.isValidWrittenChar(event.originalEvent.charCode)) 
	{
		Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keypress, this.keyHandler);
		this.headerElement.style.display = 'none';
		this.searchElement.style.display = 'inline';
		this.searchElement.mojo.focus();
	}
}
ChannelListAssistant.prototype.filterDelay = function(event)
{
	clearTimeout(this.searchTimer);
	
	this.searchText = event.value;
	
	if (this.searchText == '') 
	{
		this.searchSpinnerElement.mojo.stop();
		
		this.searchElement.mojo.blur();
		this.searchElement.style.display = 'none';
		this.headerElement.style.display = 'inline';
		Mojo.Event.listen(this.controller.sceneElement, Mojo.Event.keypress, this.keyHandler);
		this.searchFunction();
	}
	else
	{
		this.searchSpinnerElement.mojo.start();
		
		this.searching = true;
		
		this.searchTimer = setTimeout(this.searchFunction, 1000);
	}
}
ChannelListAssistant.prototype.filter = function(skipUpdate)
{
	this.listModel.items = [];
	
	for (var c = 0; c < this.channels.length; c++) 
	{
		var pushIt = false;
		
		if (this.searchText == '') 
		{
			this.channels[c].displayChannel = this.channels[c].channel;
			this.channels[c].displayTopic = this.channels[c].topic;
			pushIt = true;
		}
		else 
		{
			if (this.channels[c].channel.toLowerCase().include(this.searchText.toLowerCase())) 
			{
				this.channels[c].displayChannel = this.channels[c].channel.replace(new RegExp('(' + this.searchText + ')', 'gi'), '<span class="highlight">$1</span>');
				pushIt = true;
			}
			if (this.channels[c].topic.toLowerCase().include(this.searchText.toLowerCase())) 
			{
				this.channels[c].displayTopic = this.channels[c].topic.replace(new RegExp('(' + this.searchText + ')', 'gi'), '<span class="highlight">$1</span>');
				pushIt = true;
			}
		}
		
		if (pushIt) 
		{
			this.listModel.items.push(this.channels[c]);
		}
	}
	
	if (!skipUpdate) 
	{
		this.listElement.mojo.noticeUpdatedItems(0, this.listModel.items);
	 	this.listElement.mojo.setLength(this.listModel.items.length);
		if (this.searching) 
		{
			this.listElement.mojo.revealItem(0, true);
			this.searching = false;
		}
		
		this.searchSpinnerElement.mojo.stop();
	}
	
}

ChannelListAssistant.prototype.loadedCountUpdate = function(num)
{
	this.loadCount += num;
	this.loadedCountElement.update(this.loadCount);
}

ChannelListAssistant.prototype.doneLoading = function()
{
	this.spinnerElement.mojo.stop();
	this.updateCommandMenu();
}

ChannelListAssistant.prototype.listTapHandler = function(event)
{
	this.server.joinChannel(event.item.channel, '');
}

ChannelListAssistant.prototype.updateCommandMenu = function(skipUpdate)
{
	this.cmdMenuModel.items = [];
	
	this.cmdMenuModel.items.push({});
	this.cmdMenuModel.items.push({items: [{icon: "icon-filter-alpha", command: 'alpha'}, {icon: "icon-filter-users",  command: 'count'}], toggleCmd: this.currentSort});
	this.cmdMenuModel.items.push({});
	
	if (!skipUpdate)
	{
		this.controller.modelChanged(this.cmdMenuModel);
		this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
	}
}

ChannelListAssistant.prototype.handleCommand = function(event)
{
	if (event.type == Mojo.Event.command) 
	{
		switch (event.command)
		{
			case 'count':
			case 'alpha':
				if (this.currentSort !== event.command) 
				{
					this.currentSort = event.command;
					this.updateCommandMenu();
					this.updateList();
				}
				break;
				
			case 'do-prefs':
				this.controller.stageController.pushScene('preferences-general');
				break;
								
			case 'do-help':
				this.controller.stageController.pushScene('help');
				break;
		}
	}
}
ChannelListAssistant.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.listElement, Mojo.Event.listTap, this.listTapHandler);
	Mojo.Event.stopListening(this.searchElement, Mojo.Event.propertyChange, this.filterDelayHandler);
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keypress, this.keyHandler);
}
