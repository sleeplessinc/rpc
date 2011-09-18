
var rpc = require("./index.js")

function hello(cb, a, b) {
	cb("The hello function says, 'You sent a="+a+" and b="+b+"'")
}

var myapi = {
	hello:hello
}

rpc.createServer(myapi).listen(50505)

rpc.log(5)

