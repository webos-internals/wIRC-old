enyo.kind({
	name: 'wirc.MainServerItem',
	kind: 'enyo.SwipeableItem',
	
	tapHighlight: true,
	defaultButtonClass: 'enyo-button button',
	
	statics: {
		titleClass: {
			normal: 'title',
			unread: 'title unread',
			mentioned: 'title mentioned'
		}
	},
	
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
			]},
			{name: 'menu', kind: 'Menu', components: [
				{caption: 'Join Channel'},
				{caption: 'Preferences', className: 'prefs', icon: 'enyo/images/button-prefs.png', onclick: 'clickButton'},
			]}
		]},
	],
	
	initComponents: function() {
	    this.inherited(arguments);
		this.addClass('main-row');
		this.update();
		this.statusListener = enyo.bind(this, 'update');
		enyo.application.e.listen('server-status' + this.server.setup.id, this.statusListener);
		enyo.application.e.listen('secondary-panel', this.statusListener);
	},

	destroy: function() {
		enyo.application.e.stopListening('server-status' + this.server.setup.id, this.statusListener);
		enyo.application.e.stopListening('secondary-panel', this.statusListener);
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
		
		
		/*// for testing
		this.server.newMessage('action', 'actionnick', 'actiontext');
		this.server.newMessage('privmsg', 'privmsgnick', 'privmsgtext');
		this.server.newMessage('privmsg', 'privmsgnick', 'privmsgtext');
		this.server.newMessage('notice', '', 'noticetext');
		this.server.newMessage('notice', false, 'noticetext');
		this.server.newMessage('notice', 'noticenick', 'noticetext');
		this.server.newMessage('privmsg', 'reallylongokthisisajokerightprivmsgnick', 'privmsgtext');*/
		
	},
	
	test: function(a, b, c) {
		this.log(a, b, c);
	},

	clickButton: function(inSender, inEvent) {
		// row button clicks
		inEvent.stopPropagation();
		if (this.server != undefined) {
			var classes = inSender.getClassName().split(' ');
			for (var c = 0; c < classes.length; c++) {
				switch(classes[c]) {

					case 'connect':
					case 'error':
						this.server.connect();
						break;

					case 'disconnect':
						this.server.disconnect();
						break;
					
					case 'prefs':
						enyo.application.m.createPanel({name: 'server-edit-' + this.server.setup.id, kind: 'wirc.ServerPreferencesPanel', setup: this.server.getSetup()});
						break;

					case 'menu':
						this.$.menu.openAtControl(inSender);
						break;

					default: break;
				}
			}
		}
	},
	
	update: function() {
		
		this.addRemoveClass('enyo-item-selected', (this.owner.getSelected() == 'server-status-' + this.server.setup.id ||
												   this.owner.getSelected() == 'server-edit-' + this.server.setup.id));
		
		this.$.button1spin.hide();
		
		if (this.server.setup.alias) {
			this.$.title.setContent(this.server.setup.alias);
			this.$.subtitle.setContent(this.server.setup.address);
		}
		else {
			this.$.title.setContent(this.server.setup.address);
			this.$.subtitle.setContent('');
		}
		
		if (this.server.unread>0) 
			this.$.title.setClassName('title unread')
		else
			this.$.title.setClassName('title')
		
		this.$.button2.setClassName(this.defaultButtonClass + ' prefs');
		
		switch(this.server.state) {
			case wirc.Server.stateDisconnected:
			case wirc.Server.stateReady:
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
				
			case wirc.Server.stateError:
				this.$.button1.setClassName(this.defaultButtonClass + ' error');
					break;
					
			case wirc.Server.stateNoInternet:
			case wirc.Server.stateDisrupted:
				this.$.button1.setClassName(this.defaultButtonClass + ' noInternet');
				break;
		}
	},
	
});
