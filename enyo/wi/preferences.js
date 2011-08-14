enyo.kind({
	name: 'wi.Preferences',
	kind: enyo.Control,
	
	prefs: {},
	
	published: {
		defaults: {
			// general
			fullscreen: false,
			
			// messages
			focusInput: false,
			
			// keybinds
			mainListUp: {keyCode: 38, keyIdentifier: 'Up', ctrlKey: true, altKey: false, shiftKey: false, metaKey: false},
			mainListDown: {keyCode: 40, keyIdentifier: 'Down', ctrlKey: true, altKey: false, shiftKey: false, metaKey: false},
			
		}
	},
	
	lsvar: enyo.fetchAppInfo().id + '_prefs', // variable to use for localStorage
	
	constructor: function() {
	    this.inherited(arguments);
		this.load();
	},
	
	load: function() {
		if (localStorage && localStorage[this.lsvar])
			this.prefs = enyo.mixin(this.defaults, enyo.json.parse(localStorage[this.lsvar]));
		else if (localStorage) {
			this.prefs = this.defaults;
			localStorage[this.lsvar] = enyo.json.stringify(this.prefs);
		}
		else this.error('no localStorage?');
	},
	save: function(prefs) {
		this.prefs = prefs;
		if (localStorage) {
			localStorage[this.lsvar] = enyo.json.stringify(this.prefs);
			return true;
		} else {
			this.error('no localStorage?');
			return false;
		}
	},
	
	get: function(item) {
		if (this.prefs[item]) return this.prefs[item];
		else return false;
	}
	
});

enyo.application.p = new wi.Preferences();


/* this is stuff started in lumbo, but wirc has non-popup prefs
enyo.application.prefs = {};

enyo.kind({
	name:				'wi.Preferences.Popup',
	kind:				'wi.Popup',
	dismissWithClick:	false,
	dismissWithEscape:	false,
	
	lsvar:				enyo.fetchAppInfo().id + '_prefs',
	
	published: {
		defaults:		{}
	},
	events: {
		onSave:			'',
		onCancel:		'',
	},
	
	height:				'420px',
	width:				'320px',
	
	header: 'Preferences',
	buttons: [
		{kind: 'Button', flex: 1, caption: 'Cancel', onclick: 'cancelButton', className: 'enyo-button-negative'},
		{kind: 'Button', flex: 1, caption: 'Save', onclick: 'saveButton', className: 'enyo-button-affirmative'}
	],
	
	constructor: function() {
	    this.inherited(arguments);
		this.loadPrefs();
	},
	renderOpen: function() {
	    this.inherited(arguments);
		this.setupForm();
	},
	
	loadPrefs: function() {
		if (localStorage && localStorage[this.lsvar])
			enyo.application.prefs = enyo.mixin(this.defaults, enyo.json.parse(localStorage[this.lsvar]));
		else {
			enyo.application.prefs = this.defaults;
			localStorage[this.lsvar] = enyo.json.stringify(enyo.application.prefs);
		}
	},
	savePrefs: function() {
		if (enyo.application.prefs) {
			for (var p in enyo.application.prefs) {
				if (this.$[p]) {
					switch (this.$[p].kind) {
						case 'ToggleButton':
							enyo.application.prefs[p] = this.$[p].state;
							break;
						
						case 'Input':
						case 'ListSelector':
							enyo.application.prefs[p] = this.$[p].getValue();
							break;
							
						default:
							this.log('no handler:', this.$[p].kind);
							break;
					}
				}
			}
		}
		if (localStorage)
			localStorage[this.lsvar] = enyo.json.stringify(enyo.application.prefs);
	},
	
	setupForm: function() {
		if (enyo.application.prefs) {
			for (var p in enyo.application.prefs) {
				if (this.$[p]) {
					switch (this.$[p].kind) {
						case 'ToggleButton':
							this.$[p].updateState(enyo.application.prefs[p]);
							break;
						
						case 'Input':
						case 'ListSelector':
							this.$[p].setValue(enyo.application.prefs[p]);
							break;
							
						default:
							this.log('no handler:', this.$[p].kind);
							break;	
					}
				}
			}
		}
	},
	
	saveButton: function() {
		this.savePrefs();
		this.close();
		this.doSave();
	},
	cancelButton: function() {
		this.close();
		this.doCancel();
	},
});
*/