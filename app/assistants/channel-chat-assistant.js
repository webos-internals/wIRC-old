function ChannelChatAssistant(channel)
{
	this.channel = channel;
	
    this.nick = false;
    this.tabText = false;
    
    this.documentElement = false;
    this.sceneScroller = false;
    this.headerElement = false;
    this.titleElement = false;
    this.userButtonElement = false;
    this.userCountElement = false;
    this.topicContainerElement = false;
    this.topicElement = false;
    this.messageListElement = false;
    this.inputContainerElement = false;
    this.inputWidgetElement = false;
    this.inputElement = false;
    this.sendButtonElement = false;
    
    this.autoScroll = true;
    this.topicVisible = false;
    this.isVisible = false;
    this.lastFocusMarker = false;
    this.lastFocusMessage = false;
		this.copyStart = -1;
    
    this.timestamp = 0;
    this.timestamp_s = "";
    
    this.listModel = {
        items: []
    };
    this.inputModel = {
        value: ''
    };
    
    // setup menu
    this.menuModel = {
        visible: true,
        items: []
    }
}

ChannelChatAssistant.prototype.setup = function()
{
    try
	{

        // set theme
        this.controller.document.body.className = prefs.get().theme;
        
        this.updateAppMenu(true);
        this.controller.setupWidget(Mojo.Menu.appMenu,
		{
            omitDefaultItems: true
        }, this.menuModel);
        
        this.documentElement = this.controller.stageController.document;
        this.sceneScroller = this.controller.sceneScroller;
        this.headerElement = this.controller.get('header');
        this.titleElement = this.controller.get('title');
        this.networkLagElement = this.controller.get('networkLag');
        this.userButtonElement = this.controller.get('userButton');
        this.userCountElement = this.controller.get('userCount');
        this.topicContainerElement = this.controller.get('topicContainer');
        this.topicElement = this.controller.get('topic');
        this.messageListElement = this.controller.get('messageList');
        this.inputContainerElement = this.controller.get('inputFooter');
        this.inputWidgetElement = this.controller.get('inputWidget');
        this.sendButtonElement = this.controller.get('sendButton');
        
        this.scrollHandler = this.onScrollStarted.bindAsEventListener(this);
        this.visibleWindowHandler = this.visibleWindow.bindAsEventListener(this);
        this.invisibleWindowHandler = this.invisibleWindow.bindAsEventListener(this);
        this.dragStartHandler = this.dragStartHandler.bindAsEventListener(this);
        this.draggingHandler = this.draggingHandler.bindAsEventListener(this);
		this.messageTapHandler = this.messageTap.bindAsEventListener(this);
        this.keyHandler = this.keyHandler.bindAsEventListener(this);
        this.headerTapped = this.headerTap.bindAsEventListener(this);
        this.topicToggled = this.topicToggle.bindAsEventListener(this);
        this.userButtonPressed = this.userButtonPressed.bindAsEventListener(this);
        this.inputChanged = this.inputChanged.bindAsEventListener(this);
        this.inputElementLoseFocus = this.inputFocus.bind(this);
        this.sendButtonPressed = this.sendButtonPressed.bindAsEventListener(this);
        
        Mojo.Event.listen(this.sceneScroller, Mojo.Event.scrollStarting, this.scrollHandler);
        Mojo.Event.listen(this.documentElement, Mojo.Event.stageActivate, this.visibleWindowHandler);
        Mojo.Event.listen(this.documentElement, Mojo.Event.stageDeactivate, this.invisibleWindowHandler);
        Mojo.Event.listen(this.messageListElement, Mojo.Event.dragStart, this.dragStartHandler);
        Mojo.Event.listen(this.messageListElement, Mojo.Event.dragging, this.draggingHandler);
        Mojo.Event.listen(this.inputWidgetElement, 'keydown', this.keyHandler);
        Mojo.Event.listen(this.inputWidgetElement, 'keyup', this.keyHandler);
        this.isVisible = true;
        
        Mojo.Event.listen(this.headerElement, Mojo.Event.tap, this.headerTapped);
        this.updateUserCount();
        this.updateTitle();
        this.updateTopic();
        this.loadPrefs(true);
        
        Mojo.Event.listen(this.userButtonElement, Mojo.Event.tap, this.userButtonPressed);
        
        this.updateList(true);
        this.controller.setupWidget('messageList', {
            itemTemplate: "message/message-row",
            swipeToDelete: false,
            reorderable: false,
            renderLimit: 50,
            dividerTemplate: "message/date-divider",
            dividerFunction: this.getDivider.bind(this)
        }, this.listModel);
        this.revealBottom();
		Mojo.Event.listen(this.messageListElement, Mojo.Event.listTap, this.messageTapHandler);
		
        
        this.controller.setupWidget('inputWidget', {
            modelProperty: 'value',
            //hintText: $L('Message...'),
            inputName: 'inputElement',
            focus: false,
            multiline: true,
            enterSubmits: true,
            changeOnKeyPress: true,
            autoReplace: prefs.get().autoReplace,
            textCase: (prefs.get().autoCap ? Mojo.Widget.steModeSentenceCase : Mojo.Widget.steModeLowerCase)
        }, this.inputModel);
        Mojo.Event.listen(this.inputWidgetElement, Mojo.Event.propertyChange, this.inputChanged);
        
        this.sendButtonElement.style.display = 'none';
        Mojo.Event.listen(this.sendButtonElement, Mojo.Event.tap, this.sendButtonPressed);
    } 
    catch (e) {
        Mojo.Log.logException(e, 'channel-chat#setup');
    }
}

ChannelChatAssistant.prototype.loadPrefs = function(initial){
    this.messageSplit = parseInt(prefs.get().messageSplit);
    this.messagesStyle = prefs.get().messagesStyle;
    this.fontSize = prefs.get().fontSize;
    this.messageListElement.className = prefs.get().messagesStyle + ' fixed-' + prefs.get().messageSplit + ' font-' + prefs.get().fontSize + (prefs.get().timeStamp == 0 ? ' hide-divider' : '');
}
ChannelChatAssistant.prototype.activate = function(event){
	try{
		this.controller.stageController.setWindowProperties({blockScreenTimeout: prefs.get().blockScreenTimeout});
	    this.updateLagMeter();
		this.updateAppMenu(false);
	    this.loadPrefs();
	    if (this.alreadyActivated) {
	        this.updateList();
	    }
	    else {
			this.channel.setChatAssistant(this);
	        this.inputElement = this.inputWidgetElement.querySelector('[name=inputElement]');
	        Mojo.Event.listen(this.inputElement, 'blur', this.inputElementLoseFocus);
	    }
	    this.alreadyActivated = true;
	    this.revealBottom();
	    this.inputWidgetElement.mojo.focus();
	}catch(e)
	{
		Mojo.Log.logException(e, 'channel-chat#activate');
	}

}
ChannelChatAssistant.prototype.updateList = function(initial){
    try {
        if (initial) {
            var newMessages = this.channel.getMessages(0);
            if (newMessages.length > 0) {
                for (var m = 0; m < newMessages.length; m++) {
                    this.listModel.items.push(newMessages[m]);
                }
            }
        }
        else {
            if (!this.isVisible && this.lastFocusMessage && !this.lastFocusMessage.hasClassName('lostFocus')) {
                if (this.lastFocusMarker && this.lastFocusMarker.hasClassName('lostFocus')) {
                    this.lastFocusMarker.removeClassName('lostFocus');
                    this.lastFocusMarker = false;
                }
                this.lastFocusMessage.addClassName('lostFocus');
                this.lastFocusMessage.style.borderBottomColor = prefs.get().colorMarker[(prefs.get().theme == 'palm-default'?0:1)];
            }
            
            var start = this.messageListElement.mojo.getLength();
            var newMessages = this.channel.getMessages(start);
            if (newMessages.length > 0) {
                for (var m = 0; m < newMessages.length; m++) {
                    this.listModel.items.push(newMessages[m]);
                }
            }
            this.messageListElement.mojo.noticeUpdatedItems(start, newMessages);
            this.messageListElement.mojo.setLength(start + newMessages.length);
            this.revealBottom();
        }
        
    } 
    catch (e) {
        Mojo.Log.logException(e, 'channel-chat#updateList');
    }
}
ChannelChatAssistant.prototype.getDivider = function(item){
    var timestamp = Math.round(item.date.getTime() / 1000.0);
    if (timestamp - this.timestamp > prefs.get().timeStamp * 60) {
        this.timestamp = timestamp;
        this.timestamp_s = Mojo.Format.formatDate(item.date, {
            time: prefs.get().timeStampStyle
        });
    }
    
    return this.timestamp_s;
}

ChannelChatAssistant.prototype.updateUserCount = function()
{
	if (this.channel.nicks)
	{
    	this.userCountElement.update(this.channel.nicks.length);
	}
}
ChannelChatAssistant.prototype.updateTitle = function(){
    this.titleElement.update(this.channel.name + (this.channel.mode ? ' (' + this.channel.mode + ')' : ''));
}
ChannelChatAssistant.prototype.updateTopic = function(){
    var tmpTopic = colorize(formatLinks(formatForHtml(this.channel.topic)));
    this.topicElement.update(tmpTopic);
}

ChannelChatAssistant.prototype.onScrollStarted = function(event){
    event.addListener(this);
}
ChannelChatAssistant.prototype.moved = function(stopped, position){
    if (this.sceneScroller.scrollHeight - this.sceneScroller.scrollTop > this.sceneScroller.clientHeight) {
        this.autoScroll = false;
    }
    else {
        this.autoScroll = true;
    }
}
ChannelChatAssistant.prototype.revealBottom = function(){
    if (this.autoScroll) {
        var height = this.inputContainerElement.clientHeight;
        this.messageListElement.style.paddingBottom = height + 'px';
        
        // palm does this twice in the messaging app to make sure it always reveals the very very bottom
        this.sceneScroller.mojo.revealBottom();
        this.sceneScroller.mojo.revealBottom();
    }
}

ChannelChatAssistant.prototype.headerTap = function(event){
    if (event.target.id == 'header' || event.target.id == 'title') // we don't want to toggle topic if the header is not tapped right on
    {
        if (this.topicVisible) {
            var from = 0;
            var to = 0 - this.topicContainerElement.getHeight();
        }
        else {
            var from = 0 - this.topicContainerElement.getHeight();
            var to = 0;
        }
        
        Mojo.Animation.animateStyle(this.topicContainerElement, 'top', 'zeno', // linear/bezier/zeno
        {
            from: from,
            to: to,
            duration: 0.5,
            onComplete: this.topicToggled
        });
    }
}
ChannelChatAssistant.prototype.topicToggle = function(){
    this.topicVisible = !this.topicVisible;
}

ChannelChatAssistant.prototype.messageTap = function(event)
{
	if (event.item)
	{
		var popupList = [];
		if (event.item.nickCommands)
		{
			popupList.push({label: event.item.nick});
			popupList.push({label: 'Private Message',	 command: 'pm'});
			popupList.push({label: 'Whois',				 command: 'whois'});
		}
		
		popupList.push({label: 'Message'});
		if (this.copyStart > -1)
		{
			popupList.push({label: 'Copy',				command: 'copy'});
			if (this.copyStart == event.index)
			{
				this.copyStart = -1;
				popupList.push({label: 'Copy From Here',	command: 'copy-from'});
			}
			else
			{
				popupList.push({label: '... To Here',		command: 'copy-to'});
			}
		}
		else
		{
			popupList.push({label: 'Copy',				command: 'copy'});
			popupList.push({label: 'Copy From Here',	command: 'copy-from'});
		}
		
		this.controller.popupSubmenu(
		{
			onChoose: this.messageTapListHandler.bindAsEventListener(this, event.item, event.index),
			popupClass: 'group-popup',
			placeNear: event.originalEvent.target,
			items: popupList
		});
	}
}
ChannelChatAssistant.prototype.messageTapListHandler = function(choice, item, index)
{
	switch(choice)
	{
		case 'pm':
			var tmpQuery = this.channel.server.getQuery(this.channel.server.getNick(item.nick));
			if (tmpQuery)
			{
				tmpQuery.openStage();
			}
			else
			{
				this.channel.server.newQuery(item.nick);
			}
			
			if (this.copyStart > -1)
			{
				this.messageListElement.mojo.getNodeByIndex(this.copyStart).removeClassName('selected');
				this.copyStart = -1;
			}
			break;
		case 'whois':
			this.channel.server.whois(item.nick);
			
			if (this.copyStart > -1)
			{
				this.messageListElement.mojo.getNodeByIndex(this.copyStart).removeClassName('selected');
				this.copyStart = -1;
			}
			break;
			
		case 'copy':
			this.stopAutoFocus();
			this.controller.stageController.setClipboard(item.copyText);
			this.startAutoFocus();
			
			if (this.copyStart > -1)
			{
				this.messageListElement.mojo.getNodeByIndex(this.copyStart).removeClassName('selected');
				this.copyStart = -1;
			}
			break;
			
		case 'copy-from':
			this.copyStart = index;
			this.messageListElement.mojo.getNodeByIndex(this.copyStart).addClassName('selected');
			break;
			
		case 'copy-to':
			if (this.listModel.items.length > 0)
			{
				var message = '';
				
				var start = (this.copyStart > index ? index : this.copyStart);
				var end   = (this.copyStart < index ? index : this.copyStart);
				
				for (var i = start; i <= end; i++)
				{
					if (message != '') message += '\n';
					message += this.listModel.items[i].copyText;
				}
				if (message != '')
				{
					this.stopAutoFocus();
					this.controller.stageController.setClipboard(message);
					this.startAutoFocus();
				}
			}
			this.messageListElement.mojo.getNodeByIndex(this.copyStart).removeClassName('selected');
			this.copyStart = -1;
			break;
	}
}

ChannelChatAssistant.prototype.userButtonPressed = function(event){
    this.controller.stageController.pushScene('channel-users', this.channel);
}
ChannelChatAssistant.prototype.sendButtonPressed = function(event){
    this.channel.newCommand(this.inputModel.value);
    this.inputWidgetElement.mojo.setValue('');
    
    // this probably isn't needed
    //this.updateList();
}
ChannelChatAssistant.prototype.inputChanged = function(event){
    this.revealBottom();
    
    if (event.originalEvent && Mojo.Char.isEnterKey(event.originalEvent.keyCode) &&
    event.value != '') {
        this.sendButtonPressed();
    }
    else {
        if (event.value == '') {
            this.sendButtonElement.style.display = 'none';
        }
        else {
            this.sendButtonElement.style.display = '';
        }
    }
}
ChannelChatAssistant.prototype.inputFocus = function(event){
    if (this.inputElement) {
        this.inputElement.focus();
    }
}

ChannelChatAssistant.prototype.updateLagMeter = function(){
    var netClass = '';
    if (prefs.get().lagMeter) {
        if (this.channel.server.isConnected()) {
            if (this.channel.server.sessionInterface == 'wan') 
                netClass = 'network ' + this.channel.server.sessionNetwork + ' ' + this.channel.server.lag;
            else 
                netClass = 'network wifi ' + this.channel.server.lag;
        }
    }
    this.networkLagElement.className = netClass;
}

ChannelChatAssistant.prototype.keyHandler = function(event)
{
    var isTabKey = (event.altKey);
	var isCmdUp = (event.keyCode === Mojo.Char.q);
	var isCmdDown = (event.keyCode === Mojo.Char.a);
	
	if (event.metaKey) {
		if (event.type === 'keyup') {
			if (isCmdDown || isCmdUp) {
				if (isCmdUp && cmdHistoryIndex<cmdHistory.length) 
					cmdHistoryIndex++;
				else 
					if (isCmdDown && cmdHistoryIndex > 0) 
						cmdHistoryIndex--;
				if (cmdHistoryIndex == 0) 
					this.inputWidgetElement.mojo.setValue('');
				else 
					this.inputWidgetElement.mojo.setValue(cmdHistory[cmdHistory.length-cmdHistoryIndex]);
			} 
			else if (isTabKey) {
				if (!this.tabText) {
					var tmpText = event.target.value.match(/^(.*)[\s]{1}(.*)$/);
					this.tabText = event.target.value;
					if (tmpText) {
						this.text = tmpText[1];
						this.tabText = tmpText[2];
					}
				}
				this.nick = this.channel.tabNick(this.tabText, this.nick);
				if (this.nick) {
					if (this.text) 
						event.target.mojo.setText(this.text + " " + this.nick.name + " ");
					else 
						event.target.mojo.setText(this.nick.name + prefs.get().tabSuffix + " ");
				}
			}
		}
		
	}
	else
	{
		this.tabText = false;
    	this.text = false;
    	this.nick = false;
	}
	
}

ChannelChatAssistant.prototype.startAutoFocus = function(){
    Mojo.Event.listen(this.inputElement, 'blur', this.inputElementLoseFocus);
    this.inputWidgetElement.mojo.focus();
}
ChannelChatAssistant.prototype.stopAutoFocus = function(){
    Mojo.Event.stopListening(this.inputElement, 'blur', this.inputElementLoseFocus);
}

ChannelChatAssistant.prototype.updateAppMenu = function(skipUpdate){
    this.menuModel.items = [Mojo.Menu.editItem];
    
    var serverItems = [];
    var channelItems = [];
	
	
    // Server menu options
	var favorites = [];
    if (this.channel.server.favoriteChannels && this.channel.server.favoriteChannels.length > 0) {
        for (var c = 0; c < this.channel.server.favoriteChannels.length; c++) {
            favorites.push({
                label: ' ' + this.channel.server.favoriteChannels[c],
                command: 'join-' + this.channel.server.favoriteChannels[c]
            });
        }
    }
	if (favorites.length > 0) {
    	serverItems.push({
	        label: "Favorite Channels",
        	items: favorites
    	});
	}
    if (this.channel.server.isAway) {
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
		label: "DCC List",
		command: 'do-dcc-list'
	});
	if (!this.channel.server.isTemporary) {
		serverItems.push({
			label: "Settings",
			command: 'do-server-prefs'
		});
	}
    
    // Channel menu options
	if (!this.channel.isFav())
	{
	    channelItems.push({
	        label: "Add To Favorites",
	        command: 'do-add-fav'
	    });
	}
	else
	{
	    channelItems.push({
	        label: "Delete From Favorites",
	        command: 'do-del-fav'
	    });
	}
	
    channelItems.push({
        label: "Clear Backlog",
        command: 'do-clear-backlog'
    });
    
	
    this.menuModel.items.push({
        label: this.channel.name,
        items: channelItems
    });
    this.menuModel.items.push({
        label: (this.channel.server.alias?this.channel.server.alias:this.channel.server.address),
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
	})
    
    if (!skipUpdate) {
        this.controller.modelChanged(this.menuModel);
    }
}

ChannelChatAssistant.prototype.handleCommand = function(event){
	
    if (event.type == Mojo.Event.command) {
    
        if (event.command.substring(0,3) == 'do-') {
			
            switch (event.command) {
				case 'do-help':
                    this.controller.stageController.pushScene('help');
					break;
                case 'do-away':
                    if (!this.channel.server.isAway) {
                        SingleLineCommandDialog.pop(this, {
                            command: 'away',
                            onSubmit: this.channel.newCommand.bind(this.channel),
                            dialogTitle: 'Set Away Status',
                            textLabel: 'Reason',
                            onActivate: this.stopAutoFocus.bind(this),
                            onDeactivate: this.startAutoFocus.bind(this)
                        });
                    }
                    else {
                        this.channel.newCommand('/away');
                    }
                    this.updateAppMenu();
                    break;
                    
                case 'do-prefs':
                    this.controller.stageController.pushScene('preferences-general');
                    break;
                    
					
				case 'do-dcc-list':
					this.channel.server.openDccList();
					break;
					
				case 'do-server-prefs':
					this.controller.stageController.pushScene('server-info', this.channel.server.id);
					break;
					
                case 'do-add-fav':
					this.channel.addFav();
					this.updateAppMenu();
					break;
                case 'do-del-fav':
					this.channel.delFav();
					this.updateAppMenu();
					break;

                case 'do-clear-backlog':
                    this.channel.clearMessages();
                    this.listModel.items = [];
                    this.lastFocusMarker = false;
                    this.lastFocusMessage = false;
                    this.messageListElement.mojo.noticeUpdatedItems(0, this.listModel.items);
                    this.messageListElement.mojo.setLength(0);
                    break;
            }
            
        }
		else if (event.command.substring(0,5) == 'join-')
		{
			this.channel.server.joinChannel(event.command.substring(5), "");
		}
    }
	
}

ChannelChatAssistant.prototype.dragStartHandler = function(event){
    this.useScroll = false;
    this.lastY = event.move.y;
    this.lastX = event.move.x;
}
ChannelChatAssistant.prototype.draggingHandler = function(event){
    if (this.useScroll) {
        return;
    }
    if (Math.abs(event.move.y - this.lastY) > 15) {
        this.useScroll = true;
        return;
    }
    var difference = event.move.x - this.lastX;
    while (Math.abs(difference) >= 15) {
        if (difference > 0) {
            this.lastX = event.move.x;
            this.messageSplit = this.messageSplit + 5;
            difference = difference - 15;
        }
        else 
            if (difference < 0) {
                this.lastX = event.move.x;
                this.messageSplit = this.messageSplit - 5;
                difference = difference + 15;
            }
    }
    if (this.messageSplit < 15) {
        this.messageSplit = 15;
    }
    if (this.messageSplit > 50) {
        this.messageSplit = 50;
    }
    this.messageListElement.className = this.messagesStyle + ' fixed-' + this.messageSplit + ' font-' + this.fontSize + (prefs.get().timeStamp == 0 ? ' hide-divider' : '');
}
ChannelChatAssistant.prototype.visibleWindow = function(event){
	try
	{
		if (!this.isVisible)
		{
	        this.isVisible = true;
	    }
	    this.channel.closeDash();
	    this.updateLagMeter();
		this.updateAppMenu();
	}
	catch(e)
	{
			Mojo.Log.logException(e, 'channel-chat#visibleWindow');
	}

}
ChannelChatAssistant.prototype.invisibleWindow = function(event){
    this.isVisible = false;
    
    if (this.lastFocusMessage && this.lastFocusMessage.hasClassName('lostFocus')) {
        this.lastFocusMarker = this.lastFocusMessage;
    }
    this.lastFocusMessage = this.messageListElement.mojo.getNodeByIndex(this.messageListElement.mojo.getLength() - 1);
}

ChannelChatAssistant.prototype.cleanup = function(event)
{
	try
	{
	    Mojo.Event.stopListening(this.sceneScroller, Mojo.Event.scrollStarting, this.scrollHandler);
	    Mojo.Event.stopListening(this.documentElement, Mojo.Event.stageActivate, this.visibleWindowHandler);
	    Mojo.Event.stopListening(this.documentElement, Mojo.Event.stageDeactivate, this.invisibleWindowHandler);
	    Mojo.Event.stopListening(this.messageListElement, Mojo.Event.dragStart, this.dragStartHandler);
	    Mojo.Event.stopListening(this.messageListElement, Mojo.Event.dragging, this.draggingHandler);
	    Mojo.Event.stopListening(this.userButtonElement, Mojo.Event.tap, this.userButtonPressed);
	    Mojo.Event.stopListening(this.inputWidgetElement, Mojo.Event.propertyChange, this.inputChanged);
	    Mojo.Event.stopListening(this.inputElement, 'blur', this.inputElementLoseFocus);
		Mojo.Event.stopListening(this.messageListElement, Mojo.Event.listTap, this.messageTapHandler);
	    Mojo.Event.stopListening(this.sendButtonElement, Mojo.Event.tap, this.sendButtonPressed);
	    if (this.channel.containsNick(this.channel.server.nick) && !this.channel.server.dontPartOnClose)
		{
			this.channel.part();
	    }
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'server-list#cleanup');
	}
}
