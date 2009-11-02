function ircMessage(params)
{
	ircMessage.num++;
	
	this.num =			ircMessage.num;
	this.type =			params.type;
	this.me =			params.me;
	this.rowClass =		'';
	this.rowStyle =		'';
	this.nick =			false;
	this.nickDisplay =	'';
	this.nickStyle =	'';
	this.message =		'';
	
	switch(this.type)
	{
		case 'channel-message':
			this.nick =			params.nick;
			this.nickDisplay =	this.nick.name;
			this.nickStyle =	'color: ' + this.nick.colorHex + ';',
			this.message =		params.message;
			this.me =			params.me;
			if (this.message.include(this.me) && this.nick.name != this.me) 
			{
				this.rowStyle = 'background-color: ' + prefs.get().highlight;
			}
			break;
			
		case 'channel-action':
			this.rowClass =		'action-message';
			this.nick =			params.nick;
			this.nickDisplay =	'*';
			this.message =		this.nick.name + ' ' + params.message;
			if (this.message.include(this.me) && this.nick.name != this.me) 
			{
				this.rowStyle = 'background-color: ' + prefs.get().highlight;
			}
			break;
			
		case 'channel-event':
			this.rowClass =		'event-message';
			this.nickDisplay =	'**';
			this.message =		params.message;
			break;
			
		case 'action':
			this.rowClass =		'status-message';
			this.nickDisplay =	'*';
			this.message =		params.message;
			break;
			
		case 'notice':
			this.rowClass =		'status-message';
			this.nickDisplay =	'[' + params.message[0] + ']';
			this.message =		params.message[1];
			break;
			
		case 'channel-notice':
			this.rowClass =		'status-message';
			this.nickDisplay =	'[' + params.nick.name + ']';
			this.message =		params.message;
			break;
			
		case 'status':
			this.rowClass =		'status-message';
			this.nickDisplay =	'***';
			this.message =		params.message;
			break;
			
		case 'debug':
			this.rowClass =		'debug-message';
			this.nickDisplay =	'---';
			this.message =		params.message;
			break;
	}
	
}

ircMessage.prototype.getListObject = function()
{
	var obj =
	{
		rowClass:	this.rowClass,
		rowStyle:	this.rowStyle,
		nick:		this.nickDisplay,
		nickStyle:	this.nickStyle,
		message:		this.message
	};
	
	return obj;
}

ircMessage.num = 0;
