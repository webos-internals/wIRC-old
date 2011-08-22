enyo.kind({
	name: 'wirc.MainPanel',
	kind: 'SlidingView',
	
	width: '300px',
	fixedWidth: true,
	
	list: [],
	
	components: [
		
		{kind: wi.Header, version: 'enyo-v' + enyo.fetchAppInfo().version, random: [
			{weight: 30, tagline: 'The webOS IRC Client'},
			{weight: 30, tagline: 'Mobile IRC Done Right'},
			{weight: 10, tagline: 'Finally in the catalog!'},
			{weight:  8, tagline: 'It\'s pronounced "werk"'},
			{weight:  8, tagline: 'Whistle while you wIRC'},
			{weight:  8, tagline: 'Now you can IRC from the crapper'},
			{weight:  8, tagline: 'Now you can IRC from the bar'},
			{weight:  8, tagline: 'Damn you autocorrect!', title: 'Wire'},
			{weight:  2, tagline: 'In Windows on Cygwin'},
			{weight:  2, tagline: 'You can, but can\'t'},
			{weight:  2, tagline: 'Random Taglines Are Awesome'}
		]},
		{kind: 'HeaderShadow'},
		
		{name: 'scroller', kind: 'Scroller', flex: 1, autoVertical: true, horizontal: false, autoHorizontal: false, components: [
			{name: 'list', className: 'main-list'},
		]},
		
		{kind: 'ToolbarShadow'},
		{name: 'toolbar', kind: 'Toolbar', className: 'enyo-toolbar-light', components: [
			{icon: 'enyo/images/toolbar-server-add-down.png', onclick: 'addServerButton'},
			{icon: 'enyo/images/toolbar-prefs-down.png', onclick: 'preferencesButton'},
			{icon: 'enyo/images/preview-down.png', onclick: 'previewButton'}
		]}
		
	],
	
	initComponents: function() {
	    this.inherited(arguments);
		this.addClass('main-panel');
		this.buildList();
		enyo.application.e.listen('main-crud', enyo.bind(this, 'updateList'));
		enyo.application.e.listen('main-list-up', enyo.bind(this, 'listUpEvent'));
		enyo.application.e.listen('main-list-down', enyo.bind(this, 'listDownEvent'));
	},
	
	addServerButton: function() {
		this.owner.createPanel({name: 'server-add', kind: 'wirc.ServerPreferencesPanel'});
	},
	preferencesButton: function() {
		this.owner.createPanel({name: 'preferences', kind: 'wirc.PreferencesPanel'});
	},
	previewButton: function() {
		enyo.application.m.controller.togglePreviewArea();
	},
	
	buildList: function() {
		//this.log();
		this.list = [];
		if (enyo.application.s && enyo.application.s.list) {
			var servers = enyo.application.s.getAll();
			for (var s = 0; s < servers.length; s++) {
				//this.log('new-create-channels', 'server:', servers[s].setup.alias, 'channels:', servers[s].channels.length);
				this.list.push('server-row-' + servers[s].setup.id);
				this.$.list.createComponents([
					{name: 'server-row-' + servers[s].setup.id, kind: 'wirc.MainServerItem', server: servers[s]},
					{name: 'server-children-' + servers[s].setup.id, serverId: servers[s].setup.id, className: 'server-children'},
				], {owner: this});
			}
		}
		this.$.list.render();
	},
	
	getSelected: function() {
		return this.owner.secondary;
	},
	
	listUpEvent: function() {
		if (this.list && this.list.length > 0) {
			//this.log('up');
			var cur = this.listIndexSelected();
			if (cur !== false) {
				var prev = cur - 1;
				if (prev < 0) prev = this.list.length - 1;
				this.$[this.list[prev]].doClick();
			}
		}
	},
	listDownEvent: function() {
		if (this.list && this.list.length > 0) {
			//this.log('down');
			var cur = this.listIndexSelected();
			if (cur !== false) {
				var next = cur + 1;
				if (next >= this.list.length) next = 0;
				this.$[this.list[next]].doClick();
			}
		}
	},
	listIndexSelected: function() {
		if (this.list && this.list.length > 0) {
			for (var r = 0; r < this.list.length; r++) {
				if (this.$[this.list[r]].hasClass('enyo-item-selected')) {
					return r;
				}
			}
			return -1;
		} else {
			return false;
		}
	},
	
	updateList: function() {
		//this.log();
		this.list = [];
		if (enyo.application.s && enyo.application.s.list) {
			var servers = enyo.application.s.getAll();
			var serverControls = this.$.list.getControls();
			
			// check for removed server rows (and update those which arent removed)
			for (var sc = 0; sc < serverControls.length; sc++) {
				if (serverControls[sc].server) {
					var serverMatch = false;
					for (var s = 0; s < servers.length; s++) {
						if (serverControls[sc].server == servers[s]) serverMatch = true;
					}
					if (!serverMatch) {
						this.$['server-children-' + serverControls[sc].server.setup.id].destroy();
						serverControls[sc].destroy();
					}
					else if (serverControls[sc].update) serverControls[sc].update();
				}
			}
			
			for (var s = 0; s < servers.length; s++) {
				this.list.push('server-row-' + servers[s].setup.id);
				
				// check for new server rows to create
				var serverMatch = false;
				for (var sc = 0; sc < serverControls.length; sc++) {
					if (serverControls[sc].server && serverControls[sc].server == servers[s]) serverMatch = true;
				}
				if (!serverMatch) {
					this.$.list.createComponents([
						{name: 'server-row-' + servers[s].setup.id, kind: 'wirc.MainServerItem', server: servers[s]},
						{name: 'server-children-' + servers[s].setup.id, serverId: servers[s].setup.id, className: 'server-children'},
					], {owner: this});
				}
				else {
					var channels = servers[s].getChannels();
					var channelControls = this.$['server-children-' + servers[s].setup.id].getControls();
					
					// check for removed channel rows for this server (and update those which arent removed)
					for (var cc = 0; cc < channelControls.length; cc++) {
						var channelMatch = false;
						for (var c = 0; c < channels.length; c++) {
							if (channels[c].display && channelControls[cc].channel == channels[c]) channelMatch = true;
						}
						if (!channelMatch) {
							channelControls[cc].destroy();
						}
						else if (channelControls[cc].update) channelControls[cc].update();
					}
					
					// check for new channel rows to create for this server
					for (var c = 0; c < channels.length; c++) {
						if (channels[c].display) {
							this.list.push('channel-row-' + channels[c].getNameSimple());
							var channelMatch = false;
							for (var cc = 0; cc < channelControls.length; cc++) {
								if (channelControls[cc].channel && channelControls[cc].channel == channels[c]) channelMatch = true;
							}
							if (!channelMatch) {
								this.$['server-children-' + servers[s].setup.id].createComponents([
									{name: 'channel-row-' + channels[c].getNameSimple(), kind: 'wirc.MainChannelItem', channel: channels[c]},
								], {owner: this});
							}
						}
					}
					
					//this.$['server-children-' + servers[s].setup.id].render();
				} 
			}
		}
		this.$.list.render();
		//this.log(this.list);
		// rebuild
		//this.$.list.destroyControls();
		//this.buildList();
	},
	
	
});
