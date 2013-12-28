(function (window, undefined){


	var document = window.document || document || {};
	var DOCUMENT_FRAGMENT_NODE = document.DOCUMENT_FRAGMENT_NODE;
	var DOCUMENT_TYPE_NODE = document.DOCUMENT_TYPE_NODE;
	var FOLLOWING = document.DOCUMENT_POSITION_FOLLOWING;
	var CONTAINS = document.DOCUMENT_POSITION_CONTAINS;
	var CONTAINED_BY = document.DOCUMENT_POSITION_CONTAINED_BY;
	var PRECEDING = document.DOCUMENT_POSITION_PRECEDING;
	var elproto = window.Element ? window.Element.prototype : {};
	var concat = [].concat;
	var has = {}.hasOwnProperty;
	var slice = [].slice;
	var emptyF = function(){};

	var matchesSelector =
			elproto.webkitMatchesSelector ||
			elproto.mozMatchesSelector ||
			function (sel) {
				var doc;
				var par = this.parentElement;
				if (par === undefined) {
					doc = this.ownerDocument || document;
					par = doc.createDocumentFragment();
					par.appendChild(this.clone());
				}

				var selected = par.querySelectorAll(sel);
				var i = 0, total = selected.length;
				for (;i < total; i++) {
					if (selected[i] === this) {
						return true;
					}
				}
				return false;
			};


	function setClass () {
		this.className = [].concat(arguments).join(' ');
	}

	function setStyle (style) {
		var key, value;
		for (key in style) {
			if (has.call(style, key)) {
				this.style[key] = style[key];
			}
		}
	}

	function setText (txt) {
		this.textContent = txt;
	}

	function appendTo (to) {
		to.appendChild(this);
	}

	var extender = {
		text:         setText,
		textContent:  setText,
		txt:          setText,

		className:    setClass,
		_class:       setClass,
		cls:          setClass,
		klass:        setClass,
		classname:    setClass,

		style:        setStyle,
		css:          setStyle,

		appendTo:     appendTo,

		document:     emptyF
	};

	function extend (attr) {
		var key, value;
		if (attr === undefined) {
			return this;
		}
		for (key in attr) {
			if (has.call(attr, key)) {
				if (extender[key]) {
					extender[key].call(this, value, attr);
				}
				else{
					this.setAttribute(key, value);
				}
			}
		}
		return this;
	}

	var serializer = new window.XMLSerializer();

	function toString () {
		var doc = this.ownerDocument || window.document;
		var type = this.nodeType;
		if (type === DOCUMENT_FRAGMENT_NODE || type === DOCUMENT_TYPE_NODE) {
			fragmant = this;
		}
		else {
			fragment = doc.createDocumentFragment();
			fragment.appendChild(this.clone());
		}
		return serializer.serializeToString(fragment);
	}

	function make (tagName, options) {
		if (options === undefined) {
			options = {};
		}

		var doc = options.document || document;
		var el = doc.createElement(tagName);
		return extend.call(el, options);
	}



	// Recursively extract all node tree.
	function descendant (node, results) {
		if (undefined === results) {
			results = [];
		}
		// results.push(node);
		var children = node.childNodes;
		var i, total, child;
		for (i = 0, total = children.length; i < total; i++) {
			child = children[i];
			descendant(child, results);
		}
		return results;
	}

	var boredom = {
		make: make,
		extend: extend,
		serialize: function (el) {
				return toString.call(el);
			},
		matches: function (el, sel) {
				return matchesSelector.call(el, sel);
			},
		remove: function (node) {
				node.parentElement.removeChild(node);
				return node;
			},
		replace: function (node, repl) {
				node.parentElement.replaceChild(repl, node);
				return node;
			},
		following: function (el, selector) {
				var results = [];
				var i, total;
				for (i=0, total=selected.length; i < total; i++) {
					other = selected[i];
					if (el.compareDocumentPosition(other) === FOLLOWING) {
						results.push(other);
					}
				}
				return results;
			},
		ancestor: function (el, selector) {
				var results = [];
				if (selector) {
					while ((el = el.parentElement)) {
						if (matchesSelector.call(el, selector)) {
							results.push(el);
						}
					}
				}
				else {
					while ((el = el.parentElement)) {
						results.push(el);
					}
				}
				// Return in document order;
				results.reverse();
				return results;
			},
		ancestor_or_self: function (el, selector) {
				var results = [];
				if (selector) {
					while (el) {
						if (matchesSelector.call(el, selector)) {
							results.push(el);
						}
						el = el.parentElement;
					}
				}
				else {
					while (el) {
						results.push(el);
						el = el.parentElement;
					}
				}
				// Return in document order;
				results.reverse();
				return results;
			},
		descendant_or_self: function (el, selector) {
			if (selector) {
				var results = slice.apply(el.querySelectorAll(selector));
				if (matchesSelector.call(el, selector)) {
					results.shift(el);
				}
				return results;
			}
			else {
				return [el].concat(descendant(el));
			}
		},
		descendant: function (el, selector) {
			if (selector) {
				return [].slice.apply(el.querySelectorAll(selector));
			}
			else {
				return descendant(el);
			}
		},
		preceding: function (el, selector) {
			var doc = el.ownerDocument || document;
			var selected = selector ? doc.querySelectorAll(selector) : descendant(doc);

			var results = [];
			var i, total, node;
			for (i = 0, total = selected.length; i < total; i++) {
				node = selected[i];
				if (el.compareDocumentPosition(node) === PRECEDING) {
					results.push(node);
				}
			}
			return results;

		}
	};



// Uses jQuery AMD/CommonJS/global wrapper
if ( typeof module === "object" && module && typeof module.exports === "object" ) {
	// Expose jQuery as module.exports in loaders that implement the Node
	// module pattern (including browserify). Do not create the global, since
	// the user will be storing it themselves locally, and globals are frowned
	// upon in the Node module world.
	module.exports = boredom;
} else {
	// Register as a named AMD module, since jQuery can be concatenated with other
	// files that may use define, but not via a proper concatenation script that
	// understands anonymous AMD modules. A named AMD is safest and most robust
	// way to register. Lowercase jquery is used because AMD module names are
	// derived from file names, and jQuery is normally delivered in a lowercase
	// file name. Do this after creating the global so that if an AMD module wants
	// to call noConflict to hide this version of jQuery, it will work.
	if ( typeof define === "function" && define.amd ) {
		define( "jquery", [], function () { return boredom; } );
	}
}

// If there is a window object, that at least has a document property,
// define jQuery and $ identifiers
if ( typeof window === "object" && typeof window.document === "object" ) {
	window.boredom = boredom;
}
})(window);
