(function( window, undefined ) {

if ( ! window.performance || ! window.performance.timing ) {
	return alert( "This browser doesn't support the timing module." );
}

// Externals
var document = window.document,
	performance = window.performance,
	timing = performance.timing,
	navigation = performance.navigation,
	memory = performance.memory,

	// wrappers
	root = document.createElement('div'),
	graph = document.createElement('div'),
	timelist = document.createElement('ul'),
	navlist = document.createElement('ul'),
	close = document.createElement('div'),

	// How you got to this page
	how = navigation.type == navigation.TYPE_NAVIGATE ? 'Link follow or entered in URL bar' :
		navigation.type == navigation.TYPE_RELOAD ? 'Refresh' :
		navigation.type == navigation.TYPE_BACK_FORWARD ? 'Back/Forward Button' :
		navigation.type == navigation.TYPE_RESERVED ? 'Not defined by the browser' :
		'God only knows',

	// graph markers
	step = 0,
	width = 500,
	elapsed = timing.loadEventEnd - timing.navigationStart;


// Style the wrappers
root.style.cssText = 'width:' + width + 'px;padding:10px;position:fixed;z-index:999999;font-size:11px;top:25px;left:25px;background:white;box-shadow: 0 0 1em black;border-radius:5px;';
graph.style.cssText = 'background:#1F220E;position:relative;border-radius:5px;overflow:hidden;';
timelist.style.cssText = 'list-style:none;margin:0;padding:0;';
navlist.style.cssText = 'list-style:none;margin:10px 0 0;padding:0;';
close.style.cssText = 'position:absolute;right:-7px;top:-7px;border-radius:10px;' +
	'border:2px solid #f5f5f5;color:#f5f5f5;font-size:13px;' +
	'font-weight:bold;height:12px;width:12px;padding:1px 0 1px 1px;' +
	'line-height:13px;background:red;text-align:center;cursor:pointer;';


// Add everything to the page
document.body.appendChild( root );
root.appendChild( graph );
root.appendChild( timelist );
root.appendChild( navlist );
root.appendChild( close );


// Add titles to the lists (and build up navlist, since it's direct)
close.innerHTML = 'X';
timelist.innerHTML = "<li style='font-weight:bold;font-size:15px;'>Timing Report</li>";
navlist.innerHTML = "<li style='font-weight:bold;font-size:15px;'>Navigation Report</li>" +
	"<li>How they got here: " + how + "</li>" +
	"<li>Number of Redirects: " + navigation.redirectCount + "</li>";


// Remove the graph from the page when closing
close.onclick = function( event ) {
	document.body.removeChild( root );
	event.preventDefault();
	event.stopPropagation();
};


// Adds timing entries to graph and data list
function add( entry ) {
	var name = entry[ 0 ],
		description = entry[ 1 ],
		color = entry[ 2 ],
		start = entry[ 3 ] || 0,
		end = entry[ 4 ] || 0,
		length = end - start,
		startpos = position( start ),
		width = position( end ) - startpos,
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
	if ( ! start || ! end ) {
		return;
	}

	// Detail the graph
	plot.innerHTML = name + ': ' + length + 'ms';
	plot.title = description;
	plot.style.cssText = 'background:' + color + ';text-align:center;position:absolute;' +
		'text-wrap:none;white-space:nowrap;line-height:20px;' +
		'overflow:hidden;height:20px;font-size:13px;clear:both;' +
		'border-radius:2px;' +
		'top:' + step + 'px;left:' + startpos + 'px;width:' + width + 'px;';
	
	// Detail the data entry
	row.innerHTML = name + ': ' + length + 'ms';
	row.title = description;

	// Add event listeners
	plot.addEventListener( 'mouseover', enter, false );
	plot.addEventListener( 'mouseout', leave, false );
	row.addEventListener( 'mouseover', enter, false );
	row.addEventListener( 'mouseout', leave, false );

	// Add entries to the DOM
	graph.appendChild( plot );
	timelist.appendChild( row );

	// Spread out entries
	step += 22;
}


// Gives the position on the graph in pixels
function position( time ) {
	return ( ( time - timing.navigationStart ) / elapsed ) * width;
}


// Add entries
[
	[
		'Page Load',
		'Full length of page load, includes redirects and onload events',
		'#58DB46',
		timing.navigationStart,
		timing.loadEventEnd
	],
	[
		'Page Resources',
		'Resource loading (DNS lookups, TCP connections, resource fetching)',
		'#46DBCA',
		timing.fetchStart,
		timing.responseEnd
	],
	[
		'Redirects',
		'Time spent in redirects',
		'#7D46DB',
		timing.redirectStart,
		timing.redirectEnd
	],
	[
		'DNS Lookups',
		'Time spent doing DNS lookups',
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
		'Resources',
		'Time spent getting page resources',
		'#CFCFCF',
		timing.requestStart,
		timing.responseEnd
	],
	[
		'Resource Content',
		'Time spent from the first byte downlaoded, to the last byte',
		'#8874DA',
		timing.responseStart,
		timing.responseEnd
	],
	[
		'DOM Rendering',
		'Time spent rendering the DOM, before the dom ready event',
		'#047EC5',
		timing.domLoading,
		timing.domInteractive
	],
	[
		'DOM Ready Event',
		'Time spent waiting for dom ready events to finish',
		'#4687DB',
		timing.domContentLoadedEventStart,
		timing.domContentLoadedEventEnd
	],
	[
		'On Load',
		'Time spent waiting for the onload event to finish',
		'#22837B',
		timing.loadEventStart,
		timing.loadEventEnd
	],
	[
		'Previous Unload',
		'Time spent in previous pages unload event (has to be same origin)',
		'#1C9C45',
		timing.unloadStart,
		timing.unloadEnd
	]
].forEach( add );

// Extend the grap the full length
graph.style.height = step + 'px';

})( this );
