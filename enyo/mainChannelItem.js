enyo.kind({
	name: 'wirc.MainChannelItem',
	kind: 'enyo.SwipeableItem',
	
	tapHighlight: true,
	defaultButtonClass: 'enyo-button button',
	confirmCaption: 'Part Channel',
	
	events: {
		onButtonClick: '',
	},
	published: {
		channel: false,
	},
	
	components: [
		{name: 'title', className: 'title'},
		{className: 'buttons', components: [
			{name: 'button', kind: 'Button', className: 'button', onclick: 'clickButton', components: [
				{name: 'buttonicon', className: 'icon'}
			]},
		]},
	],
	
	initComponents: function() {
	    this.inherited(arguments);
		this.addClass('main-row');
		this.update();
		//this.statusListener = enyo.bind(this, 'update');
		//enyo.application.e.listen('server-status' + this.server.setup.id, this.statusListener);
	},
	
	destroy: function() {
		//enyo.application.e.stopListening('server-status' + this.server.setup.id, this.statusListener);
		return this.inherited(arguments);
	},
	
	doConfirm: function() {
		// swiped away
		//if (this.server != undefined)
		//	enyo.application.s.remove(this.server.setup.id);
	},
	
	doClick: function(inEvent) {
		// row click
		if (this.channel != undefined)
			enyo.application.m.createPanel({name: 'channel-chat-' + this.channel.setup.name, kind: 'wirc.ChannelChatPanel', channel: this.channel});
	},
	
	clickButton: function(inSender, inEvent) {
		// row button clicks
		/*inEvent.stopPropagation();
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
		}*/
	},
	
	update: function() {
		
		this.$.title.setContent(this.channel.setup.name);
		
		this.$.button.setClassName(this.defaultButtonClass + ' menu');
		
		/*switch(this.server.state) {
			case wirc.Server.stateDisconnected:
				this.$.button2.setClassName(this.defaultButtonClass + ' connect');
				break;
				
			case wirc.Server.stateConnecting:
				this.$.button2.setClassName(this.defaultButtonClass + ' connecting');
				this.$.button2spin.show();
				break;
				
			case wirc.Server.stateConnected:
				this.$.button1.setClassName(this.defaultButtonClass + ' menu');
				this.$.button2.setClassName(this.defaultButtonClass + ' disconnect');
				break;
		}*/
	},
	
});
