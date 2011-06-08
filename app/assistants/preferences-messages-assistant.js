function PreferencesMessagesAssistant()
{
	// setup default preferences in the prefCookie.js model
	this.cookie = new preferenceCookie();
	this.prefs = this.cookie.get();
	
	this.pageList = [
		{label: 'General',			command: 'general'},
		{label: 'Messages',			command: 'messages'},
		{label: 'Events',			command: 'events'},
		//{label: 'Keybindings',		command: 'keybindings'},
		{label: 'Notifications',	command: 'notifications'},
		{label: 'DCC',				command: 'dcc'},
		{label: 'Aliases',			command: 'aliases'}
	];
	this.currentPage = 'messages';
	
	// setup menu
	this.menuModel =
	{
		visible: true,
		items:
		[
			Mojo.Menu.editItem,
			{
				label: "Help",
				command: 'do-help'
			}
		]
	}

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
		
		// listener for help toggle
		this.helpTap = this.helpRowTapped.bindAsEventListener(this);
		this.controller.listen(this.controller.get('help-toggle'), Mojo.Event.tap, this.helpButtonTapped.bindAsEventListener(this));
		
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
			'fontStyle',
			{
				label: 'Font Style',
				choices:
				[
					{label:'Prelude',	value:'prelude'},
					{label:'Monospace',	value:'monospace'}
				],
				modelProperty: 'fontStyle'
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
		
		this.fontStyleChanged();
		this.messageStyleChanged();
		this.fontSizeChanged({value: this.sliderGetSlideValue(9, 22, this.prefs.fontSize)});
		
		this.controller.listen('messagesStyle',		Mojo.Event.propertyChange, this.messageStyleChanged.bindAsEventListener(this));
		this.controller.listen('messageSplit',		Mojo.Event.propertyChange, this.listChangedHandler);
		this.controller.listen('fontStyle',			Mojo.Event.propertyChange, this.fontStyleChanged.bindAsEventListener(this));
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
		if (isDarkTheme()) themeIndex = 1;
		
		this.controller.setupWidget
		(
			'colorCTCP',
			{
				label: 'CTCP',
				choices: listColorChoices,
				modelProperty: 'colorCTCP'
			},
			{colorCTCP: this.prefs.colorCTCP[themeIndex]}
		);
		this.controller.setupWidget
		(
			'colorNotice',
			{
				label: 'Notice',
				choices: listColorChoices,
				modelProperty: 'colorNotice'
			},
			{colorNotice: this.prefs.colorNotice[themeIndex]}
		);		
		this.controller.setupWidget
		(
			'colorAction',
			{
				label: 'Action',
				choices: listColorChoices,
				modelProperty: 'colorAction'
			},
			{colorAction: this.prefs.colorAction[themeIndex]}
		);
		this.controller.setupWidget
		(
			'colorStatus',
			{
				label: 'Status',
				choices: listColorChoices,
				modelProperty: 'colorStatus'
			},
			{colorStatus: this.prefs.colorStatus[themeIndex]}
		);
		this.controller.setupWidget
		(
			'colorText',
			{
				label: 'Text',
				choices: listColorChoices,
				modelProperty: 'colorText'
			},
			{colorText: this.prefs.colorText[themeIndex]}
		);
		this.controller.setupWidget
		(
			'colorHighlightFG',
			{
				label: 'Highlight FG',
				choices: listColorChoices,
				modelProperty: 'colorHighlightFG'
			},
			{colorHighlightFG: this.prefs.colorHighlightFG[themeIndex]}
		);
		this.controller.setupWidget
		(
			'colorHighlightBG',
			{
				label: 'Highlight BG',
				choices: listColorChoices,
				modelProperty: 'colorHighlightBG'
			},
			{colorHighlightBG: this.prefs.colorHighlightBG[themeIndex]}
		);
		this.controller.setupWidget
		(
			'colorMarker',
			{
				label: 'Marker line',
				choices: listColorChoices,
				modelProperty: 'colorMarker'
			},
			{colorMarker: this.prefs.colorMarker[themeIndex]}
		);
		this.controller.setupWidget
		(
			'colorOwnNick',
			{
				label: 'Own Nick',
				choices: listColorChoices,
				modelProperty: 'colorOwnNick'
			},
			{colorOwnNick: this.prefs.colorOwnNick[themeIndex]}
		);
		this.controller.setupWidget
		(
			'colorOtherNicks',
			{
				label: 'Other Nicks',
				choices: listColorChoices,
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
		this.controller.setupWidget
		(
			'ctcpReplyTime',
			{
				multiline: false,
				enterSubmits: false,
				modelProperty: 'ctcpReplyTime',
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.prefs
		);
		this.controller.setupWidget
		(
			'ctcpReplyFinger',
			{
				multiline: false,
				enterSubmits: false,
				modelProperty: 'ctcpReplyFinger',
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.prefs
		);
		this.controller.setupWidget
		(
			'ctcpReplyUserinfo',
			{
				multiline: false,
				enterSubmits: false,
				modelProperty: 'ctcpReplyUserinfo',
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.prefs
		);
		
		this.controller.listen('ctcpReplyVersion',	Mojo.Event.propertyChange, this.listChangedHandler);
		this.controller.listen('ctcpReplyTime',		Mojo.Event.propertyChange, this.listChangedHandler);
		this.controller.listen('ctcpReplyFinger',	Mojo.Event.propertyChange, this.listChangedHandler);
		this.controller.listen('ctcpReplyUserinfo',	Mojo.Event.propertyChange, this.listChangedHandler);
										
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
		
		// make it so nothing is selected by default (textbox rage)
		this.controller.setInitialFocusedElement(null);
		
		// add listeners to all the help-overlays
		var helps = this.controller.get('container').querySelectorAll('div.help-overlay');
		for (var h = 0; h < helps.length; h++) {
			this.controller.listen(helps[h], Mojo.Event.tap, this.helpTap);
		}
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'preferences#setup');
	}

}

PreferencesMessagesAssistant.prototype.helpButtonTapped = function(event)
{
	if (this.controller.get('container').hasClassName('help'))
	{
		this.controller.get('container').removeClassName('help');
		event.target.removeClassName('selected');
	}
	else
	{
		this.controller.get('container').addClassName('help');
		event.target.addClassName('selected');
	}
}
PreferencesMessagesAssistant.prototype.helpRowTapped = function(event)
{
	event.stop();
	event.stopPropagation();
	event.preventDefault();
	
	var lookup = event.target.id.replace(/help-/, '');
	var help = helpData.get(lookup);
	
	if (lookup && help)
	{
		this.controller.stageController.pushScene('help-data', help);
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
	if (isDarkTheme()) themeIndex = 1;
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
PreferencesMessagesAssistant.prototype.fontStyleChanged = function(event)
{
	if (event) 
	{
		this.listChanged();
		var tmp = prefs.get(true);
		
		// set theme on all other open stages
		Mojo.Controller.getAppController().assistant.updateTheme(prefs.get().theme);
	}
	this.controller.get('fontSizeTest').style.fontFamily = this.prefs['fontStyle'];
	
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
	var tmp = prefs.get(true);
		
	// set theme on all other open stages
	Mojo.Controller.getAppController().assistant.updateTheme(prefs.get().theme);
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
	
	// set theme on all other open stages
	Mojo.Controller.getAppController().assistant.updateTheme(prefs.get().theme);
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
	
	this.controller.stopListening('colorHighlightFG',		Mojo.Event.propertyChange, this.colorChangedHandler);
	this.controller.stopListening('colorHighlightBG',		Mojo.Event.propertyChange, this.colorChangedHandler);
	this.controller.stopListening('colorNotice',			Mojo.Event.propertyChange, this.colorChangedHandler);
	this.controller.stopListening('colorAction',			Mojo.Event.propertyChange, this.colorChangedHandler);
	this.controller.stopListening('colorStatus',			Mojo.Event.propertyChange, this.colorChangedHandler);
	this.controller.stopListening('colorText',				Mojo.Event.propertyChange, this.colorChangedHandler);
	this.controller.stopListening('colorMarker',			Mojo.Event.propertyChange, this.colorChangedHandler);
	this.controller.stopListening('colorOwnNick',			Mojo.Event.propertyChange, this.colorChangedHandler);
	this.controller.stopListening('colorOtherNicks',		Mojo.Event.propertyChange, this.colorChangedHandler);
	this.controller.stopListening('colorCTCP',				Mojo.Event.propertyChange, this.colorChangedHandler);
	
	this.controller.stopListening('ctcpReplyVersion',		Mojo.Event.propertyChange, this.listChangedHandler);
	this.controller.stopListening('ctcpReplyTime',			Mojo.Event.propertyChange, this.listChangedHandler);
	this.controller.stopListening('ctcpReplyFinger',		Mojo.Event.propertyChange, this.listChangedHandler);
	this.controller.stopListening('ctcpReplyUserinfo',		Mojo.Event.propertyChange, this.listChangedHandler);

}
