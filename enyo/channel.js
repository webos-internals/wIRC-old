enyo.kind({
	name: 'wirc.Channel',
	kind: enyo.Control,
	
	setup: {},
	server: false,
	
	joined: false,
	
	messages: '',
	commands: '',
	
	statics: {
	},
	
	constructor: function(setup, server) {
	    this.inherited(arguments);
		//this.log(setup);
		this.setup = setup;
		this.server = server;
		this.messages = [];
		this.commands = [];
	},
	
	getSetup: function() {
		return this.setup;
	},
	
	newMessage: function(type, nick, text) {
		var m = new wirc.Message({
			type: type,
			nick: nick,
			text: text,
		});
		this.messages.unshift(m); // for bottomUp flyweight
		//this.messages.push(m); // for generating rows
		enyo.application.e.dispatch('channel-message' + this.setup.name);
	},
	
	newCommand: function(command) {
		if (this.state = wirc.Server.stateConnected || true) { // or true so we can test commands from chrome
			
			this.commands.push(command);
			
			var cmdRegExp = new RegExp(/^\/([^\s]*)[\s]*(.*)$/); // move this
			
			var m = cmdRegExp.exec(command);
			if (m) {
				//this.log(m);
				
				var cmd = m[1];
				var val = m[2];
				
				switch (cmd.toLowerCase()) {
					
					case 'me':
						this.me(val);
						break;
						
					default:
						this.server.newCommand(command);
						break;
				}
			}
			else {
				this.msg(command);
			}
		}
		else {
			// not connected
			this.newMessage('status', false, 'Not Connected.');
			// trigger popup?
		}
	},
	
	me: function(message) {
		enyo.application.p.call('cmd_me', this.server.setup.id, this.setup.name, message);
		this.newMessage('action', this.server.setup.nick, message);
	},
	
	msg: function(message) {
		var n = Math.ceil(message.length / 255);
		var msg = '';
		for (var i = 0; i < n; i++) {
			if (i < (n - 1)) {
				msg = message.substring(i * 255, (i + 1) * 255)
			}
			else {
				msg = message.substring(i * 255);
			}
			enyo.application.p.call('cmd_msg', this.server.setup.id, this.setup.name, msg);
			this.newMessage('privmsg', this.server.setup.nick, msg);
		}
	},
	
	join: function() {
		enyo.application.p.call('cmd_join', this.server.setup.id, this.setup.name, (this.setup.key ? this.setup.key: null));
		enyo.application.p.call('cmd_channel_mode', this.server.setup.id, this.setup.name,  null);
		this.joined = true;
	}
});
