function WhoisAssistant(nick)
{
	this.nick = nick;
	
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

WhoisAssistant.prototype.setup = function()
{
	// set theme
	this.controller.document.body.className = prefs.get().theme;

	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	this.titleElement =			this.controller.get('title');
	this.dataElement =			this.controller.get('whoisData');
	
	this.titleElement.update('Whois - ' + this.nick.name);
}

WhoisAssistant.prototype.activate = function(event)
{
	this.updateData();
}

WhoisAssistant.prototype.updateData = function()
{
	var data = '';
	var rowTemplate = 'whois/data-row';
	var dividerTemplate = 'whois/data-divider';
	var channelTemplate = 'whois/data-channel';
	
	// clear scene
	this.dataElement.update(data);
	
	// data elements
	if (this.nick.whois.realname)		data += Mojo.View.render({object: {title: 'Real Name', data: this.nick.whois.realname}, template: rowTemplate});
	if (this.nick.whois.user)			data += Mojo.View.render({object: {title: 'User Name', data: this.nick.whois.user}, template: rowTemplate});
	
	if (this.nick.whois.away)			data += Mojo.View.render({object: {title: 'Away', data: this.nick.whois.away}, template: rowTemplate});
	
	if (this.nick.whois.host)			data += Mojo.View.render({object: {title: 'Host', data: this.nick.whois.host}, template: rowTemplate});
	
	if (this.nick.whois.idle>0)			data += Mojo.View.render({object: {title: 'Idle For', data: formatSeconds(this.nick.whois.idle)}, template: rowTemplate});
	if (this.nick.whois.signon)			data += Mojo.View.render({object: {title: 'Signed On At', data: formatDate(this.nick.whois.signon)}, template: rowTemplate});
	if (this.nick.whois.signon)			data += Mojo.View.render({object: {title: 'Signed On For', data: formatSeconds(Math.round(new Date().getTime()/1000.0)-this.nick.whois.signon)}, template: rowTemplate});
	
	if (this.nick.whois.serverUrl)		data += Mojo.View.render({object: {title: 'Server', data: '<a href="'+this.nick.whois.serverUrl+'">' + this.nick.whois.server + '</a>', rowClass: 'last'}, template: rowTemplate});
	else if (this.nick.whois.server)	data += Mojo.View.render({object: {title: 'Server', data: this.nick.whois.server, rowClass: 'last'}, template: rowTemplate});
	
	// channel elements
	if (this.nick.whois.channels.length > 0)
	{
		data += Mojo.View.render({object: {title: 'Channels'}, template: dividerTemplate});
		for (var c = 0; c < this.nick.whois.channels.length; c++)
		{
			if (c == (this.nick.whois.channels.length-1))
			{
				this.nick.whois.channels[c].rowClass = 'last';
			}
			data += Mojo.View.render({object: this.nick.whois.channels[c], template: channelTemplate});
		}
	}
	
	// update scene
	this.dataElement.update(data);
	
	// listen for channel taps
	if (this.nick.whois.channels.length > 0) 
	{
		for (var c = 0; c < this.nick.whois.channels.length; c++) 
		{
			Mojo.Event.listen(this.controller.get('row-' + this.nick.whois.channels[c].channel), Mojo.Event.tap, this.channelTap.bindAsEventListener(this, this.nick.whois.channels[c].channel));
		}
	}
}
	
WhoisAssistant.prototype.channelTap = function(event, channel)
{
	if (this.nick.server)
	{
		this.nick.server.joinChannel(channel);
	}
}

WhoisAssistant.prototype.handleCommand = function(event)
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