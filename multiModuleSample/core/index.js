"use strict"
var express = require('express');
var bodyParser = require('body-parser');
var proxy = require('express-http-proxy');


var app = express();
app.use('/static', express.static('static'));

var services = [];

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


app.post('/register', function (req, res) {
	var entry={
		port : req.body.port,
    	path : req.body.path,
    	name : req.body.name


	}
    app.use('/'+entry.path, proxy('http://127.0.0.1:' + entry.port));
    services.push(entry);
    console.log('registered ' + entry.path + ' at /' + entry.path 
    	+ ' redirect to: ' + entry.port 
    	+ " under name:" +entry.name);
    res.send('registered');
});

app.get('/register', (req, res) => {
    res.send(services);
})

app.listen(3000, function () {
    console.log('spark main  listening on port 3000!')
})
