// Detect a 'slash command' and strip off the slash
var cmdRegExp		= new RegExp(/^\/([^\s]*)[\s]*(.*)$/);
// Find 2 params to a slash command
var twoValRegExp	= new RegExp(/^([^\s]*)[\s]{0,1}(.*)$/);
// Find 3 params to a slash command
var threeValRegExp	= new RegExp(/^([^\s]*)[\s]{1}([^\s]*)[\s]{0,1}(.*)$/);

// Parse origin into a nickname
var nickParser		= new RegExp(/^([^\s]*)!(.*)$/);

// Check channel name
var channelRegExp = new RegExp(/^([a-zA-Z0-9]{1})(.*)$/);