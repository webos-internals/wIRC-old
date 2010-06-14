function DccSendDashboardAssistant(dcc)
{
	this.dcc = dcc;
	
	this.dashboardElement =			false;
	this.newNumberBubbleElement =	false;
	this.newNumberElement =			false;
	this.dashboardTitleElement =	false;
	this.dashboardTextElement =		false;
	this.iconActionElement =		false;
	this.textActionElement =		false;
	
	this.messageCount =				0;
	
	this.dcc.setSendDashAssistant(this);
}

DccSendDashboardAssistant.prototype.setup = function()
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
	
	this.updateData(this.dcc.percent, this.dcc.filename, this.dcc.size);
	
	// to whole thing for tap
	Mojo.Event.listen(this.dashboardElement, Mojo.Event.tap, this.dashTapHandler);
}

DccSendDashboardAssistant.prototype.updateData = function(percent, message1, message2)
{
	if (percent > 1)
	{
		this.newNumberBubbleElement.style.display = '';
		this.newNumberElement.innerHTML = percent;
	}
	this.dashboardTitleElement.innerHTML = message1;
	this.dashboardTextElement.innerHTML = message2;
}

DccSendDashboardAssistant.prototype.dashTapped = function(event)
{
	this.dcc.openStage();
	this.dcc.closeDash();
}

DccSendDashboardAssistant.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.dashboardElement, Mojo.Event.tap, this.dashTapHandler);
}
