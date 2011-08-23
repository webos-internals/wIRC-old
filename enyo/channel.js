enyo.kind({
	name: 'wirc.Channel',
	kind: enyo.Control,
	
	setup: {},
	server: false,
	
	joined: false,
	display: false,
	
	messages: '',
	commands: '',
	
	unread: 0,
	mentions: 0,
	
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
	getNameSimple: function() {
		return this.setup.name.substr(1, this.setup.name.length);
	},
	
	newMessage: function(type, nick, text) {
		var m = new wirc.BufferMessage({
			type: type,
			nick: nick,
			text: text,
			self: (nick == this.server.setup.nicks[0]),
			num: this.messages.length,
			chan: null,
		});
		this.messages.unshift(m);
		enyo.application.e.dispatch('channel-message' + this.getNameSimple());
		
		if (type != 'status') {
			var mm = new wirc.PreviewMessage({
				type: type,
				nick: nick,
				text: text,
				self: (nick == this.server.setup.nicks[0]),
				num: 0,
				chan: this.getNameSimple(),
			});
			enyo.application.e.dispatch('preview-message', mm);
		}
	},
	
	newCommand: function(command) {
		if (this.server.state = wirc.Server.stateConnected) { // || true) { // or true so we can test commands from chrome
			
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
						
					case 'part':
						this.part(val);
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
		enyo.application.pm.call('cmd_me', this.server.setup.id, this.setup.name, message);
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
			enyo.application.pm.call('cmd_msg', this.server.setup.id, this.setup.name, msg);
			this.newMessage('privmsg', this.server.setup.nicks[0], msg);
		}
	},
	
	join: function(join) {
		/* This would only need to be called if joining a previously parted
		channel that still shows up in the list. */ 
		//enyo.application.pm.call('cmd_join', this.server.setup.id, this.setup.name, this.setup.key||null);
		enyo.application.pm.call('cmd_channel_mode', this.server.setup.id, this.setup.name, null);
		this.joined = true;
		this.display = true;
		enyo.application.e.dispatch('main-crud'); // refresh main list
	},
	
	part: function(reason) {
		enyo.application.pm.call('cmd_part', this.server.setup.id, this.setup.name, reason||'woo');
		this.joined = false;
		this.display = false;
		enyo.application.e.dispatch('main-crud'); // refresh main list
	},
	
	completeNick: function(completionText, oldNick) {
		var nicks = [];
		var start = 0;
		for (i in this.setup.nicks) {
			var nick = this.setup.nicks[i]
			var c = nick[0];
			if (c === '!' || c === '.' || c === '@' || c === '%' || c === '+')
				nick = nick.substring(1);
			if (nick.toLowerCase().indexOf(completionText.toLowerCase()) === 0) {
				nicks.push(nick)
				if (nick.toLowerCase() === oldNick)
					start = nicks.length
			}
		}
		if (nicks.length > 0) {
			if (start >= nicks.length)
				start = 0;
			return nicks[start]
		}
	},
	
	sortByNick: function(a,b) {
		if (a > b)
			return 1
		else if (a < b)
			return -1
		else
			return 0
	},
	
	sortByMode: function(a,b) {
		if (a[0] == '@' && b[0] != '@')
			return -1
		else if (a[0] != '@' && b[0] == '@')
			return 1
		else {
			if (a[0] == '%' && b[0] != '%')
				return -1
			else if (a[0] != '%' && b[0] == '%')
				return 1
			else {
				if (a[0] == '+' && b[0] != '+')
					return -1
				else if (a[0] != '+' && b[0] == '+')
					return 1
				else
					return this.sortByNick(a.substring(1).toLowerCase(),b.substring(1).toLowerCase())
			}
		}
	},
	
	sortNicks: function() {
		this.setup.nicks.sort(enyo.bind(this, 'sortByMode'));
	}
	
});
