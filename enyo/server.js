enyo.kind({
	name: 'wirc.Server',
	kind: enyo.Control,
	
	state: 0,
	setup: {},
	
	messages: '',
	commands: '',
	
	channels: '',
	
	unread: 0,
	
	statics: {
		defaultSetup: {
			id:				false,
			alias:			'',
			address:		'',
			port:			'',
			nicks:			[],
			user:			'',
			password:		'',
			realname:   	'',
			ssl:			false,
			autoconnect:	false,
		},
		
		//stateServiceUnavailable:	-3,
		statePifaceUnavailable:		-2,
		stateMaxRetries:			-1,
		stateTimeout:				0,
		stateDisconnected:			0,
		//stateTokenRequest: 		1,
		stateConnecting:			2,
		stateConnected:				3,
		stateDisconnecting:			4,
		stateDisrupted:				5,
		stateError:					6,
	},
	
	constructor: function(setup) {
	    this.inherited(arguments);
		//this.log(setup);
		this.setup = setup;
		// we mix these together so an old cookie will get defaults for things that are new
		// but for some reason, it doesn't appear to work :/
		//enyo.mixin(setup, wirc.Server.defaultSetup);
		this.messages = [];
		this.commands = [];
		this.channels = [];
	},
	
	setState: function(state, e) {
		this.state = state;
		var message = '';
		switch (state) {
			case wirc.Server.statePifaceUnavailable:	message = "Preferred interface is not avaliable!";	break;
			case wirc.Server.stateMaxRetries:			message = "Exceeded max retries, not connecting!";	break;
			case wirc.Server.stateDisconnecting:		message = "Disconnecting...";						break;
			case wirc.Server.stateDisconnected:			message = "Disconnected!";							break;
			case wirc.Server.stateConnecting:			message = "Connecting...";							break;
			case wirc.Server.stateConnected:			message = "Connected!";								break;
			case wirc.Server.stateTimeout:				message = "Connection timed out!";					break;
			case wirc.Server.stateError:				message = "Connection failed (" + e + ")";			break;
		}
		if (message) this.newMessage('status', false, message);
		enyo.application.e.dispatch('server-status' + this.setup.id);
	},
	
	getSetup: function() {
		return this.setup;
	},
	
	newMessage: function(type, nick, text) {
		var m = new wirc.Message({
			type: type,
			nick: nick,
			text: text,
			num: this.messages.length
		});
		this.messages.unshift(m); // for bottomUp flyweight
		//this.messages.push(m); // for generating rows
		enyo.application.e.dispatch('server-message' + this.setup.id);
	},
	
	newCommand: function(command) {
		if (this.state = wirc.Server.stateConnected) { // || true) { // or true so we can test commands from chrome
			
			this.commands.push(command);
			
			var cmdRegExp = new RegExp(/^\/([^\s]*)[\s]*(.*)$/); // move this
			
			var m = cmdRegExp.exec(command);
			if (m) {
				//this.log(m);
				
				var cmd = m[1];
				var val = m[2];
				
				switch (cmd.toLowerCase()) {
					
					case 'join': case 'j':
						var vals = val.split(" ");
						enyo.application.pm.call('cmd_join', this.setup.id, vals[0], vals[1]||null);
						break;
						
					case 'nick':
						//this.setNick(val);
						break;
						
					case 'quit':
						this.disconnect(val);
						break;
						
					default:
						this.newMessage('status', false, 'Unknown Command: ' + cmd);
						break;
				}
			}
		}
		else {
			// not connected
			this.newMessage('status', false, 'Not Connected.');
			// trigger popup?
		}
	},
	
	
	getNick: function(string) {
		var nickParser = new RegExp(/^([^\s]*)!(.*)$/);
		
		if (string.substr(0, 1) == '#')
			return false;
		var m = nickParser.exec(string);
		if (m)
			var nick = m[1];
		else
			var nick = string;
		
		/*
		if (this.nicks.length > 0)
		{
			var nickNum = this.nickHash.get(getNick.toLowerCase());
			if (nickNum != undefined)
			{
				this.nicks[nickNum-1].name = getNick;
				return this.nicks[nickNum-1];
			}
		}
		
		var tmpNick = new ircNick({name:getNick});
		this.nicks.push(tmpNick);
		this.nickHash.set(getNick.toLowerCase(), this.nicks.length);
		*/
		return nick;
	},
	
	getOrCreateChannel:function(name, key) {
		name = this.formatChannelName(name);
		var tmp = this.getChannel(name);
		if (!tmp){
			tmp = new wirc.Channel({name: name, key: key}, this);
			this.channels.push(tmp);
			enyo.application.e.dispatch('main-crud'); // refresh main list
		}
		return tmp;
	},
	joinChannel: function(name, key) {
		name = this.formatChannelName(name);
		var tmp = this.getOrCreateChannel(name, key);
		if (!tmp.joined) {
			tmp.join();
		}
	},
	getChannel: function(name) {
		name = this.formatChannelName(name);
		if (this.channels.length < 1)
			return false;
		for (var c = 0; c < this.channels.length; c++) {
			if (this.channels[c].name == name.toLowerCase())
				return this.channels[c];
		}
		return false;
	},
	getChannels: function() {
		return this.channels;
	},
	formatChannelName: function(name) {
		var channelRegExp = new RegExp(/^([a-zA-Z0-9]{1})(.*)$/); // move this
		if (name.substr(0, 1) == '#')
			return name;
		else if (name.match(channelRegExp) != null)
			return '#'+name;
		else
			return name;
	},
	
	connect: function() {
		this.setState(wirc.Server.stateConnecting);
		try {
	  		return enyo.application.pm.call(
	  			'connect',
	  			this.setup.id,
	  			this.setup.address,
	  			this.setup.port||6667,
	  			false,
	  			this.setup.user||'wircer',
	  			this.setup.password,
	  			this.setup.nicks[0],
	  			this.setup.realname||'wIRCer on HP Touchpad'
			);
		} catch (e) {
			this.setState(wirc.Server.stateError, e);
			return false;
		}
	},
	connected: function() {
		this.setState(wirc.Server.stateConnected);
	},
	disconnect: function() {
		var reason = "BECAUSE I'M TESTING!";
		this.setState(wirc.Server.stateDisconnecting);
		enyo.application.pm.call('cmd_quit', this.setup.id, reason);
		this.setState(wirc.Server.stateDisconnected);
	},
	
});
