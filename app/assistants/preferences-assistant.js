function PreferencesAssistant()
{
	// setup default preferences in the prefCookie.js model
	this.cookie = new prefCookie();
	this.prefs = this.cookie.get();
	
	// for secret group
	this.secretString = '';
	this.secretAnswer = 'iknowwhatimdoing';
	
	this.interfaceWrapper =		false;
	
	// setup menu
	this.menuModel =
	{
		visible: true,
		items:
		[
			{
				label: "Help",
				command: 'do-help'
			}
		]
	}
	
	this.colorChoices = [
					{label:'aliceblue', value:'aliceblue'},
					{label:'antiquewhite', value:'antiquewhite'},
					{label:'aqua', value:'aqua'},
					{label:'aquamarine', value:'aquamarine'},
					{label:'azure', value:'azure'},
					{label:'beige', value:'beige'},
					{label:'bisque', value:'bisque'},
					{label:'black', value:'black'},
					{label:'blanchedalmond', value:'blanchedalmond'},
					{label:'blue', value:'blue'},
					{label:'blueviolet', value:'blueviolet'},
					{label:'brown', value:'brown'},
					{label:'burlywood', value:'burlywood'},
					{label:'cadetblue', value:'cadetblue'},
					{label:'chartreuse', value:'chartreuse'},
					{label:'chocolate', value:'chocolate'},
					{label:'coral', value:'coral'},
					{label:'cornflowerblue', value:'cornflowerblue'},
					{label:'cornsilk', value:'cornsilk'},
					{label:'crimson', value:'crimson'},
					{label:'cyan', value:'cyan'},
					{label:'darkblue', value:'darkblue'},
					{label:'darkcyan', value:'darkcyan'},
					{label:'darkgoldenrod', value:'darkgoldenrod'},
					{label:'darkgray', value:'darkgray'},
					{label:'darkgreen', value:'darkgreen'},
					{label:'darkkhaki', value:'darkkhaki'},
					{label:'darkmagenta', value:'darkmagenta'},
					{label:'darkolivegreen', value:'darkolivegreen'},
					{label:'darkorange', value:'darkorange'},
					{label:'darkorchid', value:'darkorchid'},
					{label:'darkred', value:'darkred'},
					{label:'darksalmon', value:'darksalmon'},
					{label:'darkseagreen', value:'darkseagreen'},
					{label:'darkslateblue', value:'darkslateblue'},
					{label:'darkslategray', value:'darkslategray'},
					{label:'darkturquoise', value:'darkturquoise'},
					{label:'darkviolet', value:'darkviolet'},
					{label:'deeppink', value:'deeppink'},
					{label:'deepskyblue', value:'deepskyblue'},
					{label:'dimgray', value:'dimgray'},
					{label:'dodgerblue', value:'dodgerblue'},
					{label:'firebrick', value:'firebrick'},
					{label:'floralwhite', value:'floralwhite'},
					{label:'forestgreen', value:'forestgreen'},
					{label:'fuchsia', value:'fuchsia'},
					{label:'gainsboro', value:'gainsboro'},
					{label:'ghostwhite', value:'ghostwhite'},
					{label:'gold', value:'gold'},
					{label:'goldenrod', value:'goldenrod'},
					{label:'gray', value:'gray'},
					{label:'green', value:'green'},
					{label:'greenyellow', value:'greenyellow'},
					{label:'honeydew', value:'honeydew'},
					{label:'hotpink', value:'hotpink'},
					{label:'indianred', value:'indianred'},
					{label:'indigo', value:'indigo'},
					{label:'ivory', value:'ivory'},
					{label:'khaki', value:'khaki'},
					{label:'lavender', value:'lavender'},
					{label:'lavenderblush', value:'lavenderblush'},
					{label:'lawngreen', value:'lawngreen'},
					{label:'lemonchiffon', value:'lemonchiffon'},
					{label:'lightblue', value:'lightblue'},
					{label:'lightcoral', value:'lightcoral'},
					{label:'lightcyan', value:'lightcyan'},
					{label:'lightgoldenrodyellow', value:'lightgoldenrodyellow'},
					{label:'lightgreen', value:'lightgreen'},
					{label:'lightpink', value:'lightpink'},
					{label:'lightsalmon', value:'lightsalmon'},
					{label:'lightseagreen', value:'lightseagreen'},
					{label:'lightskyblue', value:'lightskyblue'},
					{label:'lightslategray', value:'lightslategray'},
					{label:'lightsteelblue', value:'lightsteelblue'},
					{label:'lightyellow', value:'lightyellow'},
					{label:'lime', value:'lime'},
					{label:'limegreen', value:'limegreen'},
					{label:'linen', value:'linen'},
					{label:'magenta', value:'magenta'},
					{label:'maroon', value:'maroon'},
					{label:'mediumaquamarine', value:'mediumaquamarine'},
					{label:'mediumblue', value:'mediumblue'},
					{label:'mediumorchid', value:'mediumorchid'},
					{label:'mediumpurple', value:'mediumpurple'},
					{label:'mediumseagreen', value:'mediumseagreen'},
					{label:'mediumslateblue', value:'mediumslateblue'},
					{label:'mediumspringgreen', value:'mediumspringgreen'},
					{label:'mediumturquoise', value:'mediumturquoise'},
					{label:'mediumvioletred', value:'mediumvioletred'},
					{label:'midnightblue', value:'midnightblue'},
					{label:'mintcream', value:'mintcream'},
					{label:'mistyrose', value:'mistyrose'},
					{label:'moccasin', value:'moccasin'},
					{label:'navajowhite', value:'navajowhite'},
					{label:'navy', value:'navy'},
					{label:'oldlace', value:'oldlace'},
					{label:'olive', value:'olive'},
					{label:'olivedrab', value:'olivedrab'},
					{label:'orange', value:'orange'},
					{label:'orangered', value:'orangered'},
					{label:'orchid', value:'orchid'},
					{label:'palegoldenrod', value:'palegoldenrod'},
					{label:'palegreen', value:'palegreen'},
					{label:'paleturquoise', value:'paleturquoise'},
					{label:'palevioletred', value:'palevioletred'},
					{label:'papayawhip', value:'papayawhip'},
					{label:'peachpuff', value:'peachpuff'},
					{label:'peru', value:'peru'},
					{label:'pink', value:'pink'},
					{label:'plum', value:'plum'},
					{label:'powderblue', value:'powderblue'},
					{label:'purple', value:'purple'},
					{label:'red', value:'red'},
					{label:'rosybrown', value:'rosybrown'},
					{label:'royalblue', value:'royalblue'},
					{label:'saddlebrown', value:'saddlebrown'},
					{label:'salmon', value:'salmon'},
					{label:'sandybrown', value:'sandybrown'},
					{label:'seagreen', value:'seagreen'},
					{label:'seashell', value:'seashell'},
					{label:'sienna', value:'sienna'},
					{label:'silver', value:'silver'},
					{label:'skyblue', value:'skyblue'},
					{label:'slateblue', value:'slateblue'},
					{label:'slategray', value:'slategray'},
					{label:'snow', value:'snow'},
					{label:'springgreen', value:'springgreen'},
					{label:'steelblue', value:'steelblue'},
					{label:'tan', value:'tan'},
					{label:'teal', value:'teal'},
					{label:'thistle', value:'thistle'},
					{label:'tomato', value:'tomato'},
					{label:'turquoise', value:'turquoise'},
					{label:'violet', value:'violet'},
					{label:'wheat', value:'wheat'},
					{label:'white', value:'white'},
					{label:'whitesmoke', value:'whitesmoke'},
					{label:'yellow', value:'yellow'},
					{label:'yellowgreen', value:'yellowgreen'}
				];
				
}

PreferencesAssistant.prototype.setup = function()
{
	try
	{
		// setup menu
		this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
		
		// set this scene's default transition
		this.controller.setDefaultTransition(Mojo.Transition.zoomFade);
		
		// setup handlers for preferences
		this.toggleChangeHandler = this.toggleChanged.bindAsEventListener(this);
		this.sliderChangeHandler = this.sliderChanged.bindAsEventListener(this);
		this.listChangedHandler  = this.listChanged.bindAsEventListener(this);
		
		this.pifaceChanged();
		this.pifaceChangedHandler = this.pifaceChanged.bindAsEventListener(this);
		
		// Global Group
		this.controller.setupWidget
		(
			'theme',
			{
				label: 'Theme',
				choices:
				[
					{label:'Palm Default',	value:'palm-default'},
					{label:'Palm Dark',		value:'palm-dark'}
				],
				modelProperty: 'theme'
			},
			this.prefs
		);
		
		this.controller.listen('theme',	Mojo.Event.propertyChange, this.themeChanged.bindAsEventListener(this));
		
		
		
		// Server Status Group
		this.controller.setupWidget
		(
			'statusPop',
			{
	  			trueLabel:  'Yes',
	 			falseLabel: 'No',
	  			fieldName:  'statusPop'
			},
			{
				value : this.prefs.statusPop,
	 			disabled: false
			}
		);
		
		this.controller.listen('statusPop',	Mojo.Event.propertyChange, this.toggleChangeHandler);
		
		// Connection details group
		this.controller.setupWidget
		(
			'piface',
			{
				label: 'Interface',
				choices:
				[
					{label:'None', value:''},
					{label:'Wan (ppp0)', value:'ppp0'},
					{label:'Wifi (eth0)', value:'eth0'}
				],
				modelProperty: 'piface'
			},
			this.prefs
		);
		this.controller.listen('piface',		Mojo.Event.propertyChange, this.pifaceChangedHandler);
		this.controller.setupWidget
		(
			'aiface',
			{
	  			trueLabel:  'Yes',
	 			falseLabel: 'No',
	  			fieldName:  'aiface'
			},
			{
				value : this.prefs.aiface,
	 			disabled: false
			}
		);
		this.controller.listen('aiface',		Mojo.Event.propertyChange, this.toggleChangeHandler);
		
		// Input Group
		this.controller.setupWidget
		(
			'tabSuffix',
			{
				label: 'Tab Complete',
				choices:
				[
					{label:':',	value:':'},
					{label:'-',	value:'-'},
					{label:'+',	value:'+'},
					{label:'>',	value:'>'},
					{label:'|',	value:'|'},
					{label:',',	value:','},
					{label:'~',	value:'~'},
					{label:'=',	value:'='},
					{label:'?',	value:'?'},
					{label:'*',	value:'*'},
					{label:'^',	value:'^'},
					{label:'`',	value:'`'},
					{label:'"',	value:'"'},
					{label:"'",	value:"'"},
					{label:'#',	value:'#'},
					{label:'@',	value:'@'},
					{label:'/',	value:'/'},
					{label:'!',	value:'!'},
					{label:'\\',value:'\\'}
				],
				modelProperty: 'tabSuffix'
			},
			this.prefs
		);
		this.controller.setupWidget
		(
			'autoCap',
			{
	  			trueLabel:  'Yes',
	 			falseLabel: 'No',
	  			fieldName:  'autoCap'
			},
			{
				value : this.prefs.autoCap,
	 			disabled: false
			}
		);
		this.controller.setupWidget
		(
			'autoReplace',
			{
	  			trueLabel:  'Yes',
	 			falseLabel: 'No',
	  			fieldName:  'autoReplace'
			},
			{
				value : this.prefs.autoReplace,
	 			disabled: false
			}
		);
		
		this.controller.listen('tabSuffix',		Mojo.Event.propertyChange, this.listChangedHandler);
		this.controller.listen('autoCap',		Mojo.Event.propertyChange, this.toggleChangeHandler);
		this.controller.listen('autoReplace',	Mojo.Event.propertyChange, this.toggleChangeHandler);
		
		
		
		// Messages Group
		this.controller.setupWidget
		(
			'messagesStyle',
			{
				label: 'Message Style',
				choices:
				[
					{label:'Left Aligned',	value:'lefta'}, // 'left' is special and adds padding we don't want
					{label:'Fixed Columns',	value:'fixed'}
				],
				modelProperty: 'messagesStyle'
			},
			this.prefs
		);
		this.controller.setupWidget
		(
			'messageSplit',
			{
				label: 'Fixed Split',
				choices:
				[
					{label:'15% / 85%',	value:'15'},
					{label:'20% / 80%',	value:'20'},
					{label:'25% / 75%',	value:'25'},
					{label:'30% / 70%',	value:'30'},
					{label:'35% / 65%',	value:'35'},
					{label:'40% / 60%',	value:'40'},
					{label:'45% / 55%',	value:'45'},
					{label:'50% / 50%',	value:'50'},
				],
				modelProperty: 'messageSplit'
			},
			this.prefs
		);
		this.controller.setupWidget
		(
			'fontSize',
			{
				minValue: 0,
				maxValue: 1,
				round: false,
				modelProperty: 'value',
				updateInterval: 0.2
			},
			{
				value: this.sliderGetSlideValue(9, 22, this.prefs.fontSize)
			}
		);
		
		this.messageStyleChanged();
		this.fontSizeChanged({value: this.sliderGetSlideValue(9, 22, this.prefs.fontSize)});
		
		this.controller.listen('messagesStyle',		Mojo.Event.propertyChange, this.messageStyleChanged.bindAsEventListener(this));
		this.controller.listen('messageSplit',		Mojo.Event.propertyChange, this.listChangedHandler);
		this.controller.listen('fontSize',			Mojo.Event.propertyChange, this.fontSizeChanged.bindAsEventListener(this));
		
		
		// Highlight Group
		this.controller.setupWidget
		(
			'highlightStyle',
			{
				label: 'Style',
				choices:
				[
					{label:'Color', value:'color'},
					{label:'Bold', value:'bold'},
					{label:'Bold & Color', value:'boldcolor'}
				],
				modelProperty: 'highlightStyle'
			},
			this.prefs
		);
		this.controller.setupWidget
		(
			'highlightPart',
			{
				label: 'Part',
				choices:
				[
					{label:'Whole Line', value:'all'},
					{label:'Nick', value:'nick'},
					{label:'Message', value:'message'},
					{label:'Word', value:'word'}
				],
				modelProperty: 'highlightPart'
			},
			this.prefs
		);
		this.controller.setupWidget
		(
			'highlightColorOf',
			{
				label: 'Color Of',
				choices:
				[
					{label:'Foreground', value:'foreground'},
					{label:'Background', value:'background'}
				],
				modelProperty: 'highlightColorOf'
			},
			this.prefs
		);
		this.controller.setupWidget
		(
			'highlightColor',
			{
				label: 'Color',
				choices: this.colorChoices,
				modelProperty: 'highlightColor'
			},
			this.prefs
		);
		
		this.controller.setupWidget
		(
			'colorNotice',
			{
				label: 'Notice',
				choices: this.colorChoices,
				modelProperty: 'colorNotice'
			},
			this.prefs
		);		
		this.controller.setupWidget
		(
			'colorAction',
			{
				label: 'Action',
				choices: this.colorChoices,
				modelProperty: 'colorAction'
			},
			this.prefs
		);
		this.controller.setupWidget
		(
			'colorStatus',
			{
				label: 'Status',
				choices: this.colorChoices,
				modelProperty: 'colorStatus'
			},
			this.prefs
		);
		this.controller.setupWidget
		(
			'colorText',
			{
				label: 'Text',
				choices: this.colorChoices,
				modelProperty: 'colorText'
			},
			this.prefs
		);
		this.controller.setupWidget
		(
			'colorMarker',
			{
				label: 'Marker line',
				choices: this.colorChoices,
				modelProperty: 'colorMarker'
			},
			this.prefs
		);
						
		this.highlightStyleChanged();
		this.controller.listen('highlightStyle',	Mojo.Event.propertyChange, this.highlightStyleChanged.bindAsEventListener(this));
		
		this.controller.listen('highlightPart',		Mojo.Event.propertyChange, this.listChangedHandler);
		this.controller.listen('highlightColorOf',	Mojo.Event.propertyChange, this.listChangedHandler);
		this.controller.listen('highlightColor',	Mojo.Event.propertyChange, this.listChangedHandler);
		
		this.controller.listen('colorNotice',		Mojo.Event.propertyChange, this.listChangedHandler);
		this.controller.listen('colorAction',		Mojo.Event.propertyChange, this.listChangedHandler);
		this.controller.listen('colorStatus',		Mojo.Event.propertyChange, this.listChangedHandler);
		this.controller.listen('colorText',			Mojo.Event.propertyChange, this.listChangedHandler);
		this.controller.listen('colorMarker',		Mojo.Event.propertyChange, this.listChangedHandler);		
		
		// Dashboard/Banner Group
		this.controller.setupWidget
		(
			'dashboardChannel',
			{
	  			trueLabel:  'Yes',
	 			falseLabel: 'No',
	  			fieldName:  'dashboardChannel'
			},
			{
				value : this.prefs.dashboardChannel,
	 			disabled: false
			}
		);
		this.controller.setupWidget
		(
			'dashboardChannelSound',
			{
	  			trueLabel:  'Yes',
	 			falseLabel: 'No',
	  			fieldName:  'dashboardChannelSound'
			},
			{
				value : this.prefs.dashboardChannelSound,
	 			disabled: false
			}
		);
		this.controller.setupWidget
		(
			'dashboardQuerySound',
			{
	  			trueLabel:  'Yes',
	 			falseLabel: 'No',
	  			fieldName:  'dashboardQuerySound'
			},
			{
				value : this.prefs.dashboardQuerySound,
	 			disabled: false
			}
		);
		
		this.dashboardChannelChanged();
		this.controller.listen('dashboardChannel',		Mojo.Event.propertyChange, this.dashboardChannelChanged.bindAsEventListener(this));
		
		this.controller.listen('dashboardChannelSound',	Mojo.Event.propertyChange, this.toggleChangeHandler);
		this.controller.listen('dashboardQuerySound',	Mojo.Event.propertyChange, this.toggleChangeHandler);
		
		
		// hide secret group
		this.controller.get('secretPreferences').style.display = 'none';
		
		this.interfaceWrapper =		this.controller.get('interfaceWrapper');
		
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'preferences#setup');
	}

}

PreferencesAssistant.prototype.toggleChanged = function(event)
{
	this.prefs[event.target.id] = event.value;
	this.cookie.put(this.prefs);
}
PreferencesAssistant.prototype.sliderChanged = function(event)
{
	this.cookie.put(this.prefs);
}
PreferencesAssistant.prototype.listChanged = function(event)
{
	this.cookie.put(this.prefs);
}

PreferencesAssistant.prototype.themeChanged = function(event)
{
	// set the theme right away with the body class
	this.controller.document.body.className = event.value;
	this.listChanged();
}
PreferencesAssistant.prototype.messageStyleChanged = function(event)
{
	if (event) 
	{
		this.listChanged();
	}
	if (this.prefs['messagesStyle'] == 'lefta')
	{
		this.controller.get('messageFixedSplit').style.display = 'none';
	}
	else
	{
		this.controller.get('messageFixedSplit').style.display = '';
	}
}
PreferencesAssistant.prototype.highlightStyleChanged = function(event)
{
	if (event) 
	{
		this.listChanged();
	}
	if (this.prefs['highlightStyle'] == 'color' || this.prefs['highlightStyle'] == 'boldcolor')
	{
		this.controller.get('highlightPartContainer').className = 'palm-row';
		this.controller.get('highlightColorOptions').style.display = '';
	}
	else
	{
		this.controller.get('highlightPartContainer').className = 'palm-row last';
		this.controller.get('highlightColorOptions').style.display = 'none';
	}
}
PreferencesAssistant.prototype.pifaceChanged = function(event)
{
	if (event) 
	{
		this.listChanged(event);
	}
	if (this.prefs['piface']=='')
	{
		this.interfaceWrapper.className = 'palm-row single';
		this.controller.get('fallbackInfo').style.display = 'none';
	}
	else
	{
		this.interfaceWrapper.className = 'palm-row first';
		this.controller.get('fallbackInfo').style.display = '';
	}
}
PreferencesAssistant.prototype.dashboardChannelChanged = function(event)
{
	if (event) 
	{
		this.toggleChanged(event);
	}
	if (this.prefs['dashboardChannel'])
	{
		this.controller.get('dashboardChannelSoundRow').style.display = '';
	}
	else
	{
		this.controller.get('dashboardChannelSoundRow').style.display = 'none';
	}
}

PreferencesAssistant.prototype.sliderGetPrefValue = function(min, max, slider)
{
	return Math.round(min + (slider * (max - min)));
}
PreferencesAssistant.prototype.sliderGetSlideValue = function(min, max, pref)
{
	return ((pref - min) / (max - min));
}

PreferencesAssistant.prototype.fontSizeChanged = function(event)
{
	var value = this.sliderGetPrefValue(9, 22, event.value);
	
	this.controller.get('fontSizeTest').innerHTML = 'Size ' + value + ' Preview';
	this.controller.get('fontSizeTest').style.fontSize = value + 'px';
	
	this.prefs['fontSize'] = value;
	this.sliderChanged();
}

PreferencesAssistant.prototype.handleCommand = function(event)
{
	if (event.type == Mojo.Event.command)
	{
		switch (event.command)
		{
			case 'do-help':
				this.controller.stageController.pushScene('help');
				break;
		}
	}
}

PreferencesAssistant.prototype.keyPress = function(event)
{
	this.secretString += String.fromCharCode(event.originalEvent.charCode);
	
	if (event.originalEvent.charCode == 8)
	{
		this.secretString = '';
	}
	
	if (this.secretString.length == this.secretAnswer.length)
	{
		if (this.secretString === this.secretAnswer)
		{
			//this.controller.get('secretPreferences').style.display = '';
			//this.controller.getSceneScroller().mojo.revealElement(this.controller.get('secretPreferences'));
			this.secretString = '';
		}
	}
	else if (this.secretString.length > this.secretAnswer.length)
	{
		this.secretString = '';
	}
}

PreferencesAssistant.prototype.activate = function(event) {}

PreferencesAssistant.prototype.deactivate = function(event)
{
	// reload global storage of preferences when we get rid of this stage
	var tmp = prefs.get(true);
}

PreferencesAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening('theme',					Mojo.Event.propertyChange, this.themeChanged.bindAsEventListener(this));
	
	this.controller.stopListening('statusPop',				Mojo.Event.propertyChange, this.toggleChangeHandler);
	
	this.controller.stopListening('piface',					Mojo.Event.propertyChange, this.pifaceChangedHandler);
	this.controller.stopListening('aiface',					Mojo.Event.propertyChange, this.listChangedHandler);
		
	this.controller.stopListening('tabSuffix',				Mojo.Event.propertyChange, this.listChangedHandler);
	this.controller.stopListening('autoCap',				Mojo.Event.propertyChange, this.toggleChangeHandler);
	this.controller.stopListening('autoReplace',			Mojo.Event.propertyChange, this.toggleChangeHandler);
	
	this.controller.stopListening('messagesStyle',			Mojo.Event.propertyChange, this.messageStyleChanged.bindAsEventListener(this));
	this.controller.stopListening('messageSplit',			Mojo.Event.propertyChange, this.listChangedHandler);
	this.controller.stopListening('fontSize',				Mojo.Event.propertyChange, this.fontSizeChanged.bindAsEventListener(this));
	
	this.controller.stopListening('highlightStyle',			Mojo.Event.propertyChange, this.highlightStyleChanged.bindAsEventListener(this));
	this.controller.stopListening('highlightPart',			Mojo.Event.propertyChange, this.listChangedHandler);
	this.controller.stopListening('highlightColorOf',		Mojo.Event.propertyChange, this.listChangedHandler);
	this.controller.stopListening('highlightColor',			Mojo.Event.propertyChange, this.listChangedHandler);
	
	this.controller.stopListening('highlightStyle',		Mojo.Event.propertyChange, this.highlightStyleChanged.bindAsEventListener(this));
	this.controller.stopListening('highlightPart',		Mojo.Event.propertyChange, this.listChangedHandler);
	this.controller.stopListening('highlightColorOf',	Mojo.Event.propertyChange, this.listChangedHandler);
	this.controller.stopListening('highlightColor',		Mojo.Event.propertyChange, this.listChangedHandler);
	
	this.controller.stopListening('colorNotice',		Mojo.Event.propertyChange, this.listChangedHandler);
	this.controller.stopListening('colorAction',		Mojo.Event.propertyChange, this.listChangedHandler);
	this.controller.stopListening('colorStatus',		Mojo.Event.propertyChange, this.listChangedHandler);
	this.controller.stopListening('colorText',			Mojo.Event.propertyChange, this.listChangedHandler);
	this.controller.stopListening('colorMarker',		Mojo.Event.propertyChange, this.listChangedHandler);

	this.controller.stopListening('dashboardChannel',		Mojo.Event.propertyChange, this.dashboardChannelChanged.bindAsEventListener(this));
	this.controller.stopListening('dashboardChannelSound',	Mojo.Event.propertyChange, this.toggleChangeHandler);
	this.controller.stopListening('dashboardQuerySound',	Mojo.Event.propertyChange, this.toggleChangeHandler);
}
