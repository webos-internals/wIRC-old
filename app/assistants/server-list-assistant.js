function ServerListAssistant()
{
	this.serverListModel = { items: [] };
	
	servers.setListAssistant(this);
}

ServerListAssistant.prototype.setup = function()
{
	try 
	{
		this.updateList(true);
		this.controller.setupWidget('serverList', { itemTemplate: "server-list/server-row", swipeToDelete: false, reorderable: false }, this.serverListModel);
		//Mojo.Event.listen(this.controller.get('serverList'), Mojo.Event.listTap, this.listTapHandler.bindAsEventListener(this));
		
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'server-list#setup');
	}
}

ServerListAssistant.prototype.updateList = function(skipUpdate)
{
	try 
	{
		
		this.serverListModel.items = [];
		this.serverListModel.items = servers.getListObjects();
		
		//alert('Update:' + this.serverListModel.items.length + '-' + skipUpdate);
		
		if (!skipUpdate) 
		{
			this.controller.get('serverList').mojo.noticeUpdatedItems(0, this.serverListModel.items);
			this.controller.get('serverList').mojo.setLength(this.serverListModel.items.length);
		}
		
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'server-list#updateList');
	}
}

ServerListAssistant.prototype.activate = function(event) {}
ServerListAssistant.prototype.deactivate = function(event) {}
ServerListAssistant.prototype.cleanup = function(event) {}
