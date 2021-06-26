
# rpc

## Setup

``` sh
npm install rpc
```

## Usage

``` js
app = require( "connect" )()
url_path = "/api/"			// The url path prefix to watch for and handle
api_path = "/disk/path/to/modlue"	// location of handler module
app.use( require( "rpc" )( url_path, api_path ) )
```

## API handler

Your API handler should be a module that can be loaded with require()
and should look something like this:

``` js
module.exports = function( input, okay, fail ) {
	let action = input.action
	if( action == "ping" ) {
		okay( "pong" );
	} else {
		fail( "Unrecognized action: " + action );
	}
}
```

The JSON response to the browser will look something like this if
you call okay():

``` js
{ error: null, data: "pong" }
```

or this if you call fail():

``` js
{ error: "Unrecognized action: foo", data: null }
```


## Options

To let your api handle calls from other domains:

``` js
require( "rpc" )( url_path, api_path, { cors: true } );
```



