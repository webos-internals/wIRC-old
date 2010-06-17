function filePicker(params)
{
	filePicker.num++;
	this.num =					filePicker.num;
	
	this.params =				params;
	
	this.topLevel =				'/media/internal/';
	this.file =					params.file;
	
	this.onSelect =				params.onSelect;
	
	this.stageName =			'filePicker-' + this.id;
	this.stageController =		false;
	this.assistant =			false;
	
	var test = this.getDirectory(this.topLevel);
	/*
	alert('==========  FOLDER  ==========');
	for (var t = 0; t < test.length; t++)
	{
		var f = test[t];
		for (var o in f) alert(o+': '+f[o]);
		alert('==========');
	}
	*/
}

filePicker.prototype.listDirectory = function(dir)
{
	var json = JSON.parse(plugin.list_directory(dir));
	if (json && json.dir)
		return json.dir;
	else
		return [];
}
filePicker.prototype.statFile = function(file)
{
	return JSON.parse(plugin.stat_file(file));
}
filePicker.prototype.getDirectory = function(dir)
{
	var returnArray = [];
	var d = this.listDirectory(dir);
	if (d.length > 0)
	{
		for (var f = 0; f < d.length; f++)
		{
			if (d[f] != '.' && d[f] != '..')
			{
				var file = this.statFile(dir + d[f]);
				if (file && file.st_size)
				{
					file.name = d[f];
					file.location = dir + d[f];
					returnArray.push(file);
				}
			}
		}
	}
	return returnArray;
}

filePicker.prototype.openFilePicker = function()
{
	
}

filePicker.num = 0;
