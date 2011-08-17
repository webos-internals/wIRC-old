enyo.kind({
	name: 'wirc.connectionManager',
	kind: enyo.Control,
	
	state: null,
	init: false,
	
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
		enyo.asyncMethod(this.$.connectionManager, 'call');
	},
	
	failure: function(inSender, inEvent, inMessage) {
		this.error([inSender, inEvent, inMessage]);
	},
	
	gotConnections: function(inSender, inMessage, inType) {
		this.state = inMessage;
		if (!this.init) {
			this.init = true;
			for (i in enyo.application.s.list)
				if (enyo.application.s.list[i].setup.autoconnect)
					enyo.asyncMethod(enyo.application.s.list[i], 'connect');
		} else {
			if (this.isInternetConnectionAvailable()) {
				for (i in enyo.application.s.list) {
					if (enyo.application.s.list[i].getState() == wirc.Server.stateDisrupted && enyo.application.s.list[i].setup.autoreconnect)
						enyo.asyncMethod(enyo.application.s.list[i], 'connect');
					else if (enyo.application.s.list[i].getState() == wirc.Server.stateNoInternet)
						enyo.application.s.list[i].setState(wirc.Server.stateReady);
				}
			} else {
				for (i in enyo.application.s.list)
					if (enyo.application.s.list[i].setup.autoconnect &&
						enyo.application.s.list[i].getState() == wirc.Server.stateConnected)
						enyo.asyncMethod(enyo.application.s.list[i], 'disrupt');
			}
		}
	},
	
	isInternetConnectionAvailable: function() {
		if (this.state)
			return this.state.isInternetConnectionAvailable
		else
			return false
	},
	
});