enyo.kind({
	name: 'wirc.MainServerItem',
	kind: 'enyo.SwipeableItem',
	
	tapHighlight: true,
	defaultButtonClass: 'enyo-button button',
	
	events: {
		onButtonClick: '',
	},
	published: {
		server: false,
	},
	
	components: [
		{name: 'title', className: 'title'},
		{name: 'subtitle', className: 'subtitle'},
		{className: 'buttons', components: [
			{name: 'button1', kind: 'Button', className: 'button', onclick: 'clickButton', components: [
				{name: 'button1icon', className: 'icon'},
				{name: 'button1spin', kind: 'Spinner', className: 'spinner'},
			]},
			{name: 'button2', kind: 'Button', className: 'button', onclick: 'clickButton', components: [
				{name: 'button2icon', className: 'icon'},
			]}
		]},
	],
	
	initComponents: function() {
	    this.inherited(arguments);
		this.addClass('main-row');
		this.update();
		this.statusListener = enyo.bind(this, 'update');
		enyo.application.e.listen('server-status' + this.server.setup.id, this.statusListener);
	},
	
	destroy: function() {
		enyo.application.e.stopListening('server-status' + this.server.setup.id, this.statusListener);
		return this.inherited(arguments);
	},
	
	doConfirm: function() {
		// swiped away
		if (this.server != undefined)
			enyo.application.s.remove(this.server.setup.id);
	},
	
	doClick: function(inEvent) {
		// row click
		if (this.server != undefined)
			enyo.application.m.createPanel({name: 'server-status-' + this.server.setup.id, kind: 'wirc.ServerStatusPanel', server: this.server});
	},
	
	clickButton: function(inSender, inEvent) {
		// row button clicks
		inEvent.stopPropagation();
		if (this.server != undefined) {
			if (inSender.hasClass('connect')) {
				this.server.connect();
			}
			if (inSender.hasClass('disconnect')) {
				this.server.disconnect();
			}
			else if (inSender.hasClass('prefs')) {
				enyo.application.m.createPanel({name: 'server-edit-' + this.server.setup.id, kind: 'wirc.ServerPreferencesPanel', setup: this.server.getSetup()});
			}
		}
	},
	
	update: function() {
		
		this.$.button1spin.hide();
		
		if (this.server.setup.alias) {
			this.$.title.setContent(this.server.setup.alias);
			this.$.subtitle.setContent(this.server.setup.address);
		}
		else {
			this.$.title.setContent(this.server.setup.address);
			this.$.subtitle.setContent('');
		}
		
		this.$.button2.setClassName(this.defaultButtonClass + ' prefs');
		
		switch(this.server.state) {
			case wirc.Server.stateDisconnected:
				this.$.button1.setClassName(this.defaultButtonClass + ' connect');
				break;
				
			case wirc.Server.stateConnecting:
				this.$.button1.setClassName(this.defaultButtonClass + ' connecting');
				this.$.button1spin.show();
				break;
				
			case wirc.Server.stateConnected:
				this.$.button2.setClassName(this.defaultButtonClass + ' menu');
				this.$.button1.setClassName(this.defaultButtonClass + ' disconnect');
				break;
		}
	},
	
});
