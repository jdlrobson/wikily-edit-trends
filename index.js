var level = require( 'level' );
var cacher = level( './wet' );
var SAVE_KEY = 'week';
var fetch = require( 'node-fetch' );
var ONE_WEEK_MINUTES = 60*24*7;

function getTrending() {
	return new Promise( function ( resolve, reject ) {
		cacher.get( SAVE_KEY, function ( err, value ) {
			var cache = {};
			if ( !err ) {
				cache = JSON.parse( value );
			} else {
				resolve( { pages: [] } );
			}
			resolve( cache );
		} );
	} );
}

function saveTrending( cache ) {
	cacher.put( SAVE_KEY, JSON.stringify( cache ) );
}

function retire( pages, ts ) {
	var ref = new Date(ts);
	function ageInMinutes( page ) {
		var since = page.since || page.start;
		return ( ref - new Date( since ) ) / (1000*60);
	}

	return pages.filter( function ( page ) {
		return ageInMinutes( page ) < ONE_WEEK_MINUTES;
	});
}

function dedupe( pages ) {
	var unique = {};
	var newPages = [];
	pages.forEach( function ( page ) {
		// page id would be better here
		var id = page.title;

		if ( !unique[id] ) {
			newPages.push( page );
		}
		unique[id] = true;
	});
	return newPages;
}

function updateTrending( url ) {
	url = url || 'https://en.wikipedia.org/api/rest_v1/feed/trending/edits/24';
	return new Promise( function ( resolve, reject ) {
		getTrending().then( function ( cache ) {
			fetch( url ).
				then( function ( resp ) {
					return resp.json();
				} ).then( function ( newData ) {
					var ts = newData.timestamp || newData.ts;

					// Add all the new pages to our existing data structure
					cache.pages = cache.pages.concat( newData.pages );
					// now sort the list based on trending scores
					cache.pages = cache.pages.sort( function ( a, b ) {
						return a.trendiness > b.trendiness ? -1 : 1;
					} );
					// retire all the old pages
					cache.pages = retire( cache.pages, ts );
					// now lets go through an de-duplicate
					cache.pages = dedupe( cache.pages );

					// Shrink to 50 maximum
					cache.pages = cache.pages.slice( 0, 50 );
					saveTrending( cache );
					resolve();
				} );
		} );
	} );
}


module.exports = {
	update: updateTrending,
	get: getTrending
}