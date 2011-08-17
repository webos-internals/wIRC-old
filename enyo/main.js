enyo.kind({
	name: 'wirc.Main',
	kind: enyo.VFlexBox,
	
	secondary: '',
	visible: false,
	
	components: [
		
		{kind: 'wirc.Plugin'},
		
		{kind: 'ApplicationEvents', onWindowActivated: 'wakeup', onWindowDeactivated: 'sleep'},
		
		{kind: 'AppMenu', components: [
			{kind: 'EditMenu'},
			{caption: 'Preferences', onclick: 'menuPrefs'},
			//{caption: 'Debug', onclick: 'menuDebug'},
		]},
		
		//{name: 'prefs', kind: 'wirc.Preferences'},
		
		{name: 'sp', kind: 'SlidingPane', flex: 1, wideWidth: 800, components: [
		
			{name: 'main', kind: 'wirc.MainPanel'},
			
		]},
	],
	
	initComponents: function() {
	    this.inherited(arguments);
		this.createBlankPanel();
		enyo.application.m.setController(this);
		enyo.setFullScreen(enyo.application.p.get('fullscreen'));
	},
	
	wakeup: function() {
		this.visible = true;
	},
	sleep: function() {
		this.visible = false;
	},
	
	createPanel: function(component) {
		if (component.name) {
			if (this.secondary == component.name)
				return
			this.destroyBlankPanel();
			this.destroySecondary(false);
			this.secondary = component.name;
			enyo.application.e.dispatch('secondary-panel');
			this.$.sp.createComponent(component, {owner: this});
			this.$.sp.render();
			//this.$.sp.selectViewByName(this.secondary); // use at pre3 res
		}
		else {
			this.error('no component name', component);
		}
	},
	destroySecondary: function(createBlank) {
		if (this.$[this.secondary]) this.$[this.secondary].destroy();
		this.secondary = '';
		enyo.application.e.dispatch('secondary-panel');
		if (createBlank) {
			this.createBlankPanel();
			this.$.sp.render();
		}
		//this.$.sp.selectViewByName('main'); // use at pre3 res
	},
	
	createBlankPanel: function() {
		this.$.sp.createComponent(this.getBlankPanel(), {owner: this});
	},
	getBlankPanel: function() {
		return {name: 'blank', kind: 'SlidingView', flex: 1, peekWidth: 320, className: 'blank-slider', dragAnywhere: false, components: [
			{kind: enyo.VFlexBox, align: 'center', pack: 'center', width: '100%', height: '100%', components: [
				//{name: 'updateText', className: 'text', allowHtml: true, content: 'x'}
			]},
		]};
	},
	destroyBlankPanel: function() {
		if (this.$.blank) this.$.blank.destroy();
	},
	
	menuPrefs: function() {
		this.createPanel({name: 'preferences', kind: 'wirc.PreferencesPanel'});
	},
	
});

