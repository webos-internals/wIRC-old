enyo.kind({
	name: 'wirc.connectionManager',
	kind: enyo.Control,
	
	initComponents: function() {
		this.inherited(arguments);
		this.createComponent({
			name: "connectionManager",
		  	kind: "PalmService",
		  	service: "palm://com.palm.connectionmanager/",
		  	method: "getStatus",
		  	onSuccess: "gotConnections",
		  	onFailure: "failure"
		});
		this.$.connectionManager.call({subscribe:true});
	},
	
	failure: function(inSender, inEvent, inMessage) {
		this.error([inSender, inEvent, inMessage]);
	},
	
	gotConnections: function(inSender, inMessage, inType) {
		this.warn(enyo.json.stringify(inMessage));
	},
	
});

enyo.application.cm = new wirc.connectionManager();