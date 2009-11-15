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
