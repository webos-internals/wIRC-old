enyo.kind({
	
	name: 'wIRC.ServerListItem',
	kind: enyo.Control,

	components: [
		{
			kind: 'DividerDrawer',
			name: 'divider',
			flex: 1
		}
	],
  	
  	update: function(caption) {
		this.$.divider.setCaption(caption)
	},
	
	addBuffer: function(buffer) {
		this.$.divider.createComponent({
			style: 'padding-left: 20px; font-size:70%;',
			content: buffer
		})
	}
  	
})
	
	
	
	
