// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const exec = require('child_process').exec;

var env = process.env.NODE_ENV || 'dev';
var games = {};

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static(__dirname + '/public'));
if (env == 'dev')
    app.use('/typescript', express.static(__dirname + '/typescript'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
    response.sendFile(__dirname + '/views/index.html');
});

app.post("/create", function (request, response) {
    var id = generateID();
    games[id] = { id: id, status: 'waitingForPlayers' };
    response.send(id);
});

app.get("/g/:id", function (request, response) {
    if (!(request.params.id in games)) {
        response.send(404, "That game does not exist.");
    }

    response.sendFile(__dirname + '/views/game.html');
});

// Not secured, but shouldn't do anything if there are no new commits in the repository
app.get('/deploy', function (request, response) {
    response.write('<div>Checking for new commits...</div>');
    exec(__dirname + '/../deploy', (error, stdout, stderr) => {
        response.write(`<div>${nl2br(stdout)}</div><div style="color: darkred;">${nl2br(stderr)}</div>`);

        if (!error && !stdout.match(/^Up-to-date$/m)) {
            response.write('<div>Compiling typescript...</div>');
            exec(`cd ${__dirname}/.. && tsc`, (error, stdout, stderr) => {
                response.write(`<div>Success. Restarting server...</div><div id=restarted></div>
                                <script src="https://code.jquery.com/jquery-2.2.1.min.js"></script>
                                <script>setTimeout(function() { $.get('/ping', function() { $('#restarted').text('Done'); }); }, 1000);</script>`);
                response.end();
                process.exit();
            });
        } else {
            response.end();
        }
    });
});

app.get('/ping', function (request, response) {
    response.send('pong');
});

// listen for requests :)
var listener = server.listen(process.env.PORT || 9874, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});

io.on('connection', function (socket) {
    socket.on('join', function(data) {
        socket.join(data.gameId);
        socket.gameId = data.gameId;

        socket.to(data.gameId).emit('joined', data.clientId);
    });

    // The server should just be a dumb relay. Forward messages to other sockets in the same game.
    var events = ['broadcastPlayers', 'gameStart', 'dealtCards', 'submitTurn', 'powerDown', 'useOptionCard', 'gameSettings', 'gameState'];
    for (let i = 0; i < events.length; i++) {
        socket.on(events[i], function (data) {
            data.sender = socket.id;
            socket.to(socket.gameId).emit(events[i], data);
        });
    }

});

function generateID() {
    var charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789';

    // Determine the required length of the game id (with min length of 3). This will definitely come in handy when we have more than 11,979 simultaneous games active on this server.
    var length = Math.max(3, Math.ceil(Math.log(3 * Object.keys(games).length) / Math.log(charset.length)));
    var id;

    do {
        id = randomString(length, charset);
    }
    while (games[id]);  // O(1), averages 1.5 iterations in the worst case (when 1/3 of IDs of desired length are in use).

    return id;

    function randomString(length, charset) {
        var s = '';
        for (var i = 0; i < length; i++)
            s += charset.charAt(Math.floor(charset.length * Math.random()));

        return s;
    }
}

function nl2br(str) {
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2');
}