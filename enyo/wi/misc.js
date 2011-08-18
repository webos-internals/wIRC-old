enyo.kind({
	name: 'wi.ListSelector',
	kind: 'ListSelector',
	
	popupAlign: 'left',
	chrome: [
		{name: 'arrow', className: 'enyo-listselector-arrow', style: 'margin-right: 10px;'},
		{kind: 'HFlexBox', flex: 1, components: [
			{name: 'itemContainer'},
			{name: 'client'}
		]},
		{name: 'label'},
	],
});
