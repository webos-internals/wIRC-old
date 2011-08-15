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
	
	style: 'margin-top: -60px; margin-left: -12px;',
	popupBorderWidth: 24, // so says the css for the popup
	
	events: {
		onColorSelect: ''
	},
	
	components: [
		{name: 'dragger', style: 'position: absolute; top: 0px; left 0px; width: 60px; height: 60px; background: #fff; border-radius: 30px;'},
		{
			name: 'canvas',
			kind: enyo.Control,
			nodeTag: 'canvas',
			domAttributes: {
				width: '400px',
				height: '200px',
			},
			onclick: 'canvasClick',
		}
	],
	
	
	doOpen: function() {
		this.$.canvas.hasNode();
		this.ctx = this.$.canvas.node.getContext('2d');
		
		this.img = new Image();
		this.img.src = 'enyo/images/colors.png';
		this.img.onload = enyo.bind(this, 'drawImage');
		
		this.$.dragger.applyStyle('top', '-200px');
		this.$.dragger.applyStyle('left', '-200px');
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
	
	dragGetStartPosition: function(inSender, inEvent) {
		var left, top;
		left = inEvent.pageX - (parseInt(this.node.style.left, 10) + parseInt(this.node.style.marginLeft, 10) + this.popupBorderWidth);
		top = inEvent.pageY - (parseInt(this.node.style.top, 10) + parseInt(this.node.style.marginTop, 10) + this.popupBorderWidth);
		// edit for positioning above the finger?
		left = left - (parseInt(this.$.dragger.node.style.width, 10) / 2);
		top = top - (parseInt(this.$.dragger.node.style.height, 10) / 2) - 50;
		return {left: left, top: top};
	},
	dragGetCanvasPosition: function(inSender, inEvent) {
		var x, y;
		x = inEvent.pageX - (parseInt(this.node.style.left, 10) + parseInt(this.node.style.marginLeft, 10) + this.popupBorderWidth);
		y = inEvent.pageY - (parseInt(this.node.style.top, 10) + parseInt(this.node.style.marginTop, 10) + this.popupBorderWidth);
		return {x: x, y: y};
	},
	dragstartHandler: function(inSender, inEvent) {
		var pos = this.dragGetStartPosition(inSender, inEvent);
		this.$.dragger.applyStyle('top', pos.top + 'px');
		this.$.dragger.applyStyle('left', pos.left + 'px');
	},
	dragHandler: function(inSender, inEvent) {
		var c = this.canvasGetColorFromPosition(this.dragGetCanvasPosition(inSender, inEvent));
		this.$.dragger.applyStyle('background-color', 'rgb(' + c.r + ', ' + c.g + ', ' + c.b + ')');
		this.$.dragger.node.style.webkitTransform = 'translate3d(' + inEvent.dx + 'px, ' + inEvent.dy + 'px, 0)';
	},
	dragfinishHandler: function(inSender, inEvent) {
		var c = this.canvasGetColorFromPosition(this.dragGetCanvasPosition(inSender, inEvent));
		this.doColorSelect(c);
	},
	
});
