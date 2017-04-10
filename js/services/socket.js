app.factory('socket', function(LoopBackAuth) {
    var socket = io.connect('http://localhost:3000');

    var id = LoopBackAuth.accessTokenId;
    var userId = LoopBackAuth.currentUserId;
    socket.on('conectar', function() {
        socket.emit('autenticacao', { id: id, userId: userId });
        socket.on('autenticado', function() {
            console.log('Usuário está autenticado.');
        });
    });
    return socket;
});