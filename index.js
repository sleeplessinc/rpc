// Copyright 2021 Sleepless Software Inc. All rights reserved.

const HERE = require("path").dirname( module.filename );

//require( "sleepless" );

module.exports = function( url_path, api_path, opts = {} ) {

	if( opts.dev ) {
		delete require.cache[module.filename];	// cause module to reload on next require()
	}

	const app = require( "connect" )();

	app.use( require( "body-parser" ).json() );
	app.use( require( "compression" )() );
	if( opts.cors ) {
		app.use( require( "cors" )() );	// enable to handle requests from other domains
	}
	//app.use( mw_fin_json );		// adds okay, fail to res (defined in sleepless module)
	app.use( ( req, res, next ) => {
		req.query = require('querystring').parse( req._parsedUrl.query );
		next();
	});

	// API path handler
	app.use( ( req, res, next ) => {
		const { method, url, query, body } = req;
		if( ( ( method == "GET" && opts.dev ) || method == "POST" ) && url.startsWith( url_path ) ) {
			// Load api handler and pass input on to it
			const path = api_path;
			const mod = require( path );
			const input = ( method == "GET" ) ? query : body;

			const done = ( error, data ) => {
				let json = JSON.stringify( { error, data } );
				res.writeHead( 200, { "Content-Type": "application/json", });
				res.write( json );
				res.end();
			};
			const fail = ( error, body ) => { done( error, body ); };
			const okay = ( data ) => { done( null, data ); };

			mod( input, okay, fail, req, res );	
		} else {
			// Pass this request on to the next handler
			next();
		}
	});

	return app;
}
