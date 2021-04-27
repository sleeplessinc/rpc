

app = require( "." )( "/api/" )
app.use( ( req, res ) => {
	console.log( req.method + " ... " + req.url );
})
app.listen( 4000 );


