// Copyright 2021 Sleepless Software Inc. All rights reserved.

// delete require.cache[module.filename]; // uncomment for testing
const HERE = require("path").dirname( module.filename );

require( "sleepless" ).globalize();
const	connect			= require("connect"),
		serve_static 	= require( "serve-static" ),
		L = log5.mkLog( "\tmicro_server: " )(5);

const app = connect();

app.use( require( "body-parser" ).json() );
app.use( require( "cookie-parser" )() );
app.use( require( "compression" )() );
//app.use( require( "cors" )() );	// enable to handle requests from other domains
app.use( mw_fin_json );		// adds okay, fail to res (defined in sleepless module)
app.use( ( req, res, next ) => {
	req.query = require('querystring').parse( req._parsedUrl.query );
	next();
});

// API path handler
app.use( ( req, res, next ) => {
	const { method, url, query, body } = req;
	L.V( method + " " + url );
	if( /GET|POST/.test( method ) && url.startsWith( "/api/" ) ) {
		try {
			const path = HERE + "/api";
			const mod = require( path );
			const input = ( method == "GET" ) ? query : body;
			mod( input, res.okay, res.fail );	
		} catch( e ) {
			L.E( e.stack );
			next();
		}
		return;
	}
	next();
});

// Serve static files
app.use( serve_static( HERE + "/static" ) );

module.exports = app;

