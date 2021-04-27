// Copyright 2021 Sleepless Software Inc. All rights reserved.

const HERE = require("path").dirname( module.filename );

require( "sleepless" ).globalize();

module.exports = function( api_path, opts = {} ) {

	if( opts.dev ) {
		delete require.cache[module.filename];	// cause module to reload on next require()
	}

	const app = require("connect")();

	app.use( require( "body-parser" ).json() );
	app.use( require( "cookie-parser" )() );
	app.use( require( "compression" )() );
	if( opts.cors ) {
		app.use( require( "cors" )() );	// enable to handle requests from other domains
	}
	app.use( mw_fin_json );		// adds okay, fail to res (defined in sleepless module)
	app.use( ( req, res, next ) => {
		req.query = require('querystring').parse( req._parsedUrl.query );
		next();
	});

	// API path handler
	app.use( ( req, res, next ) => {
		const { method, url, query, body } = req;
		log( method + " " + url );
		if( /GET|POST/.test( method ) && url.startsWith( api_path ) ) {
			const path = HERE + api_path;
			const mod = require( path );
			const input = ( method == "GET" ) ? query : body;
			mod( input, res.okay, res.fail );	
			return;
		}
		next();
	});

	// Serve static files
	app.use( require( "serve-static" )( HERE + "/static" ) );

	return app;
}
