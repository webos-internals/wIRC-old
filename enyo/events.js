/*

main-crud: called when the main list needs updating
secondary-panel: called when the secondary panel is changed

server-status{id}: called when the server info changes like status/setup/etc
server-message{id}: called to update server messages display

channel-status{name}: called to update the channel item in the main list
channel-message{name}: called to update chat messages display
preview-message: called when any channel has a new message, the message item is sent to the callback

preferences-saved: called when preferences are saved.

main-list-up: keyboard event
main-list-down: keyboard event

*/

enyo.kind({
	name: 'wirc.EventDispatcher',
	kind: enyo.Control,
	
	evnts: {},
	
	listen: function(name, callback) {
		//this.log(name);
		if (this.evnts[name])
			this.evnts[name].push(callback);
		else
			this.evnts[name] = [callback];
	},
	stopListening: function(name, callback) {
		if (this.evnts[name]) {
			var e = this.evnts[name].indexOf(callback);
			if (e > -1) {
				this.evnts[name].splice(e, 1);
			}
		}
	},
	
	hasListeners: function(name) {
		if (this.evnts[name] && this.evnts[name].length > 0) return true;
		else return false;
	},
	dispatch: function(name) {
		var args = Array.prototype.slice.call(arguments);
		args.shift();
		if (this.hasListeners(name)) {
			//this.log(name, this.evnts[name].length);
			for (var e = 0; e < this.evnts[name].length; e++) {
				if (this.evnts[name][e]) this.evnts[name][e].apply(null, args);
			}
		}
		return true;
	},
	
	clear: function(name) {
		this.evnts[name] = [];
		return true;
	},
	
});

enyo.application.e = new wirc.EventDispatcher();
