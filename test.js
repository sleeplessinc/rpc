
var rpc = require("./index.js"),
	l = console.log

function msgHandler(a, b, cb) {
	l("incoming args: "+JSON.stringify(arguments));
	msg = {r:"You sent a="+a+" and b="+b}
	l("sending response: "+JSON.stringify(msg));
	cb(msg)
}

rpc.createServer(msgHandler).listen(50505)

logLevel = 5
l("listening");

