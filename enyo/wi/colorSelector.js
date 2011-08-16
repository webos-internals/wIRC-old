enyo.kind({
	name: 'wi.ColorSelector',
	kind: 'Item',
	layoutKind: 'HFlexLayout',
	align: 'center',
	
	published: {
		caption: '',
		value: {}
	},
	
	components: [
		
		{name: 'popup', kind: 'wi.ColorSelector.Popup', onColorSelect: 'colorSelected'},
		
		{flex: 1, components: [
			{name: 'display', style: 'width: 80px; height: 30px; background-color: #000; border-radius: 5px;', onclick: 'openPopup'},
		]},
		{name: 'caption'},
	],
	
	create: function () {
	    this.inherited(arguments);
		this.$.caption.setContent(this.caption);
		this.updateDisplay();
	},
	
	setValue: function(value) {
		this.value = value;
		this.updateDisplay();
	},
	getValue: function() {
		return this.value;
	},
	
	updateDisplay: function() {
		this.$.display.applyStyle('background-color', this.value);
	},
	
	openPopup: function() {
		this.$.popup.openAroundControl(this, true, 'left');
	},
	
	colorSelected: function(inSender, inRGB) {
		this.$.display.applyStyle('background-color', 'rgb(' + inRGB.r + ', ' + inRGB.g + ', ' + inRGB.b + ')');
	}
	
});

enyo.kind({
	name: 'wi.ColorSelector.Popup',
	kind: 'Popup',
	scrim: false,
	
	style: 'margin-top: -60px; margin-left: -10px;',
	popupBorderWidth: 24, // so says the css for the popup
	previewWidth: 55, // the width+marginright of the preview element
	
	events: {
		onColorSelect: ''
	},
	
	components: [
		{kind: 'VFlexBox', style: 'height: 200px; width: 40px; float: left; margin-right: 15px;', components: [
			{name: 'preview', style: 'background: #000; border-radius: 5px;', flex: 1},
			{name: 'entry', kind: 'Button', style: 'margin: 15px 0 0 0;', content: '#'}
		]},
		{
			name: 'canvas',
			kind: enyo.Control,
			nodeTag: 'canvas',
			domAttributes: {
				width: '340px',
				height: '200px',
			},
			style: 'border-radius: 5px; margin-bottom: -5px;',
			onclick: 'canvasClick',
		},
	],
	
	
	doOpen: function() {
		this.$.canvas.hasNode();
		this.ctx = this.$.canvas.node.getContext('2d');
		
		this.img = new Image();
		this.img.src = 'enyo/images/colors.png';
		this.img.onload = enyo.bind(this, 'drawImage');
	},
	doClose: function() {
	},
	
	drawImage: function() {
		this.ctx.drawImage(this.img, 0, 0);
	},
	
	canvasClick: function(inSender, inEvent) {
		var c = this.canvasGetColorFromPosition(this.canvasCursorClickPosition(inEvent));
		this.doColorSelect(c);
		this.close();
	},
	canvasCursorClickPosition: function(inEvent) {
		var x, y;
		x = inEvent.offsetX;
		y = inEvent.offsetY;
		return {x: x, y: y};
	},
	canvasGetColorFromPosition: function(pos) {
		var data = this.ctx.getImageData(pos.x, pos.y, 1, 1).data;
		return {r: data[0], g: data[1], b: data[2], a: data[3]};
	},
	
	dragGetCanvasPosition: function(inSender, inEvent) {
		var x, y;
		x = inEvent.pageX - (parseInt(this.node.style.left, 10) + parseInt(this.node.style.marginLeft, 10) + this.popupBorderWidth + this.previewWidth);
		y = inEvent.pageY - (parseInt(this.node.style.top, 10) + parseInt(this.node.style.marginTop, 10) + this.popupBorderWidth);
		return {x: x, y: y};
	},
	dragstartHandler: function(inSender, inEvent) {
	},
	dragHandler: function(inSender, inEvent) {
		var c = this.canvasGetColorFromPosition(this.dragGetCanvasPosition(inSender, inEvent));
		this.$.preview.applyStyle('background-color', 'rgb(' + c.r + ', ' + c.g + ', ' + c.b + ')');
	},
	dragfinishHandler: function(inSender, inEvent) {
		var c = this.canvasGetColorFromPosition(this.dragGetCanvasPosition(inSender, inEvent));
		this.doColorSelect(c);
	},
	
});
