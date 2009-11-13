function PreconfiguredNetworksAssistant()
{
	this.listModel =
	{
		items:
		[
			{
				name: 'Custom',
				rowClass: 'custom',
				scene: 'server-info',
				param: false
			}
		]
	};
	
	this.networks = {};
}

PreconfiguredNetworksAssistant.prototype.setup = function()
{
	this.listElement =		this.controller.get('networkList');
	this.listTapHandler =	this.listTapHandler.bindAsEventListener(this);
	
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
				this.networks[preconfigured[p].network].scene = 'preconfgured-network';
				this.networks[preconfigured[p].network].param = {network: preconfigured[p].network};
				
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
	
	Mojo.Event.listen(this.listElement, Mojo.Event.listTap, this.listTapHandler);
}
PreconfiguredNetworksAssistant.prototype.listTapHandler = function(event)
{
	if (event.item.scene)
	{
		this.controller.stageController.pushScene(event.item.scene, event.item.param);
	}
	else
	{
		this.controller.stageController.pushScene(this.networks[event.item.name].scene, this.networks[event.item.name].param);
	}
}
PreconfiguredNetworksAssistant.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.listElement, Mojo.Event.listDelete, this.listTapHandler);
}
