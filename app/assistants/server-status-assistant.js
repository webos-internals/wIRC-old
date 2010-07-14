function ServerStatusAssistant(server, popped)
{
	this.server = server;
	this.popped = popped;
	
	this.sceneScroller =			false;
	this.titleElement =				false;
	this.popButtonElement =			false;
	this.messageListElement =		false;
	this.inputContainerElement =	false;
	this.inputWidgetElement =		false;
	this.inputElement =				false;
	this.sendButtonElement =		false;
	
	this.action = 					false;
	
	this.autoScroll =				true;
    this.isVisible =				false;
    
    this.timestamp = 0;
    this.timestamp_s = "";
	
	this.listModel =
	{
		items: []
	};
	this.inputModel =
	{
		value:''
	};
	
	// setup menu
	this.menuModel =
	{
		visible: true,
		items: []
	}
}

ServerStatusAssistant.prototype.setup = function()
{
	try
	{
		// set theme
		this.controller.document.body.className = prefs.get().theme;
		
		this.updateAppMenu(true);
        this.controller.setupWidget(Mojo.Menu.appMenu, {
            omitDefaultItems: true
        }, this.menuModel);
		
        this.documentElement = this.controller.stageController.document;
		this.sceneScroller =			this.controller.sceneScroller;
		this.titleElement =				this.controller.get('title');
		this.networkLagElement =		this.controller.get('networkLag');
		this.popButtonElement =			this.controller.get('popButton');
		this.connectButtonElement =		this.controller.get('connectButton');
		this.messageListElement =		this.controller.get('messageList');
		this.inputContainerElement =	this.controller.get('inputFooter');
		this.inputWidgetElement =		this.controller.get('inputWidget');
		this.sendButtonElement =		this.controller.get('sendButton');
		
		this.scrollHandler =			this.onScrollStarted.bindAsEventListener(this);
		this.popButtonPressed =			this.popButtonPressed.bindAsEventListener(this);
        this.visibleWindowHandler =		this.visibleWindow.bindAsEventListener(this);
        this.invisibleWindowHandler =	this.invisibleWindow.bindAsEventListener(this);
		this.inputChanged =				this.inputChanged.bindAsEventListener(this);
		this.inputElementLoseFocus =	this.inputFocus.bind(this);
		this.sendButtonPressed =		this.sendButtonPressed.bindAsEventListener(this);
		this.messageTapHandler = 		this.messageTap.bindAsEventListener(this);
		this.keyHandler = 				this.keyHandler.bindAsEventListener(this);
		
        Mojo.Event.listen(this.documentElement, Mojo.Event.stageActivate, this.visibleWindowHandler);
        Mojo.Event.listen(this.documentElement, Mojo.Event.stageDeactivate, this.invisibleWindowHandler);
   		this.isVisible = true;
		
		Mojo.Event.listen(this.inputWidgetElement, 'keydown', this.keyHandler);
        Mojo.Event.listen(this.inputWidgetElement, 'keyup', this.keyHandler);

		Mojo.Event.listen(this.sceneScroller, Mojo.Event.scrollStarting, this.scrollHandler);
		
		this.titleElement.update((this.server.alias?this.server.alias:this.server.address) + ': Server Messages');
		this.loadPrefs(true);
		
		if (this.popped)	this.popButtonElement.style.display = 'none';
		else				Mojo.Event.listen(this.popButtonElement, Mojo.Event.tap, this.popButtonPressed);
		
		this.controller.setupWidget
		(
			'connectButton', 
			{},
			{
				buttonLabel: 'Connect',
				buttonClass: 'affirmative',
			}
		);
		Mojo.Event.listen(this.connectButtonElement, Mojo.Event.tap, this.connectButtonPressed.bindAsEventListener(this));
		if (this.server.state > 0 || this.server.statusMessages.length > 0)
		{
			this.connectButtonElement.hide();
		}
		
		this.updateList(true);
		this.controller.setupWidget
		(
			'messageList', 
			{
				itemTemplate: "message/message-row",
				swipeToDelete: false,
				reorderable: false,
				renderLimit: 50,
				dividerTemplate: "message/date-divider",
				dividerFunction: this.getDivider.bind(this)
			},
			this.listModel
		);
		this.revealBottom();
		Mojo.Event.listen(this.messageListElement, Mojo.Event.listTap, this.messageTapHandler);
		
		this.controller.setupWidget
		(
			'inputWidget',
			{
				modelProperty: 'value',
				//hintText: $L('Message...'),
				inputName: 'inputElement',
				focus: false,
				multiline: true,
				enterSubmits: true,
				changeOnKeyPress: true,
				autoReplace: prefs.get().autoReplace,
				textCase: (prefs.get().autoCap ? Mojo.Widget.steModeSentenceCase : Mojo.Widget.steModeLowerCase)
			},
			this.inputModel
		);
		Mojo.Event.listen(this.inputWidgetElement, Mojo.Event.propertyChange, this.inputChanged);
		
		this.sendButtonElement.style.display = 'none';
		Mojo.Event.listen(this.sendButtonElement, Mojo.Event.tap, this.sendButtonPressed);
	} 
	catch (e) 
	{
		Mojo.Log.logException(e, 'server-status#setup');
	}
}

ServerStatusAssistant.prototype.loadPrefs = function(initial)
{
	this.messageListElement.className = prefs.get().messagesStyle + ' fixed-' + prefs.get().messageSplit + ' font-' + prefs.get().fontSize + (prefs.get().timeStamp == 0 ? ' hide-divider' : '');
}
ServerStatusAssistant.prototype.activate = function(event)
{
	this.updateLagMeter();
	this.updateAppMenu(false);
	this.loadPrefs();
	if (this.alreadyActivated)
	{
		this.loadPrefs();
		this.updateList();
	}
	else
	{
		this.server.setStatusAssistant(this);
		this.inputElement = this.inputWidgetElement.querySelector('[name=inputElement]');
		this.startAutoFocus();
	}
	this.alreadyActivated = true;
	this.revealBottom();
	
	//this.server.newMessage('status', false, 'TEST');
}

ServerStatusAssistant.prototype.keyHandler = function(event){
	
    var isActionKey = (event.keyCode === Mojo.Char.metaKey);
	var isCmdUp = (event.keyCode === Mojo.Char.q);
	var isCmdDown = (event.keyCode === Mojo.Char.a);
    
    if (event.type === 'keydown' && isActionKey) {
        this.action = true;
    }
    else if (event.type === 'keyup' && isActionKey) {
		this.action = false;
	}
    
	if (this.action && event.type == 'keyup' && cmdHistory.length>0) {
		if (isCmdUp && cmdHistoryIndex<cmdHistory.length) cmdHistoryIndex++;
		else if (isCmdDown && cmdHistoryIndex > 0) cmdHistoryIndex--;
		if (cmdHistoryIndex==0)
			this.inputWidgetElement.mojo.setValue('');
		else
			this.inputWidgetElement.mojo.setValue(cmdHistory[cmdHistory.length-cmdHistoryIndex]);
	}
	
}

ServerStatusAssistant.prototype.updateList = function(initial)
{
	try
	{
		if (initial) 
		{
			var newMessages = this.server.getStatusMessages(0);
			if (newMessages.length > 0)
			{
				for (var m = 0; m < newMessages.length; m++) 
				{
					this.listModel.items.push(newMessages[m]);	
				}
			}
		}
		else
		{
			var start = this.messageListElement.mojo.getLength();
			var newMessages = this.server.getStatusMessages(start);
			if (newMessages.length > 0)
			{
				for (var m = 0; m < newMessages.length; m++) 
				{
					this.listModel.items.push(newMessages[m]);	
				}
			}
			this.messageListElement.mojo.noticeUpdatedItems(start, newMessages);
			this.messageListElement.mojo.setLength(start + newMessages.length);
			this.revealBottom();
		}
		
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'server-status#updateList');
	}
}
ServerStatusAssistant.prototype.getDivider = function(item)
{
	var timestamp = Math.round(item.date.getTime() / 1000.0);
    if (timestamp - this.timestamp > prefs.get().timeStamp * 60) {
        this.timestamp = timestamp;
        this.timestamp_s = Mojo.Format.formatDate(item.date, {
            time: prefs.get().timeStampStyle
        });
    }
    
    return this.timestamp_s;
}

ServerStatusAssistant.prototype.startAutoFocus = function()
{
	Mojo.Event.listen(this.inputElement, 'blur', this.inputElementLoseFocus);
	this.inputWidgetElement.mojo.focus();
}
ServerStatusAssistant.prototype.stopAutoFocus = function()
{
	Mojo.Event.stopListening(this.inputElement, 'blur', this.inputElementLoseFocus);
}

ServerStatusAssistant.prototype.onScrollStarted = function(event)
{
	event.addListener(this);
}
ServerStatusAssistant.prototype.moved = function(stopped, position)
{
	if (this.sceneScroller.scrollHeight - this.sceneScroller.scrollTop > this.sceneScroller.clientHeight) 
	{
		this.autoScroll = false;
	}
	else
	{
		this.autoScroll = true;
	}
}
ServerStatusAssistant.prototype.revealBottom = function()
{
	if (this.autoScroll) 
	{
		var height = this.inputContainerElement.clientHeight;
		this.messageListElement.style.paddingBottom = height + 'px';
		
		// palm does this twice in the messaging app to make sure it always reveals the very very bottom
		this.sceneScroller.mojo.revealBottom();
		this.sceneScroller.mojo.revealBottom();
	}
}

ServerStatusAssistant.prototype.messageTap = function(event)
{
	if (event.item)
	{
		var popupList = [];
		popupList.push({label: 'Message'});
		popupList.push({label: 'Copy',	 command: 'copy'});
		
		this.controller.popupSubmenu(
		{
			onChoose: this.messageTapListHandler.bindAsEventListener(this, event.item),
			popupClass: 'group-popup',
			placeNear: event.originalEvent.target,
			items: popupList
		});
	}
}
ServerStatusAssistant.prototype.messageTapListHandler = function(choice, item)
{
	switch(choice)
	{
		case 'copy':
			this.stopAutoFocus();
			this.controller.stageController.setClipboard(item.copyText);
			this.startAutoFocus();
			break;
	}
}

ServerStatusAssistant.prototype.connectButtonPressed = function(event)
{
	this.server.init();
	this.connectButtonElement.hide();
}

ServerStatusAssistant.prototype.popButtonPressed = function(event)
{
	this.server.showStatusScene(true);
}
ServerStatusAssistant.prototype.sendButtonPressed = function(event)
{
	this.server.newCommand(this.inputModel.value);
	this.inputWidgetElement.mojo.setValue('');
	
	// this probably isn't needed
	this.updateList();
}
ServerStatusAssistant.prototype.inputChanged = function(event)
{
	this.revealBottom();
	
	if (event.originalEvent && Mojo.Char.isEnterKey(event.originalEvent.keyCode) &&
		event.value != '') 
	{
		this.sendButtonPressed();
	}
	else
	{
		if (event.value == '') 
		{
			this.sendButtonElement.style.display = 'none';
		}
		else 
		{
			this.sendButtonElement.style.display = '';
		}
	}
}
ServerStatusAssistant.prototype.inputFocus = function(event)
{
	if (this.inputElement)
	{
		this.inputElement.focus();
	}
}

ServerStatusAssistant.prototype.updateLagMeter = function()
{
	var netClass = '';
	if (prefs.get().lagMeter)
	{
		if (this.server.isConnected())
		{
			if (this.server.sessionInterface == 'wan')
				netClass = 'network ' + this.server.sessionNetwork + ' ' + this.server.lag;
			else
				netClass = 'network wifi ' + this.server.lag;
		}
	}
	this.networkLagElement.className = netClass;
}

ServerStatusAssistant.prototype.alertDialog = function(message)
{
	this.controller.showAlertDialog(
	{
	    title:				this.server.alias,
		allowHTMLMessage:	true,
	    message:			message,
	    choices:			[{label:$L('Ok'), value:''}],
		onChoose:			function(value){}
    });
}

ServerStatusAssistant.prototype.updateAppMenu = function(skipUpdate){
	
	try {
	
		this.menuModel.items = [Mojo.Menu.editItem];
		
		var serverItems = [];
		var channelItems = [];
		
		// Server menu options
		serverItems.push({
			label: 'Join Channel',
			command: 'do-join-channel'
		});
		
		serverItems.push({
			label: 'Channel List',
			command: 'do-channel-list'
		});
		
		var favorites = [];
    	if (this.server.favoriteChannels && this.server.favoriteChannels.length > 0) {
        	for (var c = 0; c < this.server.favoriteChannels.length; c++) {
	            favorites.push({
    	            label: ' ' + this.server.favoriteChannels[c],
        	        command: 'join-' + this.server.favoriteChannels[c]
	            });
        	}
    	}
    	serverItems.push({
	        label: "Favorite Channels",
        	items: favorites
    	});
		
		if (this.server.isAway) {
			serverItems.push({
				label: "Back",
				command: 'do-away'
			});
		}
		else {
			serverItems.push({
				label: "Away",
				command: 'do-away'
			});
		}
		
		serverItems.push({
			label: 'Change Nick',
			command: 'do-change-nick'
		});
		
		serverItems.push({
			label: "DCC List",
			command: 'do-dcc-list'
		});
		
		if (!this.server.isTemporary) {
			serverItems.push({
				label: "Settings",
				command: 'do-server-prefs'
			});
		}
		
		serverItems.push({
			label: 'Clear Backlog',
			command: 'do-clear-backlog'
		});
		
		this.menuModel.items.push({
			label: (this.server.alias?this.server.alias:this.server.address),
			items: serverItems
		});
		
		
		
		// Global menu options
		this.menuModel.items.push({
			label: "Preferences",
			command: 'do-prefs'
		});

		this.menuModel.items.push({
			label: "Help",
			command: 'do-help'
		});
		
		if (!skipUpdate) {
			this.controller.modelChanged(this.menuModel);
		}
		
	} catch (e) {
		Mojo.Log.info("#################################################");
		Mojo.Log.info(e);
		Mojo.Log.info("#################################################");
	}
	
}

ServerStatusAssistant.prototype.handleCommand = function(event)
{
	if (event.type == Mojo.Event.command)
	{
		if (event.command.substring(0, 3) == 'do-')
		{
			switch (event.command)
			{
				case 'do-prefs':
					this.controller.stageController.pushScene('preferences-general');
					break;
					
				case 'do-dcc-list':
					this.server.openDccList();
					break;
					
				case 'do-server-prefs':
					this.controller.stageController.pushScene('server-info', this.server.id);
					break;

                case 'do-away':
                    if (!this.server.isAway) {
                        SingleLineCommandDialog.pop(this, {
                            command: 'away',
                            onSubmit: this.newCommand.bind(this.server),
                            dialogTitle: 'Set Away Status',
                            textLabel: 'Reason',
                            onActivate: this.stopAutoFocus.bind(this),
                            onDeactivate: this.startAutoFocus.bind(this)
                        });
                    }
                    else {
                        this.newCommand('/away');
                    }
                    this.updateAppMenu();
                    break;
										
				case 'do-change-nick':
					if (this.server.isConnected()) 
					{
						SingleLineCommandDialog.pop
						(
							this,
							{
								command:		'nick',
								onSubmit:		this.server.newCommand.bind(this.server),
								dialogTitle:	'Change Nick',
								textLabel:		'Nick',
								textDefault:	this.server.nick.name,
								okText:			'change',
								onActivate:		this.stopAutoFocus.bind(this),
								onDeactivate:	this.startAutoFocus.bind(this)
							}
						);
					}
					else
					{
						this.alertDialog('You must be connected to change your nick.');
					}
					break;
					
				case 'do-channel-list':
					if (this.server.isConnected()) 
					{
						this.server.newCommand('/list');
					}
					else
					{
						this.alertDialog('You must be connected to get the channel list.');
					}
					break;
					
				case 'do-join-channel':
					if (this.server.isConnected()) 
					{
						SingleLineCommandDialog.pop
						(
							this,
							{
								command:		'join',
								onSubmit:		this.server.newCommand.bind(this.server),
								dialogTitle:	'Join Channel',
								textLabel:		'Channel',
								textDefault:	'#',
								okText:			'Join',
								onActivate:		this.stopAutoFocus.bind(this),
								onDeactivate:	this.startAutoFocus.bind(this)
							}
						);
					}
					else
					{
						this.alertDialog('You must be connected to join a channel.');
					}
					break;
					
				case 'do-clear-backlog':
					this.server.clearMessages();
					this.listModel.items = [];
					this.messageListElement.mojo.noticeUpdatedItems(0, this.listModel.items);
					this.messageListElement.mojo.setLength(0);
					break;

				case 'do-help':
					this.controller.stageController.pushScene('help');
					break;
			}
		}
		else if (event.command.substring(0,5) == 'join-')
		{
			this.server.joinChannel(event.command.substring(5), "");
		}
		
	}
}

ServerStatusAssistant.prototype.visibleWindow = function(event)
{
    if (!this.isVisible)
	{
        this.isVisible = true;
    }
    this.updateLagMeter();
	this.updateAppMenu();
}
ServerStatusAssistant.prototype.invisibleWindow = function(event)
{
    this.isVisible = false;
}

ServerStatusAssistant.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.sceneScroller,		Mojo.Event.scrollStarting,	this.scrollHandler);
    Mojo.Event.stopListening(this.documentElement, Mojo.Event.stageActivate, this.visibleWindowHandler);
    Mojo.Event.stopListening(this.documentElement, Mojo.Event.stageDeactivate, this.invisibleWindowHandler);
	if (!this.popped) 
	{
		Mojo.Event.stopListening(this.popButtonElement, Mojo.Event.tap, 			this.popButtonPressed);
	}
	Mojo.Event.stopListening(this.connectButtonElement, Mojo.Event.tap,				this.connectButtonPressed.bindAsEventListener(this));
	Mojo.Event.stopListening(this.inputWidgetElement,	Mojo.Event.propertyChange,	this.inputChanged);
	Mojo.Event.stopListening(this.inputElement,			'blur',						this.inputElementLoseFocus);
	Mojo.Event.stopListening(this.sendButtonElement,	Mojo.Event.tap, 			this.sendButtonPressed);
	Mojo.Event.stopListening(this.messageListElement, Mojo.Event.listTap, this.messageTapHandler);
}
