enyo.kind({
	name: 'wirc.Keys',
	kind: enyo.Control,
	
	components: [
		{kind: 'ApplicationEvents', onKeyup: 'keyUp', onKeydown: 'keyDown', onKeypress: 'keyPress'},
	],
	
	
	keyDown: function(inSender, inEvent) {
		this.logEvent(inEvent);
		if (inEvent.keyIdentifier == 'Up' && inEvent.ctrlKey) {
			enyo.application.e.dispatch('main-list-up');
			return true;
		}
		if (inEvent.keyIdentifier == 'Down' && inEvent.ctrlKey) {
			enyo.application.e.dispatch('main-list-down');
			return true;
		}
		return false;
	},
	
	keyPress: function(inSender, inEvent) {
		this.logEvent(inEvent);
	},
	
	keyUp: function(inSender, inEvent) {
		this.logEvent(inEvent);
	},
	
	
	logEvent: function(inEvent) {
		//this.log(inEvent.type, inEvent.keyCode, inEvent.keyIdentifier, inEvent.ctrlKey, inEvent.altKey, inEvent.shiftKey, inEvent.metaKey, inEvent.altGraphKey);
		//for (var e in inEvent) this.log(e, inEvent[e]);
	},
	
	
});

enyo.application.k = new wirc.Keys();
