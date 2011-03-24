(function( window, undefined ) {

// Block unsupporting browsers
if ( ! window.performance || ! window.performance.timing ) {
	return alert( "This browser doesn't support the timing module." );
}

// Meta
var version = '0.0.1pre',
	date = '2011-03-21',

	// Perf Shortcuts
	performance = window.performance,
	timing = performance.timing,
	navigation = performance.navigation,
	memory = performance.memory,
	NAV_START = timing.navigationStart || timing.fetchStart,

	// Order of timing events
	order = [
		[
			'navigationStart',
			'Timestamp immediately after prompting to unload the previous document'
		],
		[
			'redirectStart',
			'Timestamp immediately before the start of the fetch that initiates the redirect'
		],
		[
			'redirectEnd',
			'Timestamp immediately after receiving the last byte of the response of the last redirect'
		],
		[
			'fetchStart',
			'Timestamp immediately before checking application cache or fetching the resource'
		],
		[
			'domainLookupStart',
			'Timestamp immediately before DNS lookup of current document'
		],
		[
			'domainLookupEnd',
			'Timestamp immediately after DNS lookup of current document'
		],
		[
			'connectStart',
			'Timestamp immediately before establishing a connection to the server for document retrieval'
		],
		[
			'secureConnectionStart',
			'Timestamp immediately before starting the handshake process'
		],
		[
			'connectEnd',
			'Timestamp immediately after establishing a connection to the server for document retrieval'
		],
		[
			'requestStart',
			'Timestamp immediately before requesting the current document'
		],
		[
			'responseStart',
			'Timestamp immediately after recieving the first byte of the current document'
		],
		[
			'responseEnd',
			'Timestamp immediately after recieving the last byte of the current document'
		],
		[
			'domInteractive',
			'Timestamp immediately before the document readiness state is changed to "interactive"'
		],
		[
			'domContentLoadedEventStart',
			'Timestamp immediately before the start of the DOMContentLoaded event'
		],
		[
			'domContentLoadedEventEnd',
			'Timestamp immediately after the end of the DOMContentLoaded event'
		],
		[
			'domComplete',
			'Timestamp immediately before the document readiness state is changed to "complete"'
		],
		[
			'loadEventStart',
			'Timestamp immediately before the start of the load event'
		],
		[
			'loadEventEnd',
			'Timestamp immediately after the end of the load event'
		]
	],

	// Various markers to plot
	markers = [
		[
			'Page Load',
			'Full length of page load',
			'#CFCFCF',
			NAV_START,
			timing.loadEventEnd
		],
		/* TODO: What occurs between prompting previous unload page and the start of redirects?
		[
			'??navigationStart - redirectStart??',
			'????',
			'#CFCFCF',
			timing.navigationStart,
			timing.redirectStart
		],
		*/
		[
			'Redirects',
			'Time spent in redirects',
			'#CFCFCF',
			timing.redirectStart,
			timing.redirectEnd
		],
		/* TODO: What happens between the end of a redirect and the start of document fetch process?
		[
			'??redirectEnd - fetchStart??',
			'????',
			'#CFCFCF',
			timing.redirectEnd,
			timing.fetchStart
		],
		*/
		[
			'Application Cache Check',
			'Time spent looking into application caches for the document',
			'#CFCFCF',
			timing.fetchStart,
			timing.domainLookupStart
		],
		[
			'DNS Lookup',
			'Time spent doing DNS lookup',
			'#3AABDF',
			timing.domainLookupStart,
			timing.domainLookupEnd
		],
		/* TODO: What happens between DNS Lookup and TCP Connection?
		[
			'??domainLookupEnd - connectStart??',
			'????',
			'#CFCFCF',
			timing.domainLookupEnd,
			timing.connectStart
		],
		*/
		[
			'TCP Connection',
			'Time spent in TCP connection',
			'#77C017',
			timing.connectStart,
			timing.connectEnd
		],
		[
			'Secure TCP Connection',
			'Time spent setting up Secure TCP connection',
			'#CFCFCF',
			timing.secureConnectionStart,
			timing.connectEnd
		],
		/* TODO: What happens between established connection and the start of the document request?
		[
			'??connectEnd - requestStart??',
			'????',
			'#CFCFCF',
			timing.connectEnd,
			timing.requestStart
		],
		*/
		[
			'Sending Request',
			'Time spent sending request to server for document retrieval',
			'#CFCFCF',
			timing.requestStart,
			timing.responseStart
		],
		[
			'Document Retrieval',
			'Time spent from the first byte downloaded, till the last',
			'#DA5454',
			timing.responseStart,
			timing.responseEnd
		],
		/* TODO: Confirm document object creation is what causes delays between getting retriving the resource and loading the DOM
		   Ref: http://dev.w3.org/html5/spec/dom.html#current-document-readiness
		[
			'Document Creation',
			'Time spent creating the Document Object (This needs confirmation)',
			'#CFCFCF',
			timing.responseEnd,
			timing.domLoading
		],
		*/
		[
			'DOM Loading',
			'Time spent between "loading" and "complete" DOM Ready states',
			'#CFCFCF',
			timing.domLoading,
			timing.domComplete
		],
		[
			'DOM Interactive',
			'Time spent between "loading" and "interactive" DOM Ready states',
			'#CFCFCF',
			timing.domLoading,
			timing.domInteractive
		],
		[
			'DOM Ready Event',
			'Time spent waiting for dom ready events to finish',
			'#3C4BEC',
			timing.domContentLoadedEventStart,
			timing.domContentLoadedEventEnd
		],
		[
			'DOM Complete',
			'Time spent between end of DOMContentLoaded event and "complete" DOM REady state',
			'#CFCFCF',
			timing.domContentLoadedEventEnd,
			timing.domComplete
		],
		/* TODO: What causes delay between DOM Complete and the start of the load events?
		[
			'??domComplete - loadEventStart??',
			'????',
			'#CFCFCF',
			timing.domComplete,
			timing.loadEventStart
		],
		*/
		[
			'On Load',
			'Time spent waiting for the onload event to finish',
			'#FF3535',
			timing.loadEventStart,
			timing.loadEventEnd
		]
	],

	// Unpredictable entries on the timing object
	unpredictables = {

		markers: [
			// The previous unload event can occur anywhere between fetchStart and responseEnd
			[
				'Previous Unload',
				'Time spent in previous pages unload event (has to be same origin)',
				'#CFCFCF',
				timing.unloadEventStart,
				timing.unloadEventEnd
			]
		],

		events: [
			// The previous unload event can occur anywhere between fetchStart and responseEnd
			[
				'unloadEventStart',
				'Timestamp immediately before the start of unload events on the previous document'
			],
			// The previous unload event can occur anywhere between fetchStart and responseEnd
			[
				'unloadEventEnd',
				'Timestamp immediately after the end of unload events on the previous document'
			],
			// The domLoading event can occur anytime after responseStart
			[
				'domLoading',
				'Timestamp immediately before the document readiness state is changed to "loading"'
			]
		]

	},

	// Externals
	document = window.document,
	console = window.console,
	log = function( msg ) {
		console.info( msg );
	},

	// wrappers
	root = document.createElement('div'),
	graph = document.createElement('div'),
	timelist = document.createElement('ul'),
	eventlist = document.createElement('ul'),
	navlist = document.createElement('ul'),
	close = document.createElement('div'),

	// Overlay for eventlist
	overlay = document.createElement('div'),
	overlayText = document.createElement('div'),
	overlayHold = false,

	// labels
	header = document.createElement('h1'),
	startlabel = document.createElement('div'),
	endlabel = document.createElement('div'),

	// How you got to this page
	how = navigation.type == navigation.TYPE_NAVIGATE ? 'Link follow or entered in URL bar' :
		navigation.type == navigation.TYPE_RELOAD ? 'Refresh' :
		navigation.type == navigation.TYPE_BACK_FORWARD ? 'Back/Forward Button' :
		navigation.type == navigation.TYPE_RESERVED ? 'Not defined by the browser' :
		'God only knows',

	// Storable reports object
	reports = { timing: {}, events: {}, nav: { how: how, redirects: navigation.redirectCount } },

	// Markers
	step = 0,
	width = 500,
	center = ( window.innerWidth / 2 ) - ( ( width + 20 ) / 2 ) - 20,
	elapsed = timing.loadEventEnd - NAV_START,

	// Style resets
	reset = 'margin:0;padding:0;border:0;outline:0;font-weight:inherit;width:auto;' +
		'font-style:inherit;font-size:13px;font-family:Times;text-align:left;' +
		'vertical-align:baseline;color:inherit;line-height:13px;color:black;' +
		'opacity:1;';



// Style the wrappers
root.style.cssText = reset + 'width:' + width + 'px;padding:10px;position:fixed;' +
	'z-index:100000;font-size:11px;top:25px;left:' + center + 'px;' +
	'background:white;box-shadow: 0 0 15px black;border-radius:5px;border:1px solid #999;';
graph.style.cssText = reset + 'background:#1F220E;position:relative;border-radius:5px;overflow:hidden;clear:both;';
timelist.style.cssText = reset + 'list-style:none;margin:10px 0 0;padding:0;float:left;width:48%;padding-bottom:10px;';
eventlist.style.cssText = reset + 'list-style:none;margin:10px 0 0;padding:0;float:left;width:51%;padding-bottom:10px;';
navlist.style.cssText = reset + 'list-style:none;margin:10px 0 0;padding:0;clear:both;';
close.style.cssText = reset + 'position:absolute;right:-7px;top:-7px;border-radius:10px;' +
	'border:2px solid #f5f5f5;color:#f5f5f5;font-size:13px;' +
	'font-weight:bold;height:12px;width:12px;padding:1px 0 1px 1px;' +
	'line-height:13px;background:red;text-align:center;cursor:pointer;';


// Style & build the overlay
overlay.style.cssText = reset + 'position:absolute;border-left:1px solid #E0FA5D;top:0px;z-index:100001;display:none;';
overlayText.style.cssText = reset + 'position:absolute;top:0px;z-index:100002;padding:3px 8px;font-weight:bold;' +
	'font-size:11px;background:#E0FA5D;white-space:nowrap;display:none;';
graph.appendChild( overlay );
graph.appendChild( overlayText );


// Style the labels
header.style.cssText = reset + 'font-size:21px;font-weight:bold;clear:both;margin-bottom:20px;';
startlabel.style.cssText = reset + 'float:left;font-size:9px;';
endlabel.style.cssText = reset + 'float:right;font-size:9px;';

// Insert label text
header.innerHTML = 'Timing.js v' + version;
startlabel.innerHTML = 'Navigation Start (0ms)';
endlabel.innerHTML = 'Load Event End (' + elapsed + 'ms)';


// Add everything to the page
root.appendChild( header );
root.appendChild( startlabel );
root.appendChild( endlabel );
root.appendChild( graph );
root.appendChild( timelist );
root.appendChild( eventlist );
root.appendChild( navlist );
root.appendChild( close );
document.body.appendChild( root );


// Add titles to the lists (and build up navlist, since it's direct)
close.innerHTML = 'X';
timelist.innerHTML = "<li style='" + reset + "font-weight:bold;font-size:18px;margin-bottom:4px;'>Timing Report</li>";
eventlist.innerHTML = "<li style='" + reset + "font-weight:bold;font-size:18px;margin-bottom:4px;'>Event Report</li>";
navlist.innerHTML = "<li style='" + reset + "font-weight:bold;font-size:18px;margin-bottom:4px;'>Navigation Report</li>" +
	"<li style='" + reset + "padding:2px 0 4px 0;'>How you got here: <span style='" + reset + "color:blue;'>" + how + "</span></li>" +
	"<li style='" + reset + "'>Number of Redirects: <span style='" + reset + "color:blue;'>" + navigation.redirectCount + "</span></li>";


// Inject unpredictable markers for graph plotting
unpredictables.markers.forEach(function( marker ) {
	var stack = [], start = marker[ 3 ], inject = false;

	// Find an injection point
	markers.forEach(function( entry, i ) {
		var next = markers[ i + 1 ];
		stack.push( entry );

		if ( ! inject && start >= entry[ 3 ] && next && start < next[ 3 ] ) {
			inject = true;
			stack.push( marker );
		}
	});

	// Not sure how it can get here, but catch it anyway
	if ( ! inject ) {
		stack.push( marker );
	}

	// Assign the new marker stack with the unload event injected correctly
	markers = stack.slice( 0 );
});

// Inject unpredictable events into event report
unpredictables.events.forEach(function( event ) {
	var stack = [], start = timing[ event[ 0 ] ], inject = false;

	// Find injection point for events order
	order.forEach(function( entry, i ) {
		var next = order[ i + 1 ];
		stack.push( entry );

		if ( ! inject && start >= timing[ entry[ 0 ] ] && next && start < timing[ next[ 0 ] ] ) {
			inject = true;
			stack.push( event );
		}
	});

	// Not sure how it can get here, but catch it anyway
	if ( ! inject ) {
		stack.push( event );
	}

	// Assign the new order stack with the unload event injected correctly
	order = stack.slice( 0 );
});


// Handle removing report from DOM
function remove( event ) {
	if ( root ) {
		document.body.removeChild( root );
		document.removeEventListener( 'click', remove, false );
		document.removeEventListener( 'keyup', escapeKey, false );
		eventBlock( event );
	}
}

// Close report on escape key
function escapeKey( event ) {
	if ( event.keyCode == 27 ) {
		remove( event );
	}
}

// Shortcutt for stopping event propagation
function eventBlock( event ) {
	overlayHold = false;
	event.preventDefault();
	event.stopPropagation();
}

// Remove report when clicking on close button
// and anywhere else on the page
close.onclick = remove;
root.onclick = eventBlock;
document.addEventListener( 'click', remove, false );
document.addEventListener( 'keyup', escapeKey, false );

// Gives the position on the graph in pixels
function position( time ) {
	return ( ( time - NAV_START ) / elapsed ) * width;
}


// Add entries based off spec @ http://w3c-test.org/webperf/specs/NavigationTiming/
log( '---Performance Timing Statistics---' );
markers.forEach(function( entry ) {
	var name = entry[ 0 ],
		description = entry[ 1 ],
		color = entry[ 2 ],
		start = entry[ 3 ] || 0,
		end = entry[ 4 ] || 0,
		length = end - start,
		startpos = position( start ),
		endpos = position( end ),
		barwidth = endpos - startpos,
		plot = document.createElement('div'),
		row = document.createElement('li'),
		enter = function(){
			plot.style.backgroundColor = '#E0FA5D';
			row.style.backgroundColor = '#E0FA5D';
		},
		leave = function(){
			plot.style.backgroundColor = color;
			row.style.backgroundColor = 'transparent';
		};
	

	// Handle case where no time is defined (usually unload|redirects)
	if ( ! start || ! end || length < 0 ) {
		return;
	}

	// Stash length of marker for reporting
	reports.timing[ name ] = length;

	// Always ensure a visible width is given
	if ( barwidth < 5 ) {
		barwidth = 5;

		// Handle case where width overflows to the left
		if ( ( startpos + barwidth ) > width ) {
			startpos -= ( startpos + barwidth ) - width;
		}
	}

	// Detail the graph
	plot.innerHTML =  length + 'ms: ' + name;
	plot.title = description;
	plot.style.cssText = reset + 'background:' + color + ';text-align:center;position:absolute;' +
		'text-wrap:none;white-space:nowrap;line-height:20px;' +
		'overflow:hidden;height:20px;font-size:13px;clear:both;' +
		'border-radius:2px;' +
		'top:' + step + 'px;left:' + startpos + 'px;width:' + barwidth + 'px;';
	
	// Detail the data entry
	row.innerHTML = "<span style='" + reset + "border:1px solid black;background:" + color + ";'>&nbsp;&nbsp;&nbsp;&nbsp;</span> " + name + ": <span style='" + reset + "color:blue;'>" + length + "ms</span>";
	row.title = description;
	row.style.cssText = reset + 'padding:4px 0;';

	// Add event listeners
	plot.addEventListener( 'mouseover', enter, false );
	plot.addEventListener( 'mouseout', leave, false );
	row.addEventListener( 'mouseover', enter, false );
	row.addEventListener( 'mouseout', leave, false );

	// Add entries to the DOM
	graph.appendChild( plot );
	timelist.appendChild( row );

	// Log results into the console
	log( name + ' (' + description + '): ' + length + 'ms' );

	// Spread out entries (only if they exist, and skip previous unload)
	if ( length > 0 ) {
		step += 22;
	}
	else {
		plot.style.display = 'none';
	}
});

// We have to ensure organization of events is correct (unload is tricky)
(function(){
	var undef = [], start = [], exists = [];

	// Separate each event into it's respective category
	order.forEach(function( entry ) {
		var name = entry[ 0 ];

		// Store timestamp for reporting
		reports.events[ name ] = timing[ name ];

		// Push onto appropiate stack
		if ( ! timing[ name ] ) {
			undef.push( entry );
		}
		else if ( timing[ name ] == NAV_START ) {
			start.push( entry );
		}
		else {
			exists.push( entry );
		}
	});

	// Reapply order
	order = undef.concat( start, exists );
})();

// List out event report
log( '---Event Reporting---' );
order.forEach(function( entry ) {
	var list = document.createElement('li'),
		name = entry[ 0 ],
		description = entry[ 1 ],
		time = timing[ name ] - NAV_START,
		pos = position( timing[ name ] || 0 ),
		enter = function(){
			list.style.backgroundColor = '#E0FA5D';

			// Only expand overlay if the entry exists
			if ( timing[ name ] && overlayHold ) {
				if ( overlayHold.pos === pos ) {
					return;
				}
				overlay.style.display = overlayText.style.display = 'block';
				overlay.style.width = Math.abs( pos - overlayHold.pos ) + 'px';
				overlay.style.left = overlayText.style.left = Math.min( pos, overlayHold.pos ) + 'px';
				overlay.style.opacity = 0.5;
				overlay.style.backgroundColor = '#E0FA5D';

				
				overlayText.innerHTML = time > overlayHold.time ?
					( time - overlayHold.time ) + 'ms: ' + overlayHold.name + '-' + name :
					( overlayHold.time - time ) + 'ms: ' + name + ' - ' + overlayHold.name;

				// Positioning the overlay text
				if ( ( overlayHold.pos / width ) > 0.5 ) {
					overlayText.style.left = 'auto';
					overlayText.style.right = ( width - Math.max( pos, overlayHold.pos ) ) + 'px';
				}
				else {
					overlayText.style.right = 'auto';
					overlayText.style.left = Math.min( pos, overlayHold.pos ) + 'px';
				}
			}
			// Only expose overlay if entry exists
			else if ( timing[ name ] ) {
				overlayText.innerHTML = time + 'ms - ' + name;
				overlay.style.display = overlayText.style.display = 'block';
				overlay.style.opacity = 1;
				overlay.style.width = 'auto';
				overlay.style.backgroundColor = 'transparent';

				if ( ( pos / width ) > 0.5 ) {
					overlay.style.left = overlayText.style.left = 'auto';
					overlay.style.right = overlayText.style.right = ( width - pos ) + 'px';
					overlay.style.borderLeft = 'none';
					overlay.style.borderRight = '1px solid #E0FA5D';
				}
				else {
					overlay.style.right = overlayText.style.right = 'auto';
					overlay.style.left = overlayText.style.left = pos + 'px';
					overlay.style.borderRight = 'none';
					overlay.style.borderLeft = '1px solid #E0FA5D';
				}
			}
		},
		click = function( event ) {
			if ( timing[ name ] ) {
				overlayHold = {
					pos: pos,
					time: time,
					name: name
				};
				event.stopPropagation();
				event.preventDefault();
			}
		},
		leave = function(){
			list.style.backgroundColor = 'transparent';
			overlay.style.display = overlayText.style.display = 'none';
		};

	// Add to the event list
	list.style.cssText = reset + 'font-size:12px;' + ( timing[ name ] ? 'cursor:pointer;' : '' );
	list.title = description;
	list.innerHTML = timing[ name ] ?
		time + 'ms - ' + name :
		"<span style='" + reset + "font-style:italic;font-size:12px;'>Not Defined - " + name + "</span>";
	eventlist.appendChild( list );

	// Attach hover effects
	list.addEventListener( 'click', click, false );
	list.addEventListener( 'mouseover', enter, false );
	list.addEventListener( 'mouseout', leave, false );

	// Log to the console
	log( '[' + timing[ name ] + '] ' + name + ' - ' + description );
});

// Log the navigation results AFTER timing results
log( '---Navigation Report---' );
log( 'How you got here: ' + how );
log( 'Number of Redriects: ' + navigation.redirectCount );

log( '---Timing.js Report---' );
log( JSON.stringify( reports ) );
log( reports );

// For your viewing pleasure
log( '---Performance Object---' );
log( performance );

// Extend the grap the full length
graph.style.height = step + 'px';
overlay.style.height = step + 'px';

})( this );
