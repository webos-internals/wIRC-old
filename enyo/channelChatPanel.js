enyo.kind({
	name: 'wirc.ChannelChatPanel',
	kind: 'wirc.SlidingView',
	
	published: {
		channel: false,
	},
	
	completionText: false,
	text: false,
	nick: false,
	
	nicks: [],
	
	components: [
	
		/*{kind: 'ApplicationEvents', onResize:'doResize',
			onWindowHidden: 'windowHiddenHandler', onWindowShown: 'windowShownHandler',
			onWindowActivated: 'windowActivatedHandler', onWindowDeactivated: 'windowDeactivatedHandler'},*/
	
		{name: "nicklist", kind: "Pullout", style: "width: 180px; top: 73px; bottom: 0; margin-bottom: 54px;", className: "enyo-bg", flyInFrom: "right", onOpen: "pulloutToggle", onClose: "closeRightPullout", components: [
			{name: 'nicks', kind: 'FlyweightList', height: '100%', onSetupRow: 'setupNick', className: 'messages', components: [
				{kind: 'wirc.NickItem', name: 'nick'}
		    ]},
		]},
		
		{name: 'header', kind: 'Header', height: '73px', style: 'z-axis: 1;', components: [
			{name: 'headerText', content: 'asdf', flex: 1, className: 'topic'},
			//{kind: 'Button', caption: 'o', onclick: 'test', className: 'close'},
			{kind: enyo.ToolButton, icon: 'enyo/images/buddies-down.png', onclick: 'showNickList', name: 'nicklistButton'},
			{kind: enyo.ToolButton, icon: 'enyo/images/close-down.png', onclick: 'closeButton'},
		]},
		{kind: 'HeaderShadow'},
		
		{className: 'fixed-splitter'},
		
		{name: 'messages', kind: 'FlyweightList', height: '100%', bottomUp: true, onSetupRow: 'setupMessage', className: 'messages', components: [
			{name: 'message', kind: 'wirc.MessageItem'}
	    ]},
		
		{kind: 'ToolbarShadow'},
		{name: 'toolbar', kind: 'Toolbar', className: 'enyo-toolbar-light toolbar message-toolbar', components: [
			{kind: 'GrabButton'},
			{name: 'input', kind: 'wirc.MessageRichText', flex: 1, onkeydown: 'keyDown'},
		]},
		
	],
	
	initComponents: function() {
	    this.inherited(arguments);
		
		this.addClass('messages-panel');
		this.addClass(enyo.application.p.get('listStyle'))
		
		this.messageListener = enyo.bind(this, 'queueRefresh');
		this.headerListener = enyo.bind(this, 'headerRefresh');
		this.nicklistListener = enyo.bind(this, 'nicklistRefresh');
		enyo.application.e.listen('channel-message' + this.channel.getNameSimple(), this.messageListener);
		enyo.application.e.listen('channel-topic' + this.channel.getNameSimple(), this.headerListener);
		enyo.application.e.listen('nick-completion', enyo.bind(this, 'completeNick'))
		enyo.application.e.listen('update-user-count' + this.channel.getNameSimple(), this.nicklistListener);
	},
	
	destroy: function() {
		if (this.channel.messages.length>0) {
			for (i in this.channel.messages)
				this.channel.messages[i].setup.last = false;
			this.channel.messages[0].setup.last = true;
		}
		enyo.application.e.stopListening('channel-message' + this.channel.getNameSimple(), this.messageListener);
		enyo.application.e.stopListening('channel-topic' + this.channel.getNameSimple(), this.headerListener);
		enyo.application.e.stopListening('channel-mode' + this.channel.getNameSimple(), this.headerListener);
		enyo.application.e.stopListening('update-user-count' + this.channel.getNameSimple(), this.nicklistlistener);
		return this.inherited(arguments);
	},
	
	rendered: function() {
	    this.inherited(arguments);
		this.nicklistRefresh();
	},
	
	headerRefresh: function() {
		if (this.$.header) {
			var mode = this.channel.setup.mode ? ',' + this.channel.setup.mode : '';
			this.$.headerText.setContent(
				this.channel.setup.name + ' (' +
				this.nicks.length +
				mode +
				') ' + this.channel.setup.topic
			);
		}
	},
	
	queueRefresh: function() {
		enyo.job('refreshMessages', enyo.bind(this, 'refreshMessages'), 5);
	},
	refreshMessages: function() {
		this.$.messages.refresh();
	},
	nicklistRefresh: function() {
		this.nicks = this.channel.getListNicks();
		this.nicks.sort(wirc.Nick.sortByMode);
		if (this.$.nicklist && this.$.nicklist.showing)
			this.$.nicks.refresh();
		this.headerRefresh();
	},
	
	resizeHandler: function() { // application resize (orientation change/keyboard pop)
		this.inherited(arguments);
		this.queueRefresh();
	},
	doResize: function() { // pane resize
		this.queueRefresh();
	},
	
	test: function() {
		this.log();	
		for (var x = 0; x < 100; x++) {
			this.channel.newMessage('status', false, 'test - '+x);
		}
		this.queueRefresh();
	},
	
	setupMessage: function(inSender, inIndex) {
		if (this.channel.messages[inIndex]) {
			this.channel.messages[inIndex].setupItem(this.$.message);
			return true;
		}
		return false;
	},
	
	setupNick: function(inSender, inIndex) {
		if (this.nicks[inIndex]) {
			this.$.nick.setupItem(this.nicks,inIndex);
			return true;
		}
		return false;
	},
	
	keyDown: function(inSender, inEvent) {
		if (!enyo.application.k.keyDown(inSender, inEvent)) {
			if (enyo.application.k.testMatch(enyo.application.p.get('nickCompletion'), inEvent) && this.$.input.getValue().length>0) {
				this.completeNick();
			} else {
				this.completionText = false;
				this.text = false;
				this.nick = false;
				if (inEvent.keyCode === 13) {
					inEvent.preventDefault();
					var text = this.$.input.getValue().trim();
					if (text) this.channel.newCommand(text);
					this.$.input.setValue('');
				}
			}
		}
	},
	
	closeButton: function() {
		this.setShowing(false)
	},
	
	showNickList: function() {
		if (this.$.nicklist.showing)
			this.$.nicklist.close();
		else {
			this.$.nicklist.domStyles['margin-bottom'] = enyo.application.m.previewHeight() + 54 + 'px'
			this.$.nicklist.open();
			this.$.nicks.render();
		}
	},
	
	completeNick: function() {
		if (!this.completionText) {
			this.completionText = this.$.input.getValue();
			var tmpText = this.completionText.match(/^(.*)[\s]{1}(.*)$/);
			if (tmpText) {
				this.text = tmpText[1];
				this.completionText = tmpText[2];
			}
			this.warn(this.completionText, this.text)
		}
		this.nick = this.channel.completeNick(this.completionText, this.nick);
		if (this.nick) {
			if (this.text)
				this.$.input.setValue(this.text + " " + this.nick + "&nbsp;");
			else
				this.$.input.setValue(this.nick + enyo.application.p.get('complectionSeparator') + "&nbsp;");
		}
	},
	
});
