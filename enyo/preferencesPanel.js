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
			
				{kind: 'RowGroup', width: '400px', caption: 'Timestamps', components: [
					{name: 'showTimeStamps', kind: 'ToggleButton', components: [{flex: 1}, {content: 'Show Timestamps'}]},
				]},
				
				{kind: 'RowGroup', width: '400px', caption: 'Nick Completion', components: [
					{name: 'complectionSeparator', kind: 'ToggleButton', components: [{flex: 1}, {content: 'Separator'}]},
				]},
				
				{kind: 'RowGroup', width: '400px', caption: 'Color Scheme', components: [
				
					{name: 'colorNotice', kind: 'wi.ColorSelector', caption: 'Notice'},
					{name: 'colorAction', kind: 'wi.ColorSelector', caption: 'Action'},
					{name: 'colorStatus', kind: 'wi.ColorSelector', caption: 'Status'},
					{name: 'colorText', kind: 'wi.ColorSelector', caption: 'Text'},
					{name: 'colorOwnNick', kind: 'wi.ColorSelector', caption: 'Own Nick'},
					{name: 'colorOtherNicks', kind: 'wi.ColorSelector', caption: 'Other Nicks'},
					
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
				{kind: 'RowGroup', width: '400px', caption: 'General', components: [
				
					{name: 'mainListUp', kind: 'wi.KeyInput', caption: 'Main List Up'},
					{name: 'mainListDown', kind: 'wi.KeyInput', caption: 'Main List Down'},
					{name: 'nickCompletion', kind: 'wi.KeyInput', caption: 'Nick Completion'},
					
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
		this.$.showTimeStamps.setState(this.prefs.showTimeStamps);
		this.$.complectionSeparator.setValue(this.prefs.complectionSeparator)
		
		this.$.colorNotice.setValue(this.prefs.colorNotice);
		this.$.colorAction.setValue(this.prefs.colorAction);
		this.$.colorStatus.setValue(this.prefs.colorStatus);
		this.$.colorText.setValue(this.prefs.colorText);
		this.$.colorOwnNick.setValue(this.prefs.colorOwnNick);
		this.$.colorOtherNicks.setValue(this.prefs.colorOtherNicks);
		
		// keybinds
		this.$.mainListUp.setValue(this.prefs.mainListUp);
		this.$.mainListDown.setValue(this.prefs.mainListDown);
		this.$.nickCompletion.setValue(this.prefs.nickCompletion);
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
		
		// stop keycapture on keybinds tab
		if (show == 'keybindsTab') enyo.application.k.stopCapture();
		else enyo.application.k.startCapture();
	},
	
	destroy: function() {
		enyo.application.k.startCapture(); // this may have not been called if they're still on the key tab
		return this.inherited(arguments);
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
		this.prefs.showTimeStamps = this.$.showTimeStamps.getState();
		this.prefs.complectionSeparator = this.$.complectionSeparator.getValue();
		
		this.prefs.colorNotice = this.$.colorNotice.getValue();
		this.prefs.colorAction = this.$.colorAction.getValue();
		this.prefs.colorStatus = this.$.colorStatus.getValue();
		this.prefs.colorText = this.$.colorText.getValue();
		this.prefs.colorOwnNick = this.$.colorOwnNick.getValue();
		this.prefs.colorOtherNicks = this.$.colorOtherNicks.getValue();
				
		// keybinds
		this.prefs.mainListUp = this.$.mainListUp.getValue();
		this.prefs.mainListDown = this.$.mainListDown.getValue();
		this.prefs.nickCompletion = this.$.nickCompletion.getValue();
		
		
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

