// replace tokens in a string with values
replaceTokens = function(string) {
	string = string.replace("%WIRCVER%", Mojo.Controller.appInfo.version);
	string = string.replace("%WEBOSVER%", Mojo.Environment.DeviceInfo.platformVersion);
	string = string.replace("%CARRIER%", Mojo.Environment.DeviceInfo.carrierName);
	string = string.replace("%MODEL%", Mojo.Environment.DeviceInfo.modelNameAscii);
	string = string.replace("%DATETIME%", Mojo.Format.formatDate(new Date(), {time: 'full', date: 'full'}));
	string = string.replace("%REALNAME%", prefs.get().realname); 
	return string;	  
}

// formats a timestamp to a readable date
formatDate = function(date){
    var dateObj = new Date(date * 1000);
    var toReturn = '';
    var pm = false;
    
    toReturn += (dateObj.getMonth() + 1) + '/' + dateObj.getDate() + '/' + String(dateObj.getFullYear()).substring(2) + ' ';
    
    if (dateObj.getHours() > 12) 
        pm = true;
    
    if (!pm) {
        if (dateObj.getHours() < 1) 
            toReturn += '12';
        if (dateObj.getHours() > 0) 
            toReturn += dateObj.getHours();
        toReturn += ':';
        if (dateObj.getMinutes() < 10) 
            toReturn += '0'
        toReturn += dateObj.getMinutes() + ' AM';
    }
    else {
        toReturn += (dateObj.getHours() - 12) + ':';
        if (dateObj.getMinutes() < 10) 
            toReturn += '0'
        toReturn += dateObj.getMinutes() + ' PM';
    }
    
    return toReturn;
}

// strips html tags and fixes "double space" problem in the string
formatForHtml = function(string){
    string = string.escapeHTML();
    string = string.replace(/[\s]{2}/g, " &nbsp;");
    return string;
}

// parses urls to html links, not using Mojo.Format.runTextIndexer because it tries to parse email addresses and other crap stupidly
formatLinks = function(string){
													  // \/ changed this from a \w to a \S fixes the - thing
    return string.replace(/((https?\:\/\/)|(www\.))(\S+)(\S{2,4})(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/ig, function(url){
        var full_url = url;
        if (!full_url.match('^https?:\/\/')) {
            full_url = 'http://' + full_url;
        }
        return '<a href="' + full_url + '" target="_blank">' + url + '</a>';
    });
}

// trim function
trim = function(str){
    return str.replace(/^\s*/, "").replace(/\s*$/, "");
}

// formats seconds into a readable string
formatSeconds = function(seconds, longFormat){
    var toReturn = '';
    
    var days = Math.floor(seconds / 86400);
    seconds -= (days * 86400);
    
    var hours = Math.floor(seconds / 3600);
    seconds -= (hours * 3600);
    
    var mins = Math.floor(seconds / 60);
    seconds -= (mins * 60);
    
    if (longFormat) {
        if (days == 1) 
            toReturn += days + ' day ';
        if (days > 1) 
            toReturn += days + ' days ';
        if (hours == 1) 
            toReturn += hours + ' hour ';
        if (hours > 1) 
            toReturn += hours + ' hours ';
        if (mins == 1) 
            toReturn += mins + ' min ';
        if (mins > 1) 
            toReturn += mins + ' mins ';
        if (seconds == 1) 
            toReturn += seconds + ' sec ';
        if (seconds > 1) 
            toReturn += seconds + ' secs ';
    }
    else {
        if (days > 0) 
            toReturn += days + 'd ';
        if (hours > 0) 
            toReturn += hours + 'h ';
        if (mins > 0) 
            toReturn += mins + 'm ';
        if (seconds > 0) 
            toReturn += seconds + 's ';
    }
    
    if (toReturn == '') {
        toReturn = 'never';
    }
    
    return toReturn;
}
function formatMilliSeconds(milliseconds){
    var toReturn = '';
    
	var seconds = Math.floor(milliseconds / 1000);
	milliseconds = "" + (milliseconds - (seconds * 1000));
	while(milliseconds.length < 3) { milliseconds = '0' + milliseconds; }
	var m = 2;
	while(milliseconds.charAt(m) == "0") {
		milliseconds = milliseconds.substr(0, m);
		m--;
	}
	
    var hours = Math.floor(seconds / 3600);
    seconds -= (hours * 3600);
    
    var mins = Math.floor(seconds / 60);
    seconds -= (mins * 60);
    
    if (hours > 0) 
        toReturn += hours + 'h ';
    if (mins > 0) 
        toReturn += mins + 'm ';
    if (milliseconds > 0) 
        toReturn += seconds + '.' + milliseconds + 's ';
    else if (seconds > 0) 
        toReturn += seconds + 's ';
    
    if (toReturn == '') {
        toReturn = 'instant';
    }
    
    return toReturn;
}

colorize = function (message) {
	var pageBack  = 'white';
	var pageFront = 'black';
	var length    = message.length;
	var newText   = '';
	var bold      = false;
	var color     = false;
	var reverse   = false;
	var underline = false;
	var foreColor = '';
	var backColor = '';
	for (var i = 0 ; i < length ; i++) {
		switch (message.charAt(i)) {
			case String.fromCharCode(2):
				if (bold) {
					newText += '</b>';
					bold     = false;
				} else {
					newText += '<b>';
					bold    = true;
				}
				break;
			case String.fromCharCode(3):
				if (color)	{
					newText += '</span>';
					color = false;
				}
				foreColor = '';
				backColor = '';
				if ((parseInt(message.charAt(i+1)) >= 0) && (parseInt(message.charAt(i+1)) <= 9)) {
					color = true;
					if ((parseInt(message.charAt(++i+1)) >= 0) && (parseInt(message.charAt(i+1)) <= 9)) {
						foreColor = getColor(parseInt(message.charAt(i)) * 10 + parseInt(message.charAt(++i)));
					} else {
						foreColor = getColor(parseInt(message.charAt(i)));
					}
					if ((message.charAt(i+1) == ',') && (parseInt(message.charAt(++i+1)) >= 0) && (parseInt(message.charAt(i+1)) <= 9)) {
						if ((parseInt(message.charAt(++i+1)) >= 0) && (parseInt(message.charAt(i+1)) <= 9)) {
							backColor = getColor(parseInt(message.charAt(i)) * 10 + parseInt(message.charAt(++i)));
						} else {
							backColor = getColor(parseInt(message.charAt(i)));
						}
					}
				}
				if (foreColor) {
					newText += '<span style="color:'+foreColor;
					if (backColor) {
						newText += ';background-color:'+backColor;
					}
					newText += '">';
				}
				break;
			case String.fromCharCode(15):
				if (bold) {
					newText += '</b>';
					bold     = false;
				}
				if (color) {
					newText += '</span>';
					color    = false;
				}
				if (reverse) {
					newText += '</span>';
					reverse  = false;
				}
				if (underline) {
					newText  += '</u>';
					underline = false;
				}
				break;
			case String.fromCharCode(22):
				if (reverse) {
					newText += '</span>';
					reverse  = false;
				} else {
					newText += '<span style="color:'+pageBack+';background-color:'+pageFront+'">';
					reverse  = true;
				}
			case String.fromCharCode(31):
				if (underline) {
					newText  += '</u>';
					underline = false;
				} else {
					newText  += '<u>';
					underline = true;
				}
			default:
				newText += message.charAt(i);
				break;
		}

	}
	if (bold)      newText += '</b>';
	if (color)     newText += '</span>';
	if (reverse)   newText += '</span>'
	if (underline) newText += '</u>';
	return newText;
}

getColor = function(numeric)
{
	var num = parseInt(numeric);
	switch (num)
	{
		case 0:  return 'white';
		case 1:  return 'black';
		case 2:  return 'navy';
		case 3:  return 'green';
		case 4:  return 'red';
		case 5:  return 'maroon';
		case 6:  return 'purple';
		case 7:  return 'olive';
		case 8:  return 'yellow';
		case 9:  return 'lime';
		case 10: return 'teal';
		case 11: return 'aqua';
		case 12: return 'blue';
		case 13: return 'fuchsia';
		case 14: return 'gray';
		default: return 'silver';
	}
}