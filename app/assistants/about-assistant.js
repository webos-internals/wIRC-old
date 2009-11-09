function AboutAssistant(id)
{
	this.serviceVersionElement =		false;
}

AboutAssistant.prototype.setup = function()
{
	this.serviceVersionElement = this.controller.get('serviceVersion');
	wIRCd.version(this.serviceVersionHandler.bindAsEventListener(this));
}

AboutAssistant.prototype.serviceVersionHandler = function(payload)
{
	if (payload && payload.serviceVersion)
		this.serviceVersionElement.update(payload.serviceVersion);
}

AboutAssistant.prototype.activate = function(event)
{
}

AboutAssistant.prototype.cleanup = function(event)
{
}
