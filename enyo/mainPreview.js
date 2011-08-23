enyo.kind({
	name: 'wirc.MainPreview',
	kind: enyo.Control,
	
	height: '125px',
	messagesToShow: 10,
	messages: [],
	messageNum: 0,
	
	components: [
		
		{kind: 'PreviewShadow'},
		
		//{className: 'fixed-splitter'},
		
		{name: 'messagesContainer', height: '100%', style: 'position: relative; overflow: hidden;', components: [
			{name: 'messages', className: 'messages', style: 'position: absolute; bottom: 0; right: 0; left: 0'},
		]},
		
	],
	
	initComponents: function() {
	    this.inherited(arguments);
		this.addClass('messages-panel');
		this.addClass(enyo.application.p.get('listStyle'));
		this.$.messagesContainer.applyStyle('background-color', enyo.application.p.get('colorBackground'));
		this.$.messages.applyStyle('background-color', enyo.application.p.get('colorBackground'));
		this.messageListener = enyo.bind(this, 'queueRefresh');
		enyo.application.e.listen('preview-message', this.messageListener);
	},
	
	destroy: function() {
		enyo.application.e.stopListening('preview-message', this.messageListener);
		return this.inherited(arguments);
	},
	
	queueRefresh: function(msg) {
		msg.setup.num = this.messageNum;
		this.messageNum++;
		this.log(msg);
		this.messages.push(msg);
		if (this.messages.length > this.messagesToShow) this.messages.shift();
		enyo.job('refreshPreviewMessages', enyo.bind(this, 'refreshMessages'), 5);
	},
	refreshMessages: function() {
		if (this.showing)
			this.updateList();
	},
	
	updateList: function() {
		this.log(this.messages.length);
		this.$.messages.destroyControls();
		for (var m = 0; m < this.messages.length; m++) {
			this.$.messages.createComponent({name: 'message-' + m, kind: 'wirc.MessageItem'}, {owner: this});
		}
		for (var m = 0; m < this.messages.length; m++) {
			this.messages[m].setupItem(this.$['message-' + m]);
		}
		this.$.messages.render();
	},
	
});
