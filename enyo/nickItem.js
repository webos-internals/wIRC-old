enyo.kind({
	name: 'wirc.NickItem',
	kind: enyo.Control,
	tapHighlight: true,
	
	
	components: [
		{kind: 'Item', name: 'divider', showing: false, className: 'nick-divider'},
		{kind: enyo.Item, tapHighlight: true, components: [
			{
				layoutKind: 'HFlexLayout', className: 'nick-item', components: [
					//{name: 'mode', className: 'mode'},
	        		{name: 'nick', className: 'nick', flex: 1}
				]
			}
		]}
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
			this.$.divider.domStyles["border-bottom"] = "none"
			this.$.divider.domStyles["border-top"] = "none"
			this.$.nick.domStyles["border-top"] = "none"
			if (n.mode == '@')
				this.$.divider.setContent('Ops');
			else if (n.mode == '%')
				this.$.divider.setContent('Half-Ops');
			else if (n.mode == '+')
				this.$.divider.setContent('Voiced');
			else
				this.$.divider.setContent('Members');
		} else {
			this.$.divider.setShowing(false);
		}
		
		if (inIndex < nicks.length-2 && n.mode != nicks[inIndex+1].mode)
			this.$.nick.domStyles["border-bottom"] = "none"
		else if (inIndex == nicks.length-1)
			this.$.nick.domStyles["border-bottom"] = "none"
				
	}
	
});