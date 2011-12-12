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
		
		{name: 'sp', kind: 'enyo.SlidingPane', flex: 1, wideWidth: 800, components: [
		
			{name: 'main', kind: 'wirc.MainPanel'},
			
		]},
		
		{name: 'preview', kind: 'wirc.MainPreview'},
	],
	
	initComponents: function() {
	    this.inherited(arguments);
		enyo.application.m.setController(this);
		enyo.application.p.buildCss(document);
		enyo.setFullScreen(enyo.application.p.get('fullscreen'));
		this.$.preview.setDisplay(enyo.application.p.get('showPreview'));
		this.addClass('main');
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
			this.destroySecondary();
			this.secondary = component.name;
			enyo.application.e.dispatch('secondary-panel');
			this.$.sp.createComponent(component, {owner: this});
			this.$.sp.render();
			// we need a way to know if "wideWidth" is in effect to do this
			//this.$.sp.selectViewByName(this.secondary); // use at pre3 res
		}
		else {
			this.error('no component name', component);
		}
	},
	destroySecondary: function() {
		if (this.$[this.secondary]) this.$[this.secondary].destroy();
		this.secondary = '';
		enyo.application.e.dispatch('secondary-panel');
		//this.$.sp.selectViewByName('main'); // use at pre3 res
	},
	
	menuPrefs: function() {
		this.createPanel({name: 'preferences', kind: 'wirc.PreferencesPanel'});
	},
	
	togglePreviewArea: function() {
		this.$.preview.toggleDisplay();
	}
	
});
