var express = require('express');
var request = require('request');

var app = express()
var sparkPort = 3000;
var modulePort = 3001;

app.use('/static', express.static('static'))

app.get('/', function (req, res) {
    res.send('Hello from module1!')
})


app.listen(modulePort, function () {
    console.log('module1 listening on port ' + modulePort)
    request.post({
        url: 'http://localhost:' + sparkPort + '/register',
        form: { path: 'mod1', port: modulePort }
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

