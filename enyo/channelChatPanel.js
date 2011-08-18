enyo.kind({
	name: 'wirc.ChannelChatPanel',
	kind: 'wirc.SlidingView',
	
	dismissible: true,
	
	published: {
		channel: false,
	},
	
	completionText: false,
	text: false,
	nick: false,
	
	components: [
	
		/*{kind: 'ApplicationEvents', onResize:'doResize',
			onWindowHidden: 'windowHiddenHandler', onWindowShown: 'windowShownHandler',
			onWindowActivated: 'windowActivatedHandler', onWindowDeactivated: 'windowDeactivatedHandler'},*/
	
		{name: "nicklist", kind: "Pullout", style: "width: 180px; top: 64px; bottom: 0; margin-bottom: 54px;", className: "enyo-bg", flyInFrom: "right", onOpen: "pulloutToggle", onClose: "closeRightPullout", components: [
			{name: 'nicks', kind: 'FlyweightList', height: '100%', onSetupRow: 'setupNick', className: 'messages', components: [
				{kind: 'Item', name: 'nick'}
		    ]},
		]},
		
		{name: 'header', kind: 'Header', style: 'z-axis: 1;', components: [
			{name: 'headerText', content: 'asdf', flex: 1},
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
		this.addClass(enyo.application.p.get('listStyle'));
		this.$.client.applyStyle('background-color', enyo.application.p.get('colorBackground'));
		this.messageListener = enyo.bind(this, 'queueRefresh');
		enyo.application.e.listen('channel-message' + this.channel.getNameSimple(), this.messageListener);
		enyo.application.e.listen('nick-completion', enyo.bind(this, 'completeNick'))
	},
	
	destroy: function() {
		enyo.application.e.stopListening('channel-message' + this.channel.getNameSimple(), this.messageListener);
		return this.inherited(arguments);
	},
	
	rendered: function() {
	    this.inherited(arguments);
		this.$.headerText.setContent(this.channel.setup.name);
	},
	
	
	queueRefresh: function() {
		enyo.job('refreshMessages', enyo.bind(this, 'refreshMessages'), 5);
	},
	refreshMessages: function() {
		this.$.messages.refresh();
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
		if (this.channel.setup.nicks[inIndex]) {
			this.$.nick.setContent(this.channel.setup.nicks[inIndex]);
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
					var text = this.$.input.getValue();
					if (text) this.channel.newCommand(text);
					this.$.input.setValue('');
				}
			}
		}
	},
	
	closeButton: function() {
		this.setShowing(false)
	},
	
	setShowing: function(showing) {
		this.inherited(arguments);
		if (!showing)
			this.owner.destroySecondary(true);
	},
	
	showNickList: function() {
		if (this.$.nicklist.showing)
			this.$.nicklist.close();
		else {
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
