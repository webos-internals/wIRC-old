function ircMessage(params)
{
	ircMessage.num++;
	
	this.num =			ircMessage.num;
	this.type =			params.type;
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
			break;
			
		case 'channel-action':
			this.rowStyle =		'action-message';
			this.nick =			params.nick;
			this.nickDisplay =	'*';
			this.message =		this.nick.name + ' ' + params.message;
			break;
			
		case 'channel-event':
			this.rowStyle =		'event-message';
			this.nickDisplay =	'**';
			this.message =		params.message;
			break;

		case 'action':
			this.rowStyle =		'status-message';
			this.nickDisplay =	'*';
			this.message =		params.message;
			break;
			
		case 'status':
			this.rowStyle =		'status-message';
			this.nickDisplay =	'***';
			this.message =		params.message;
			break;
			
		case 'debug':
			this.rowStyle =		'debug-message';
			this.nickDisplay =	'---';
			this.message =		params.message;
			break;
	}
	
}

ircMessage.prototype.getListObject = function()
{
	var obj =
	{
		rowStyle:	this.rowStyle,
		nick:		this.nickDisplay,
		nickStyle:	this.nickStyle,
		message:	this.message
	};
	
	return obj;
}

ircMessage.num = 0;