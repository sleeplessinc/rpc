
# rpc

## Setup

	npm install rpc

## Usage

	app = require( "connect" )();
	app.use( require( "rpc" )( "/api/" ) )


## Options

To let your api handle calls from other domains:

	require( "rpc" )( path, { cors: true } );



