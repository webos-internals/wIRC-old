enyo.kind({
	name: 'wirc.Keys',
	kind: enyo.Control,
	
	capture: true,
	
	components: [
		{kind: 'ApplicationEvents', onKeydown: 'keyDown'/*, onKeyup: 'keyUp', onKeypress: 'keyPress'*/},
	],
	
	stopCapture: function() {
		this.capture = false;
	},
	startCapture: function() {
		this.capture = true;
	},
	
	keyDown: function(inSender, inEvent) {
		if (this.capture) {
			//this.logEvent(inEvent);
			
			if (this.testMatch(enyo.application.p.get('mainListUp'), inEvent)) {
				enyo.application.e.dispatch('main-list-up');
				return true;
			}
			if (this.testMatch(enyo.application.p.get('mainListDown'), inEvent)) {
				enyo.application.e.dispatch('main-list-down');
				return true;
			}
			if (this.testMatch(enyo.application.p.get('nickCompletion'), inEvent)) {
				enyo.application.e.dispatch('nick-completion');
				return true;
			}
			
		}
		return false;
	},
	
	testMatch: function(one, two) {
		//this.log(one, two);
		if (one.keyCode			!== two.keyCode)		return false;
		//if (one.keyIdentifier	!== two.keyIdentifier)	return false;
		if (one.ctrlKey			!== two.ctrlKey)		return false;
		if (one.altKey			!== two.altKey)			return false;
		if (one.shiftKey		!== two.shiftKey)		return false;
		if (one.metaKey			!== two.metaKey)		return false;
		return true; // they all seemed to match!
	},
	
	/*
	keyPress: function(inSender, inEvent) {
		this.logEvent(inEvent);
	},
	
	keyUp: function(inSender, inEvent) {
		this.logEvent(inEvent);
	},
	*/
	
	logEvent: function(inEvent) {
		this.log(inEvent.type, inEvent.keyCode, inEvent.keyIdentifier, inEvent.ctrlKey, inEvent.altKey, inEvent.shiftKey, inEvent.metaKey);
		//for (var e in inEvent) this.log(e, inEvent[e]);
	},
	
});

enyo.application.k = new wirc.Keys();
