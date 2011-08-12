enyo.kind({
	name: 'wirc.ServerPreferencesPanel',
	kind: 'SlidingView',
	
	/*peekWidth: 64,*/
	dragAnywhere: false,
	
	published: {
		setup: ''
	},
	
	components: [
	
		{name: 'header', layoutKind: 'VFlexLayout', kind: 'Header', components: [{name: 'headerText', content: ''}]},
		{kind: 'HeaderShadow'},
		
    	{name: 'scroller', kind: 'Scroller', className: 'scroller', flex: 1, autoVertical: true, components: [
			
			{kind: 'Control', layoutKind: 'VFlexLayout', align: 'center', components: [
			
				{kind: 'RowGroup', width: '400px', caption: 'Connection', components: [
					{name: 'alias', hint: 'Optional', kind: 'Input', autoCapitalize: 'lowercase', components: [{content: 'Alias'}]},
					{name: 'address', hint: 'Required', kind: 'Input', autoCapitalize: 'lowercase', components: [{content: 'Address'}]},
				]},
				
				{kind: 'RowGroup', width: '400px', caption: 'Nick', components: [
					{name: 'nick', hint: 'Required', kind: 'Input', autoCapitalize: 'lowercase'},
				]},
			
			]},
			
		]},
		
		{kind: 'ToolbarShadow'},
		{name: 'toolbar', kind: 'Toolbar', className: 'enyo-toolbar-light toolbar', components: [
			{kind: 'GrabButton'},
			{kind: 'Spacer'},
			{name: 'cancelButton', kind: 'Button', width: '100px', caption: 'Cancel', onclick: 'cancelButton', className: 'enyo-button-negative'},
			{name: 'saveButton',   kind: 'Button', width: '200px', caption: '',       onclick: 'saveButton',   className: 'enyo-button-affirmative'},
			{kind: 'Spacer'},
		]},
		
	],
	
	create: function() {
	    this.inherited(arguments);
		
		if (!this.setup) {
			this.setup = enyo.clone(wirc.Server.defaultSetup);
			this.$.saveButton.setContent('Add');
			this.$.headerText.setContent('Add New Server');
		}
		else {
			this.$.saveButton.setContent('Save');
			this.$.headerText.setContent('Edit Server');
		}
		
		this.$.alias.setValue(this.setup.alias);
		this.$.address.setValue(this.setup.address);
		this.$.nick.setValue(this.setup.nick);
	},
	
	cancelButton: function() {
		this.owner.destroySecondary(true);
	},
	saveButton: function() {
		this.setup.alias = this.$.alias.getValue();
		this.setup.address = this.$.address.getValue();
		this.setup.nick = this.$.nick.getValue();
		
		if (this.setup.id === false) {
			var saved = enyo.application.s.add(this.setup);
		}
		else {
			var saved = enyo.application.s.edit(this.setup);
		}
		
		if (saved) {
			this.owner.destroySecondary(true);
		}
		else {
			this.log('Not Saved!?');
		}
	},
	
});
