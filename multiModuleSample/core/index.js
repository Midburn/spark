"use strict"
var express = require('express');
var bodyParser = require('body-parser');
var proxy = require('express-http-proxy');


var app = express();
app.use('/', express.static('static'));
app.use('/', express.static('static/html'));

var services = [];
var servicesArr=undefined;//sorted services array


app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


app.post('/register', function (req, res) {
	var entry={
		port : req.body.port,
    	path : req.body.path,
    	name : req.body.name,
        ordering: (req.body.ordering===undefined)? 100:req.body.ordering


	}
    app.use('/'+entry.path, proxy('http://127.0.0.1:' + entry.port));
    services[entry.path]=entry;
    servicesArr=undefined;
    console.log('registered ' + entry.path + ' at /' + entry.path 
    	+ ' redirect to: ' + entry.port 
    	+ " under name:" +entry.name);

    res.send('registered');
});

app.get('/register', (req, res) => {
    if (servicesArr===undefined)
    {servicesArr=Object.values(services);
    servicesArr.sort(function (a,b) {return a.ordering-b.ordering});
    }

    res.send(servicesArr);
})

app.listen(3000, function () {
    console.log('spark main  listening on port 3000!')
})
