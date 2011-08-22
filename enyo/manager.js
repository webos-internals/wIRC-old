enyo.kind({
	name: 'wirc.Manager',
	kind: enyo.Control,
	
	controller: false,
	
	messages: [],
	
	setController: function(c) {
		this.controller = c;
	},
	
	createPanel: function() {
		if (this.controller)
			return this.controller.createPanel.apply(this.controller, arguments);
	},
	destroyPanel: function() {
		if (this.controller)
			return this.controller.destroySecondary.apply(this.controller, arguments);
	},
	
	newMessage: function(m) {
		this.messages.unshift(m);
	}
	
});

enyo.application.m = new wirc.Manager();
