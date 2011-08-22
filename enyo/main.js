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
		
		{name: 'previews', kind: 'FlyweightList', transitionKind: "enyo.transitions.Fade", height: '125px', bottomUp: true, onSetupRow: 'setupPreview', className: 'messages', components: [
			{name: 'preview', kind: 'wirc.MessageItem'}
	    ]},
	    
	],
	
	initComponents: function() {
	    this.inherited(arguments);
		this.createBlankPanel();
		enyo.application.m.setController(this);
		enyo.setFullScreen(enyo.application.p.get('fullscreen'));
		this.addClass('messages-panel');
		this.addClass(enyo.application.p.get('listStyle'));
		this.applyStyle('background-color', enyo.application.p.get('colorBackground'));
		this.previewListener = enyo.bind(this, 'previewRefresh');
		this.previewAreaListener = enyo.bind(this, 'togglePreviewArea');
		enyo.application.e.listen('channel-message', this.previewListener);
		//enyo.application.e.listen('preview-toggle', this.previewAreaListener);
		this.$.previews.setShowing(enyo.application.p.get('showPreview'));
	},
	
	wakeup: function() {
		this.visible = true;
	},
	sleep: function() {
		this.visible = false;
	},
	
	previewRefresh: function() {
		enyo.job('refreshPreviewMessages', enyo.bind(this, 'refreshPreviewMessages'), 5);
	},
	refreshPreviewMessages: function() {
		this.$.previews.refresh();
	},
	setupPreview: function(inSender, inIndex) {
		if (enyo.application.m.messages[inIndex]) {
			enyo.application.m.messages[inIndex].setupItem(this.$.preview, true, true);
			return true;
		}
		return false;
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
	
	destroy: function() {
		enyo.application.e.stopListening('channel-message', this.previewListener);
		enyo.application.e.stopListening('preview-toggle', this.previewAreaListener);
		return this.inherited(arguments);
	},
	
	menuPrefs: function() {
		this.createPanel({name: 'preferences', kind: 'wirc.PreferencesPanel'});
	},
	
	togglePreviewArea: function() {
		if (this.$.previews.showing) {
			this.$.previews.setShowing(false);
			enyo.application.p.set('showPreview', false);
		} else {
			this.$.previews.setShowing(true);
			enyo.application.e.dispatch('channel-message');
			enyo.application.p.set('showPreview', true);
		}
	}
	
});
