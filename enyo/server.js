enyo.kind({
	name: 'wirc.Server',
	kind: enyo.Control,
	
	state: 0,
	setup: {},
	
	messages: '',
	commands: '',
	
	channels: '',
	nicks: [],
	
	self: null,
	
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
			autoreconnect:	false,
			onconnect:		[],
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
		stateNoInternet:			7,
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
			case wirc.Server.statePifaceUnavailable:	message = "Preferred interface is not avaliable!";			break;
			case wirc.Server.stateMaxRetries:			message = "Exceeded max retries, not connecting!";			break;
			case wirc.Server.stateDisconnecting:		message = "Disconnecting...";								break;
			case wirc.Server.stateDisconnected:			message = "Disconnected!";									break;
			case wirc.Server.stateConnecting:			message = "Connecting...";									break;
			case wirc.Server.stateConnected:			message = "Connected!";										break;
			case wirc.Server.stateTimeout:				message = "Connection timed out!";							break;
			case wirc.Server.stateError:				message = "Connection failed (" + e + ")";					break;
			case wirc.Server.stateNoInternet:			message = "Connection failed, no internet connection";		break;
			case wirc.Server.stateDisrupted:			message = "Connection disrupted, no internet connection";	break;
		}
		if (message) this.newMessage('status', false, message);
		enyo.application.e.dispatch('server-status' + this.setup.id);
	},
	
	getState: function() {
		return this.state;
	},
	
	getSetup: function() {
		return this.setup;
	},
	
	newMessage: function(type, nick, text) {
		var m = new wirc.Message({
			type: type,
			nick: nick,
			text: text,
			num: this.messages.length,
		});
		this.messages.unshift(m); // for bottomUp flyweight
		//this.messages.push(m); // for generating rows
		enyo.application.e.dispatch('server-message' + this.setup.id);
		
		/*// used to test
		var mm = new wirc.Message({
			type: type,
			nick: nick,
			text: text,
			self: false,
			num: 0,
			chan: this.setup.alias,
		});
		enyo.application.e.dispatch('preview-message', mm);*/
	},
	
	newCommand: function(command) {
		if (this.state = wirc.Server.stateConnected) { // || true) { // or true so we can test commands from chrome
			
			this.commands.push(command);
			
			var cmdRegExp = new RegExp(/^\/([^\s]*)[\s]*(.*)$/); // move this
			var twoValRegExp = new RegExp(/^([^\s]*)[\s]{0,1}(.*)$/); // move this
			
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
						
					case 'msg':
						var tmpMatch = twoValRegExp.exec(val);
						if (tmpMatch) {
							var n = Math.ceil(tmpMatch[2].length / 255);
							var i = 0;
							var msg = '';
							for (;i<n;i++) {
								if (i < (n - 1))
									msg = tmpMatch[2].substring(i * 255, (i + 1) * 255)
								else
									msg = tmpMatch[2].substring(i * 255);
								enyo.application.pm.call('cmd_msg', this.setup.id, tmpMatch[1], msg||null);
								this.newMessage('privmsg', this.self, msg); // Fix, dont use nicks directly
								/*
								 * We need to direct the above message to the correct query window if necessary
								 */
							}
						}
						break;
						
					case 'quote':
						enyo.application.pm.call('send_raw', this.setup.id, val);
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
		
		var m = nickParser.exec(string);
		if (m)
			var nick = m[1];
		else
			var nick = string;
		
		if (this.nicks[nick])
			return this.nicks[nick];
		
		this.nicks[nick] = new wirc.Nick({name:nick});

		return this.nicks[nick];
	},
	
	getOrCreateChannel:function(name, key) {
		name = this.formatChannelName(name);
		var tmp = this.getChannel(name);
		if (!tmp){
			tmp = new wirc.Channel({name: name, key: key, topic: '', mode: ''}, this);
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
		if (enyo.application.cm.isInternetConnectionAvailable()) {
			this.setState(wirc.Server.stateConnecting);
			try {
				this.nicks = {}; // XXX: WHY THE FUCK IS THIS NEEDED?
				this.self = this.setup.nicks[0];
		  		return enyo.application.pm.call(
		  			'connect',
		  			this.setup.id,
		  			this.setup.address,
		  			this.setup.port||6667,
		  			this.setup.ssl ? 1 : 0,
		  			this.setup.user||'wircer',
		  			this.setup.password,
		  			this.self,
		  			this.setup.realname||'wIRCer on HP Touchpad'
				);
			} catch (e) {
				this.setState(wirc.Server.stateError, e);
			}
		} else {
			this.setState(wirc.Server.stateNoInternet);
		}
	},
	connected: function() {
		this.setState(wirc.Server.stateConnected);
		if (this.setup.onconnect && this.setup.onconnect.length > 0) {
			for (var c = 0; c < this.setup.onconnect.length; c++) {
				if (this.setup.onconnect[c].charAt(0) != '/') 
					var ocjob = enyo.bind(this, 'newCommand', '/' + this.setup.onconnect[c]);
				else
					var ocjob = enyo.bind(this, 'newCommand', this.setup.onconnect[c]);
				enyo.job('onconnect-' + this.setup.id + '-' + c, ocjob, 1);
			}
		}
	},
	disconnect: function() {
		/*
		 * This is called when a user clicks the "disconnect" button while
		 * a internet connection is still valid. It sends the quit command
		 * to the IRC server and users will see a quit reason.
		 */
		var reason = "BECAUSE I'M TESTING!";
		this.setState(wirc.Server.stateDisconnecting);
		enyo.application.pm.call('cmd_quit', this.setup.id, reason);
		this.setState(wirc.Server.stateDisconnected);
	},
	disrupt: function() {
		/*
		 * This is called when there is no valid internet connection and you
		 * want to cleanup the connection on the plugin/client side. This does
		 * not send any commands to the IRC server.
		 */
		var reason = "BECAUSE I'M TESTING!";
		enyo.application.pm.call('disconnect', this.setup.id);
		this.setState(wirc.Server.stateDisrupted);
	},
	
	removeNick: function(nick) {
		for (var i in this.channels)
			this.channels[i].removeNick(nick);
	}
	
});
