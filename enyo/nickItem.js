enyo.kind({
	name: 'wirc.NickItem',
	kind: enyo.Item,
	
	components: [
		{
			layoutKind: 'HFlexLayout', className: 'nick-item', components: [
				{name: 'mode', className: 'mode'},
        		{name: 'nick', className: 'nick', flex: 1}
			]
		}
	],
	
	setupItem: function(nick) {
		var n = nick;
		if (n[0] == '@') {
			n = n.substring(1);
			this.$.mode.addClass('icon op');
		} else if (n[0] == '%') {
			n = n.substring(1);
			this.$.mode.addClass('icon halfop');
		} else if (n[0] == '+') {
			n = n.substring(1);
			this.$.mode.addClass('icon voice');
		}
		this.$.nick.setContent(n);
	}
	
});