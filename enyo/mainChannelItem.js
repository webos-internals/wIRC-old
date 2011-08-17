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
		this.statusListener = enyo.bind(this, 'update');
		enyo.application.e.listen('channel-status' + this.channel.getNameSimple(), this.statusListener);
		enyo.application.e.listen('secondary-panel', this.statusListener);
	},
	
	destroy: function() {
		enyo.application.e.stopListening('channel-status' + this.channel.getNameSimple(), this.statusListener);
		enyo.application.e.stopListening('secondary-panel', this.statusListener);
		return this.inherited(arguments);
	},
	
	doConfirm: function() {
		// swiped away
		if (this.channel != undefined)
			this.channel.part('Swipe-to-Part');
	},
	
	doClick: function(inEvent) {
		// row click
		if (this.channel != undefined) {
			enyo.application.m.createPanel({name: 'channel-chat-' + this.channel.getNameSimple(), kind: 'wirc.ChannelChatPanel', channel: this.channel});
			this.channel.unread = 0;
			enyo.application.e.dispatch('main-crud'); // refresh main list
		}
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
		
		this.addRemoveClass('enyo-item-selected', (this.owner.getSelected() == 'channel-chat-' + this.channel.getNameSimple()));
		
		this.$.title.setContent(this.channel.setup.name);
		
		if (this.channel.mentions>0) 
			this.$.title.setClassName('title mentioned')
		else if (this.channel.unread>0) 
			this.$.title.setClassName('title unread')
		else
			this.$.title.setClassName('title')
		
		this.$.button.setClassName(this.defaultButtonClass + ' menu');

	},
	
});
