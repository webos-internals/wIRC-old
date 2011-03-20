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
	'availableCommands':	{ title: 'Available Commands',		func: aliasesModel.commandHelp},
	
	
	// GENERAL
	'theme':				{ title: 'Theme',					data: 'This changes the entire look of the app. The options themselves should be self-explanatory.' },
	'cmdHistoryMax':		{ title: 'Max Command History',		data: 'This is the number of commands wIRC will remember.<br /><br />You can access them with Hold Gesture + Q (to go back,) and Hold Gesture + A (to go forward.)'},
	'blockScreenTimeout':	{ title: 'Block Screen Timeout',	data: 'When set to Yes, the screen won\'t dim while the chat window is active. If No, it will turn off after so much use.'},
	'statusPop':			{ title: 'Default in New Card',		data: 'When set to Yes, the server status scene will pop out into its own card when you tap on that server.'},
	'useExternalIP':		{ title: 'Use External IP',			data: 'When enabled, wIRC will use the external IP. Disable this for use on an internal network.'},
	'connectionTimeout':	{ title: 'Connection Timeout',		data: 'Select how long wIRC will wait for a connection to respond before disconnecting.'},
	'lagMeter':				{ title: 'Lag Meter',				data: 'Enable this to automatically ping the server to determine how good your connection is.'},
	'autoPingInterval':		{ title: 'Auto Ping Interval',		data: 'Select how long wIRC should wait between pings to the server.'},
	'piface':				{ title: 'Preferred Interface',		data: 'Which interface do you want wIRC to connect over? Wifi or Wan (your cellular connection.)'},
	'aiface':				{ title: 'Use Fallback',			data: 'When enabled, depending on your Preferred Interface (Wifi or Wan,) wIRC will try the other interface if connecting fails over the preferred.<br /><br />When disabled, it will only try on the preferred interface.'},

	// MESSAGES
	'tabSuffix':			{ title: 'Tab Complete',			data: 'Select the character that will be added to the end of a nickname when you type part of the users nick and then Hold Gesture + Press the Orange Key.'},
	'autoCap':				{ title: 'Auto Capitalization',		data: 'When enabled, will automatically capitalize the first letter of your message.'},
	'autoReplace':			{ title: 'Auto Correct',			data: 'When enabled, input fields will use the Auto Correct feature of webOS.'},
	'messagesStyle':		{ title: 'Message Style',			data: 'This allows you to choose between a Left Aligned and Fixed Columns display options for messages.'},
	'messageSplit':			{ title: 'Fixed Split',				data: 'The default split (of horizontal screen space.)<br /><br />You can also change this in-chat by dragging the split side to side in any chat scene.'},
	'fontSize':				{ title: 'Font Size',				data: 'Select the message font size.'},
	'senderColoring':		{ title: 'Sender Coloring',			data: 'Select weather or not nicknames in chat of others should be randomly colored, or a fixed color selected below.'},
	'timeStamp':			{ title: 'Timestamp',				data: 'This set show frequently timestamps are inserted between chat messages.'},
	'timeStampStyle':		{ title: 'Timestamp Style',			data: 'This sets how much time information you want displayed between messages.'},
	'highlightStyle':		{ title: 'Mention Style',			data: 'When you\'re mentioned, this selects how that message will be differentiated from the rest.'},
	'highlightPart':		{ title: 'Mention Part',			data: 'When you\'re mentioned, this selects what part of that message will be changed from the rest.'},
	'colorNotice':			{ title: 'Notice Color',			data: 'Text color for notice messages.'},
	'colorAction':			{ title: 'Action Color',			data: 'Text color for action messages. (/me something)'},
	'colorStatus':			{ title: 'Status Color',			data: 'Text color for status messages. (join/part)'},
	'colorText':			{ title: 'Text Color',				data: 'General text color for messages.'},
	'colorOwnNick':			{ title: 'Own Nick Color',			data: 'Your nick color.'},
	'colorOtherNicks':		{ title: 'Other Nick Color',		data: 'Color of every other nick besides yours.'},
	'colorHighlightFG':		{ title: 'Highlight Foreground',	data: 'The color of messages that have been highlighted'},
	'colorHighlightBG':		{ title: 'Highlight Background',	data: 'The background color of messages that have been highlighted'},
	'colorCTCP':			{ title: 'CTCP Color',				data: 'Text color for CTCP messages.'},
	'colorMarker':			{ title: 'Marker Line Color',		data: 'This is the color of the line that keeps track of the last message you saw in a specific chat scene.'},
	'ctcpReplyVersion':		{ title: 'CTCP Version Reply',		data: 'This message is the response when someone sends you a version request.'},
	'ctcpReplyTime':		{ title: 'CTCP Time Reply',			data: 'This message is the response when someone sends you a time request.'},
	'ctcpReplyFinger':		{ title: 'CTCP Finger Reply',		data: 'This message is the response when someone sends you a finger request.'},
	'ctcpReplyUserinfo':	{ title: 'CTCP Userinfo Reply',		data: 'This message is the response when someone sends you a userinfo request.'},
	
	// EVENTS
	'partReason':			{ title: 'Part Reason',				data: 'This is the text that is sent to the channel when you part/leave the channel.'},
	'quitReason':			{ title: 'Quit Reason',				data: 'This is the text that is sent to any channels you\'re in when you quit/disconnect from the server.'},
	'kickReason':			{ title: 'Kick Reason',				data: 'If you have the ability to kick people from a channel, this is the default reason which will be displayed.'},
	'eventJoin':			{ title: 'Show Joins',				data: 'This will show/hide join messages in a channel.'},
	'eventPart':			{ title: 'Show Parts',				data: 'This will show/hide part messages in a channel.'},
	'eventQuit':			{ title: 'Show Quits',				data: 'This will show/hide quit messages in a channel.'},
	'eventMode':			{ title: 'Show Modes',				data: 'This will show/hide mode change messages in a channel.'},

	// NOTIFICATIONS
	'dashboardChannel':		{ title: 'On Channel Mention',		data: 'When set to Yes, this will cause a dashboard/banner notification to be spawned when you are mentioned or an alert word is triggered.'},
	'dashboardChannelSound':{ title: 'Mention Banner Sound',	data: 'When enabled, will trigger a sound when the dashboard/banner notification is spawned.'},
	'dashboardQuerySound':	{ title: 'Query Banner Sound',		data: 'When enabled, you will receeve a sound when you get a private message (query message.)'},
	'inviteAction':			{ title: 'Invite Action',			data: 'This allows you to select how channel invites should be handled.'},
	'dashboardInviteSound':	{ title: 'Invite Sound',			data: 'When enabled, you will receive a sound when you get a channel invitation.'},
	'alertList':			{ title: 'Alert Words',				data: 'This is a list of words you will be alerted about when someone says it (like your nick does by default)'},

	// DCC
	'dccChatAction':		{ title: 'Invite Action',			data: 'This allows you to select how DCC chat requests should be handled.'},
	'dccChatInviteSound':	{ title: 'DCC Chat Invite Sound',	data: 'When enabled, you will receive a sound when you get a DCC chat request.'},
	'dccDefaultFolder':		{ title: 'Default Save Folder',		data: 'Select the default folder for DCC file you receive.'},
	'dccSendAction':		{ title: 'File Request Action',		data: 'Select how you want DCC file requests to be handled.'},
	'dccSendRequestSound':	{ title: 'DCC File Request Sound',	data: 'When enabled, you will receive a sound when you get a DCC file request.'},
	'dccSendAlwaysDefault':	{ title: 'Always Save to Default',	data: 'When enabled, you won\'t be prompted for where to save the file, it will be saved to the default folder selected above.'},

	// ALIAS
	'aliasList':			{ title: 'Alias List',				data: 'This is a list of aliases or shortcuts for extending commands.'},
	'aliasInfo':			{ title: 'Alias',					data: 'This is the aliased command (what you actually type in) which will trigger the command below.<br /><br />Don\'t prefix it with a / here. But when you use the alias, you will need to type a / first.'},
	'aliasCommand':			{ title: 'Command',					data: 'This is the command which will be sent to the server when you type in the alias above.<br /><br />Don\'t prefix it with a / here.'},
	
	// IDENTITY
	'realname':				{ title: 'Real Name',				data: 'This name will be displayed besides your nickname when you join or part a channel.'},
	'nickList':				{ title: 'Nicknames',				data: 'This is a list of nicknames (or "handles") you will be using for connecting to servers.'},


	// SERVER INFO
	'alias':				{ title: 'Alias',					data: 'Optional. You can give this connection a "Nice" name. It will be used in the list and elsewhere in the app when using this connection.'},
	'address':				{ title: 'Address',					data: 'This is the Server name or IP address for the IRC server you want to connect to.'},
	'defaultNick':			{ title: 'Nickname',				data: 'Select which nick want to use for this connection.'},

	// ADVANCED SERVER INFO
	'port':					{ title: 'Port',					data: 'Defaults to 6667. The port for this connection.<br /><br />Note: sometimes you have to change this if you plan to use encryption.'},
	'encryption':			{ title: 'Encryption',				data: 'Select what encryption method you want to use if any for this connection.<br /><br />Note: sometimes you have to change the port for different types of encryption.'},
	'serverUser':			{ title: 'User',					data: 'Optional. Enter a username for your server if it supports or requires it.'},
	'serverPassword':		{ title: 'Password',				data: 'Optional. Enter a password for your server if it supports or requires it.'},
	'autoConnect':			{ title: 'Auto-Connect',			data: 'When enabled, wIRC will connect to this server automatically when you start the app.'},
	'proxyNetwork':			{ title: 'Proxy Network',			data: 'Optional. This field is appended to the username:password string, only useful to BIP users.'},
	'dontPartOnClose':		{ title: 'Don\'t Part on Close',	data: 'Enable this if you want wIRC to send a part command when you close a channel.'},
	'autoOpenFavs':			{ title: 'Auto Open Favorites',		data: 'When enabled, only channels listed in the favorites list will be opened when reconnecting to an IRC bouncer like BIP.'},
	//'autoIdentify':			{ title: '',						data: ''},
	//'identifyService':		{ title: '',						data: ''},
	//'identifyPassword':		{ title: '',						data: ''},
	'onConnect':			{ title: 'Perform On Connect',		data: 'Commands to run once you connect.<br /><br />If you don\'t prefix them with a / one will be added for you.'},
	'favoriteChannels':		{ title: 'Favorite Channels',		data: 'A list of channels for this server to be easily accessible from the app menu.'},
	
};