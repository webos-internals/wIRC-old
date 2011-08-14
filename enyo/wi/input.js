enyo.kind({
	name: 'wi.Input',
	kind: enyo.Input,
	
	onfocus: 'showKeyboard',
	autoCapitalize: 'lowercase',
	
	showKeyboard: function() {
		enyo.keyboard.show(0);
	},
});

enyo.kind({
	name: 'wi.PasswordInput',
	kind: enyo.PasswordInput,
	
	onfocus: 'showKeyboard',
	autoCapitalize: 'lowercase',
	
	showKeyboard: function() {
		enyo.keyboard.show(0);
	},
});