    // Utility functions
    function typeOf(value) {
	var s = typeof value;
	if (s === 'object') {
	    if (value) {
		if (Object.prototype.toString.call(value) == '[object Array]') {
		    s = 'array';
		}
	    } else {
		s = 'null';
	    }
	}
	return s;
    }


    function isEmpty(o) {
	var i, v;
	if (typeOf(o) === 'object') {
	    for (i in o) {
		v = o[i];
		if (v !== undefined && typeOf(v) !== 'function') {
		    return false;
		}
	    }
	}
	return true;
    }

    if (!String.prototype.entityify) {
	String.prototype.entityify = function() {
	    return this.replace(/&/g, "&amp;").replace(/</g,
						       "&lt;").replace(/>/g, "&gt;");
	};
    }

    if (!String.prototype.quote) {
	String.prototype.quote = function() {
	    var c, i, l = this.length,
		o = '"';
	    for (i = 0; i < l; i += 1) {
		c = this.charAt(i);
		if (c >= ' ') {
		    if (c === '\\' || c === '"') {
			o += '\\';
		    }
		    o += c;
		} else {
		    switch (c) {
		    case '\b':
			o += '\\b';
			break;
		    case '\f':
			o += '\\f';
			break;
		    case '\n':
			o += '\\n';
			break;
		    case '\r':
			o += '\\r';
			break;
		    case '\t':
			o += '\\t';
			break;
		    default:
			c = c.charCodeAt();
			o += '\\u00' + Math.floor(c / 16).toString(16) +
			    (c % 16).toString(16);
		    }
		}
	    }
	    return o + '"';
	};
    }

    if (!String.prototype.supplant) {
	String.prototype.supplant = function(o) {
	    return this.replace(
		    /\{([^{}]*)\}/g,
		function(a, b) {
		    var r = o[b];
		    return typeof r === 'string' || typeof r === 'number' ? r : a;
		}
	    );
	};
    }

    if (!String.prototype.trim) {
	String.prototype.trim = function() {
	    return this.replace(/^\s*(\S*(?:\s+\S+)*)\s*$/, "$1");
	};
    }

function getRandomColor() {
    palette = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928']

    var color = palette[Math.floor(Math.random()*palette.length)];

    return color
}

