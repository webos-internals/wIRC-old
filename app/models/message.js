/*	MESSAGE_FORMAT
 * 
 *	Implemented	MessageType	Event		Origin		NoDisplay	Param-1			Param-2		Nick		Color	Destination
 *		X		type1		NOTICE		NULL					AUTH						[]			1		server
 *		X		type2		#			<host>					<active-nick>				*			1		server
 *		X		type1		NOTICE		NULL					<active-nick>				[]			1		server
 *		X		type3		NOTICE		-1,services				<active-nick>				***			2		server
 *				type3		MODE		NickServ											***			2		server
 *				type3		MODE		NickServ				<channel>					***			2		channel
 *							CONNECT		<host>			X
 *							376			<host>			X
 *		X		type4		JOIN		<nick>!												-->			2		channel
 *		X		type5		PART		<nick>!												<--			2		channel
 *		X		type5		QUIT		<nick>!												<--			2		channel
 *		X		type6		NOTICE		<nick>!					<channel>					[<nick>]	1		channel
 *		X		type6		NOTICE		<nick>!					<active-nick>				[<nick>]	1		query
 *		X		type7		ACTION		<nick>!					<channel>					-*-			3		channel
 *		X		type7		ACTION		<nick>!					<active-nick>				-*-			3		query
 *				type8		TOPIC		<nick>!					<channel>					*			2		channel > server
 *		X		type8		332			<host>					<active-nick>	<channel>	*			2		channel > server
 *		X		type8		333			<host>					<active-nick>	<channel>	*			2		channel > server
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
	
	this.channel =		false;
	
	this.rowClass =		'';
	this.rowStyle =		'';
	this.nickStyle =	'';
	
	if (params.message.constructor == Array) 
	{	// params.message isn't a "message" if its an array it becomes "messages",
		// but whatever, we'll fix them all anyways.
		for(var m = 0; m < params.message.length; m++)
		{
			params.message[m] = params.message[m].escapeHTML();
		}
	}
	else
	{	// good message, you're actually a message, lets fix you.
		params.message = params.message.escapeHTML();
	}
	
	switch(this.type)
	{
				
		case 'type1':
			this.rowClass		= 'no-seperator';
			this.nickDisplay	= '[]';
			this.nickStyle 		= 'color: ' + prefs.get().colorNotice;
			this.messageStyle 	= 'color: ' + prefs.get().colorNotice;
			this.message		= params.message[1];
			break;

		case 'type2':
			this.rowClass		= 'no-seperator';
			this.nickDisplay	= '*';
			this.nickStyle 		= 'color: ' + prefs.get().colorNotice;
			this.messageStyle 	= 'color: ' + prefs.get().colorNotice;
			this.message		= params.message;
			break;

		case 'type3':
			this.rowClass		= 'no-seperator';
			this.nickDisplay	= '***';
			this.nickStyle 		= 'color: ' + prefs.get().colorStatus;
			this.messageStyle 	= 'color: ' + prefs.get().colorStatus;
			this.message		= params.message;
			break;

		case 'type4':
			this.rowClass		= 'no-seperator';
			this.nickDisplay	= '-->';
			this.nickStyle 		= 'color: ' + prefs.get().colorStatus;
			this.messageStyle 	= 'color: ' + prefs.get().colorStatus;
			this.message		= params.message;
			break;
			
		case 'type5':
			this.rowClass		= 'no-seperator';
			this.nickDisplay	= '<--';
			this.nickStyle 		= 'color: ' + prefs.get().colorStatus;
			this.messageStyle 	= 'color: ' + prefs.get().colorStatus;
			this.message		= params.message;
			break;
			
		case 'type6':
			this.rowClass		= 'no-seperator';
			this.nick			= params.nick;
			this.nickDisplay	= '[' + this.nick.name + ']';
			this.nickStyle 		= 'color: ' + prefs.get().colorNotice;
			this.messageStyle 	= 'color: ' + prefs.get().colorNotice;
			this.message		= params.message;
			break;						

		case 'type7':
			this.rowClass		= 'no-seperator';
			this.nick			= params.nick;
			this.nickDisplay	= '-*-';
			this.nickStyle 		= 'color: ' + prefs.get().colorAction;
			this.messageStyle 	= 'color: ' + prefs.get().colorAction;
			this.message		= this.nick.name + ' ' + params.message;
			break;

		case 'type8':
			this.rowClass		= 'no-seperator';
			this.nickDisplay	= '*';
			this.nickStyle 		= 'color: ' + prefs.get().colorStatus;
			this.messageStyle 	= 'color: ' + prefs.get().colorStatus;
			this.message		= params.message;
			break;

		case 'type9':
			this.rowClass		= 'no-seperator';
			this.nickDisplay	= '<->';
			this.nickStyle 		= 'color: ' + prefs.get().colorStatus;
			this.messageStyle 	= 'color: ' + prefs.get().colorStatus;
			this.message		= params.message;
			break;
			
		case 'type10':
			this.rowClass		= 'no-seperator';
			this.nickDisplay	= '<-*';
			this.nickStyle 		= 'color: ' + prefs.get().colorStatus;
			this.messageStyle 	= 'color: ' + prefs.get().colorStatus;
			this.message		= params.message;
			break;			
				
//===================== OLD STYLES ===========================================//
	
		// type11
		case 'privmsg':
			this.nick =			params.nick;
			this.nickDisplay =	this.nick.name;
			this.nickStyle =	'color: ' + this.nick.colorHex + ';',
			this.messageStyle = 'color: ' + prefs.get().colorText;
			this.message =		params.message;
			this.me =			params.me;
			if (this.message.toLowerCase().include(this.me.toLowerCase()) && this.nick.name.toLowerCase() != this.me.toLowerCase()) 
			{
				if (params.channel)
				{
					this.channel = params.channel;
				}
				this.highlightMessage();
			}
			break;

		// type7					
		case 'action':
			//this.rowClass =		'action-message';
			this.nick =			params.nick;
			this.nickDisplay =	'-*-';
			this.nickStyle = 'color: ' + prefs.get().colorAction;
			this.messageStyle = 'color: ' + prefs.get().colorAction;
			this.message =		this.nick.name + ' ' + params.message;
			if (this.message.toLowerCase().include(this.me.toLowerCase()) && this.nick.name.toLowerCase() != this.me.toLowerCase()) 
			{
				if (params.channel)
				{
					this.channel = params.channel;
				}
				this.highlightMessage();
			}
			break;
			
		// type9
		case 'nick':
			//this.rowClass =		'event-message';
			this.nickDisplay =	'<->';
			this.nickStyle = 'color: ' + prefs.get().colorStatus;
			this.messageStyle = 'color: ' + prefs.get().colorStatus;
			this.message =		params.message;
			break;								
		
		// type4
		case 'channel-join':
			//this.rowClass =		'event-message';
			this.nickDisplay =	'-->';
			this.nickStyle = 'color: ' + prefs.get().colorStatus;
			this.messageStyle = 'color: ' + prefs.get().colorStatus;
			this.message =		params.message;
			break;
			
		// type5
		case 'channel-part-quit':
			//this.rowClass =		'event-message';
			this.nickDisplay =	'<--';
			this.nickStyle = 'color: ' + prefs.get().colorStatus;
			this.messageStyle = 'color: ' + prefs.get().colorStatus;
			this.message =		params.message;
			break;
			
		// type10
		case 'channel-kick':
			//this.rowClass =		'event-message';
			this.nickDisplay =	'<-*';
			this.nickStyle = 'color: ' + prefs.get().colorStatus;
			this.messageStyle = 'color: ' + prefs.get().colorStatus;
			this.message =		params.message;
			break;						

		// type1			
		case 'notice':
			this.rowClass =		'no-seperator';
			this.nickDisplay	= '[' + params.message[0] + ']';
			this.nickStyle 		= 'color: ' + prefs.get().colorNotice;
			this.messageStyle 	= 'color: ' + prefs.get().colorNotice;
			this.message		= params.message[1];
			break;

		// type2			
		case 'info':
			this.nickDisplay	= '*';
			this.nickStyle 		= 'color: ' + prefs.get().colorNotice;
			this.messageStyle 	= 'color: ' + prefs.get().colorNotice;
			this.message		= params.message[1];
			break;

		// type3			
		case 'status':
			//this.rowClass =		'status-message';
			this.nickDisplay =	'***';
			this.nickStyle = 'color: ' + prefs.get().colorStatus;
			this.messageStyle = 'color: ' + prefs.get().colorStatus;
			this.message =		params.message;
			break;
			
		case 'debug':
			this.rowClass =		'debug-message';
			this.nickDisplay =	'---';
			this.message =		params.message;
			break;
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
	{
		if (prefs.get().highlightColorOf == 'foreground') style += 'color: ' + prefs.get().highlightColor + ';';
		if (prefs.get().highlightColorOf == 'background') style += 'background-color: ' + prefs.get().highlightColor + ';';
	}
	if (prefs.get().highlightStyle == 'bold' || prefs.get().highlightStyle == 'boldcolor') 
	{
		style += 'font-weight: bold;';
	}
	
	switch (prefs.get().highlightPart)
	{
		case 'all':
			this.rowStyle += style;
			// foreground color doesn't work through children, sigh, so we have to set them manually...
			if ((prefs.get().highlightStyle == 'color' ||
				prefs.get().highlightStyle == 'boldcolor') &&
				prefs.get().highlightColorOf == 'foreground')
			{
				this.nickStyle += style;
				this.messageStyle += style;
			}
			break;
		case 'nick':
			this.nickStyle += style;
			break;
		case 'message':
			this.messageStyle += style;
			break;
		case 'word':
			this.plainMessage = this.message;
			this.message = this.message.replace(new RegExp('(' + this.me + ')', 'gi'), '<span style="' + style + '">$1</span>');
			break;
	}
}
ircMessage.prototype.parseLinks = function(message)
{
  	return message.replace
	(
		/((https?\:\/\/)|(www\.))(\S+)(\w{2,4})(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/ig,
		function(url)
		{
		    var full_url = url;
		    if (!full_url.match('^https?:\/\/')) {
		        full_url = 'http://' + full_url;
		    }
		    return '<a href="' + full_url + '" target="_blank">' + url + '</a>';
		}
	);
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
		message:		this.parseLinks(this.message),
		rowClass:		this.rowClass,
		rowStyle:		this.rowStyle,
		nickStyle:		this.nickStyle,
		messageStyle:	this.messageStyle
	};
	
	return obj;
}

ircMessage.num = 0;
