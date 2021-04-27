

app = require( "." )( "/api/", "./api" )
app.use( ( req, res ) => {
	console.log( req.method + " " + req.url );
	res.end( "Hello World!" );
})
app.listen( 4000 );


