enyo.kind({
	
	name: 'wIRC.ServerDrawer',
	kind: 'DividerDrawer',
	flex: 1,
	
	published: {
		serverID: null
	},
		
})

enyo.kind({
	
	name: 'wIRC.ServerListItem',
	kind: enyo.Control,
	
	events: {
		onBufferClick: ''
	},

	components: [
		{
			kind: 'wIRC.ServerDrawer',
			name: 'divider',
			onmousedown: 'bufferClicked',
			serverID: null,
		}
	],
  	
  	update: function(id, address, buffers) {
  		this.log([id,address,buffers])
  		this.serverID = id
		this.$.divider.setCaption(address)
		this.$.divider.destroyControls()
		for (i in buffers) {
			this.$.divider.createComponent({
				content: buffers[i],
				kind: 'Item',
				style: 'padding-left: 20px; font-size:70%;'
			})	
		}
	},
	
	bufferClicked: function(inSender, inEvent) {
		this.doBufferClick(this.serverId)
	}
  	
})
	
	
	
	
