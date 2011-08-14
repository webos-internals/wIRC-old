enyo.kind({
	name: 'wirc.Message',
	kind: enyo.Control,
	
	setup: {},
	
	constructor: function(setup) {
	    this.inherited(arguments);
		//this.log(setup);
		this.setup = setup;
	},
	
	setupItem: function(item) {
		
		// reset?
		item.$.seperator.show();
		item.$.nick.setContent('');
		item.$.text.setContent('');
		
		if (this.setup.self)
			item.setClassName('enyo-item message-row self');
		else
			item.setClassName('enyo-item message-row ' + this.setup.type);
		if (!this.setup.nick) {
			item.$.nick.hide();
			item.$.seperator.hide();
		}
		switch(this.setup.type) {
			case 'action':
				item.$.nick.setContent('*');
				item.$.seperator.hide();
				item.$.text.setContent(this.setup.nick + ' ' + this.setup.text);
				break;
				
			default:
				item.$.nick.setContent(this.setup.nick);
				item.$.text.setContent(this.setup.text);
				break;
		}
	},
	
});

enyo.kind({
	name: 'wirc.MessageItem',
	kind: enyo.Item,
	layoutKind: 'HFlexLayout',
	
	/*published: {
		message: ''
	},*/
	
	components: [
        {name: 'nick', className: 'nick'},
		{name: 'seperator', className: 'seperator', content: ':&nbsp;'},
        {name: 'text', className: 'text', flex: 1},
	],
	
	/*
	create: function() {
	    this.inherited(arguments);
		this.message.setupItem(this);
	},
	*/
});

enyo.kind({
	name: 'wirc.MessageRichText',
	kind: 'RichText',
	
	richContent: false,
	alwaysLooksFocused: true,
	hint: '',
	maxTextHeight: '68px',
	
	autoCapitalize: 'lowercase',
	
});
