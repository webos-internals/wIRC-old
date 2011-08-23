enyo.kind({
	name: 'enyo.HeaderShadow',
	kind: enyo.Control,
	className: 'header-shadow',
});
enyo.kind({
	name: 'enyo.ToolbarShadow',
	kind: enyo.Control,
	className: 'toolbar-shadow',
});
enyo.kind({
	name: 'enyo.PreviewShadow',
	kind: enyo.Control,
	className: 'preview-shadow',
});

enyo.kind({
	name: 'wirc.SlidingView',
	kind: 'SlidingView',
	
	/*peekWidth: 64,*/
	dragAnywhere: false,
	
	rendered: function() {
		this.inherited(arguments);
		this.applySize(true);
	},
});

