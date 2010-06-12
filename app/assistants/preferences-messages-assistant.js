function PreferencesMessagesAssistant()
{
	// setup default preferences in the prefCookie.js model
	this.cookie = new preferenceCookie();
	this.prefs = this.cookie.get();
	
	this.pageList = [
		{label: 'General',			command: 'general'},
		{label: 'Messages',			command: 'messages'},
		{label: 'Events'		,	command: 'events'},
		{label: 'Keybindings'	,	command: 'keybindings'},
		{label: 'Notifications',	command: 'notifications'}
	];
	this.currentPage = 'messages';
	
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
		{label:'', value:''},
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

PreferencesMessagesAssistant.prototype.setup = function()
{
	try
	{
		// setup menu
		this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
		
		// set this scene's default transition
		this.controller.setDefaultTransition(Mojo.Transition.zoomFade);
		
		// setup page selector
		this.pageSelectorElement =	this.controller.get('pageSelector');
		this.pageNameElement =		this.controller.get('pageName');
		this.pageTapHandler =		this.pageTap.bindAsEventListener(this);
		this.pageSwitcher =			this.pageSwitch.bindAsEventListener(this);
		this.controller.listen(this.pageSelectorElement, Mojo.Event.tap, this.pageTapHandler);
		
		this.pageNameElement.update(this.currentPage);
		
		// setup handlers for preferences
		this.toggleChangeHandler = this.toggleChanged.bindAsEventListener(this);
		this.sliderChangeHandler = this.sliderChanged.bindAsEventListener(this);
		this.listChangedHandler  = this.listChanged.bindAsEventListener(this);
		this.colorChangedHandler  = this.colorChanged.bindAsEventListener(this);
		this.senderColoringHandler = this.senderColoringChanged.bindAsEventListener(this);
		
		
		
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
		this.controller.setupWidget
		(
			'senderColoring',
			{
	  			trueLabel:  'Random',
	  			trueValue:	true,
	 			falseLabel: 'Fixed',
	 			falseValue: false,
	  			fieldName:  'senderColoring'
			},
			{
				value : this.prefs.senderColoring,
	 			disabled: false
			}
		);
		this.controller.setupWidget
		(
			'timeStamp',
			{
				label: 'Timestamp',
				choices:
				[
					{label:'None',		value:0},
					{label:'Every Min',	value:1},
					{label:'Every 5',	value:5},
					{label:'Every 10',	value:10},
					{label:'Every 15',	value:15},
					{label:'Every 30',	value:30},
					{label:'Every Hour',value:60},
				],
				modelProperty: 'timeStamp'
			},
			this.prefs
		);
		this.controller.setupWidget
		(
			'timeStampStyle',
			{
				label: 'Timestamp Style',
				choices:
				[
					{label:'Short',		value:'short'},
					{label:'Medium',	value:'medium'},
					{label:'Long',		value:'long'},
					{label:'Full',		value:'full'},
					{label:'Default',	value:'default'}
				],
				modelProperty: 'timeStampStyle'
			},
			this.prefs
		);
		
		this.controller.listen('senderColoring',		Mojo.Event.propertyChange, this.senderColoringHandler);
		this.senderColoringChanged();
		
		this.messageStyleChanged();
		this.fontSizeChanged({value: this.sliderGetSlideValue(9, 22, this.prefs.fontSize)});
		
		this.controller.listen('messagesStyle',		Mojo.Event.propertyChange, this.messageStyleChanged.bindAsEventListener(this));
		this.controller.listen('messageSplit',		Mojo.Event.propertyChange, this.listChangedHandler);
		this.controller.listen('fontSize',			Mojo.Event.propertyChange, this.fontSizeChanged.bindAsEventListener(this));
		this.controller.listen('timeStamp',			Mojo.Event.propertyChange, this.listChangedHandler);
		this.controller.listen('timeStampStyle',	Mojo.Event.propertyChange, this.listChangedHandler);
		
		
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
		
		// Color stuff
		var themeIndex = 0;
		if (this.prefs.theme == 'palm-dark') themeIndex = 1;
		
		this.controller.setupWidget
		(
			'colorCTCP',
			{
				label: 'CTCP',
				choices: this.colorChoices,
				modelProperty: 'colorCTCP'
			},
			{colorCTCP: this.prefs.colorCTCP[themeIndex]}
		);
		this.controller.setupWidget
		(
			'colorNotice',
			{
				label: 'Notice',
				choices: this.colorChoices,
				modelProperty: 'colorNotice'
			},
			{colorNotice: this.prefs.colorNotice[themeIndex]}
		);		
		this.controller.setupWidget
		(
			'colorAction',
			{
				label: 'Action',
				choices: this.colorChoices,
				modelProperty: 'colorAction'
			},
			{colorAction: this.prefs.colorAction[themeIndex]}
		);
		this.controller.setupWidget
		(
			'colorStatus',
			{
				label: 'Status',
				choices: this.colorChoices,
				modelProperty: 'colorStatus'
			},
			{colorStatus: this.prefs.colorStatus[themeIndex]}
		);
		this.controller.setupWidget
		(
			'colorText',
			{
				label: 'Text',
				choices: this.colorChoices,
				modelProperty: 'colorText'
			},
			{colorText: this.prefs.colorText[themeIndex]}
		);
		this.controller.setupWidget
		(
			'colorHighlightFG',
			{
				label: 'Highlight FG',
				choices: this.colorChoices,
				modelProperty: 'colorHighlightFG'
			},
			{colorHighlightFG: this.prefs.colorHighlightFG[themeIndex]}
		);
		this.controller.setupWidget
		(
			'colorHighlightBG',
			{
				label: 'Highlight BG',
				choices: this.colorChoices,
				modelProperty: 'colorHighlightBG'
			},
			{colorHighlightBG: this.prefs.colorHighlightBG[themeIndex]}
		);
		this.controller.setupWidget
		(
			'colorMarker',
			{
				label: 'Marker line',
				choices: this.colorChoices,
				modelProperty: 'colorMarker'
			},
			{colorMarker: this.prefs.colorMarker[themeIndex]}
		);
		this.controller.setupWidget
		(
			'colorOwnNick',
			{
				label: 'Own Nick',
				choices: this.colorChoices,
				modelProperty: 'colorOwnNick'
			},
			{colorOwnNick: this.prefs.colorOwnNick[themeIndex]}
		);
		this.controller.setupWidget
		(
			'colorOtherNicks',
			{
				label: 'Other Nicks',
				choices: this.colorChoices,
				modelProperty: 'colorOtherNicks'
			},
			{colorOtherNicks: this.prefs.colorOtherNicks[themeIndex]}
		);
	
		// CTCP Replies	
		this.controller.setupWidget
		(
			'ctcpReplyVersion',
			{
				multiline: false,
				enterSubmits: false,
				modelProperty: 'ctcpReplyVersion',
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.prefs
		);
		this.controller.listen('ctcpReplyVersion',	Mojo.Event.propertyChange, this.listChangedHandler);
										
		this.highlightStyleChanged();
		this.controller.listen('highlightStyle',	Mojo.Event.propertyChange, this.highlightStyleChanged.bindAsEventListener(this));
		this.controller.listen('highlightPart',		Mojo.Event.propertyChange, this.listChangedHandler);
		
		this.controller.listen('colorHighlightFG',	Mojo.Event.propertyChange, this.colorChangedHandler);
		this.controller.listen('colorHighlightBG',	Mojo.Event.propertyChange, this.colorChangedHandler);
		this.controller.listen('colorNotice',		Mojo.Event.propertyChange, this.colorChangedHandler);
		this.controller.listen('colorAction',		Mojo.Event.propertyChange, this.colorChangedHandler);
		this.controller.listen('colorStatus',		Mojo.Event.propertyChange, this.colorChangedHandler);
		this.controller.listen('colorText',			Mojo.Event.propertyChange, this.colorChangedHandler);
		this.controller.listen('colorMarker',		Mojo.Event.propertyChange, this.colorChangedHandler);
		this.controller.listen('colorOwnNick',		Mojo.Event.propertyChange, this.colorChangedHandler);
		this.controller.listen('colorOtherNicks',	Mojo.Event.propertyChange, this.colorChangedHandler);
		this.controller.listen('colorCTCP',			Mojo.Event.propertyChange, this.colorChangedHandler);
				
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'preferences#setup');
	}

}

PreferencesMessagesAssistant.prototype.toggleChanged = function(event)
{
	this.prefs[event.target.id] = event.value;
	this.cookie.put(this.prefs);
}
PreferencesMessagesAssistant.prototype.sliderChanged = function(event)
{
	this.cookie.put(this.prefs);
}
PreferencesMessagesAssistant.prototype.listChanged = function(event)
{
	this.cookie.put(this.prefs);
}
PreferencesMessagesAssistant.prototype.colorChanged = function(event)
{
	var themeIndex = 0;
	if (this.prefs.theme == 'palm-dark') themeIndex = 1;
	this.prefs[event.property][themeIndex] = event.value;
	this.cookie.put(this.prefs);
	alert(this.prefs[event.property]);
}

PreferencesMessagesAssistant.prototype.senderColoringChanged = function(event)
{
	if (event) 
	{
		this.toggleChanged(event);
	}
	if (this.prefs['senderColoring'])
	{
		this.controller.get('OtherNicksWrapper').style.display = 'none';
	}
	else
	{
		this.controller.get('OtherNicksWrapper').style.display = '';
	}	
}
PreferencesMessagesAssistant.prototype.messageStyleChanged = function(event)
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
PreferencesMessagesAssistant.prototype.highlightStyleChanged = function(event)
{
	if (event) 
	{
		this.listChanged();
	}
	if (this.prefs['highlightStyle'] == 'color' || this.prefs['highlightStyle'] == 'boldcolor')
	{
		this.controller.get('highlightColorOptions').style.display = '';
	}
	else
	{
		this.controller.get('highlightColorOptions').style.display = 'none';
	}
}
PreferencesMessagesAssistant.prototype.sliderGetPrefValue = function(min, max, slider)
{
	return Math.round(min + (slider * (max - min)));
}
PreferencesMessagesAssistant.prototype.sliderGetSlideValue = function(min, max, pref)
{
	return ((pref - min) / (max - min));
}

PreferencesMessagesAssistant.prototype.fontSizeChanged = function(event)
{
	var value = this.sliderGetPrefValue(9, 22, event.value);
	
	this.controller.get('fontSizeTest').innerHTML = 'Size ' + value + ' Preview';
	this.controller.get('fontSizeTest').style.fontSize = value + 'px';
	
	this.prefs['fontSize'] = value;
	this.sliderChanged();
}

PreferencesMessagesAssistant.prototype.pageSwitch = function(page)
{
	if (page === null || page == "" || page == undefined || page == this.currentPage) return;
	this.controller.stageController.swapScene({name: 'preferences-'+page, transition: Mojo.Transition.crossFade});
}
PreferencesMessagesAssistant.prototype.pageTap = function(event)
{
	this.controller.popupSubmenu(
	{
		onChoose: this.pageSwitcher,
		popupClass: 'group-popup',
		toggleCmd: this.currentPage,
		placeNear: event.target,
		items: this.pageList
	});
}

PreferencesMessagesAssistant.prototype.handleCommand = function(event)
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

PreferencesMessagesAssistant.prototype.activate = function(event)
{
	if (!this.hasBennActivated)
	{
		this.pageSwitcher(this.currentPage);
	}
	this.hasBennActivated = true;
}

PreferencesMessagesAssistant.prototype.deactivate = function(event)
{
	// reload global storage of preferences when we get rid of this stage
	var tmp = prefs.get(true);
}

PreferencesMessagesAssistant.prototype.cleanup = function(event)
{
	this.controller.stopListening(this.pageSelectorElement, Mojo.Event.tap,			   this.pageTapHandler);
	
	this.controller.stopListening('tabSuffix',				Mojo.Event.propertyChange, this.listChangedHandler);
	this.controller.stopListening('autoCap',				Mojo.Event.propertyChange, this.toggleChangeHandler);
	this.controller.stopListening('autoReplace',			Mojo.Event.propertyChange, this.toggleChangeHandler);
	
	this.controller.stopListening('messagesStyle',			Mojo.Event.propertyChange, this.messageStyleChanged.bindAsEventListener(this));
	this.controller.stopListening('messageSplit',			Mojo.Event.propertyChange, this.listChangedHandler);
	this.controller.stopListening('fontSize',				Mojo.Event.propertyChange, this.fontSizeChanged.bindAsEventListener(this));
	this.controller.stopListening('senderColoring',			Mojo.Event.propertyChange, this.senderColoringHandler);
	this.controller.stopListening('timeStamp',				Mojo.Event.propertyChange, this.listChangedHandler);
	
	this.controller.stopListening('highlightStyle',			Mojo.Event.propertyChange, this.highlightStyleChanged.bindAsEventListener(this));
	this.controller.stopListening('highlightPart',			Mojo.Event.propertyChange, this.listChangedHandler);
	
	this.controller.stopListening('colorHighlightFG',		Mojo.Event.propertyChange, this.listChangedHandler);
	this.controller.stopListening('colorHighlightBG',		Mojo.Event.propertyChange, this.listChangedHandler);
	this.controller.stopListening('colorNotice',			Mojo.Event.propertyChange, this.listChangedHandler);
	this.controller.stopListening('colorAction',			Mojo.Event.propertyChange, this.listChangedHandler);
	this.controller.stopListening('colorStatus',			Mojo.Event.propertyChange, this.listChangedHandler);
	this.controller.stopListening('colorText',				Mojo.Event.propertyChange, this.listChangedHandler);
	this.controller.stopListening('colorMarker',			Mojo.Event.propertyChange, this.listChangedHandler);
	this.controller.stopListening('colorOwnNick',			Mojo.Event.propertyChange, this.listChangedHandler);
	this.controller.stopListening('colorOtherNicks',		Mojo.Event.propertyChange, this.listChangedHandler);
	this.controller.stopListening('colorCTCP',				Mojo.Event.propertyChange, this.listChangedHandler);

}
