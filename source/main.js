enyo.kind({
  	name: "wIRC.Main",
  	kind: enyo.VFlexBox,
  	components: [
  		{kind: 'AppMenu', components: [
			{caption: 'About', onclick: 'about'},
		]},
  		{kind: "TabGroup", onChange: "mainTabSelected", components: [
		    {caption: "Connections", value: "connections"},
		    {caption: "Chats", value: "chats", depressed: true},
		]},
  		{kind: "SlidingPane", flex: 1, components: [
  			{name: "channels", width: "175px", components: [
  				{kind: "DividerDrawer", caption: "Freenode", components: [
  					{kind: "Item", content: "#webos-internals", flex: 1},
  					{kind: "Item", content: "#webos", flex: 1},
  					{kind: "Item", content: "NickServ", flex: 1},
  					{kind: "Item", content: "ChanServ", flex: 1},
  					{kind: "Item", content: "oil", flex: 1}
  				]},
  				{kind: "DividerDrawer", caption: "Rizon", components: [
  					{kind: "Item", content: "#zen-sources", flex: 1}
  				]}
  			]},
  			{name: "nicks", width: "175px", components: [
  				{kind: "Item", content: "ChanServ"},
  				{kind: "Item", content: "cryptk|offline"},
  				{kind: "Item", content: "destinal"},
  				{kind: "Item", content: "jhojho"},
  				{kind: "Item", content: "oil"},
  				{kind: "Item", content: "PuffTheMagic"},
  				{kind: "Item", content: "rwhitby"}
  			]},
  			{name: "chat", flex: 1, components: [
  				{layoutKind: "VFlexLayout", flex: 1, components: [
  					{kind: "Item", components: [
  						{kind: "InputBox", components: [
    						{kind: "BasicRichText", flex: 1, style: "height: 50px;", className: "enyo-input-inner", value: "Discussion about webOS internals (not webOS SDK usage - #webos for that, or wIRC - #wirc for that). Honor all licenses, carrier agreements and copyrights. Twitter: @webosinternals Logs: http://logs.nslu2-linux.org/ Wiki: http://www.webos-internals.org/ Pastebin: http://webos.pastebin.com/ Preware: http://install.preware.org/ Patches: http://patches.webos-internals.org/"},
						]},
  					]},
    				{flex: 1, content: enyo.string.escapeHtml("<rwhitby> preware auto-installer sometimes fails.  dunno why.")},
    				{kind: "BasicInput", style: "height: 50px; width: 100%"}
				]}
  			]},
		]}
  	],
  	mainTabSelected: function(inSender) {
  		this.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    	this.log("Selected button " + inSender.getValue());
    	this.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
	},
	about: function() {
		this.$.prefs.pop();
	},
});