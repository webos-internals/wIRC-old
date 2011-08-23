enyo.kind({
	name: 'wirc.NickItem',
	kind: enyo.Item,
	
	components: [
		{kind: 'Divider', name: 'divider', showing: false},
		{
			layoutKind: 'HFlexLayout', className: 'nick-item', components: [
				//{name: 'mode', className: 'mode'},
        		{name: 'nick', className: 'nick', flex: 1}
			]
		}
	],
	
	setupItem: function(nicks, inIndex) {
		
		var n = nicks[inIndex];
		
		this.$.nick.setContent(n.nick);
		
		if (n.mode == '@')
			this.addClass('op');
		else if (n.mode == '%')
			this.addClass('halfop');
		else if (n.mode == '+')
			this.addClass('voiced');
		else
			this.addClass('member');
		
		if (inIndex==0 || n.mode != nicks[inIndex-1].mode) {
			this.$.divider.setShowing(true);
			this.$.nick.domStyles["border-top"] = "none"
			if (n.mode == '@')
				this.$.divider.setCaption('Ops');
			else if (n.mode == '%')
				this.$.divider.setCaption('Half-Ops');
			else if (n.mode == '+')
				this.$.divider.setCaption('Voiced');
			else
				this.$.divider.setCaption('Members');
		} else {
			this.$.divider.setShowing(false);
		}
		
		if (inIndex < nicks.length-2 && n.mode != nicks[inIndex+1].mode)
			this.$.nick.domStyles["border-bottom"] = "none"
		else if (inIndex == nicks.length-1)
			this.$.nick.domStyles["border-bottom"] = "none"
				
	}
	
});