enyo.kind({
	name: 'wirc.Servers',
	kind: enyo.Control,
	
	nextId: 0,	// unique server id counter
	list: [],	// array of servers
	listr: {},	// reverse-lookup (id -> list key)
	
	lsvar: enyo.fetchAppInfo().id + '_servers', // variable to use for localStorage
	
	create: function() {
	    this.inherited(arguments);
		this.load();
	},
	
	getAll: function() {
		return this.list;
	},
	get: function(index) { // basically getFromKey
		return this.list[index];
	},
	getFromId: function(id) {
		// this uses the lookup
		return this.list[this.listr[id]];
		/* // this loops the server array each time
		if (this.list && this.list.length > 0) {
			for(var s = 0; s < this.list.length; s++) {
				if (this.list[s].setup.id == id)
					return this.list[s];
			}
		}*/
		return false;
	},
	getKeyFromId: function(id) {
		// this uses the lookup
		return this.listr[id];
		/* // this loops the server array each time
		if (this.list && this.list.length > 0) {
			for(var s = 0; s < this.list.length; s++) {
				if (this.list[s].setup.id == id)
					return s;
			}
		}
		*/
		return false;
	},
	
	load: function() {
		this.list = [];
		this.listr = {};
		if (localStorage && localStorage[this.lsvar]) {
			var tmp = enyo.json.parse(localStorage[this.lsvar]);
			this.nextId = tmp.nextId;
			if (tmp.servers && tmp.servers.length > 0) {
				for(var s = 0; s < tmp.servers.length; s++) {
					var tmps = new wirc.Server(tmp.servers[s]);
					this.listr[tmps.setup.id] = this.list.length;
					this.list.push(tmps);
				}
			}
		}
	},
	save: function() {
		if (localStorage) {
			var tmp = {nextId: this.nextId, servers: []};
			if (this.list && this.list.length > 0) {
				for(var s = 0; s < this.list.length; s++) {
					tmp.servers.push(this.list[s].getSetup());
				}
			}
			localStorage[this.lsvar] = enyo.json.stringify(tmp);
		}
	},
	
	add: function(setup) {
		setup.id = this.nextId;
		//this.log(setup);
		this.nextId++;
		var tmp = new wirc.Server(setup);
		this.listr[tmp.setup.id] = this.list.length;
		this.list.push(tmp);
		this.save();
		enyo.application.e.dispatch('main-crud');
		return true;
	},
	edit: function(setup) {
		//this.log(setup);
		var s = this.getKeyFromId(setup.id);
		this.list[s].setup = setup;
		this.save();
		enyo.application.e.dispatch('server-status' + setup.id);
		return true;
	},
	remove: function(id) {
		//this.log(id);
		var s = this.getKeyFromId(id);
		if (this.list[s]) {
			this.list.splice(s, 1);
			this.listr = {};
			for (var s = 0; s < this.list.length; s++) {
				this.listr[this.list[s].setup.id] = s;
			}
			this.save();
			enyo.application.e.dispatch('main-crud');
			return true;
		}
		else {
			return false;
		}
	},
	
});

enyo.application.s = new wirc.Servers();
