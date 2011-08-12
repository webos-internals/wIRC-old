enyo.kind({
	
	name: 'wIRC.ServerListItem',
	kind: enyo.Control,
	
	published: {
		buffers: []
	},
	
	components: [
		{
			kind: 'DividerDrawer',
			name: 'divider',
			flex: 1,
			components: [
				{
					kind: "VirtualList",
					name: 'bufferList',
					flex: 1,
					onSetupRow: 'updateBufferList',
					components: [
						{
							style: 'padding-left: 20px; font-size:70%;',
							name: "bufferListItem",
						}
					]
				}
			]
		}
	],
  	
  	update: function(caption, buffers) {
		this.$.divider.setCaption(caption)
		this.buffers = buffers
		this.$.bufferList.refresh()
	},
	
	updateBufferList: function(inSender, inIndex) {
		this.log("update buffer list")
  		if (this.buffers.length > 0 && inIndex >= 0 && inIndex < this.buffers.length) {
      		this.$.bufferListItem.setContent(this.buffers[inIndex])
	      	return true;
		}
	},
  	
})
	
	
	
	
