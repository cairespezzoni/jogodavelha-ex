(function() {
'use strict';

    angular
        .module('app')
        .service('DataService', DataService);

    DataService.inject = [];
    function DataService() {
        
        // Variáveis Instância
        var meuSocketId = '';

        // Variáveis Global
        var pagina;
        var gameId = 0;
        var meuPapel = '';
        var tabuleiro = [];

        // Variáveis do Host
        var hostJogadores = [];
        var hostJogoNovo = false; // ?
        var hostNumJogadoresNaSala = hostJogadores.length; //remover
        var hostIniciativa = Math.round(Math.random());

        // Variáveis do Player
        var hostSocketId = '';
        var gameId = undefined;
        var meuNome = 'Anônimo';

    };

})();