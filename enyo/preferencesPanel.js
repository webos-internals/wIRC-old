enyo.kind({
	name: 'wirc.PreferencesPanel',
	kind: 'wirc.SlidingView',
	
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
					{name: 'complectionSeparator', hint: 'Optional', kind: 'Input', components: [{content: 'Separator'}]},
				]},
				
				{kind: 'RowGroup', width: '400px', caption: 'List Format', components: [
				
					{name: 'listStyle', kind: 'wi.ListSelector', label: 'Style', items: [
				        {caption: 'Fixed Width', value: 'fixed'},
				        {caption: 'Left Aligned', value: 'left'},
				    ]},
					{name: 'listBackground', kind: 'wi.ListSelector', label: 'Background', onChange: 'listBackgroundChanged', items: [
				        {caption: 'Solid', value: 'solid'},
				        {caption: 'Alternate', value: 'alt'},
				    ]},
					
				]},
				
				{kind: 'RowGroup', width: '400px', caption: 'Text', components: [
				
					{name: 'fontSize', kind: 'wi.ListSelector', label: 'Font Size', items: [
				        {caption: '10px', value: '10px'},
				        {caption: '12px', value: '12px'},
				        {caption: '14px', value: '14px'},
				        {caption: '16px', value: '16px'},
				        {caption: '18px', value: '18px'},
				        {caption: '20px', value: '20px'},
				        {caption: '22px', value: '22px'},
				        {caption: '24px', value: '24px'},
				    ]},
					
				]},
				
				{kind: 'RowGroup', width: '400px', caption: 'Color Scheme', components: [
				
					{name: 'colorBackground', kind: 'wi.InputColor', caption: 'Background'},
					{name: 'colorBackgroundAlt', kind: 'wi.InputColor', caption: 'Alternate Background'},
					{name: 'colorNotice', kind: 'wi.InputColor', caption: 'Notice'},
					{name: 'colorAction', kind: 'wi.InputColor', caption: 'Action'},
					{name: 'colorStatus', kind: 'wi.InputColor', caption: 'Status'},
					{name: 'colorText', kind: 'wi.InputColor', caption: 'Text'},
					{name: 'colorOwnNick', kind: 'wi.InputColor', caption: 'Own Nick'},
					{name: 'colorOtherNicks', kind: 'wi.InputColor', caption: 'Other Nicks'},
					{name: 'colorMarkerLine', kind: 'wi.InputColor', caption: 'Marker Line'},
					
				]},
			]},
			
			{name: 'eventsTab', layoutKind: 'VFlexLayout', align: 'center', components: [
				{kind: 'RowGroup', width: '400px', caption: 'row heading', components: [
				
					{kind: 'Item', content: 'events'}
					
				]},
			]},
			
			{name: 'notificationsTab', layoutKind: 'VFlexLayout', align: 'center', components: [
				{kind: 'Group', width: '400px', caption: 'Alert Words', components: [

					{name: 'alertWords', kind: 'wi.InputList', inputHint: ''},

				]},
			]},
			
			{name: 'dccTab', layoutKind: 'VFlexLayout', align: 'center', components: [
				{kind: 'RowGroup', width: '400px', caption: 'row heading', components: [
				
					{kind: 'Item', content: 'dcc'}
					
				]},
			]},
			
			{name: 'keybindsTab', layoutKind: 'VFlexLayout', align: 'center', components: [
				{kind: 'RowGroup', width: '400px', caption: 'General', components: [
				
					{name: 'mainListUp', kind: 'wi.InputKey', caption: 'Main List Up'},
					{name: 'mainListDown', kind: 'wi.InputKey', caption: 'Main List Down'},
					{name: 'nickCompletion', kind: 'wi.InputKey', caption: 'Nick Completion'},
					
				]},
			]},
			
			{name: 'aliasesTab', layoutKind: 'VFlexLayout', align: 'center', components: [
				{kind: 'wi.Group', width: '400px', caption: ['Alias','Command'], components: [
					{name: 'aliases', kind: 'wi.InputList', inputHint: '/Command'},
				]}
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
		
		this.$.listStyle.setValue(this.prefs.listStyle);
		this.$.listBackground.setValue(this.prefs.listBackground);
		this.listBackgroundChanged();
		
		this.$.fontSize.setValue(this.prefs.fontSize);
		
		this.$.colorBackground.setValue(this.prefs.colorBackground);
		this.$.colorBackgroundAlt.setValue(this.prefs.colorBackgroundAlt);
		this.$.colorNotice.setValue(this.prefs.colorNotice);
		this.$.colorAction.setValue(this.prefs.colorAction);
		this.$.colorStatus.setValue(this.prefs.colorStatus);
		this.$.colorText.setValue(this.prefs.colorText);
		this.$.colorOwnNick.setValue(this.prefs.colorOwnNick);
		this.$.colorOtherNicks.setValue(this.prefs.colorOtherNicks);
		this.$.colorMarkerLine.setValue(this.prefs.colorMarkerLine);
		this.$.aliases.setValue(this.prefs.aliases);
		
		// notifications
		this.$.alertWords.setValue(this.prefs.alertWords);
		
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
		
		this.$.scroller.scrollIntoView(0, 0);

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
		
		this.prefs.listStyle = this.$.listStyle.getValue();
		this.prefs.listBackground = this.$.listBackground.getValue();
		
		this.prefs.fontSize = this.$.fontSize.getValue();
		
		this.prefs.colorBackground = this.$.colorBackground.getValue();
		this.prefs.colorBackgroundAlt = this.$.colorBackgroundAlt.getValue();
		this.prefs.colorNotice = this.$.colorNotice.getValue();
		this.prefs.colorAction = this.$.colorAction.getValue();
		this.prefs.colorStatus = this.$.colorStatus.getValue();
		this.prefs.colorText = this.$.colorText.getValue();
		this.prefs.colorOwnNick = this.$.colorOwnNick.getValue();
		this.prefs.colorOtherNicks = this.$.colorOtherNicks.getValue();
		this.prefs.colorMarkerLine = this.$.colorMarkerLine.getValue();
		this.prefs.aliases = this.$.aliases.getValue();
		
		// notifications
		this.prefs.alertWords = this.$.alertWords.getValue();
				
		// keybinds
		this.prefs.mainListUp = this.$.mainListUp.getValue();
		this.prefs.mainListDown = this.$.mainListDown.getValue();
		this.prefs.nickCompletion = this.$.nickCompletion.getValue();
		
		
		// actually save
		var saved = enyo.application.p.save(this.prefs);
		if (saved) {
			enyo.application.p.buildCss(document);
			this.owner.destroySecondary(true);
		}
		else {
			this.log('Not Saved!?');
		}
	},
	
	listBackgroundChanged: function(inSender) {
		if (this.$.listBackground.getValue() == 'alt')
			this.$.colorBackgroundAlt.show();
		else
			this.$.colorBackgroundAlt.hide();
	}
	
});

