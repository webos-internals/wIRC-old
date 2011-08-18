enyo.kind({
	name: 'wirc.ServerStatusPanel',
	kind: 'wirc.SlidingView',
	
	dismissible: true,
	
	published: {
		server: false,
	},
	
	components: [
	
		/*{kind: 'ApplicationEvents', onResize:'doResize',
			onWindowHidden: 'windowHiddenHandler', onWindowShown: 'windowShownHandler',
			onWindowActivated: 'windowActivatedHandler', onWindowDeactivated: 'windowDeactivatedHandler'},*/
	
		{name: 'header', kind: 'Header', components: [
			{name: 'headerText', content: 'asdf', flex: 1},
			//{kind: 'Button', caption: 'o', onclick: 'test', className: 'close'},
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
		enyo.application.e.listen('server-message' + this.server.setup.id, this.messageListener);
	},
	
	destroy: function() {
		enyo.application.e.stopListening('server-message' + this.server.setup.id, this.messageListener);
		return this.inherited(arguments);
	},
	
	rendered: function() {
	    this.inherited(arguments);
		this.applySize(true); // dont resize weirdly
		this.$.headerText.setContent((this.server.setup.alias ? this.server.setup.alias : this.server.setup.address) + ': Server Messages');
	},
	
	
	queueRefresh: function() {
		enyo.job('refreshMessages', enyo.bind(this, 'refreshMessages'), 5);
	},
	refreshMessages: function() {
		if (this.$.messages.showing)
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
			this.server.newMessage('status', false, 'test - '+x);
		}
		this.queueRefresh();
	},
	
	setupMessage: function(inSender, inIndex) {
		if (this.server.messages[inIndex]) {
			this.server.messages[inIndex].setupItem(this.$.message);
			return true;
		}
		return false;
	},
	
	keyDown: function(inSender, inEvent) {
		if (!enyo.application.k.keyDown(inSender, inEvent)) {
			if (inEvent.keyCode === 13) {
				inEvent.preventDefault();
				var text = this.$.input.getValue();
			if (text) this.server.newCommand(text);
				this.$.input.setValue('');
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
	
});
