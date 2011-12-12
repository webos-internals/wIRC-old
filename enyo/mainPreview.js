enyo.kind({
	name: 'wirc.MainPreview',
	kind: enyo.Control,
	
	height: '125px',
	messagesToShow: 10,
	messages: [],
	messageNum: 0,
	isDisplaying: false,
	
	components: [
		
		{kind: 'PreviewShadow'},
		
		{className: 'fixed-splitter'},
		
		{name: 'messagesContainer', className: 'messages', height: '100%', style: 'position: relative; overflow: hidden;', components: [
			{name: 'messages', className: 'messages', style: 'position: absolute; bottom: 0; right: 0; left: 0'},
		]},
		
	],
	
	initComponents: function() {
	    this.inherited(arguments);
		
		this.addClass('preview-panel messages-panel');
		this.updateClasses();
		
		this.messageListener = enyo.bind(this, 'queueRefresh');
		this.classesListener = enyo.bind(this, 'updateClasses');
		enyo.application.e.listen('preview-message', this.messageListener);
		enyo.application.e.listen('preferences-saved', this.classesListener);
		
		this.applyStyle('-webkit-transition', 'height 0.8s ease-out');
	},
	
	destroy: function() {
		enyo.application.e.stopListening('preview-message', this.messageListener);
		enyo.application.e.stopListening('preferences-saved', this.classesListener);
		return this.inherited(arguments);
	},
	
	updateClasses: function() {
		this.removeClass('fixed'); this.removeClass('left');
		this.addClass(enyo.application.p.get('listStyle'));
	},
	
	queueRefresh: function(msg) {
		msg.setup.num = this.messageNum;
		this.messageNum++;
		this.messages.push(msg);
		if (this.messages.length > this.messagesToShow) this.messages.shift();
		enyo.job('refreshPreviewMessages', enyo.bind(this, 'refreshMessages'), 5);
	},
	refreshMessages: function() {
		if (this.isDisplaying)
			this.updateList();
	},
	
	updateList: function() {
		this.$.messages.destroyControls();
		for (var m = 0; m < this.messages.length; m++) {
			this.$.messages.createComponent({name: 'message-' + m, kind: 'wirc.MessageItem'}, {owner: this});
		}
		for (var m = 0; m < this.messages.length; m++) {
			this.messages[m].setupItem(this.$['message-' + m]);
		}
		this.$.messages.render();
	},
	
	setDisplay: function(value) {
		this.isDisplaying = !value;
		this.toggleDisplay();
	},
	toggleDisplay: function() {
		if (this.isDisplaying) {
			this.isDisplaying = false;
			this.applyStyle('height', '125px');
			enyo.application.p.set('showPreview', false);
		} else {
			this.isDisplaying = true;
			this.applyStyle('height', '0px');
			enyo.application.p.set('showPreview', true);
		}
	},
	
});
