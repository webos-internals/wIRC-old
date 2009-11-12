function InviteDashboardAssistant(server, nick, channel)
{
	this.server =	server;
	this.nick =		nick;
	this.channel =	channel;
	
	this.dashboardElement =			false;
	this.newNumberBubbleElement =	false;
	this.newNumberElement =			false;
	this.dashboardTitleElement =	false;
	this.dashboardTextElement =		false;
	this.iconActionElement =		false;
	this.textActionElement =		false;
	
	this.messageCount =				0;
}

InviteDashboardAssistant.prototype.setup = function()
{
	this.dashboardElement =			this.controller.get('dashboard');
	this.newNumberBubbleElement =	this.controller.get('newNumberBubble');
	this.newNumberElement =			this.controller.get('newNumber');
	this.dashboardTitleElement =	this.controller.get('dashboardTitle');
	this.dashboardTextElement =		this.controller.get('dashboardText');
	this.iconActionElement =		this.controller.get('iconAction');
	this.textActionElement =		this.controller.get('textAction');
	
	this.dashTapHandler =	this.dashTapped.bindAsEventListener(this);
	
	// hide new bubble
	this.newNumberBubbleElement.style.display = 'none';
	
	// puts message
	this.dashboardTitleElement.innerHTML = this.nick + ' invites you to: ' + this.channel;
	this.dashboardTextElement.innerHTML = 'Tap to Join, Swipe to Ignore.';
	
	// to whole thing for tap
	Mojo.Event.listen(this.dashboardElement, Mojo.Event.tap, this.dashTapHandler);
}

InviteDashboardAssistant.prototype.dashTapped = function(event)
{
	this.server.joinChannel(this.channel);
	this.server.closeInvite(this.nick, this.channel);
}

InviteDashboardAssistant.prototype.cleanup = function(event)
{
	this.server.closeInvite(this.nick, this.channel);
	Mojo.Event.stopListening(this.dashboardElement, Mojo.Event.tap, this.dashTapHandler);
}
