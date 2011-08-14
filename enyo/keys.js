enyo.kind({
	name: 'wirc.Keys',
	kind: enyo.Control,
	
	components: [
		//{kind: 'ApplicationEvents', onKeyup: 'keyUp', onKeydown: 'keyDown', onKeypress: 'keyPress'},
	],
	
	/*
	keyUp: function(inSender, inEvent) {
		this.log(inSender, inEvent);
	},
	keyDown: function(inSender, inEvent) {
		this.log(inSender, inEvent);
	},
	keyPress: function(inSender, inEvent) {
		this.log(inSender, inEvent);
	},
	*/
	
});

enyo.application.k = new wirc.Keys();
