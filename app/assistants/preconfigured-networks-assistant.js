function PreconfiguredNetworksAssistant()
{
	this.listModel =
	{
		items: []
	};
	
	this.networks = {};
	
	// setup menu
	this.menuModel =
	{
		visible: true,
		items:
		[
			Mojo.Menu.editItem,
			{
				label: "Preferences",
				command: 'do-prefs'
			},
			{
				label: "Help",
				command: 'do-help'
			}
		]
	};
}

PreconfiguredNetworksAssistant.prototype.setup = function()
{
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	this.customElement =	this.controller.get('custom');
	this.listElement =		this.controller.get('networkList');
	this.customTapHandler =	this.customTapHandler.bindAsEventListener(this);
	this.listTapHandler =	this.listTapHandler.bindAsEventListener(this);
	
	// Add back button functionality for the TouchPad
	this.backElement = this.controller.get('back');
	this.backTapHandler = this.backTap.bindAsEventListener(this);
	this.controller.listen(this.backElement, Mojo.Event.tap, this.backTapHandler);
	
	if (preconfigured.length > 0)
	{
		for (var p = 0; p < preconfigured.length; p++)
		{
			if (!this.networks[preconfigured[p].network]) 
			{
				this.networks[preconfigured[p].network] =
				{
					cound: 1,
					scene: 'server-info',
					param:
					{
						alias: preconfigured[p].network,
						address: preconfigured[p].address
					}
				};
				var networkObj =
				{
					name: preconfigured[p].network
				};
				this.listModel.items.push(networkObj);
			}
			else
			{
				this.networks[preconfigured[p].network].count++;
				this.networks[preconfigured[p].network].scene = 'preconfigured-network';
				this.networks[preconfigured[p].network].param = preconfigured[p].network;
				
			}
		}
	}
	
	this.controller.setupWidget
	(
		'networkList',
		{
			itemTemplate: "preconfigured-networks/network-row",
			swipeToDelete: false,
			reorderable: false
		},
		this.listModel
	);
	
	
	Mojo.Event.listen(this.customElement, Mojo.Event.tap, this.customTapHandler);
	Mojo.Event.listen(this.listElement, Mojo.Event.listTap, this.listTapHandler);
}

PreconfiguredNetworksAssistant.prototype.customTapHandler = function(event)
{
	this.controller.stageController.pushScene('server-info');
}
PreconfiguredNetworksAssistant.prototype.listTapHandler = function(event)
{
	this.controller.stageController.pushScene(this.networks[event.item.name].scene, this.networks[event.item.name].param);
}

PreconfiguredNetworksAssistant.prototype.backTap = function(event)
{
    if (Mojo.Environment.DeviceInfo.modelNameAscii == 'TouchPad') {
		this.controller.stageController.popScene();
    }
};

PreconfiguredNetworksAssistant.prototype.handleCommand = function(event)
{
	if (event.type == Mojo.Event.command)
	{
		switch (event.command)
		{
			case 'do-help':
				this.controller.stageController.pushScene('help');
				break;
				
			case 'do-prefs':
				this.controller.stageController.pushScene('preferences-general');
				break;
		}
	}
}

PreconfiguredNetworksAssistant.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.backElement, Mojo.Event.tap, this.backTapHandler);
	Mojo.Event.stopListening(this.customElement, Mojo.Event.tap, this.customTapHandler);
	Mojo.Event.stopListening(this.listElement, Mojo.Event.listDelete, this.listTapHandler);
}
