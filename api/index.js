
module.exports = function( input, okay, fail ) {

	const { cmd, msg } = input;

	if( cmd == "ping" ) {
		okay( "pong" );
		return;
	}

	fail( "Invalid action: " + cmd );

}

