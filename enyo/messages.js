enyo.kind({
	name: 'wirc.Message',
	kind: enyo.Control,
	
	setup: {},
	
	constructor: function(setup) {
	    this.inherited(arguments);
		//this.log(setup);
		this.setup = setup;
		this.setup.timestamp = new Date();
	},
	
	formatTimeStamp: function(currentTime) {
		var hours = currentTime.getHours();
		var minutes = currentTime.getMinutes();
		if (hours < 10)
			hours = "0" + hours;
		if (minutes < 10)
  			minutes = "0" + minutes;
  		return "["+hours+":"+minutes+"]"
	},
	
	setupItem: function(item) {
		
		// reset?
		if (enyo.application.p.get('showTimeStamps')) {
			item.$.timestamp.setContent(this.formatTimeStamp(this.setup.timestamp));
			item.$.timestamp.show();
		} else {
			item.$.timestamp.hide();
		}
		item.$.seperator.show();
		item.$.nick.setContent('');
		item.$.text.setContent('');
		
		if (this.setup.self)
			item.setClassName('enyo-item message-row self');
		else
			item.setClassName('enyo-item message-row ' + this.setup.type);
		if (!this.setup.nick) {
			item.$.nick.hide();
			//item.$.seperator.hide();
		}
		switch(this.setup.type) {
			case 'action':
				item.$.nick.setContent('*');
				//item.$.seperator.hide();
				item.$.text.setContent(this.setup.nick + ' ' + this.setup.text);
				break;
				
			default:
				item.$.nick.setContent(this.setup.nick);
				item.$.text.setContent(this.setup.text);
				break;
		}
		
		if (this.setup.num%2==0)
			item.applyStyle('background','#EBEBEB');
		else
			item.applyStyle('background','#f5f5f5');
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
		{name: 'timestamp', className: 'timestamp', width: '45px', fixedWidth: true},
        {name: 'nick', className: 'nick', width: '100px', fixedWidth: true},
		{name: 'seperator', className: 'seperator'},
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
	
	richContent: true,
	alwaysLooksFocused: true,
	hint: '',
	maxTextHeight: '68px',
	autocorrect: false,
	autoCapitalize: 'lowercase',
	
	getValue: function() {
		return this.getText().replace(/&nbsp;/g, ' ');
	}
	
});
