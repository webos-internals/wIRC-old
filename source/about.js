enyo.kind({
	name: 'wIRC.About',
	kind: 'wi.Preferences.Popup',
	
	// default values
	defaults: {
		listselect:		2,
		toggle:			true,
		input:			'test'
	},
	
	components: [
	
		{kind: 'RowGroup', defaultKind: 'HFlexBox', caption: 'Tests', components: [
		
			{kind: 'Item', layoutKind: 'HFlexLayout', align: 'center', components: [
				{content: 'List Selector', flex: 1, className: 'enyo-label'},
				{name: 'listselect', kind: 'ListSelector', items: [
					{caption: 'Item One', value: 1},
					{caption: 'Item Two', value: 2},
					{caption: 'Item Three', value: 3},
					{caption: 'Item Four', value: 4}
				]},
			]},
			
			{kind: 'Item', layoutKind: 'HFlexLayout', align: 'center', components: [
				{content: 'Toggle Button', flex: 1, className: 'enyo-label'},
				{name: 'toggle', kind: 'ToggleButton', onChange: 'toggleChanged'},
			]},
			
			{name: 'input', hint: 'Input', kind: 'Input'},
			
		]},
		
		{name: 'togglegroup', kind: 'RowGroup', defaultKind: 'HFlexBox', caption: 'Toggled', components: [
			{content: 'Only Visible when toggled'}
		]},
		
	],
	
	toggleChanged: function(is, val) {
		// show/hide that group
		if (val) this.$.togglegroup.show();
		else	 this.$.togglegroup.hide();
	},
	
	doSave: function() {
		this.inherited(arguments);
		// do things here like changing theme or app other things that should change when the settings are changed and saved
	},
	
});
