
module.exports = function( input, okay, fail ) {

	const { action, msg } = input;

	if( action == "ping" ) {
		okay( "pong" );
		return;
	}

	fail( "Invalid action: " + action );

}

