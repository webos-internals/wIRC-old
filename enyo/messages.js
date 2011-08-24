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
				classes:	['message-row', this.setup.type],
				rowStyle:	{},
				chan:		(this.setup.chan ? '<#' + this.setup.chan + '>' : ''),
				nick:		(this.setup.nick || ''),
				nickStyle:	{},
				text:		(this.setup.text || ''),
				textCopy:	'',
				textStyle:	{},
			};
			
			switch(this.setup.type) {
				
				case 'status':
					this._cache.classes.push('no-sep');
					break;
					
				case 'notice':
					if (!this._cache.nick) this._cache.classes.push('no-sep');
					break;
				
				case 'action':
					this._cache.classes.push('no-sep');
					this._cache.nick = '*&nbsp;';
					this._cache.text = this.setup.nick + ' ' + this.setup.text;
					break;
				
				case 'privmsg':
					if (this.setup.self) this._cache.classes.push('self');
					// else if (random) get the nicks color and set it with nickStyle like below
					//	this._cache.nickStyle['color'] = enyo.application.p.get('colorOtherNicks');
					break;
				
				default:
					break;
			}
		}
	},
	
	setupItem: function(item) {
		
		this.generateCache();
		
		item.setClassName(item.defaultClassName);
		item.addClass(this._cache.classes.join(' '));
		item.addRemoveClass('alt', (this.setup.num % 2) == 0);
		item.addRemoveClass('last', this.setup.last);
		
		for (var s in this._cache.rowStyle)	 item.applyStyle(s, this._cache.rowStyle[s]);
		for (var s in this._cache.nickStyle) item.$.nick.applyStyle(s, this._cache.nickStyle[s]);
		for (var s in this._cache.textStyle) item.$.text.applyStyle(s, this._cache.textStyle[s]);
		
		item.$.chan.setContent(this._cache.chan);
		item.$.nick.setContent(this._cache.nick);
		item.$.text.setContent(this._cache.text);
		
		if (enyo.application.p.get('showTimeStamps')) {
			item.$.timestamp.setContent(this.formatTimeStamp(this.setup.timestamp));
			item.$.timestamp.setShowing(true);
		} else {
			item.$.timestamp.setShowing(false);
		}
		
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
	
	defaultClassName: 'enyo-item',
	
	/*published: {
		message: ''
	},*/
	
	components: [
		{name: 'timestamp', className: 'timestamp'},
		{name: 'chan', className: 'chan', allowHtml: true},
        {name: 'nick', className: 'nick', allowHtml: true},
        {name: 'text', className: 'text', allowHtml: true, flex: 1},
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
		// move this to be handled by prefs css color setting code
		this.applyStyle('background-color', enyo.application.p.get('colorBackground'));
		this.applyStyle('color', enyo.application.p.get('colorText'));
	},
	
	getValue: function() {
		return this.getText().replace(/&nbsp;/g, ' ');
	}
	
});
