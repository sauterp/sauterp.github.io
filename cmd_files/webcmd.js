// Web command line.
// Russ Cox <rsc@swtch.com>, February 2007 
// IE syntax fixes (no trailing commas), March 2008

// Simple shortcuts: name: url.
var shortcuts = {
    "t":    "https://todoist.com/",
	"m":	"https://mail.google.com/",
	"c":	"https://www.google.com/calendar",
    "p":    "https://mail.protonmail.com/login",
}

// Search shortcuts: name: [url, cgiparam, {extra cgi}]
var searches = {
    "d":    ["https://duckduckgo.com/lite/", "q"],
    "di":   ["https://duckduckgo.com/", "q", {"ia" : "images", "iax" : "images"}],
    "dv":   ["https://duckduckgo.com/", "q", {"ia" : "videos", "iax" : "videos"}],
	"g":	["https://www.google.com/search", "q"],
	"gi":	["https://www.google.com/images", "q"],
    "y":    ["https://www.youtube.com/search", "q"],
	"w":	["https://en.wikipedia.org/wiki/Special:Search", "search"],
	"ws":	["https://es.wikipedia.org/wiki/Special:Search", "search"],
    "j":    ["https://jisho.org/search/"],
}
/*
	"a":	["https://www.amazon.com/s", "field-keywords",
			{"url": "search-alias=aps" }],
*/

// Help text to be displayed for shortcuts & commands.
var help = {
    "d":    "duckduckgo lite search",
    "di":   "duckduckgo image search",
    "dv":   "duckduckgo videos search",
	"g":	"google search",
	"gi":	"google image search",
    "y":    "youtube search",
	"m":	"google mail",
	"c":	"google calendar",
	"w":	"wikipedia",
    "ws":   "wikipedia español",
	"e":	"javascript evaluator",
    "t":    "todoist",
    "j":    "jisho",
    "p":    "protonmail",
}

// Commands: args are command name, arg text,
// and array of arg text split by white space.
// Commands must be named cmd_foo where
// foo is the actual command name.

// Evaluate an argument.
function cmd_e(cmd, arg, args)
{
	output(arg + " = " + eval(arg));
}


/////
///// Below here you should not need to fiddle with.
/////

// Compute help text.
function helptext()
{
	var a;
	var i = 0;
	var s = "";
	
	s += "<table cellspacing=0 cellpadding=0 border=0>";

	a = new Array();
	for(var k in searches)
		a[i++] = k;
	a.sort();
	s += "<tr><td colspan=3><b>Searches:</b>";
	for(i=0; i<a.length; i++){
		var h = help[a[i]];
		if(h == undefined)
			h = searches[a[i]][0];
		s += "<tr><td><b>" + a[i] + "</b><td width=10><td>" + h + "\n";
	}
	s += "<tr height=10>\n";

	a = new Array();
	i = 0;
	for(var k in shortcuts)
		a[i++] = k;
	a.sort();
	s += "<tr><td colspan=3><b>Shortcuts:</b>";
	for(i=0; i<a.length; i++){
		var h = help[a[i]];
		if(h == undefined)
			h = shortcuts[a[i]];
		s += "<tr><td><b>" + a[i] + "</b><td width=10><td>" + h + "\n";
	}
	s += "<tr height=10>\n";
	
	a = new Array();
	i = 0;
	for(var k in window)
		if(k.substr(0,4) == "cmd_")
			a[i++] = k.substr(4);
	a.sort();
	s += "<tr><td colspan=3><b>Additional Commands:</b>";
	for(i=0; i<a.length; i++){
		var h = help[a[i]];
		if(h == undefined)
			h = "???";
		s += "<tr><td><b>" + a[i] + "</b><td width=10><td>" + h + "\n";
	}
	s += "<tr height=10>\n";

	s += "</table>\n";
	return s;
}

// Run command.
function runcmd(cmd)
{
	// Check for URL.
	var space = cmd.indexOf(' ');
	if(space == -1 && (cmd.indexOf('/') != -1 || cmd.indexOf('.') != -1)){
		// No spaces, has slash or dot: assume URL.
		if(cmd.indexOf('://') == -1)
			cmd = "https://" + cmd;
		window.location = cmd;
		return false;
	}
	if(space == -1){
		arg = "";
		args = new Array();
	}else{
		arg = cmd.substr(space+1);
		cmd = cmd.substr(0, space);
		args = toarray(arg.split(/\s+/));
	}

	var fn;
	if(searches[cmd] != undefined)
		fn = search;
	else if(shortcuts[cmd] != undefined)
		fn = shortcut;
	else{
        fn = search;
        arg = args;
        arg.unshift(cmd);
        arg = arg.join(' ');
        args = new Array();
        cmd = "d";
        /* Prints an error message
		fn = window["cmd_" + cmd];
		if(fn == undefined){
			error("no command: " + cmd);
			return false;
		}
        */
	}
	fn(cmd, arg, args);
	return false;
}

// Print output on page.
function output(s)
{
	document.getElementById("output").innerHTML += s + "<br>";
}

// Print error on page.
function error(s)
{
	document.getElementById("error").innerHTML += s + "<br>";
}

// Convert whatever split returns into an Array.
function toarray(args)
{
	var a = new Array();
	for(var i = 0; i < args.length; i++)
		a[i] = args[i];
	return a;
}

// Return a URL with some CGI args.
function cgiurl(base, params)
{
	var url = base + "?";
	for(var k in params)
		url += k + "=" + escape(params[k]) + "&";
	return url;
}

// Handle search shortcut.
function search(cmd, arg, args)
{
    if(searches[cmd][1] == undefined)
        window.location = searches[cmd][0] + arg
    else
    {
	    var a = searches[cmd][2];
	    if(a == undefined)
	    	a = {};
	    a[searches[cmd][1]] = arg;
	    window.location = cgiurl(searches[cmd][0], a);
    }
}

// Handle simple shortcut.
function shortcut(cmd, arg, args)
{
	window.location = shortcuts[cmd];
}
