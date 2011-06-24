function HelpDataAssistant(data)
{
	this.data = data;
	
	// setup menu
	this.menuModel =
	{
		visible: true,
		items:
		[
			Mojo.Menu.editItem,
			{
				label: "Help",
				command: 'do-help'
			}
		]
	};
};

HelpDataAssistant.prototype.setup = function()
{
	this.controller.get('help-title').innerHTML = $L(this.data.title);
	if (this.data.data)
	{
		this.controller.get('data').innerHTML = $L(this.data.data);
	}
	if (this.data.func)
	{
		this.controller.get('data').innerHTML = this.data.func();
	}
	
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	// Add back button functionality for the TouchPad
	this.backElement = this.controller.get('icon');
	this.backTapHandler = this.backTap.bindAsEventListener(this);
	this.controller.listen(this.backElement, Mojo.Event.tap, this.backTapHandler);

};

HelpDataAssistant.prototype.backTap = function(event)
{
    if (Mojo.Environment.DeviceInfo.modelNameAscii == 'TouchPad') {
	this.controller.stageController.popScene();
    }
};

HelpDataAssistant.prototype.activate = function(event)
{
	/*if (this.controller.stageController.setWindowOrientation)
	{
    	this.controller.stageController.setWindowOrientation("up");
	}*/
};
HelpDataAssistant.prototype.deactivate = function(event) {};
HelpDataAssistant.prototype.cleanup = function(event) {
	Mojo.Event.stopListening(this.backElement, Mojo.Event.tap, this.backTapHandler);
};

// Local Variables:
// tab-width: 4
// End:
