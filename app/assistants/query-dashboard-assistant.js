function QueryDashboardAssistant(query)
{
	this.query = query;
	
	this.dashboardElement =			false;
	this.newNumberBubbleElement =	false;
	this.newNumberElement =			false;
	this.dashboardTitleElement =	false;
	this.dashboardTextElement =		false;
	this.iconActionElement =		false;
	this.textActionElement =		false;
	
	this.query.setDashAssistant(this);
}

QueryDashboardAssistant.prototype.setup = function()
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
	
	// put last mesage into fields
	var lastMessage = this.query.getLastMessage();
	this.updateMessage(lastMessage.nick, lastMessage.message);
	
	// to whole thing for tap
	Mojo.Event.listen(this.dashboardElement, Mojo.Event.tap, this.dashTapHandler);
}

QueryDashboardAssistant.prototype.updateMessage = function(nick, message)
{
	this.dashboardTitleElement.innerHTML = nick;
	this.dashboardTextElement.innerHTML = message;
}

QueryDashboardAssistant.prototype.dashTapped = function(event)
{
	this.query.openStage();
	this.query.closeDash();
}

QueryDashboardAssistant.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.dashboardElement, Mojo.Event.tap, this.dashTapHandler);
}
