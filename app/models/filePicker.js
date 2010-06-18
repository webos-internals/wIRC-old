/*
 * filePicker
 * 
 * usage:
 * var f = new filePicker({
 * 		type: 'file', // or folder
 * 		onSelect: function, // function that will be called upon completion
 * 		pop: false // make truthy if you want the filePicker to pop its own stage for selecting
 * });
 * 
 * 
 */

function filePicker(params)
{
	filePicker.num++;
	this.num =					filePicker.num;
	
	this.topLevel =				'/media/internal/';
	
	this.params =				params;
	
	this.type =					(params.type ? params.type : 'file');
	this.onSelect =				params.onSelect;
	this.pop =					(params.pop ? params.pop : false);
	
	this.stageName =			'filePicker-' + this.num;
	this.sceneName =			this.type + '-picker';
	this.stageController =		false;
	this.assistant =			false;
	this.popped =				false;
	
	this.openFilePicker();
	/*
	var test = this.getDirectory(this.topLevel);
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
	// this function takes how the plugin works and makes it sane
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
	if (this.pop)
	{
		this.popFilePicker();
	}
	else
	{
		this.stageController = Mojo.Controller.appController.getActiveStageController('card');
	    if (this.stageController)
		{
			this.stageController.pushScene(this.sceneName, this);
		}
		else
		{
			this.popFilePicker();
		}
	}
}
filePicker.prototype.popFilePicker = function()
{
	this.stageController = Mojo.Controller.appController.getStageController(this.stageName);
	
    if (this.stageController)
	{
		var scenes = this.stageController.getScenes();
		if (scenes[0].sceneName == this.sceneName && scenes.length > 1)
		{
			this.stageController.popScenesTo(this.sceneName);
		}
		this.stageController.activate();
	}
	else
	{
		var f = function(controller)
		{
			controller.pushScene(this.sceneName, this);
			this.popped = true;
		};
		Mojo.Controller.appController.createStageWithCallback({name: this.stageName, lightweight: true}, f.bind(this));
	}
}

filePicker.num = 0;
