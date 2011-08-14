enyo.kind({
	name: 'wirc.PreferencesPanel',
	kind: 'SlidingView',
	
	/*peekWidth: 64,*/
	dragAnywhere: false,
	
	prefs: {
		fullscreen: false,
	},
	
	components: [
	
		{name: 'header', layoutKind: 'VFlexLayout', kind: 'Header', style: 'margin-bottom: -1px;', components: [{content: 'Preferences'}]},
		{name: 'tabs1', kind: 'TabGroup', onChange: 'tabToggle', value: 'general', components: [
			{content: 'General',		value: 'general'},
			{content: 'Messages',		value: 'messages'},
			{content: 'Events',			value: 'events'},
			{content: 'Notifications',	value: 'notifications'},
		]},
		{name: 'tabs2', kind: 'TabGroup', onChange: 'tabToggle', value: '', components: [
			{content: 'DCC',			value: 'dcc'},
			{content: 'Key Bindings',	value: 'keybinds'},
			{content: 'Aliases',		value: 'aliases'},
			{content: 'Other',			value: 'other', disabled: true},
		]},
		{kind: 'HeaderShadow'},
		
    	{name: 'scroller', kind: 'Scroller', className: 'scroller', flex: 1, autoVertical: true, components: [
			
			{name: 'generalTab', layoutKind: 'VFlexLayout', align: 'center', components: [
				{kind: 'RowGroup', width: '400px', caption: 'Appearance', components: [
				
					{name: 'fullscreen', kind: 'ToggleButton', components: [{flex: 1}, {content: 'Full Screen'}]},
					
				]},
			]},
			
			{name: 'messagesTab', layoutKind: 'VFlexLayout', align: 'center', components: [
				{kind: 'RowGroup', width: '400px', caption: 'row heading', components: [
				
					{name: 'focusInput', kind: 'ToggleButton', components: [{flex: 1}, {content: 'Auto-Focus Input'}]},
					
				]},
			]},
			
			{name: 'eventsTab', layoutKind: 'VFlexLayout', align: 'center', components: [
				{kind: 'RowGroup', width: '400px', caption: 'row heading', components: [
				
					{kind: 'Item', content: 'events'}
					
				]},
			]},
			
			{name: 'notificationsTab', layoutKind: 'VFlexLayout', align: 'center', components: [
				{kind: 'RowGroup', width: '400px', caption: 'row heading', components: [
				
					{kind: 'Item', content: 'notifications'}
					
				]},
			]},
			
			{name: 'dccTab', layoutKind: 'VFlexLayout', align: 'center', components: [
				{kind: 'RowGroup', width: '400px', caption: 'row heading', components: [
				
					{kind: 'Item', content: 'dcc'}
					
				]},
			]},
			
			{name: 'keybindsTab', layoutKind: 'VFlexLayout', align: 'center', components: [
				{kind: 'RowGroup', width: '400px', caption: 'row heading', components: [
				
					{kind: 'Item', content: 'keybinds'}
					
				]},
			]},
			
			{name: 'aliasesTab', layoutKind: 'VFlexLayout', align: 'center', components: [
				{kind: 'RowGroup', width: '400px', caption: 'row heading', components: [
				
					{kind: 'Item', content: 'aliases'}
					
				]},
			]},
			
			{name: 'otherTab', layoutKind: 'VFlexLayout', align: 'center', components: [
				{kind: 'RowGroup', width: '400px', caption: 'row heading', components: [
				
					{kind: 'Item', content: 'other'}
					
				]},
			]},
			
		]},
		
		{kind: 'ToolbarShadow'},
		{name: 'toolbar', kind: 'Toolbar', className: 'enyo-toolbar-light toolbar', components: [
			{kind: 'GrabButton'},
			{kind: 'Spacer'},
			{name: 'cancelButton', kind: 'Button', width: '100px', caption: 'Cancel', onclick: 'cancelButton', className: 'enyo-button-negative'},
			{name: 'saveButton',   kind: 'Button', width: '200px', caption: 'Save',   onclick: 'saveButton',   className: 'enyo-button-affirmative'},
			{kind: 'Spacer'},
		]},
		
	],
	
	create: function() {
	    this.inherited(arguments);
		this.tabToggle();
		this.prefs = enyo.application.p.prefs;
		
		// do the loading
		// general
		this.$.fullscreen.setState(this.prefs.fullscreen);
		
		// messages
		this.$.focusInput.setState(this.prefs.focusInput);
	},
	
	tabToggle: function(inSender, inValue) {
		if (inSender) {
			if (inSender.name == 'tabs1') {
				var show = this.$.tabs1.getValue() + 'Tab';
				this.$.tabs2.setValue('');
			}
			if (inSender.name == 'tabs2') {
				var show = this.$.tabs2.getValue() + 'Tab';
				this.$.tabs1.setValue('');
			}
		}
		else var show = 'generalTab';
		var controls = this.$.tabs1.getControls();
		for (var c = 0; c < controls.length; c++) this.$[controls[c].value + 'Tab'].hide();
		var controls = this.$.tabs2.getControls();
		for (var c = 0; c < controls.length; c++) this.$[controls[c].value + 'Tab'].hide();
		this.$[show].show();
	},
	
	cancelButton: function() {
		this.owner.destroySecondary(true);
	},
	saveButton: function() {
		// setup prefs variable
		// general
		this.prefs.fullscreen = this.$.fullscreen.getState();
		enyo.setFullScreen(this.prefs.fullscreen);
		
		// messages
		this.prefs.focusInput = this.$.focusInput.getState();
		
		
		// actually save
		var saved = enyo.application.p.save(this.prefs);
		if (saved) {
			this.owner.destroySecondary(true);
		}
		else {
			this.log('Not Saved!?');
		}
	},
	
});
