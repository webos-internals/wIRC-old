var connectionInfo = {}
var stageStack=[];
var stageMakerActive=false;
connectionmanager.identifier = 'palm://com.palm.connectionmanager';

function connectionmanager() {}

connectionmanager.watchStatus = function(callback)
{
	var request = new Mojo.Service.Request(connectionmanager.identifier,
	{
		method: 'getStatus',
		parameters: {
			"subscribe":true
		},
		onSuccess: callback,
		onFailure: callback
	});

	return request;
}
//We get in a stage and a callback, and call the callback when the stage has successfully been created. 
//The desired workflow is request new card -> add card to stack -> each object in stack will use the function as the callback -> callback when stack empty 
connectionmanager.openStage=function(stage,callback)
{
	if(stageMakerActive==true)
	{
		stageStack.push({"stage":stage,cb:callback});
	}
	else
	{
		stageStack.push({"stage":stage,cb:callback});
		connectionmanager.createStages(function(){
		})
	}
}
connectionmanager.createStages=function(callback,og)
{
	stageMakerActive=true
	if(stageStack.length>0)
	{
		var stack=stageStack.pop();
		Mojo.Controller.appController.createStageWithCallback({name: stack.stage.stageName, lightweight: true}, function(controller){
					controller.pushScene('channel-chat', {name:stack.stage,"creationCB":function(scene){
						connectionmanager.createStages(null,og);
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