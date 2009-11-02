function database()
{
	this.outputLog = false;
	
	this.db = null;
	this.openDB();
	
	//this.dropTables();
	this.createTables();
	//this.initialData();
}

database.prototype.initialData = function()
{
	/*
	this.saveServer(
	{
		id:				false,
		alias:			'Freenode',
		address:		'irc.freenode.net',
		port:			'',
		autoConnect:	true
	}, this.dumpResults.bind(this));
	
	this.saveServer(
	{
		id:				false,
		alias:			'',
		address:		'irc.no.alias.com',
		port:			'',
		autoConnect:	false
	}, this.dumpResults.bind(this));
	
	for (var x = 1; x <= 10; x++)
	//for (var x = 1; x <= 2; x++)
	{
		this.saveServer(
		{
			id:				false,
			alias:			'Test Server #' + x,
			address:		'irc.test' + x + '.org',
			port:			'',
			autoConnect:	false
		}, this.dumpResults.bind(this));
	}
	*/
}

database.prototype.getServers = function(callback)
{
	this.db.transaction(function(tx)
	{
		tx.executeSql
		(
			"SELECT * FROM servers;",
			[],
			function(tx, result)
			{
				db.log('Got Servers');
				callback(result);
			},
			function(tx, error)
			{
				db.log('Error Getting Servers');
				callback(result);
			}
		);
	});
}
database.prototype.getServer = function(id, callback)
{
	this.db.transaction(function(tx)
	{
		tx.executeSql
		(
			"SELECT * FROM servers WHERE id=?;",
			[id],
			function(tx, result)
			{
				db.log('Got Server');
				callback(result);
			},
			function(tx, error)
			{
				db.log('Error Getting Server');
				callback(result);
			}
		);
	});
}
database.prototype.saveServer = function(params, callback)
{
	if (params.id === false)
	{
		var query = "INSERT INTO servers (alias, address, port, autoConnect, onConnect) VALUES (?, ?, ?, ?, ?)";
		var data = [params.alias, params.address, params.port, params.autoConnect, params.onConnect];
	}
	else
	{
		var query = "UPDATE servers SET alias=?, address=?, port=?, autoConnect=?, onConnect=? WHERE id=?";
		var data = [params.alias, params.address, params.port, params.autoConnect, params.onConnect, params.id];
	}
	
	this.db.transaction(function(tx)
	{
		tx.executeSql
		(
			query, 
			data,
			function(tx, result)
			{
				db.log('Server Saved: ' + params.alias);
				callback(result);
			},
			function(tx, error)
			{
				db.log('Error Saving Server: ' + params.alias);
				callback(result);
			}
			
		);
	});
}
database.prototype.deleteServer = function(id, callback)
{
	this.db.transaction(function(tx)
	{
		tx.executeSql
		(
			"DELETE FROM servers WHERE id=?",
			[id],
			function(tx, result)
			{
				db.log('Server Deleted:' + id);
				callback(result);
			},
			function(tx, error)
			{
				db.log('Error Deleting Server:' + id);
				callback(result);
			}
		);
	});
}

database.prototype.createTables = function()
{
	this.db.transaction(function (tx)
	{
		tx.executeSql
		(
			"CREATE TABLE IF NOT EXISTS servers (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, alias VARCHAR NOT NULL, address VARCHAR NOT NULL, port INTEGER NOT NULL, autoConnect BOOL, autoIdentify BOOL, identifyService VARCHAR, identifyPassword VARCHAR, onConnect TEXT);",
			[], 
			function(tx, result)
			{
				db.log('Table Created [servers]');
			},
			function(tx, error)
			{
				db.log('Table Create Failed [servers]');
			}
		);
	});
}
database.prototype.dropTables = function()
{
	this.db.transaction(function (tx)
	{
		tx.executeSql
		(
			"DROP TABLE servers;",
			[], 
			function(tx, result)
			{
				db.log('Table Dropped [servers]');
			},
			function(tx, error)
			{
				db.log('Table Drop Failed [servers]');
			}
		);
	});
}
database.prototype.openDB = function()
{
	this.db = openDatabase
	(
		'wIRCdb',
		'1',
		'wIRC Database',
		'102400'
	);
	
	if (!this.db)
	{
		db.log('Error Opening Database.');
	}
}

database.prototype.log = function(message)
{
	if (this.outputLog)
	{
		alert(message);
		//console.log(message);
	}
}
database.prototype.dumpResults = function(results)
{
	try
	{
		//for (var x in results) alert(x + ': ' + results[x]);
		//for (var x in results.rows) alert(x + ': ' + results.rows[x]);
		//results.rows.item(0)['']
	}
	catch (e)
	{
		//Mojo.Log.logException(e, "database#dumpResults");
	}
}
