/*	MESSAGE_FORMAT
 * 
 *	Implemented	MessageType	Event		Origin		NoDisplay	Param-1			Param-2		Nick		Color	Destination
 *		X		type1		NOTICE		NULL					AUTH						[]			1		server
 *		X		type2		#			<host>					<active-nick>				~			1		server
 *		X		type1		NOTICE		NULL					<active-nick>				[]			1		server
 *		X		type3		NOTICE		-1,services				<active-nick>				~~~			2		server
 *				type3		MODE		NickServ											~~~			2		server
 *				type3		MODE		NickServ				<channel>					~~~			2		channel
 *							CONNECT		<host>			X
 *							376			<host>			X
 *		X		type4		JOIN		<nick>!												-->			2		channel
 *		X		type5		PART		<nick>!												<--			2		channel
 *		X		type5		QUIT		<nick>!												<--			2		channel
 *		X		type6		NOTICE		<nick>!					<channel>					[<nick>]	1		channel
 *		X		type6		NOTICE		<nick>!					<active-nick>				[<nick>]	1		query
 *		X		type7		ACTION		<nick>!					<channel>					*			3		channel
 *		X		type7		ACTION		<nick>!					<active-nick>				*			3		query
 *				type8		TOPIC		<nick>!					<channel>					~			2		channel > server
 *		X		type8		332			<host>					<active-nick>	<channel>	~			2		channel > server
 *		X		type8		333			<host>					<active-nick>	<channel>	~			2		channel > server
 *		X		type9		NICK		<nick>!												<->			2		channel
 *		X		type10		KICK		<nick>!					<channel>					<-*			2		channel
 *				type11		PRIVMSG		<nick>!					<channel>					<nick>		4		channel
 *				type11		PRIVMSG		<nick>!					<active-nick>				<nick>		4		query
 *				type12		?			?						?							<=			2		channel // NETSPLIT LEAVE
 *				type13		?			?						?							=>			2		channel // NETSPLIT JOIN
 */

function ircMessage(params)
{
	ircMessage.num++;
	
	this.num =			ircMessage.num;
	this.type =			params.type;
	this.me =			params.me;
	this.nick =			false;
	this.nickDisplay =	'';
	this.message =		'';
	this.plainMessage =	'';
	
	this.nickCommands = false;
	
	this.copyText =		'';
	
	this.channel =		false;
	
	this.date =			new Date();
	
	this.rowClass =		'';
	this.rowStyle =		'';
	this.nickStyle =	'';
	
	this.theme = 		0;
	switch (prefs.get().theme) {
		case 'palm-dark':
			this.theme = 1;
	}
	
	if (params.message.constructor == Array) 
	{	// params.message isn't a "message" if its an array it becomes "messages",
		// but whatever, we'll fix them all anyways.
		for(var m = 0; m < params.message.length; m++)
		{
			params.message[m] = formatForHtml(params.message[m]);
		}
	}
	else
	{	// good message, you're actually a message, lets fix you.
		params.message = formatForHtml(params.message);
	}
	
	switch(this.type)
	{
				
		// NO LONGER NEEDED
		case 'type1':
			this.rowClass		= 'no-seperator';
			this.nickDisplay	= '[]';
			this.nickStyle 		= 'color: ' + prefs.get().colorNotice[this.theme];
			this.messageStyle 	= 'color: ' + prefs.get().colorNotice[this.theme];
			this.message		= params.message[1];
			break;

		case 'type2':
			this.rowClass		= 'no-seperator';
			this.nickDisplay	= '~';
			this.nickStyle 		= 'color: ' + prefs.get().colorNotice[this.theme];
			this.messageStyle 	= 'color: ' + prefs.get().colorNotice[this.theme];
			this.message		= params.message;
			break;

		case 'type3':
			this.rowClass		= 'no-seperator';
			this.nickDisplay	= '~~~';
			this.nickStyle 		= 'color: ' + prefs.get().colorStatus[this.theme];
			this.messageStyle 	= 'color: ' + prefs.get().colorStatus[this.theme];
			this.message		= params.message;
			break;
			
		case 'type3.5':
			this.rowClass		= 'no-seperator';
			this.nickDisplay	= '*';
			this.nickStyle 		= 'color: ' + prefs.get().colorCTCP[this.theme];
			this.messageStyle 	= 'color: ' + prefs.get().colorCTCP[this.theme];
			this.message		= params.message;
			break;

		case 'type4':
			this.rowClass		= 'no-seperator';
			this.nickDisplay	= '-->';
			this.nickStyle 		= 'color: ' + prefs.get().colorStatus[this.theme];
			this.messageStyle 	= 'color: ' + prefs.get().colorStatus[this.theme];
			this.message		= params.message;
			break;
			
		case 'type5':
			this.rowClass		= 'no-seperator';
			this.nickDisplay	= '<--';
			this.nickStyle 		= 'color: ' + prefs.get().colorStatus[this.theme];
			this.messageStyle 	= 'color: ' + prefs.get().colorStatus[this.theme];
			this.message		= params.message;
			break;
			
		// notice	
		case 'type6':
			this.rowClass		= 'no-seperator';
			this.nick			= params.nick;
			this.nickDisplay	= '[' + this.nick.name + ']';
			this.nickStyle 		= 'color: ' + prefs.get().colorNotice[this.theme];
			this.messageStyle 	= 'color: ' + prefs.get().colorNotice[this.theme];
			this.message		= params.message;
			break;

		case 'type7':
			this.rowClass		= 'no-seperator';
			this.nick			= params.nick;
			this.nickDisplay	= '*';
			this.nickStyle 		= 'color: ' + prefs.get().colorAction[this.theme];
			this.messageStyle 	= 'color: ' + prefs.get().colorAction[this.theme];
			this.message		= this.nick.name + ' ' + params.message;
			break;

		case 'type77':
			this.rowClass		= 'no-seperator';
			this.nick			= params.nick;
			this.nickDisplay	= '*';
			this.nickStyle 		= 'color: ' + prefs.get().colorAction[this.theme];
			this.messageStyle 	= 'color: ' + prefs.get().colorAction[this.theme];
			this.message		= params.message;
			break;

		case 'type8':
			this.rowClass		= 'no-seperator';
			this.nickDisplay	= '~';
			this.nickStyle 		= 'color: ' + prefs.get().colorStatus[this.theme];
			this.messageStyle 	= 'color: ' + prefs.get().colorStatus[this.theme];
			this.message		= params.message;
			break;

		case 'type9':
			this.rowClass		= 'no-seperator';
			this.nickDisplay	= '<->';
			this.nickStyle 		= 'color: ' + prefs.get().colorStatus[this.theme];
			this.messageStyle 	= 'color: ' + prefs.get().colorStatus[this.theme];
			this.message		= params.message;
			break;
			
		case 'type10':
			this.rowClass		= 'no-seperator';
			this.nickDisplay	= '<-*';
			this.nickStyle 		= 'color: ' + prefs.get().colorStatus[this.theme];
			this.messageStyle 	= 'color: ' + prefs.get().colorStatus[this.theme];
			this.message		= params.message;
			break;			
				
//===================== OLD STYLES ===========================================//
	
		// type11
		case 'privmsg':
			this.me =			params.me;
			this.nick =			params.nick;
			this.nickDisplay =	this.nick.name;
			if (this.me==this.nick.name)
				this.nickStyle =	'color: ' + prefs.get().colorOwnNick[this.theme] + ';';
			else if (prefs.get().senderColoring)
				this.nickStyle =	'color: ' + this.nick.colorHex + ';';
			else
				this.nickStyle =	'color: ' + prefs.get().colorOtherNicks[this.theme] + ';';
			this.messageStyle = 'color: ' + prefs.get().colorText[this.theme];
			this.message =		params.message;
			if (this.nick.name.toLowerCase() != this.me.toLowerCase()) // if its not me, move on to highlight test
			{
				this.nickCommands	= true;
				if (params.channel) 
				{
					this.channel = params.channel;
				}
				this.highlightTest();
			}
			this.copyText		= '<'+this.nick.name+'> '+this.message;
			break;

		// type7					
		case 'action':
			//this.rowClass =		'action-message';
			this.nick =			params.nick;
			this.nickDisplay =	'*';
			this.nickStyle = 'color: ' + prefs.get().colorAction[this.theme];
			this.messageStyle = 'color: ' + prefs.get().colorAction[this.theme];
			this.message =		this.nick.name + ' ' + params.message;
			if (this.nick.name.toLowerCase() != this.me.toLowerCase()) // if its not from me, move on to highlight test
			{
				this.nickCommands	= true;
				if (params.channel) 
				{
					this.channel = params.channel;
				}
				this.highlightTest();
			}
			this.copyText		= this.nick.name+' '+this.message;
			break;
			
		// type9
		case 'nick':
			//this.rowClass =		'event-message';
			this.nickDisplay =	'<->';
			this.nickStyle = 'color: ' + prefs.get().colorStatus[this.theme];
			this.messageStyle = 'color: ' + prefs.get().colorStatus[this.theme];
			this.message =		params.message;
			break;								
		
		// type4
		case 'channel-join':
			//this.rowClass =		'event-message';
			this.nickDisplay =	'-->';
			this.nickStyle = 'color: ' + prefs.get().colorStatus[this.theme];
			this.messageStyle = 'color: ' + prefs.get().colorStatus[this.theme];
			this.message =		params.message;
			break;
			
		// type5
		case 'channel-part-quit':
			//this.rowClass =		'event-message';
			this.nickDisplay =	'<--';
			this.nickStyle = 'color: ' + prefs.get().colorStatus[this.theme];
			this.messageStyle = 'color: ' + prefs.get().colorStatus[this.theme];
			this.message =		params.message;
			break;
			
		// type10
		case 'channel-kick':
			//this.rowClass =		'event-message';
			this.nickDisplay =	'<-*';
			this.nickStyle = 'color: ' + prefs.get().colorStatus[this.theme];
			this.messageStyle = 'color: ' + prefs.get().colorStatus[this.theme];
			this.message =		params.message;
			break;						

		// type1			
		case 'notice':
			this.rowClass =		'no-seperator';
			this.nickDisplay	= '[' + params.message[0] + ']';
			this.nickStyle 		= 'color: ' + prefs.get().colorNotice[this.theme];
			this.messageStyle 	= 'color: ' + prefs.get().colorNotice[this.theme];
			this.message		= params.message[1];
			break;

		// type2			
		case 'info':
			this.nickDisplay	= '*';
			this.nickStyle 		= 'color: ' + prefs.get().colorNotice[this.theme];
			this.messageStyle 	= 'color: ' + prefs.get().colorNotice[this.theme];
			this.message		= params.message[1];
			break;

		// type3			
		case 'status':
			//this.rowClass =		'status-message';
			this.nickDisplay =	'***';
			this.nickStyle = 'color: ' + prefs.get().colorStatus[this.theme];
			this.messageStyle = 'color: ' + prefs.get().colorStatus[this.theme];
			this.message =		params.message;
			break;
			
		case 'debug':
			this.rowClass =		'debug-message';
			this.nickDisplay =	'---';
			this.message =		params.message;
			break;
	}
	
}

ircMessage.prototype.highlightTest = function()
{
	// first test is current nick (it may have been /nick'd to and not in the nicklist tested below)
	if (this.message.toLowerCase().include(this.me.toLowerCase())) 
	{
		this.highlightMessage();
		return;
	}
	
	// then we move onto the predefined nicklist
	var testNicks = prefs.get().nicknames;
	if (testNicks.length > 0)
	{
		for (var n = 0; n < testNicks.length; n++)
		{
			if (this.message.toLowerCase().include(testNicks[n].toLowerCase())) 
			{
				this.highlightMessage();
				return;
			}
		}
	}
	
	// lastly, we check the alert words preference
	var testWords = prefs.get().alertWords;
	if (testWords.length > 0)
	{
		for (var w = 0; w < testWords.length; w++)
		{
			if (this.message.toLowerCase().include(testWords[w].toLowerCase())) 
			{
				this.highlightMessage();
				return;
			}
		}
	}
	
}

ircMessage.prototype.highlightMessage = function()
{
	if (this.channel)
	{
		if (!this.channel.chatAssistant.isVisible && prefs.get().dashboardChannel)
		{
			this.channel.openDash(this.getNotificationObject());
		}
		this.channel = false;
	}
	
	var style = '';
	
	if (prefs.get().highlightStyle == 'color' || prefs.get().highlightStyle == 'boldcolor')
		style += 'color:' + prefs.get().colorHighlightFG[this.theme] + ';background-color:' + prefs.get().colorHighlightBG[this.theme] + ';';
		
	if (prefs.get().highlightStyle == 'bold' || prefs.get().highlightStyle == 'boldcolor') 
		style += 'font-weight:bold;';
	
	switch (prefs.get().highlightPart)
	{
		case 'all':
			this.rowStyle = style;
			this.nickStyle = style;
			this.messageStyle = style;
			break;
		case 'nick':
			this.nickStyle = style;
			break;
		case 'message':
			this.messageStyle = style;
			break;
		case 'word':
			this.plainMessage = this.message;
			this.message = this.message.replace(new RegExp('(' + this.me + ')', 'gi'), '<span style="' + style + '">$1</span>');
			break;
	}
}

ircMessage.prototype.getNotificationObject = function()
{
	var obj =
	{
		nick:			this.nickDisplay,
		message:		(this.plainMessage==''?this.message:this.plainMessage)
	};
	
	return obj;
}
ircMessage.prototype.getListObject = function()
{
	var obj =
	{
		nick:			this.nickDisplay,
		date:			this.date,
		message:		formatLinks(this.message),
		rowClass:		this.rowClass,
		rowStyle:		this.rowStyle,
		nickStyle:		this.nickStyle,
		messageStyle:	this.messageStyle,
		copyText:		(this.copyText?this.copyText:this.message),
		nickCommands:	this.nickCommands
	};
	
	return obj;
}

ircMessage.num = 0;
