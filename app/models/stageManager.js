var stageStack = [];
var stageMakerActive = false;

function stageManager() {}

//We get in a stage and a callback, and call the callback when the stage has successfully been created. 
//The desired workflow is request new card -> add card to stack -> each object in stack will use the function as the callback -> callback when stack empty 
stageManager.openStage = function(stage, callback)
{
	if(stageMakerActive == true)
	{
		stageStack.push({"stage": stage, cb: callback});
	}
	else
	{
		stageStack.push({"stage": stage, cb: callback});
		stageManager.createStages(function(){
		})
	}
}
stageManager.createStages = function(callback, og)
{
	stageMakerActive = true
	if(stageStack.length > 0)
	{
		var stack = stageStack.pop();
		Mojo.Controller.appController.createStageWithCallback({name: stack.stage.stageName, lightweight: true}, function(controller){
					controller.pushScene('channel-chat', {name:stack.stage, "creationCB": function(scene){
						stageManager.createStages(null, og);
					}});
		});
	}
	else
	{
		if(og)
		{
			og(null);
		}
	}
}