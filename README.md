
# rpc

## Setup

	npm install rpc

## Usage

	app = require( "connect" )()
	url_path = "/api/"					// The url path prefix to watch for and handle
	api_path = "/disk/path/to/modlue"	// location of handler module
	app.use( require( "rpc" )( url_path api_path ) )


## Options

To let your api handle calls from other domains:

	require( "rpc" )( url_path, api_path, { cors: true } );



