function aliasesModel()
{
	this.cookie = false;
	this.aliases = [];
	this.defaultNum = 0;
	this.load();
};
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
aliasesModel.prototype.add = function(alias, command)
{
	try 
	{
		this.aliases.push({alias: alias, command: command});
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
		this.aliases[key] = {alias: alias, command: command};
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
[
	{num: 1, alias: 'j',		command: 'join &2'},
	{num: 1, alias: 'part',		command: 'leave &2'},
	{num: 1, alias: 'm',		command: 'query &2'},
	{num: 1, alias: 'msg',		command: 'query &2'},
	{num: 1, alias: 'raw',		command: 'quote &2'},
	{num: 1, alias: 'ns',		command: 'msg NickServ &2'},
	{num: 1, alias: 'authserv',	command: 'msg AuthServ &2'}
];
