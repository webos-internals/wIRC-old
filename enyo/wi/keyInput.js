enyo.kind({
	name: 'wi.KeyInput',
	kind: 'Item',
	layoutKind: 'HFlexLayout',
	
	recording: false,
	lastValue: {},
	currentValue: {},
	
	published: {
		caption: '',
		value: {}
	},
	
	components: [
	
		{kind: 'ApplicationEvents', onKeydown: 'keyDown'},
		
		{name: 'button', kind: 'Button', style: 'margin-top: -5px; margin-bottom: -5px; margin-right: 10px;', onclick: 'buttonClick', components: [
			{name: 'record', style: 'width: 15px; height: 15px; background: #c33; margin-top: 2px; border-radius: 15px;'},
			{name: 'stop', style: 'width: 15px; height: 15px; background: #666; margin-top: 2px;'},
		]},
		{name: 'display', flex: 1},
		{name: 'caption'},
		
	],
	
	create: function () {
	    this.inherited(arguments);
		this.$.caption.setContent(this.caption);
		this.updateDisplay(this.value);
		this.$.stop.hide();
	},
	
	buttonClick: function(inSender, inEvent) {
		if (!this.recording) {
			this.currentValue = this.value;
			this.lastValue = this.value;
			this.updateDisplay(this.currentValue);
			this.$.record.hide();
			this.$.stop.show();
			this.recording = true;
		}
		else {
			if (this.validValue(this.currentValue)) this.value = this.currentValue;
			else this.value = this.lastValue;
			this.updateDisplay(this.value);
			this.currentValue = {};
			this.lastValue = {};
			this.$.stop.hide();
			this.$.record.show();
			this.recording = false;
		}
	},
	
	setValue: function(value) {
		this.value = value;
		this.updateDisplay(this.value);
	},
	getValue: function() {
		return this.value;
	},
	
	keyDown: function(inSender, inEvent) {
		if (this.recording) {
			this.currentValue = this.getValueFromEvent(inEvent);
			this.updateDisplay(this.currentValue);
			//enyo.application.k.logEvent(inEvent);
		}
	},
	
	getValueFromEvent: function(event) {
		var value = {
			keyCode:		event.keyCode,
			keyIdentifier:	event.keyIdentifier,
			ctrlKey:		event.ctrlKey,
			altKey:			event.altKey,
			shiftKey:		event.shiftKey, // if the capslock is on this is reversed!
			metaKey:		event.metaKey
		};
		return value;
	},
	
	updateDisplay: function(value) {
		this.$.display.setContent(this.getStringFromValue(value));
		if (this.validValue(value)) this.$.display.applyStyle('color', null);
		else this.$.display.applyStyle('color', 'rgba(0, 0, 0, 0.4)');
	},
	
	validValue: function(value) {
		// we will require one modifier and a valid key
		var mods = 0;
		if (value.ctrlKey)	mods++;
		if (value.altKey)	mods++;
		if (value.shiftKey)	mods++;
		if (value.metaKey)	mods++;
		if (mods > 0 &&
			value.keyCode &&		// this list probably needs more
			value.keyCode != 8 &&	// backspace
			value.keyCode != 17 &&	// ctrl
			value.keyCode != 129 &&	// alt
			value.keyCode != 16 &&	// shift
			value.keyCode != 13) {	// enter
			return true;
		}
		else return false;
	},
	
	getStringFromValue: function(value) {
		var used = [];
		if (value.ctrlKey)	used.push('Ctrl');
		if (value.altKey)	used.push('Alt');
		if (value.shiftKey)	used.push('Shft');
		if (value.metaKey)	used.push('Meta');
		if (value.keyCode &&		// this list probably needs more
			value.keyCode != 8 &&	// backspace
			value.keyCode != 17 &&	// ctrl
			value.keyCode != 129 &&	// alt
			value.keyCode != 16 &&	// shift
			value.keyCode != 13) {	// enter
			if (value.keyCode == 9) used.push('Tab');
			else if (value.keyCode >= 37 && value.keyCode <= 40) used.push(value.keyIdentifier);
			else used.push(String.fromCharCode(value.keyCode));
			//used.push('(' + value.keyCode + ') ' + value.keyIdentifier);
		}
		else
			used.push('...');
		
		var pretty = used.join(' + ');
		if (pretty == '') {
			if (this.recording) pretty = 'Press and Hold Keys';
			else pretty = 'None';
		}
		return pretty;
	},
	
});
