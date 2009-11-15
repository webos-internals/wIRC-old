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
	
	if (this.nick.whois.realname)		data += Mojo.View.render({object: {title: 'Real Name', data: this.nick.whois.realname}, template: rowTemplate});
	if (this.nick.whois.user)			data += Mojo.View.render({object: {title: 'User Name', data: this.nick.whois.user}, template: rowTemplate});
	
	if (this.nick.whois.away)			data += Mojo.View.render({object: {title: 'Away', data: this.nick.whois.away}, template: rowTemplate});
	
	if (this.nick.whois.host)			data += Mojo.View.render({object: {title: 'Host', data: this.nick.whois.host}, template: rowTemplate});
	
	if (this.nick.whois.idle>0)			data += Mojo.View.render({object: {title: 'Idle For', data: formatSeconds(this.nick.whois.idle)}, template: rowTemplate});
	if (this.nick.whois.signon)			data += Mojo.View.render({object: {title: 'Signed On At', data: formatDate(this.nick.whois.signon)}, template: rowTemplate});
	if (this.nick.whois.signon)			data += Mojo.View.render({object: {title: 'Signed On For', data: formatSeconds(Math.round(new Date().getTime()/1000.0)-this.nick.whois.signon)}, template: rowTemplate});
	
	if (this.nick.whois.serverUrl)		data += Mojo.View.render({object: {title: 'Server', data: '<a href="'+this.nick.whois.serverUrl+'">' + this.nick.whois.server + '</a>', rowClass: 'last'}, template: rowTemplate});
	else if (this.nick.whois.server)	data += Mojo.View.render({object: {title: 'Server', data: this.nick.whois.server, rowClass: 'last'}, template: rowTemplate});
	
	
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