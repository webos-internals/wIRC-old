enyo.kind({
	name: 'wirc.connectionManager',
	kind: enyo.Control,
	
	state: null,
	
	initComponents: function() {
		this.inherited(arguments);
		this.createComponent({
			name: "connectionManager",
		  	kind: "PalmService",
		  	service: "palm://com.palm.connectionmanager/",
		  	method: "getStatus",
		  	subscribe: true,
		  	onSuccess: "gotConnections",
		  	onFailure: "failure"
		});
		this.$.connectionManager.call();
	},
	
	failure: function(inSender, inEvent, inMessage) {
		this.error([inSender, inEvent, inMessage]);
	},
	
	gotConnections: function(inSender, inMessage, inType) {
		this.state = inMessage;
	},
	
	isInternetConnectionAvailable: function() {
		if (this.state)
			return this.state.isInternetConnectionAvailable
		else
			return false
	},
	
});

enyo.application.cm = new wirc.connectionManager();