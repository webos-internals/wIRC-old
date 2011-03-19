function helpData()
{
}

helpData.get = function(lookup)
{
	if (helpData.lookup[lookup])
	{
		return helpData.lookup[lookup];
	}
	else
	{
		return { title: lookup.replace(/_/g, " ").replace(/-/g, " "), data: 'This section isn\'t setup.<br><br>Call a Programmer!<br>Tell Him: "'+lookup+'".' };
	}
	return false; // this shouldn't happen
}

helpData.lookup = 
{
	
	// MISC
	'availableCommands':		{ title: 'Available Commands',		func: aliasesModel.commandHelp},
	
	
	// GENERAL
	'theme':					{ title: 'Theme',					data: 'This changes the entire look of the app. The options themselves should be self-explanatory' },
	'cmdHistoryMax':			{ title: 'Max Command History',		data: ''},
	'blockScreenTimeout':		{ title: 'Block Screen Timeout',	data: ''},
	'dimScreen':				{ title: 'Dim Screen',				data: ''},
	'statusPop':				{ title: 'Default in New Card',		data: ''},
	'useExternalIP':			{ title: 'Use External IP',			data: ''},
	'connectionTimeout':		{ title: 'Connection Timeout',		data: ''},
	'lagMeter':					{ title: 'Lag Meter',				data: ''},
	'autoPingInterval':			{ title: 'Auto Ping Interval',		data: ''},
	'piface':					{ title: 'Preferred Interface',		data: ''},
	'aiface':					{ title: 'Use Fallback',			data: ''},

	// MESSAGES
	'tabSuffix':				{ title: 'Tab Complete',			data: ''},
	'autoCap':					{ title: 'Auto Capitalization',		data: ''},
	'autoReplace':				{ title: 'Smart Text Engine',		data: ''},
	'messagesStyle':			{ title: 'Message Style',			data: ''},
	'messageSplit':				{ title: 'Fixed Split',				data: ''},
	'fontSize':					{ title: 'Font Size',				data: ''},
	'senderColoring':			{ title: 'Sender Coloring',			data: ''},
	'timeStamp':				{ title: 'Timestamp',				data: ''},
	'timeStampStyle':			{ title: 'Timestamp Style',			data: ''},
	'highlightStyle':			{ title: 'Mention Style',			data: ''},
	'highlightPart':			{ title: 'Mention Part',			data: ''},
	'colorNotice':				{ title: 'Notice Color',			data: ''},
	'colorAction':				{ title: 'Action Color',			data: ''},
	'colorStatus':				{ title: 'Status Color',			data: ''},
	'colorText':				{ title: 'Text Color',				data: ''},
	'colorOwnNick':				{ title: 'Own Nick Color',			data: ''},
	'colorOtherNicks':			{ title: 'Other Nick Color',		data: ''},
	'colorHighlightFG':			{ title: 'Highlight Foreground',	data: ''},
	'colorHighlightBG':			{ title: 'Highlight Background',	data: ''},
	'colorCTCP':				{ title: 'CTCP Color',				data: ''},
	'colorMarker':				{ title: 'Marker Line Color',		data: ''},
	'ctcpReplyVersion':			{ title: 'CTCP Version Reply',		data: ''},
	'ctcpReplyTime':			{ title: 'CTCP Time Reply',			data: ''},
	'ctcpReplyFinger':			{ title: 'CTCP Finger Reply',		data: ''},
	'ctcpReplyUserinfo':		{ title: 'CTCP Userinfo Reply',		data: ''},
	
	// EVENTS
	'partReason':				{ title: 'Part Reason',				data: ''},
	'quitReason':				{ title: 'Quit Reason',				data: ''},
	'kickReason':				{ title: 'Kick Reason',				data: ''},
	'eventJoin':				{ title: 'Show Joins',				data: ''},
	'eventPart':				{ title: 'Show Parts',				data: ''},
	'eventQuit':				{ title: 'Show Quits',				data: ''},
	'eventMode':				{ title: 'Show Modes',				data: ''},

	// NOTIFICATIONS
	'dashboardChannel':			{ title: 'On Channel Mention',		data: ''},
	'dashboardChannelSound':	{ title: 'Mention Banner Sound',	data: ''},
	'dashboardQuerySound':		{ title: 'Query Banner Sound',		data: ''},
	'inviteAction':				{ title: 'Invite Action',			data: ''},
	'dashboardInviteSound':		{ title: 'Invite Sound',			data: ''},
	'alertList':				{ title: 'Alert Words',				data: ''},

	// DCC
	'dccChatAction':			{ title: 'Invite Action',			data: ''},
	'dccChatInviteSound':		{ title: 'DCC Chat Invite Sound',	data: ''},
	'dccDefaultFolder':			{ title: 'Default Save Folder',		data: ''},
	'dccSendAction':			{ title: 'File Request Action',		data: ''},
	'dccSendRequestSound':		{ title: 'DCC File Request Sound',	data: ''},
	'dccSendAlwaysDefault':		{ title: 'Always Save to Default',	data: ''},

	// ALIAS
	'aliasList':				{ title: 'Alias List',				data: ''},

	// ALIAS INFO
	'aliasInfo':				{ title: 'Alias',					data: ''},
	'aliasCommand':				{ title: 'Command',					data: ''},
	
	// IDENTITY
	'realname':					{ title: 'Real Name',				data: ''},
	'nickList':					{ title: 'Nicknames',				data: ''},


	// SERVER INFO
	'alias':					{ title: 'Alias',					data: ''},
	'address':					{ title: 'Address',					data: ''},
	'defaultNick':				{ title: 'Nickname',				data: ''},

	// ADVANCED SERVER INFO
	'port':						{ title: 'Port',					data: ''},
	'encryption':				{ title: 'Encryption',				data: ''},
	'serverUser':				{ title: 'User',					data: ''},
	'serverPassword':			{ title: 'Password',				data: ''},
	'autoConnect':				{ title: 'Auto-Connect',			data: ''},
	'proxyNetwork':				{ title: 'Proxy Network',			data: ''},
	'dontPartOnClose':			{ title: 'Don\'t Part on Close',	data: ''},
	'autoOpenFavs':				{ title: 'Auto Open Favorites',		data: ''},
	//'autoIdentify':			{ title: '',						data: ''},
	//'identifyService':		{ title: '',						data: ''},
	//'identifyPassword':		{ title: '',						data: ''},
	'onConnect':				{ title: 'Perform On Connect',		data: ''},
	'favoriteChannels':			{ title: 'Favorite Channels',		data: ''},
	
};