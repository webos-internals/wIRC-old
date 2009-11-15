function WhoisAssistant(nick)
{
	this.nick = nick;
}

WhoisAssistant.prototype.setup = function()
{
	this.titleElement =			this.controller.get('title');
	this.dataElement =			this.controller.get('whoisData');
	
	this.titleElement.update('Whois - ' + this.nick.name);
	
	var data = '';
	var rowTemplate = 'whois/data-row';
	var dividerTemplate = 'whois/data-divider';
	var channelTemplate = 'whois/data-channel';
	
	data += Mojo.View.render({object: {title: 'Real Name', data: this.nick.whois.realname}, template: rowTemplate});
	data += Mojo.View.render({object: {title: 'User', data: this.nick.whois.user}, template: rowTemplate});
	data += Mojo.View.render({object: {title: 'Host', data: this.nick.whois.host}, template: rowTemplate});
	data += Mojo.View.render({object: {title: 'Idle', data: formatSeconds(this.nick.whois.idle)}, template: rowTemplate});
	data += Mojo.View.render({object: {title: 'Signed On', data: formatDate(this.nick.whois.signon), rowClass: 'last'}, template: rowTemplate});
	
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
	
	this.dataElement.update(data);
}