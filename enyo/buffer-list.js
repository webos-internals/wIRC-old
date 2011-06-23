enyo.kind({
	name: 'wIRC.BufferList',
	kind: enyo.FlyweightList,
	
	published: {
		data: [],
	},
	pageSize: 50,
	
	setupRow: function(inSender, inIndex) {
		var record = this.fetch(inIndex);
		if (record) {
			this.doSetupRow(record, inIndex);
			return true;
		}
	},
	fetch: function(inRow) {
		if (this.data[inRow])
			return this.data[inRow];
		else
			return false;
	},
	rowToPage: function(inRowIndex) {
		return Math.floor(inRowIndex / this.pageSize);
	},
	
	reset: function() {
		var pageTop = this.rowToPage(this.top);
	},
	rewind: function() {
		enyo.FlyweightList.prototype.punt.call(this);
		this.refresh();
	},
	punt: function() {
		this.inherited(arguments);
		this.reset();
	},
});
