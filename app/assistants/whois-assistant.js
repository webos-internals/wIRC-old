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
	
	data += Mojo.View.render({object: {title: 'Real Name', data: this.nick.whois.realname}, template: rowTemplate});
	data += Mojo.View.render({object: {title: 'User', data: this.nick.whois.user}, template: rowTemplate});
	data += Mojo.View.render({object: {title: 'Host', data: this.nick.whois.host}, template: rowTemplate});
	data += Mojo.View.render({object: {title: 'Idle', data: formatSeconds(this.nick.whois.idle)}, template: rowTemplate});
	data += Mojo.View.render({object: {title: 'Signed On', data: formatDate(this.nick.whois.signon), rowClass: 'last'}, template: rowTemplate});
	
	data += Mojo.View.render({object: {title: 'Channels'}, template: dividerTemplate});
	
	this.dataElement.update(data);
}