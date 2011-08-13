enyo.kind({
	name: 'wirc.MainPanel',
	kind: 'SlidingView',
	
	width: '320px',
	fixedWidth: true,
	
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
			{kind: 'Button', content: 'Add Server', onclick: 'addServerButton'},
			{kind: 'Button', components: [{kind: 'Image', src: 'enyo/images/button-prefs.png', style: 'margin: -10px;'}], onclick: 'preferencesButton'}
		]}
		
	],
	
	initComponents: function() {
	    this.inherited(arguments);
		this.addClass('main-panel');
		this.buildList();
		enyo.application.e.listen('main-crud', enyo.bind(this, 'updateList'));
	},
	
	addServerButton: function() {
		this.owner.createPanel({name: 'server-add', kind: 'wirc.ServerPreferencesPanel'});
	},
	preferencesButton: function() {
		this.owner.createPanel({name: 'preferences', kind: 'wirc.PreferencesPanel'});
	},
	
	buildList: function() {
		//this.log();
		if (enyo.application.s && enyo.application.s.list) {
			var servers = enyo.application.s.getAll();
			for (var s = 0; s < servers.length; s++) {
				//this.log('new-create-channels', 'server:', servers[s].setup.alias, 'channels:', servers[s].channels.length);
				this.$.list.createComponents([
					{name: 'server-row-' + servers[s].setup.id, kind: 'wirc.MainServerItem', server: servers[s]},
					{name: 'server-children-' + servers[s].setup.id, serverId: servers[s].setup.id, className: 'server-children'},
				], {owner: this});
			}
		}
		this.$.list.render();
	},
	
	updateList: function() {
		//this.log();
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
		// rebuild
		//this.$.list.destroyControls();
		//this.buildList();
	},
	
	
});

