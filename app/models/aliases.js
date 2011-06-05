function aliasesModel()
{
	this.cookie = false;
	this.aliases = [];
	this.defaultNum = 0;
	this.load();
};
aliasesModel.prototype.parse = function(message, objectType, object)
{
	try
	{
		if (this.aliases.length < 1)
			return message;
		
		var match = cmdRegExp.exec(message);
		if (match)
		{
			var cmd = match[1].toLowerCase();
			var val = match[2];
			
			for (var a = 0; a < this.aliases.length; a++)
			{
				if (cmd == this.aliases[a].alias)
				{
					var parsed = '/'+this.aliases[a].command;
					
					var pTwo   = twoValRegExp.exec(val);
					var pThree = threeValRegExp.exec(val);
					
					// %c - current channel
					if (this.aliases[a].command.include('%c'))
					{
						if (objectType == 'channel')
							parsed = parsed.replace(/%c/g, object.name);
						else
							parsed = parsed.replace(/%c/g, '');
					}
					
					// %e - current network name
					if (this.aliases[a].command.include('%e'))
					{
						if (objectType == 'channel')
							parsed = parsed.replace(/%e/g, (object.server.alias?object.server.alias:object.server.address));
						else if (objectType == 'server')
							parsed = parsed.replace(/%e/g, (object.alias?object.alias:object.address));
						else
							parsed = parsed.replace(/%e/g, '');
					}
					
					// %n - users nick
					if (this.aliases[a].command.include('%n'))
					{
						if (objectType == 'channel')
							parsed = parsed.replace(/%n/g, (object.server.nick?object.server.nick.name:''));
						else if (objectType == 'server')
							parsed = parsed.replace(/%n/g, (object.nick?object.nick.name:''));
						else
							parsed = parsed.replace(/%n/g, '');
					}
					
					// %t - time/date
					if (this.aliases[a].command.include('%t'))
					{
						parsed = parsed.replace(/%t/g, Mojo.Format.formatDate(new Date(), {time: 'default', date: 'default'}));
					}
					
					// %2 - word 2
					if (this.aliases[a].command.include('%2'))
					{
						if (pTwo && pTwo[1])
							parsed = parsed.replace(/%2/g, pTwo[1]);
						else
							parsed = parsed.replace(/%2/g, '');
					}
					
					// %3 - word 3
					if (this.aliases[a].command.include('%3'))
					{
						if (pThree && pThree[2])
							parsed = parsed.replace(/%3/g, pThree[2]);
						else
							parsed = parsed.replace(/%3/g, '');
					}
					
					// &2 - word 2 to end
					if (this.aliases[a].command.include('&2'))
					{
						if (val)
							parsed = parsed.replace(/&2/g, val);
						else
							parsed = parsed.replace(/&2/g, '');
					}
					
					// &3 - word 3 to end
					if (this.aliases[a].command.include('&3'))
					{
						if (pTwo && pTwo[2])
							parsed = parsed.replace(/&3/g, pTwo[1]);
						else
							parsed = parsed.replace(/&3/g, '');
					}
					
					/*
					alert('=============');
					alert('message: '+message);
					alert('alias:   '+this.aliases[a].alias);
					alert('command: '+this.aliases[a].command);
					alert('parsed:  '+parsed);
					*/
					
					return parsed;
				}
			}
		}
		
		return message;
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'aliasesModel#parse');
		return message;
	}
}
aliasesModel.prototype.load = function()
{
	try
	{
		if (!this.cookie) 
		{
			this.cookie = new Mojo.Model.Cookie('aliases');
			//this.cookie.remove(); // uncomment to delete cookie for testing
			var cookieData = this.cookie.get();
			if (cookieData)
			{
				this.aliases = cookieData.aliases;
				this.defaultNum = cookieData.defaultNum;
				if (aliasesModel.defaultHighest > this.defaultNum) this.loadDefaults();
			}
			else
			{
				this.aliases = aliasesModel.defaultAliases;
				this.defaultNum = aliasesModel.defaultHighest;
			}
		}
	} 
	catch (e) 
	{
		Mojo.Log.logException(e, 'aliasesModel#load');
	}
};
aliasesModel.prototype.loadDefaults = function()
{
	for (var a = 0; a < aliasesModel.defaultAliases.length; a++)
	{
		if (aliasesModel.defaultAliases[a].num > this.defaultNum)
		{
			this.add(aliasesModel.defaultAliases[a]);
		}
	}
}
aliasesModel.prototype.save = function()
{
	try
	{
		if (!this.cookie) 
		{
			return;
		}
		this.cookie.put({aliases: this.aliases, defaultNum: this.defaultNum});
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'aliasesModel#save');
	}
};
aliasesModel.prototype.get = function()
{
	try 
	{
		if (this.aliases.length > 0) 
		{
			return this.aliases;
		}
		return [];
	} 
	catch (e) 
	{
		Mojo.Log.logException(e, 'aliasesModel#get');
	}
};
aliasesModel.prototype.getAliasKey = function(alias)
{
	try 
	{
		if (this.aliases.length > 0) 
		{
			for (var a = 0; a < this.aliases.length; a++)
			{
				if (this.aliases[a].alias.toLowerCase() == alias.toLowerCase())
				{
					return a;
				}
			}
		}
		return false;
	} 
	catch (e) 
	{
		Mojo.Log.logException(e, 'aliasesModel#getAliasKey');
	}
};
aliasesModel.prototype.add = function(alias, command)
{
	try 
	{
		this.aliases.push({alias: alias.toLowerCase(), command: command.toLowerCase()});
		this.save();
	} 
	catch (e)
	{
		Mojo.Log.logException(e, 'aliasesModel#add');
	}
};
aliasesModel.prototype.edit = function(key, alias, command)
{
	try 
	{
		this.aliases[key] = {alias: alias.toLowerCase(), command: command.toLowerCase()};
		this.save();
	}
	catch (e) 
	{
		Mojo.Log.logException(e, 'aliasesModel#edit');
	}
};
aliasesModel.prototype.del = function(key)
{
	try 
	{
		this.aliases[key] = false;
		this.save();
	} 
	catch (e) 
	{
		Mojo.Log.logException(e, 'aliasesModel#del');
	}
};

aliasesModel.defaultHighest = 1;
aliasesModel.defaultAliases =
[	// aliases to load automatically
	// add one to num and increment defaultHighest above
	// so only the new default will be added
	// not sure how to handle replacement or removal
	{num: 1, alias: 'j',		command: 'join &2'},
	{num: 1, alias: 'leave',	command: 'part &2'},
	{num: 1, alias: 'm',		command: 'msg &2'},
	{num: 1, alias: 'raw',		command: 'quote &2'},
	{num: 1, alias: 'exit',		command: 'quit'},
	{num: 1, alias: 'ns',		command: 'msg NickServ &2'},
	{num: 1, alias: 'authserv',	command: 'msg AuthServ &2'}
];
aliasesModel.commandHelp = function()
{
	var r = 'Commands are entered by typing a / then the command.<br /><br /><span style="text-transform: uppercase;">';
	for (var c = 0; c < aliasesModel.commands.length; c++)
	{
		r += '<div style="display: inline-block; width: 32%;">' + aliasesModel.commands[c] + '</div>';
	}
	r += '</span><br /><br />This list doesn\'t include any of the aliases defined in the preferences.';
	return r;
};
aliasesModel.commands =
[	// built-in commands that can't be an alias
	'ame',
	'amsg',
	'away',
	'ctcp',
	'dcc',
	'getip',
	'help',
	'ignore',
	'invite',
	'join',
	'kick',
	'list',
	'me',
	'mode',
	'msg',
	'nick',
	'notice',
	'part',
	'partall',
	'ping',
	'query',
	'quit',
	'quote',
	'topic',
	'trace',
	'umode',
	'who',
	'whois',
	'whowas'
];
