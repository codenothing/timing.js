Timing.js
=========

Timing.js is a bookmarklet script to graph out the timing reports provided by the browser. It does **absolutely no measuring**,
just reporting on the browser defined timestamps.


How it works
============

Timing.js is a bookmarlet that builds a simple graph showing the differen't intervals of time during the page load process.
[Go here](http://www.codenothing.com/demos/2011/timing.js/) and drag the link on the page to your bookmarks bar. 

Markers
=======

- **Page Load**: Full length of page load, includes redirects and onload events

- **Redirects**: Time spent in redirects

- **DNS Lookups**: Time spent doing DNS lookups

- **TCP Connections**: Time spent in TCP connections

- **Document Download**: Time spent downloading the requested document from the server

- **Resources**: Time spent getting page resources

- **Resource Content**: Time spent from the first byte downloaded, to the last byte

- **Resource Parsing**: Time spent from end of resource download, to start of DOM Rendering

- **DOM Rendering**: Time spent rendering the DOM, before the dom ready event

- **DOM Ready Event**: Time spent waiting for dom ready events to finish

- **DOM Render Complete**: Time spent rendering after ready events

- **On Load**: Time spent waiting for the onload event to finish

- **Previous Unload**: Time spent in previous pages unload event (has to be same origin)
