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

	// Order of timing events
	order = [
		'navigationStart',
		'redirectStart',
		'redirectEnd',
		'fetchStart',
		'domainLookupStart',
		'domainLookupEnd',
		'connectStart',
		'secureConnectionStart',
		'connectEnd',
		'requestStart',
		'responseStart',
		'unloadEventStart',
		'unloadEventEnd',
		'domLoading',
		'responseEnd',
		'domContentLoadedEventStart',
		'domInteractive',
		'domContentLoadedEventEnd',
		'domComplete',
		'loadEventStart',
		'loadEventEnd'
	],

	// Various markers to plot
	markers = [
		[
			'Page Load',
			'Full length of page load, includes redirects and onload events',
			'#58DB46',
			timing.navigationStart || timing.fetchStart,
			timing.loadEventEnd
		],
		[
			'Redirects',
			'Time spent in redirects',
			'#7D46DB',
			timing.redirectStart,
			timing.redirectEnd
		],
		// TODO: Pin down when previous unload occurs
		[
			'Previous Unload',
			'Time spent in previous pages unload event (has to be same origin)',
			'#1C9C45',
			timing.unloadEventStart,
			timing.unloadEventEnd
		],
		[
			'DNS Lookup',
			'Time spent doing DNS lookup',
			'#E271D9',
			timing.domainLookupStart,
			timing.domainLookupEnd
		],
		[
			'TCP Connections',
			'Time spent in TCP connections',
			'#DB3543',
			timing.connectStart,
			timing.connectEnd
		],
		[
			'Document Download', // TODO: Confirmation needed
			'Time spent downloading the requested document from the server',
			'#96C3CC',
			timing.connectEnd,
			timing.requestStart
		],
		[
			'Resources',
			'Time spent getting page resources',
			'#CFCFCF',
			timing.requestStart,
			timing.responseEnd
		],
		[
			'Resource Content',
			'Time spent from the first byte downloaded, to the last byte',
			'#8874DA',
			timing.responseStart,
			timing.responseEnd
		],
		[
			'Resource Parsing', // TODO: Confirmation needed
			'Time spent from end of resource download, to start of DOM Rendering',
			'#46DBCA',
			timing.responseEnd,
			timing.domLoading
		],
		[
			'DOM Loading',
			'Time spent between "loading" and "complete" dom readiness',
			'#047EC5',
			timing.domLoading,
			timing.domComplete
		],
		[
			'DOM Interactive',
			'Time spent between "loading" and "interactive" dom readiness',
			'#047EC5',
			timing.domLoading,
			timing.domInteractive
		],
		[
			'DOM Ready Event',
			'Time spent waiting for dom ready events to finish',
			'#EE8905',
			timing.domContentLoadedEventStart,
			timing.domContentLoadedEventEnd
		],
		[
			'DOM Render Complete',
			'Time spent rendering after ready events',
			'#FF007B',
			timing.domContentLoadedEventEnd,
			timing.domComplete
		],
		[
			'On Load',
			'Time spent waiting for the onload event to finish',
			'#22837B',
			timing.loadEventStart,
			timing.loadEventEnd
		]
	],

	// Externals
	document = window.document,
	console = window.console,

	// wrappers
	root = document.createElement('div'),
	graph = document.createElement('div'),
	timelist = document.createElement('ul'),
	eventlist = document.createElement('ul'),
	navlist = document.createElement('ul'),
	close = document.createElement('div'),

	// Overlay for eventlist
	overlay = document.createElement('div'),
	overlayText = document.createElement('span'),

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

	// Markers
	step = 0,
	width = 500,
	center = ( window.innerWidth / 2 ) - ( ( width + 20 ) / 2 ) - 20,
	elapsed = timing.loadEventEnd - ( timing.navigationStart || timing.fetchStart ),

	// Style resets
	reset = 'margin:0;padding:0;border:0;outline:0;font-weight:inherit;' +
		'font-style:inherit;font-size:13px;font-family:inherit;' +
		'vertical-align:baseline;color:inherit;line-height:13px;color:black;';



// Style the wrappers
root.style.cssText = reset + 'width:' + width + 'px;padding:10px;position:fixed;' +
	'z-index:100000;font-size:11px;top:25px;left:' + center + 'px;' +
	'background:white;box-shadow: 0 0 1em black;border-radius:5px;';
graph.style.cssText = reset + 'background:#1F220E;position:relative;border-radius:5px;overflow:hidden;clear:both;';
timelist.style.cssText = reset + 'list-style:none;margin:10px 0 0;padding:0;float:left;width:48%';
eventlist.style.cssText = reset + 'list-style:none;margin:10px 0 0;padding:0;float:left;width:51%;';
navlist.style.cssText = reset + 'list-style:none;margin:10px 0 0;padding:0;clear:both;';
close.style.cssText = reset + 'position:absolute;right:-7px;top:-7px;border-radius:10px;' +
	'border:2px solid #f5f5f5;color:#f5f5f5;font-size:13px;' +
	'font-weight:bold;height:12px;width:12px;padding:1px 0 1px 1px;' +
	'line-height:13px;background:red;text-align:center;cursor:pointer;';


// Style & build the overlay
overlay.style.cssText = reset + 'position:absolute;border-left:1px solid #E0FA5D;top:0px;left:10px;z-index:100001;display:none;';
overlayText.style.cssText = reset + 'float:left;padding:3px 8px;font-size:11px;background:#E0FA5D;white-space:nowrap;';
overlay.appendChild( overlayText );
graph.appendChild( overlay );


// Style the labels
header.style.cssText = reset + 'font-size:21px;font-weight:bold;clear:both;margin-bottom:20px;';
startlabel.style.cssText = reset + 'float:left;font-size:9px;';
endlabel.style.cssText = reset + 'float:right;font-size:9px;';

// Insert label text
header.innerHTML = 'Timing.js v' + version;
startlabel.innerHTML = 'Navigation Start (0ms)';
endlabel.innerHTML = 'Load Event End (' + elapsed + 'ms)';


// Add everything to the page
document.body.appendChild( root );
root.appendChild( header );
root.appendChild( startlabel );
root.appendChild( endlabel );
root.appendChild( graph );
root.appendChild( timelist );
root.appendChild( eventlist );
root.appendChild( navlist );
root.appendChild( close );


// Add titles to the lists (and build up navlist, since it's direct)
close.innerHTML = 'X';
timelist.innerHTML = "<li style='" + reset + "font-weight:bold;font-size:18px;margin-bottom:4px;'>Timing Report</li>";
eventlist.innerHTML = "<li style='" + reset + "font-weight:bold;font-size:18px;margin-bottom:4px;'>Event Report</li>";
navlist.innerHTML = "<li style='" + reset + "font-weight:bold;font-size:18px;margin-bottom:4px;'>Navigation Report</li>" +
	"<li style='" + reset + "padding:2px 0 4px 0;'>How you got here: <span style='" + reset + "color:blue;'>" + how + "</span></li>" +
	"<li style='" + reset + "'>Number of Redirects: <span style='" + reset + "color:blue;'>" + navigation.redirectCount + "</span></li>";



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
	return ( ( time - ( timing.navigationStart || timing.fetchStart ) ) / elapsed ) * width;
}

// Add entries based off spec @ http://w3c-test.org/webperf/specs/NavigationTiming/
console.info( '---Performance Timing Statistics---' );
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

	// Handle case where no time is defined (usually unload)
	if ( ! start || ! end || length < 0 ) {
		return;
	}

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
	console.info( name + ' (' + description + '): ' + length + 'ms' );

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
	order.forEach(function( name ) {
		if ( ! timing[ name ] ) {
			undef.push( name );
		}
		else if ( timing[ name ] == ( timing.navigationStart || timing.fetchStart ) ) {
			start.push( name );
		}
		else {
			exists.push( name );
		}
	});

	// Ensure existing stack is sorted in ascending order
	exists.sort(function( a, b ) {
		return timing[ a ] - timing[ b ];
	});

	// Reapply order
	order = undef.concat( start, exists );
})();

// List out event report
order.forEach(function( name ) {
	var list = document.createElement('li'),
		pos = timing[ name ] - ( timing.navigationStart || timing.fetchStart ),
		enter = function(){
			list.style.backgroundColor = '#E0FA5D';

			// Only open overlay if the entry exists
			if ( timing[ name ] ) {
				var mark = position( timing[ name ] );
				overlayText.innerHTML = pos + 'ms - ' + name;
				overlay.style.display = 'block';

				if ( ( mark / width ) > 0.5 ) {
					overlay.style.left = 'auto';
					overlay.style.right = ( width - mark ) + 'px';
					overlay.style.borderLeft = 'none';
					overlay.style.borderRight = '1px solid #E0FA5D';
					overlayText.style.float = 'right';
					overlayText.style.textAlign = 'right';
				}
				else {
					overlay.style.left = mark + 'px';
					overlay.style.borderRight = 'none';
					overlay.style.borderLeft = '1px solid #E0FA5D';
					overlayText.style.float = 'left';
					overlayText.style.textAlign = 'left';
				}
			}
		},
		leave = function(){
			list.style.backgroundColor = 'transparent';
			overlay.style.display = 'none';
		};

	// Add to the event list
	list.style.cssText = reset + 'font-size:12px;';
	list.innerHTML = timing[ name ] ?
		pos + 'ms - ' + name :
		"<span style='" + reset + "font-style:italic;font-size:12px;'>undefined - " + name + "</span>";
	eventlist.appendChild( list );

	// Attach hover effects
	list.addEventListener( 'mouseover', enter, false );
	list.addEventListener( 'mouseout', leave, false );
});

// Log the navigation results AFTER timing results
console.info( '---Navigation Report---' );
console.info( 'How you got here: ' + how );
console.info( 'Number of Redriects: ' + navigation.redirectCount );

// For your viewing pleasure
console.info( '---Performance Object---' );
console.info( performance );

// Extend the grap the full length
graph.style.height = step + 'px';
overlay.style.height = step + 'px';

})( this );
