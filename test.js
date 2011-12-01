
var rpc = require("./index.js")

function echo(cb, a) {
	cb("echoing back "+a)
}
function inc(cb, n) {
	cb(parseInt(n) + 1)
}
function foo(cb, obj) {
	cb("foo says x="+(typeof obj.x))
}

var api = {
	echo:echo,
	inc:inc,
	foo:foo,
	date:function(cb) { cb(Date()) },
}

rpc.createServer(api).listen(50505)

rpc.log(5)

