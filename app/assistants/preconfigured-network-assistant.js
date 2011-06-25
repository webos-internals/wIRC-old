function PreconfiguredNetworkAssistant(network)
{
	this.network = network;
	
	this.listNoRegionModel =
	{
		items: []
	};
	this.listModel =
	{
		items: []
	};

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

PreconfiguredNetworkAssistant.prototype.setup = function() 
{
	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	this.networkElement =		this.controller.get('network');
	this.listNoRegionElement =	this.controller.get('serverNoRegionList');
	this.listElement =			this.controller.get('serverList');
	this.listTapHandler =		this.listTapHandler.bindAsEventListener(this);
	
	// Add back button functionality for the TouchPad
	this.backElement = this.controller.get('back');
	this.backTapHandler = this.backTap.bindAsEventListener(this);
	this.controller.listen(this.backElement, Mojo.Event.tap, this.backTapHandler);
	
	this.networkElement.update(this.network);
	
	if (preconfigured.length > 0)
	{
		for (var p = 0; p < preconfigured.length; p++)
		{
			if (preconfigured[p].network == this.network) 
			{
				var networkObj = 
				{
					group: preconfigured[p].region,
					name: (preconfigured[p].subregion ? preconfigured[p].subregion : preconfigured[p].address),
					rowClass: (preconfigured[p].subregion ? 'subregion-title' : 'address-title'),
					address: preconfigured[p].address,
					param: 
					{
						alias: preconfigured[p].network + (preconfigured[p].subregion ? ': ' + preconfigured[p].subregion : (preconfigured[p].region ? ': ' + preconfigured[p].region : '')),
						address: preconfigured[p].address
					}
				};
				if (preconfigured[p].region) 
				{
					this.listModel.items.push(networkObj);
				}
				else
				{
					this.listNoRegionModel.items.push(networkObj);
				}
			}
		}
	}
	
	this.controller.setupWidget
	(
		'serverNoRegionList',
		{
			itemTemplate: "preconfigured-network/server-row",
			swipeToDelete: false,
			reorderable: false
		},
		this.listNoRegionModel
	);
	this.controller.setupWidget
	(
		'serverList',
		{
			itemTemplate: "preconfigured-network/server-row",
			dividerTemplate: "preconfigured-network/region-divider",
			dividerFunction: this.getDivider.bind(this),
			swipeToDelete: false,
			reorderable: false
		},
		this.listModel
	);
	
	Mojo.Event.listen(this.listNoRegionElement, Mojo.Event.listTap, this.listTapHandler);
	Mojo.Event.listen(this.listElement, Mojo.Event.listTap, this.listTapHandler);
}

PreconfiguredNetworkAssistant.prototype.getDivider = function(item)
{
	if (item.group) return item.group;
	else return '';
}

PreconfiguredNetworkAssistant.prototype.listTapHandler = function(event)
{
	this.controller.stageController.pushScene('server-info', event.item.param);
}

PreconfiguredNetworkAssistant.prototype.backTap = function(event)
{
    if (Mojo.Environment.DeviceInfo.modelNameAscii == 'TouchPad') {
		this.controller.stageController.popScene();
    }
};

PreconfiguredNetworkAssistant.prototype.handleCommand = function(event)
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

PreconfiguredNetworkAssistant.prototype.cleanup = function(event) 
{
	Mojo.Event.stopListening(this.backElement, Mojo.Event.tap, this.backTapHandler);
	Mojo.Event.stopListening(this.listNoRegionElement, Mojo.Event.listDelete, this.listTapHandler);
	Mojo.Event.stopListening(this.listElement, Mojo.Event.listDelete, this.listTapHandler);
}
