function DccRequestDashboardAssistant(dcc)
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
}

DccRequestDashboardAssistant.prototype.setup = function()
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
	if (this.dcc.filename && this.dcc.size) {
		this.dashboardTitleElement.innerHTML = this.dcc.nick.name + ' wants to send: ' + this.filename;
		this.dashboardElement.className = 'dcc-send-dashboard dashboard-notification-module';
	}
	else {
		this.dashboardTitleElement.innerHTML = this.dcc.nick.name + ' wants to chat';
		this.dashboardElement.className = 'dcc-chat-dashboard dashboard-notification-module';
	}
	this.dashboardTextElement.innerHTML = 'Tap to Accept, Swipe to Reject.';
	
	// to whole thing for tap
	Mojo.Event.listen(this.dashboardElement, Mojo.Event.tap, this.dashTapHandler);
}

DccRequestDashboardAssistant.prototype.dashTapped = function(event)
{
	this.dcc.closeRequest();
	this.dcc.accept();
}

DccRequestDashboardAssistant.prototype.cleanup = function(event)
{
	this.dcc.closeRequest();
	Mojo.Event.stopListening(this.dashboardElement, Mojo.Event.tap, this.dashTapHandler);
}
