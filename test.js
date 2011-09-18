
var rpc = require("./index.js"),
	l = console.log



function hello(a, b, cb) {
	l("incoming a="+a+", b="+b)
	msg = {r:"You sent a="+a+" and b="+b}
	l("sending response: "+JSON.stringify(msg));
	cb(msg)
}

var cbs = {
	hello:hello
}
rpc.createServer(cbs).listen(50505)

rpc.log(5)
l("listening");

