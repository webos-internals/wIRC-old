function ChannelUsersAssistant(channel)
{
	this.channel = channel;
	
	this.titleElement =				false;
	this.userListElement =			false;
	
	this.nicks =	[];
	this.listModel = {items:[]};
	
	this.searchModel =	{value:''};
	
	this.searchTimer =	false;
	this.searching =	false;
	this.searchText =	'';
	
	this.channel.setUsersAssistant(this);
	
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

ChannelUsersAssistant.prototype.setup = function()
{
	try
	{
		this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
		
		this.headerElement =		this.controller.get('listHeader');
		this.searchElement =		this.controller.get('searchText');
		this.searchSpinnerElement =	this.controller.get('searchSpinner');
		this.titleElement =			this.controller.get('title');
		this.userListElement =		this.controller.get('userList');
		
		this.listTapHandler =		this.listTap.bindAsEventListener(this);
		this.filterDelayHandler =	this.filterDelay.bindAsEventListener(this);
		this.keyHandler =			this.keyTest.bindAsEventListener(this);
		this.searchFunction =		this.filter.bind(this);
		
		this.titleElement.innerHTML = this.channel.name;
		
		this.updateList(true);
		this.controller.setupWidget
		(
			'userList',
			{
				itemTemplate: "channel-users/user-row",
				swipeToDelete: false,
				reorderable: false,
				renderLimit: 50
			},
			this.listModel
		);
		
		Mojo.Event.listen(this.userListElement, Mojo.Event.listTap, this.listTapHandler);
		
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
	catch (e) 
	{
		Mojo.Log.logException(e, 'channel-users#setup');
	}
}

ChannelUsersAssistant.prototype.updateList = function(skipUpdate)
{
	try
	{
		this.nicks = [];
		this.nicks = this.channel.getListNicks();
		
		this.nicks.sort(function(a, b)
		{
			var toReturn = 0;
			
			toReturn = ircNick.getModeNum(a.mode) - ircNick.getModeNum(b.mode);
			
			if (toReturn == 0)
			{	// if mode is the same, sort by date
				aName = a.name.toLowerCase();
				bName = b.name.toLowerCase();
				toReturn = ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
			}
			
			return toReturn
		});
		
		this.filter(skipUpdate);
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'channel-users#updateList');
	}
}

ChannelUsersAssistant.prototype.keyTest = function(event)
{
	if (Mojo.Char.isValidWrittenChar(event.originalEvent.charCode)) 
	{
		Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keypress, this.keyHandler);
		this.headerElement.style.display = 'none';
		this.searchElement.style.display = 'inline';
		this.searchElement.mojo.focus();
	}
}
ChannelUsersAssistant.prototype.filterDelay = function(event)
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
ChannelUsersAssistant.prototype.filter = function(skipUpdate)
{
	this.listModel.items = [];
	
	for (var n = 0; n < this.nicks.length; n++) 
	{
		var pushIt = false;
		
		if (this.searchText == '') 
		{
			this.nicks[n].displayName = this.nicks[n].name;
			pushIt = true;
		}
		else if (this.nicks[n].name.toLowerCase().include(this.searchText.toLowerCase())) 
		{
			this.nicks[n].displayName = this.nicks[n].name.replace(new RegExp('(' + this.searchText + ')', 'gi'), '<span class="highlight">$1</span>');
			pushIt = true;
		}
		
		if (pushIt) 
		{
			this.listModel.items.push(this.nicks[n]);
		}
	}
	
	if (!skipUpdate) 
	{
		this.userListElement.mojo.noticeUpdatedItems(0, this.listModel.items);
	 	this.userListElement.mojo.setLength(this.listModel.items.length);
		if (this.searching) 
		{
			this.userListElement.mojo.revealItem(0, true);
			this.searching = false;
		}
		
		this.searchSpinnerElement.mojo.stop();
	}
	
}

ChannelUsersAssistant.prototype.listTap = function(event)
{
	event.stop();
	/*
	this.controller.showDialog(
	{
		template: 'dialog/user-dialog',
		assistant: new UserActionDialog(this, event.item)
	});
	*/
	var nick = this.channel.server.getNick(event.item.name);
	
	var popupList = [];
	popupList.push({label: event.item.name});
	popupList.push({label: 'Private Message',	 command: 'pm'});
	popupList.push({label: 'Whois',				 command: 'whois'});
	popupList.push({label: 'Invite',			 command: 'invite', disabled: true});
	
	var operatorList = [];
	operatorList.push({label: (nick.hasMode('o', this.channel)?'DeOp':'Op'),		 command: 'op'});
	operatorList.push({label: (nick.hasMode('h', this.channel)?'DeHalfOp':'HalfOp'), command: 'half'});
	operatorList.push({label: (nick.hasMode('v', this.channel)?'DeVoice':'Voice'),	 command: 'voice'});
	operatorList.push({label: 'Kick',	 command: 'kick'});
	operatorList.push({label: 'Ban',	 command: 'ban', disabled: true});
	popupList.push({label: 'Operator Actions', items: operatorList});
	
	var ctcpList = [];
	ctcpList.push({label: 'PING',		command: 'ctcp-ping'});
	ctcpList.push({label: 'FINGER',		command: 'ctcp-finger'});
	ctcpList.push({label: 'VERSION',	command: 'ctcp-version'});
	ctcpList.push({label: 'SOURCE',		command: 'ctcp-source'});
	ctcpList.push({label: 'USERINFO',	command: 'ctcp-userinfo'});
	ctcpList.push({label: 'TIME',		command: 'ctcp-time'});
	popupList.push({label: 'CTCP Actions', items: ctcpList});
	
	
	this.controller.popupSubmenu(
	{
		onChoose: this.listTapListHandler.bindAsEventListener(this, event.item, nick),
		popupClass: 'group-popup',
		placeNear: event.originalEvent.target,
		items: popupList
	});
}
ChannelUsersAssistant.prototype.listTapListHandler = function(choice, item, nick)
{
	switch(choice)
	{
		case 'pm':
			var tmpQuery = this.channel.server.getQuery(this.channel.server.getNick(item.name));
			if (tmpQuery)
			{
				tmpQuery.openStage();
			}
			else
			{
				this.channel.server.newQuery(item.name);
			}
			break;
		case 'whois':
			this.channel.server.whois(item.name);
			break;
			
		case 'op':
			this.channel.newCommand('/mode ' + this.channel.name + ' ' + (nick.hasMode('o', this.channel)?'-':'+') + 'o ' + item.name);
			break;
		case 'half':
			this.channel.newCommand('/mode ' + this.channel.name + ' ' + (nick.hasMode('h', this.channel)?'-':'+') + 'h ' + item.name);
			break;
		case 'voice':
			this.channel.newCommand('/mode ' + this.channel.name + ' ' + (nick.hasMode('v', this.channel)?'-':'+') + 'v ' + item.name);
			break;
		case 'kick':
			SingleLineCommandDialog.pop
			(
				this.sceneAssistant,
				{
					command:		'kick ' + item.name,
					onSubmit:		this.channel.newCommand.bind(this.channel),
					dialogTitle:	'Kick ' + item.name,
					textLabel:		'Reason',
					textDefault:	prefs.get().kickReason,
					okText:			'Kick'
				}
			);
			break;
		
		case 'ctcp-ping':
			this.channel.server.newCommand('/ctcp ' + item.name + ' PING');
			break;
		case 'ctcp-finger':
			this.channel.server.newCommand('/ctcp ' + item.name + ' FINGER');
			break;
		case 'ctcp-version':
			this.channel.server.newCommand('/ctcp ' + item.name + ' VERSION');
			break;
		case 'ctcp-source':
			this.channel.server.newCommand('/ctcp ' + item.name + ' SOURCE');
			break;
		case 'ctcp-userinfo':
			this.channel.server.newCommand('/ctcp ' + item.name + ' USERINFO');
			break;
		case 'ctcp-time':
			this.channel.server.newCommand('/ctcp ' + item.name + ' TIME');
			break;
	}
}

ChannelUsersAssistant.prototype.handleCommand = function(event)
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

ChannelUsersAssistant.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.userListElement, Mojo.Event.listTap, this.listTapHandler);
	Mojo.Event.stopListening(this.searchElement, Mojo.Event.propertyChange, this.filterDelayHandler);
	Mojo.Event.stopListening(this.controller.sceneElement, Mojo.Event.keypress, this.keyHandler);
}

