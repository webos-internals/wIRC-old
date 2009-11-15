// formats a timestamp to a readable date
formatDate = function(date)
{
	var dateObj = new Date(date * 1000);
	var toReturn = '';
	var pm = false;
	
	toReturn += (dateObj.getMonth() + 1) + '/' + dateObj.getDate() + '/' + String(dateObj.getFullYear()).substring(2) + ' ';
	
	if (dateObj.getHours() > 12) pm = true;
	
	if (!pm)
	{
		if (dateObj.getHours() < 1) toReturn += '12';
		if (dateObj.getHours() > 0) toReturn += dateObj.getHours();
		toReturn += ':';
		if (dateObj.getMinutes() < 10) toReturn += '0'
		toReturn += dateObj.getMinutes() + ' AM';
	}
	else
	{
		toReturn += (dateObj.getHours() - 12) + ':';
		if (dateObj.getMinutes() < 10) toReturn += '0'
		toReturn += dateObj.getMinutes() + ' PM';
	}
	
	return toReturn;
}

// strips html tags and fixes "double space" problem in the string
formatForHtml = function(string)
{
	string = string.escapeHTML();
	string = string.replace(/[\s]{2}/g, " &nbsp;");
	return string;
}

// parses urls to html links, not using Mojo.Format.runTextIndexer because it tries to parse email addresses and other crap stupidly
formatLinks = function(string)
{
  	return string.replace
	(
		/((https?\:\/\/)|(www\.))(\S+)(\w{2,4})(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/ig,
		function(url)
		{
		    var full_url = url;
		    if (!full_url.match('^https?:\/\/')) {
		        full_url = 'http://' + full_url;
		    }
		    return '<a href="' + full_url + '" target="_blank">' + url + '</a>';
		}
	);
}

// trim function
trim = function(str)
{
	return str.replace(/^\s*/, "").replace(/\s*$/, "");
}

// formats seconds into a readable string
formatSeconds = function(seconds, longFormat)
{
	var toReturn = '';
	
	var days = Math.floor(seconds / 86400);
	seconds -= (days * 86400);
	
	var hours = Math.floor(seconds / 3600);
	seconds -= (hours * 3600);

	var mins = Math.floor(seconds / 60);
	seconds -= (mins * 60);
	
	if (longFormat) 
	{
		if (days == 1)		toReturn += days + ' day ';
		if (days > 1)		toReturn += days + ' days ';
		if (hours == 1)		toReturn += hours + ' hour ';
		if (hours > 1)		toReturn += hours + ' hours ';
		if (mins == 1)		toReturn += mins + ' min ';
		if (mins > 1)		toReturn += mins + ' mins ';
		if (seconds == 1)	toReturn += seconds + ' sec ';
		if (seconds > 1)	toReturn += seconds + ' secs ';
	}
	else
	{
		if (days > 0)		toReturn += days + 'd ';
		if (hours > 0)		toReturn += hours + 'h ';
		if (mins > 0)		toReturn += mins + 'm ';
		if (seconds > 0)	toReturn += seconds + 's ';
	}
	
	if (toReturn == '')
	{
		toReturn = 'never';
	}
	
	return toReturn;
}
