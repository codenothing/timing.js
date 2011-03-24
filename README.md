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

- **Page Load**: Full length of page load

- **Redirects**: Time spent in redirects

- **Application Cache Check**: Time spent looking into application caches for the document

- **DNS Lookup**: Time spent doing DNS lookup

- **TCP Connection**: Time spent in TCP connection

- **Secure TCP Connection**: Time spent setting up Secure TCP connection

- **Sending Request**: Time spent sending request to server for document retrieval

- **Document Retrieval**: Time spent from the first byte downloaded, till the last

- **DOM Loading**: Time spent between "loading" and "complete" DOM Ready states

- **DOM Interactive**: Time spent between "loading" and "interactive" DOM Ready states

- **DOM Ready Event**: Time spent waiting for dom ready events to finish

- **DOM Complete**: Time spent between end of DOMContentLoaded event and "complete" DOM REady state

- **On Load**: Time spent waiting for the onload event to finish

- **Previous Unload**: Time spent in previous pages unload event (has to be same origin)
