function ircChannel(params)
{
	this.name =				params.name;
	this.server =			params.server;
	this.stageName =		'channel-' + this.server.alias + '-' + this.name;
	this.stageController =	false;
}

ircChannel.prototype.openStage = function()
{
	try
	{
		this.stageController = Mojo.Controller.appController.getStageController(this.stageName);
	
        if (this.stageController) 
		{
			this.stageController.popScenesTo('channel-chat');
			this.stageController.activate();
		}
		else
		{
			var f = function(controller)
			{
				controller.pushScene('channel-chat', this);
			};
			Mojo.Controller.appController.createStageWithCallback({name: this.stageName, lightweight: true}, f);
		}
	}
	catch (e)
	{
		Mojo.Log.logException(e, "ircChannel#openStage");
	}
}
