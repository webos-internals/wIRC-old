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
			//{caption: 'Preferences', onclick: 'menuPrefs'},
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
	},
	
	wakeup: function() {
		this.visible = true;
	},
	sleep: function() {
		this.visible = false;
	},
	
	createPanel: function(component) {
		if (component.name) {
			this.destroyBlankPanel();
			this.destroySecondary(false);
			this.secondary = component.name;
			this.$.sp.createComponent(component, {owner: this});
			this.$.sp.render();
		}
		else {
			this.error('no component name', component);
		}
	},
	destroySecondary: function(createBlank) {
		if (this.$[this.secondary]) this.$[this.secondary].destroy();
		if (createBlank) {
			this.createBlankPanel();
			this.$.sp.render();
		}
	},
	
	createBlankPanel: function() {
		this.$.sp.createComponent(this.getBlankPanel(), {owner: this});
	},
	getBlankPanel: function() {
		return {name: 'blank', kind: 'SlidingView', flex: 1, peekWidth: 320, className: 'blank-slider', dragAnywhere: false, components: [
			{kind: enyo.VFlexBox, align: 'center', pack: 'center', width: '100%', height: '100%', components: [
				{name: 'updateText', className: 'text', allowHtml: true, content: 'x'}
			]},
		]};
	},
	destroyBlankPanel: function() {
		if (this.$.blank) this.$.blank.destroy();
	},
	
	menuPrefs: function() {
		//this.$.prefs.pop();
	},
	
});

