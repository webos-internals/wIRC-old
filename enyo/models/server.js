function Server(id, address, port) {
	
	this.id = id
	this.address = address
	this.port = port
	this.connected = false
	
	this.data = []
	
	this.buffers = ['Server Log']
	
}
