var express = require('express');
var request = require('request');

var app = express()
var sparkPort = 3000;
var modulePort = 3002;

app.use('/', express.static('static'))

app.get('/', function (req, res) {
    res.send('Hello from module1!')
})


app.listen(modulePort, function () {
    console.log('module2 listening on port ' + modulePort)
    request.post({
        url: 'http://localhost:' + sparkPort + '/register',
        form: { path: 'mod2', port: modulePort ,name: 'module two',ordering:2}
    },
        (err, httpResponse, body) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('register response:' + httpResponse.statusCode);
        }
    );
})

