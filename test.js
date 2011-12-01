
var rpc = require("./index.js")

function echo(cb, a) {
	cb("echoing back "+a)
}

var api = {
	echo:echo
}

rpc.createServer(api).listen(50505)

rpc.log(5)

