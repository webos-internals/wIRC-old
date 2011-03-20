var stageStack = [];
var stageMakerActive = false;
var stageMakerTimer = false;

function stageManager() {}

//We get in a stage and a callback, and call the callback when the stage has successfully been created. 
//The desired workflow is request new card -> add card to stack -> each object in stack will use the function as the callback -> callback when stack empty 
stageManager.openStage = function(stage, callback)
{
	if(stageMakerActive == true)
	{
		stageStack.push({"stage": stage, "callback": callback});
	}
	else
	{
		stageStack.push({"stage": stage, "callback": callback});
		stageManager.createStages();
	}
}
stageManager.stageInQueue = function(stage)
{
	if (stageStack.length > 0)
	{
		for (var s = 0; s < stageStack.length; s++)
		{
			if (stageStack[s].stage == stage) return true;
		}
	}
	return false;
}
stageManager.createStages = function()
{
	try
	{
		stageMakerActive = true
		if (stageMakerTimer) clearTimeout(stageMakerTimer);
		if (stageStack.length > 0)
		{
			var stack = stageStack.shift();
			Mojo.Controller.appController.createStageWithCallback({name: stack.stage, lightweight: true}, function(c)
			{
				if (stack.callback) stack.callback(c);
				Mojo.Event.listen(c.document, Mojo.Event.stageActivate, function(){ if (stageMakerActive) stageManager.createStages(); });
			});
			stageMakerTimer = setTimeout(function() { if (stageMakerActive) stageManager.createStages(); }, 3 * 1000);
		}
		else
		{
			stageMakerActive = false;
		}
	}
	catch (e)
	{
		Mojo.Log.logException(e, "stageManager#createStages");
		if (stageMakerActive) stageManager.createStages();
	}
}

