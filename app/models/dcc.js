function ircDcc(params)
{
	this.id =			params.dcc_id;
	this.nick =			params.nick;
	this.params =		params;
	this.server =		params.server;
	this.address =		params.address;
	this.filename =		params.filename;
	this.size =			params.size;
	
	this.requestBannerName = 'dcc-' + this.server.id + '-' + this.id;
	this.requestDashName = 'dccdash-' + this.server.id + '-' + this.id;
}

ircDcc.prototype.openRequest = function()
{
	try
	{
		
		var msgText = this.nick.name + ' wants to chat';
		var icon = 'icon-dcc-chat.png';
		if (this.filename && this.size) {
			msgText = this.nick.name + ' wants to send: ' + this.filename;
			icon = 'icon-dcc-send.png';
		}
		
		Mojo.Controller.appController.showBanner
		(
			{
				icon: icon,
				messageText: msgText,
				soundClass: (prefs.get().dashboardInviteSound?"alerts":"")
			},
			{
				type: 'dcc',
				server: this.server.id,
				id: this.id
			},
			this.requestBannerName
		);
					
		var tmpController = Mojo.Controller.appController.getStageController(this.requestDashName);
	    if (tmpController) 
		{
			// do nothing on second invite if dash already exists?
		}
		else
		{
			Mojo.Controller.appController.createStageWithCallback({name: this.requestDashName, lightweight: true}, this.openRequestCallback.bind(this), "dashboard");
		}
		
	}
	catch (e)
	{
		Mojo.Log.logException(e, "ircDcc#openRequest");
	}
}
ircDcc.prototype.openRequestCallback = function(controller)
{
	controller.pushScene('dcc-request-dashboard', this);
}
ircDcc.prototype.closeRequest = function()
{
	try
	{
		Mojo.Controller.appController.removeBanner(this.requestBannerName);
		Mojo.Controller.appController.closeStage(this.requestDashName);
	}
	catch (e)
	{
		Mojo.Log.logException(e, "ircDcc#closeRequest");
	}
}

ircDcc.prototype.accept = function()
{
	plugin.dcc_accept(this.server.id, this.id);
}
