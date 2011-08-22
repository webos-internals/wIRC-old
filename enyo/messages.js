enyo.kind({
	name: 'wirc.Message',
	kind: enyo.Control,
	
	setup: {},
	_cache: '',
	
	constructor: function(setup) {
	    this.inherited(arguments);
		//this.log(setup);
		this.setup = setup;
		this.last = false;
		this.setup.timestamp = new Date();
		this._cache = '';
	},
	
	generateCache: function() {
		if (this._cache == '') {
			this._cache = {
				classes:	['message-row'],
				rowStyle:	{},
				chan:		(this.setup.chan || ''),
				nick:		(this.setup.nick || ''),
				nickStyle:	{},
				text:		(this.setup.text || ''),
				textCopy:	'',
				textStyle:	{},
			};
			
			switch(this.setup.type) {
				
				case 'status':
					this._cache.classes.push('no-sep');
					this._cache.rowStyle['color'] = enyo.application.p.get('colorStatus');
					break;
					
				case 'notice':
					if (!this._cache.nick) this._cache.classes.push('no-sep');
					this._cache.rowStyle['color'] = enyo.application.p.get('colorNotice');
					break;
				
				case 'action':
					this._cache.classes.push('no-sep');
					this._cache.nick = '*';
					this._cache.text = this.setup.nick + ' ' + this.setup.text;
					this._cache.rowStyle['color'] = enyo.application.p.get('colorAction');
					break;
				
				case 'privmsg':
					this._cache.rowStyle['color'] = enyo.application.p.get('colorText');
					if (this.setup.self)
						this._cache.nickStyle['color'] = enyo.application.p.get('colorOwnNick');
					else
						this._cache.nickStyle['color'] = enyo.application.p.get('colorOtherNicks');
					break;
				
				default:
					break;
			}
		}
	},
	
	setupItem: function(item, ignoreMarker) {
		
		this.generateCache();
		
		item.addClass(this._cache.classes.join(' '));
		
		for (var s in this._cache.rowStyle)	 item.applyStyle(s, this._cache.rowStyle[s]);
		for (var s in this._cache.nickStyle) item.$.nick.applyStyle(s, this._cache.nickStyle[s]);
		for (var s in this._cache.textStyle) item.$.text.applyStyle(s, this._cache.textStyle[s]);
		
		if (this._cache.chan) {
			item.$.chan.setContent('<#'+this._cache.chan+'>');
			item.$.nick.setClassName('preview');
			//item.$.nick.setStyle('padding-left','3px');
			item.$.chan.setShowing(true);
		} else {
			item.$.chan.setShowing(false);
		}
		
		item.$.nick.setContent(this._cache.nick);
		item.$.text.setContent(this._cache.text);
		
		if (enyo.application.p.get('listBackground') == 'alt' && (this.setup.num % 2) == 0)
			item.applyStyle('background-color', enyo.application.p.get('colorBackgroundAlt'));
		else
			item.applyStyle('background-color', null);
		
		if (enyo.application.p.get('showTimeStamps')) {
			item.$.timestamp.setContent(this.formatTimeStamp(this.setup.timestamp));
			item.$.timestamp.show();
		} else {
			item.$.timestamp.hide();
		}
		
		if (!ignoreMarker && this.setup.last)
			item.applyStyle('border-bottom','1px solid red;');
		else
			item.applyStyle('border-bottom','none;');
		
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
	
});

enyo.kind({
	name: 'wirc.MessageItem',
	kind: enyo.Item,
	layoutKind: 'HFlexLayout',
	
	/*published: {
		message: ''
	},*/
	
	components: [
		{name: 'timestamp', className: 'timestamp'},
		{name: 'chan', classname: 'chan', showing: false},
        {name: 'nick', className: 'nick'},
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
	
	create: function() {
	    this.inherited(arguments);
		this.applyStyle('background-color', enyo.application.p.get('colorBackground'));
		this.applyStyle('color', enyo.application.p.get('colorText'));
	},
	
	getValue: function() {
		return this.getText().replace(/&nbsp;/g, ' ');
	}
	
});
