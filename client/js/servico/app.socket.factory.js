(function() {
'use strict';

    angular
        .module('app')
        .factory('SocketFactory', SocketFactory);

    SocketFactory.inject = [];
    function SocketFactory() {
        var service = {
            serverConecta: serverConecta
        };
        
        return service;

        ////////////////

        var socket;

        function serverConecta() {
            socket = io.connect('http://192.168.10.248:3000');
            
            socket.on('conectado', function(data) {
                return data.message;
            });

            return 'Erro na Conexão!';
        };
    }
})();