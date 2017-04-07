var pending = true;
var trends = require( './index' );

function printTrends( header ) {
	trends.get().then( function ( json ) {
		console.log(header);
		json.pages.forEach( function ( page ) {
			console.log( page.title, page.trendiness );
		})
	} );
}


printTrends( '####Before####' );

trends.update().then( function ( json ) {
	printTrends( '####After####' );
});

