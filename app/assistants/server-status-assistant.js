function ServerStatusAssistant(server)
{
	this.server = server;
	this.inputModel = {value:''};
}

ServerStatusAssistant.prototype.setup = function()
{
	this.controller.get('title').innerHTML = this.server.alias;
	
	this.controller.setupWidget
	(
		'inputWidget',
		{
			multiline: true,
			enterSubmits: true,
			//hintText: $L('Message...'),
			modelProperty: 'value',
			focus: false,
			changeOnKeyPress: true
		},
		this.inputModel
	);
	
}

ServerStatusAssistant.prototype.activate = function(event) {}
ServerStatusAssistant.prototype.deactivate = function(event) {}
ServerStatusAssistant.prototype.cleanup = function(event) {}
