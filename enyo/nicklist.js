enyo.kind({
	name: 'wirc.NickList',
	kind: enyo.Popup,
	
	components: [
		{name: 'count'}
	],
	
	setCount: function(count) {
		this.$.count.setContent('Nick count: '+count);
	}
	
})