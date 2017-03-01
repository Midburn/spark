"use strict"
var express = require('express');
var bodyParser = require('body-parser');
var proxy = require('express-http-proxy');


var app = express()

var services = [];

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


app.post('/register', function (req, res) {
    var port = req.body.port;
    var path = req.body.path;
    app.use('/'+path, proxy('http://127.0.0.1:' + port));
    services.push(path);
    console.log('registered ' + path + ' at /' + path + ' redirect to: ' + port);
    res.send('registered');
})

app.get('/register', (req, res) => {
    res.send(services);
})

app.listen(3000, function () {
    console.log('spark main  listening on port 3000!')
})
