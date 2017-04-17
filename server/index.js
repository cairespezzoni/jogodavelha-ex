//var path = require('path');
var app = require('express')();
var gameServer = require('./gameServer');

// Cria um servidor baseado em Node.js na porta 3000
var server = require('http').createServer(app).listen(process.env.PORT || 3000);

var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket) {
    console.log('Ouvindo na porta: 3000');
    gameServer.initGame(io, socket);
});