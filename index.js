/*
Copyright 2013 Sleepless Software Inc. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE. 

*/

var util = require("util")
var url = require("url")
var http = require("http")
var log = require("log5").mkLog("rpc:")

exports.log = log

var j2o = function(j) { try { return JSON.parse(j) } catch(e) { return null } }
var o2j = function(o) { return JSON.stringify(o) }

var nop = function(){}


function messageEnd(tx, msgOut) {

	var json = o2j(msgOut)

	log(3, "<<< "+json)

	tx.res.writeHead(200, {
		"Cache-Control": "no-cache",
		"Content-Type": "text/plain",
		"Content-Length": "" + json.length,
	})

	tx.res.end(json)

}


function messageStart(tx, json) {

	var msg = j2o(json)

	log(3, ">>> "+json)

	tx.json = json
	tx.msg = msg

	if(!msg)
		return fail(tx, "no message")

	if(typeof msg !== "object")
		return fail(tx, "bad message")

	var args = msg.args
	if(!(args instanceof Array))
		return fail(tx, "message not an array")

	if(args.length < 1)
		return fail(tx, "array empty")

	var funcName = args[0].trim()
	if(!funcName)
		return fail(tx, "no function")

	var cbs = tx.cbs
	var func = cbs[funcName]
	if(!func)
		return fail(tx, "function not found: "+funcName)

	args.splice(0, 1, function(msgOut){messageEnd(tx, msgOut)})
	func.apply(tx, args)

}


function fail(tx, why) {

	why = why || "mystery"
	log(3, "FAIL: "+why)
	var msg = {error:why}
	messageEnd(tx, msg)

}


function messageInit(tx) {

	var m = tx.req.method
	var json = tx.query.j

	if(!json) {
		tx.res.writeHead(404, {
			"Cache-Control": "no-cache",
			"Content-Type": "text/plain"
		})
		tx.res.end(tx.path + ": NOT FOUND")
		log(3, "NOT FOUND: " + tx.path)
		return
	}

	if(m == "GET") {
		messageStart(tx, json)
		return
	}

	if(m == "POST") {
		tx.req.pause()		// necessary?
		messageStart(tx, json)
		return
	}

	fail(tx, "bad method "+m)

}


// Every request starts here
function accept(req, res, cbs) {

	if(req.method == "OPTIONS") {
		res.writeHead(200, {
			"Access-Control-Allow-Origin": "*",	// to allow cross-domain script execution 
			"Access-Control-Max-Age": "0",
		})
		res.end()
		return;
	}
	
	var u = url.parse(req.url, true)
	var path = u.pathname
	var tx = {cbs:(cbs || nop), req:req, res:res, path:path, query:u.query, u:u}
	messageInit(tx)

}


exports.createServer = function(cbs) {

	return http.createServer(function(req, res) {
		accept(req, res, cbs)
	}) 

}

