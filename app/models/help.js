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
	// GENERAL
	'theme':					{ title: 'Theme',	data:  'This changes the entire look of the app. The options themselves should be self-explanatory' },
	/*
	'cmdHistoryMax':			{ title: '',		data: ''},
	'blockScreenTimeout':		{ title: '',		data: ''},
	'dimScreen':				{ title: '',		data: ''},
	'statusPop':				{ title: '',		data: ''},
	'useExternalIP':			{ title: '',		data: ''},
	'connectionTimeout':		{ title: '',		data: ''},
	'lagMeter':					{ title: '',		data: ''},
	'autoPingInterval':			{ title: '',		data: ''},
	'piface':					{ title: '',		data: ''},
	'aiface':					{ title: '',		data: ''},

	// MESSAGES
	'tabSuffix':				{ title: '',		data: ''},
	'autoCap':					{ title: '',		data: ''},
	'autoReplace':				{ title: '',		data: ''},
	'messagesStyle':			{ title: '',		data: ''},
	'messageSplit':				{ title: '',		data: ''},
	'fontSize':					{ title: '',		data: ''},
	'senderColoring':			{ title: '',		data: ''},
	'timeStamp':				{ title: '',		data: ''},
	'timeStampStyle':			{ title: '',		data: ''},
	'highlightStyle':			{ title: '',		data: ''},
	'highlightPart':			{ title: '',		data: ''},
	'colorNotice':				{ title: '',		data: ''},
	'colorAction':				{ title: '',		data: ''},
	'colorStatus':				{ title: '',		data: ''},
	'colorText':				{ title: '',		data: ''},
	'colorOwnNick':				{ title: '',		data: ''},
	'colorOtherNicks':			{ title: '',		data: ''},
	'colorHighlightFG':			{ title: '',		data: ''},
	'colorHighlightBG':			{ title: '',		data: ''},
	'colorCTCP':				{ title: '',		data: ''},
	'colorMarker':				{ title: '',		data: ''},
	'ctcpReplyVersion':			{ title: '',		data: ''},
	'ctcpReplyTime':			{ title: '',		data: ''},
	'ctcpReplyFinger':			{ title: '',		data: ''},
	'ctcpReplyUserinfo':		{ title: '',		data: ''},
	
	// EVENTS
	'partReason':				{ title: '',		data: ''},
	'quitReason':				{ title: '',		data: ''},
	'kickReason':				{ title: '',		data: ''},
	'eventJoin':				{ title: '',		data: ''},
	'eventPart':				{ title: '',		data: ''},
	'eventQuit':				{ title: '',		data: ''},
	'eventMode':				{ title: '',		data: ''},

	// NOTIFICATIONS
	'dashboardChannel':			{ title: '',		data: ''},
	'dashboardChannelSound':	{ title: '',		data: ''},
	'dashboardQuerySound':		{ title: '',		data: ''},
	'inviteAction':				{ title: '',		data: ''},
	'dashboardInviteSound':		{ title: '',		data: ''},
	'alertList':				{ title: '',		data: ''},

	// DCC
	'dccChatAction':			{ title: '',		data: ''},
	'dccChatInviteSound':		{ title: '',		data: ''},
	'dccDefaultFolder':			{ title: '',		data: ''},
	'dccSendAction':			{ title: '',		data: ''},
	'dccSendRequestSound':		{ title: '',		data: ''},
	'dccSendAlwaysDefault':		{ title: '',		data: ''},
	
	// IDENTITY
	'realname':					{ title: '',		data: ''},
	'nickList':					{ title: '',		data: ''},

	// SERVER INFO
	'alias':					{ title: '',		data: ''},
	'address':					{ title: '',		data: ''},
	'defaultNick':				{ title: '',		data: ''},

	// ADVANCED SERVER INFO
	'port':						{ title: '',		data: ''},
	'encryption':				{ title: '',		data: ''},
	'serverUser':				{ title: '',		data: ''},
	'serverPassword':			{ title: '',		data: ''},
	'autoConnect':				{ title: '',		data: ''},
	'proxyNetwork':				{ title: '',		data: ''},
	'dontPartOnClose':			{ title: '',		data: ''},
	'autoOpenFavs':				{ title: '',		data: ''},
	'autoIdentify':				{ title: '',		data: ''},
	'identifyService':			{ title: '',		data: ''},
	'identifyPassword':			{ title: '',		data: ''},
	'onConnect':				{ title: '',		data: ''},
	'favoriteChannels':			{ title: '',		data: ''},
	*/
	
};