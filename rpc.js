/*
Copyright 2011 Sleepless Software Inc. All rights reserved.

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

var url = require("url")
var http = require("http")
var log = require("log5").mkLog("rpc:")

exports.log = log


var j2o = function(j) { try { return JSON.parse(j) } catch(e) { return null } }
var o2j = function(o) { return JSON.stringify(o) }
var millis = function() { return new Date().getTime() }
var time = function() { return Math.floor(millis() / 1000) }

var nop = function(){}


function messageEnd(tx, msgOut) {
	var json = o2j(msgOut)

	log(3, "<<< "+json)

	tx.res.writeHead(200, {
		"Cache-Control": "no-cache",
		"Content-Type": "text/plain",
		"Content-Length": ""+json.length,
	})

	tx.res.end(json)
}


function messageStart(tx, json) {
	var msg = j2o(json)

	log(3, ">>> "+json)

	tx.json = json
	tx.msg = msg
	if(!msg) 
		return fail(tx, "bad message")

	if(!(msg instanceof Array))
		return fail(tx, "message not an array")

	var f = cbs[msg[0]]
	if(!f)
		return fail(tx, "remote procedure not found: "+f)
	
	var args = msg.slice(1)
	args.push(function(msgOut) { messageEnd(tx, msgOut) })
	Function.apply(tx, args)
	//tx.cbs(msg, function(msgOut) { messageEnd(tx, msgOut) }, tx)
}


function fail(tx, why) {
	var rc = 500

	why = why || "mystery"
	log(3, "FAIL: "+why)
	s = "ERROR "+rc
	tx.res.writeHead(rc, {
		"Content-Type": "text/plain",
		"Content-Length": s.length
	})
	tx.res.end(s)
}

function messageInit(tx) {
	var m = tx.req.method,
		json = tx.query.j

	if(!json) {

		// json message absent

		if(m == "GET") {
			// special case: "GET /rpc/ HTTP/1.x" - return the rpc.js boot strap file
			tx.req.url = "/rpc.js"
			www(tx.req, tx.res)
			return
		}
		fail(tx, "no message")
		return
	}

	// json message present

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


// Static pages delivered using paperboy
boy = require("paperboy")
function www(req, res, docroot) {
	boy
		.deliver("docroot", req, res)
		.before(function() {
		})
		.after(function() {
			log(3, "PB OK "+req.method+req.url)
		})
		.error(function() {
			wwwErr(req, res, 500) 
		})
		.otherwise(function() {
			wwwErr(req, res, 404) 
		})
}
function wwwErr(req, res, r) {
	res.writeHead(r, {'Content-Type': 'text/plain'})
	res.end("Error "+r)
	log(3, r+" "+req.method+req.url)
}


// Every request starts here
function accept(req, res, cbs) {
	var u = url.parse(req.url, true),
		path = u.pathname

	if(/^\/rpc\/?$/.test(path)) {
		messageInit({cbs:(cbs || nop), req:req, res:res, path:path, query:u.query, u:u})
		return;
	}

	if(req.method == "OPTIONS") {
		res.writeHead(200, {
			"Access-Control-Allow-Origin": "*",	// to allow cross-domain script execution 
			"Access-Control-Max-Age": "0",
		})
		res.end()
		return;
	}

	www(req, res)					// everything else handled by paperboy
}

exports.createServer = function(cbs) {
	return http.createServer(function(req, res) {
		accept(req, res, cbs)
	}) 
}

