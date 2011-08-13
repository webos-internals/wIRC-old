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
			
				{kind: 'RowGroup', width: '400px', caption: 'Server Information', components: [
					{name: 'alias', hint: 'Optional', kind: 'Input', autoCapitalize: 'lowercase', components: [{content: 'Alias'}]},
					{name: 'address', hint: 'Required', kind: 'Input', autoCapitalize: 'lowercase', components: [{content: 'Address'}]},
					{name: 'port', hint: 'Optional', kind: 'Input', autoCapitalize: 'lowercase', components: [{content: 'Port'}]},
					{name: 'user', hint: 'Optional', kind: 'Input', autoCapitalize: 'lowercase', components: [{content: 'User'}]},
					{name: 'password', hint: 'Optional', kind: 'PasswordInput', autoCapitalize: 'lowercase', components: [{content: 'Password'}]},
					{name: 'ssl', kind: 'ToggleButton', disabled: true, components: [{flex: 1}, {content: 'SSL'}]},
				]},
				
				{kind: 'RowGroup', width: '400px', caption: 'User Information', components: [
					{name: 'realname', hint: 'Optional', kind: 'Input', autoCapitalize: 'lowercase', components: [{content: 'Real Name'}]},
					{name: 'nick1', hint: 'Required', kind: 'Input', autoCapitalize: 'lowercase', components: [{content: 'Primary Nick Name'}]},
					{name: 'nick2', hint: 'Required', kind: 'Input', autoCapitalize: 'lowercase', components: [{content: 'Secondary Nick Name'}]},
					{name: 'nick3', hint: 'Required', kind: 'Input', autoCapitalize: 'lowercase', components: [{content: 'Tertiary Nick Nname'}]},
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
		this.$.nick1.setValue(this.setup.nick1);
		this.$.nick2.setValue(this.setup.nick2);
		this.$.nick3.setValue(this.setup.nick3);
		this.$.port.setValue(this.setup.port);
		this.$.user.setValue(this.setup.user);
		this.$.password.setValue(this.setup.password);
		this.$.realname.setValue(this.setup.realname);
		this.$.ssl.setState(this.setup.ssl);
	},
	
	cancelButton: function() {
		this.owner.destroySecondary(true);
	},
	saveButton: function() {
		this.setup.alias = this.$.alias.getValue();
		this.setup.address = this.$.address.getValue();
		this.setup.nick1 = this.$.nick1.getValue();
		this.setup.nick2 = this.$.nick2.getValue();
		this.setup.nick3 = this.$.nick3.getValue();
		this.setup.port = this.$.port.getValue();
		this.setup.user = this.$.user.getValue();
		this.setup.password = this.$.password.getValue();
		this.setup.realname = this.$.realname.getValue();
		this.setup.ssl = this.$.ssl.getState();
		
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
