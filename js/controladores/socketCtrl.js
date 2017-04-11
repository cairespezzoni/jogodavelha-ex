//app.controller('socketCtrl', function ($scope) {
    
    var IO = {};
    
    var init = function () {
        IO.socket = io.connect();
        IO.bindEvents();
    }

    IO.bindEvents = function() {
        //IO.socket.on('connected', IO.onConnected);
        //IO.socket.on('newGameCreated', IO.onNewGameCreated);
        IO.socket.on('playerJoinedRoom', IO.playerJoinedRoom);
        //IO.socket.on('beginNewGame', IO.beginNewGame);
        //IO.socket.on('newWordData', IO.onNewWordData);
        //IO.socket.on('hostCheckAnswer', IO.hostCheckAnswer);
        //IO.socket.on('gameOver', IO.gameOver);
        //IO.socket.on('error', IO.error);
    }

    init();

})();