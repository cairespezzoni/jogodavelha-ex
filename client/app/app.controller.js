(function() {
    'use strict';

    angular
        .module('app')
        .controller('AppController', AppController);

    AppController.inject = ['$scope', '$timeout'];
    function AppController($scope, $timeout) {

        var vm = this;

        // Host
        vm.onCriarClick = onCriarClick;
        // Player
        vm.onEntrarClick = onEntrarClick;
        vm.onRegistrarClick = onRegistrarClick;
        vm.onPlayerJogadaClick = onPlayerJogadaClick;
        vm.onPlayerRestartClick = onPlayerRestartClick;

        vm.info = {
            url: window.location.href,
            pagina: "./html/intro.html",
            gameId: undefined,
            jogadores: [], // nome
            espera: false,
            esperamsg: "",
            tabuleiro: [],
            estilo:[[[],[],[]],
                    [[],[],[]],
                    [[],[],[]]],
            nome: undefined,
            oponente: undefined,
            jogocomecou: false,
            suavez: false,
            final: false,
            finalclasse: "finalempate"
        };

        var meusDados = {
            papel: ''
        };

        console.log('Iniciando socketCtrl');
        var socket = io.connect('http://192.168.10.248:3000');
        escutandoEventos();

        //////////////////////////////////////////////////////
        
        function escutandoEventos() {
            socket.on('conectado', onConectado);
            socket.on('novoJogoCriado', novoJogoCriado);
            socket.on('playerEntraSala', playerEntraSala);
            socket.on('salaCheia', salaCheia);
            socket.on('cadastraOponente', cadastraOponente);
            socket.on('sorteiaIniciativa', sorteiaIniciativa);
            socket.on('iniciarJogo', iniciarJogo);
            socket.on('suaVez', suaVez);
            socket.on('atualizaTabuleiro', atualizaTabuleiro);
            socket.on('hostFimJogo', hostFimJogo);
            socket.on('playerVitoria', playerVitoria);
            socket.on('playerDerrota', playerDerrota);
            socket.on('reiniciaJogo', reiniciaJogo);
        };

        function onConectado(data) {
            console.log(data.message);
        };

        function salaCheia() {
            vm.info.esperamsg = "A sala está cheia!";
            $scope.$apply();
        };

        /////////////////////////////////
        ///                           ///
        ///          AMBOS            ///
        ///                           ///
        /////////////////////////////////

        var hp = {
            Host: {},
            Player: {}
        };
        
        function playerEntraSala(data) {
            hp[meusDados.papel].atualizaTelaEspera(data);
        };

        function sorteiaIniciativa(data) {
            console.log('Começando novo jogo - ' + meusDados.papel);
            hp[meusDados.papel].playerSorteio(data);
        };   

        function iniciarJogo(jogadornome) {
            hp[meusDados.papel].iniciarJogo(jogadornome);
        };

        function atualizaTabuleiro(datajogada) {
            vm.info.tabuleiro = datajogada.tabuleiro;
            hp[meusDados.papel].atualizaTabuleiro(datajogada);
            $scope.$apply();
        };

        function terminaJogo(condicao) {
            switch(condicao) {
                case 1:
                    vm.info.estilo[0][0].push("vitoria");
                    vm.info.estilo[0][1].push("vitoria");
                    vm.info.estilo[0][2].push("vitoria");
                    break;
                case 2:
                    vm.info.estilo[1][0].push("vitoria");
                    vm.info.estilo[1][1].push("vitoria");
                    vm.info.estilo[1][2].push("vitoria");
                    break;
                case 3:
                    vm.info.estilo[2][0].push("vitoria");
                    vm.info.estilo[2][1].push("vitoria");
                    vm.info.estilo[2][2].push("vitoria");
                    break;
                case 4:
                    vm.info.estilo[0][0].push("vitoria");
                    vm.info.estilo[1][0].push("vitoria");
                    vm.info.estilo[2][0].push("vitoria");
                    break;
                case 5:
                    vm.info.estilo[0][1].push("vitoria");
                    vm.info.estilo[1][1].push("vitoria");
                    vm.info.estilo[2][1].push("vitoria");
                    break;
                case 6:
                    vm.info.estilo[0][2].push("vitoria");
                    vm.info.estilo[1][2].push("vitoria");
                    vm.info.estilo[2][2].push("vitoria");
                    break;
                case 7:
                    vm.info.estilo[0][0].push("vitoria");
                    vm.info.estilo[1][1].push("vitoria");
                    vm.info.estilo[2][2].push("vitoria");
                    break;
                case 8:
                    vm.info.estilo[2][0].push("vitoria");
                    vm.info.estilo[1][1].push("vitoria");
                    vm.info.estilo[0][2].push("vitoria");
                    break;
            };
            vm.info.espera = false;
            vm.info.final = true;
            $scope.$apply();
        };

        function reiniciaJogo(data) {
            // gameId, pagina, estilo, jogocomecou, suavez, finalclasse, finalmsg
            vm.info.pagina = data.pagina;
            vm.info.espera = data.espera;
            vm.info.esperamsg = data.esperamsg;
            vm.info.estilo = data.estilo;
            vm.info.jogocomecou = data.jogocomecou;
            vm.info.suavez = data.suavez;
            vm.info.suavezmsg = data.suavezmsg;
            vm.info.final = data.final;
            vm.info.finalclasse = data.finalclasse;
            $scope.$apply();
            if (meusDados.papel == 'Host') {
                socket.emit('hostPreparaJogo', vm.info.gameId);
            };
        };

        /////////////////////////////////
        ///                           ///
        ///          HOST             ///
        ///                           ///
        /////////////////////////////////
        
        function onCriarClick() {
            socket.emit('hostCriarNovoJogo');
        };

        function novoJogoCriado(serverdata) {
            vm.info.gameId = serverdata.gameId;
            meusDados.papel = 'Host';
            
            // Exibir tela de jogo novo
            vm.info.pagina = "./html/novoJogo.html";
            $scope.$apply();
        };

        function hostFimJogo(datajogada) {
            if (datajogada.resultado != 9) {
                vm.info.finalclasse = "finalvitoria";
                vm.info.suavezmsg = datajogada.nome + " é o vencedor!";
            };
            terminaJogo(datajogada.resultado);
        };

        hp.Host.atualizaTelaEspera = function (playerdata) {
            console.log("Jogador " + playerdata.nome + " entrou no jogo!");
            
            if( vm.info.jogadores.length === 0 ) {
                
                // Adicionar novo jogador na tela de espera
                vm.info.jogadores.push(playerdata.nome);

            } else if( vm.info.jogadores.length === 1) {
                
                vm.info.jogadores.push(playerdata.nome);

                vm.info.nome = vm.info.jogadores[0];
                vm.info.oponente = vm.info.jogadores[1];
                socket.emit('hostPreparaJogo', vm.info.gameId);

            } else {
                
                console.log('Sala cheia!!!!!');

            };

            $scope.$apply();
        };

        hp.Host.playerSorteio = function (gamedata) {
                    
            vm.info.tabuleiro = gamedata.tabuleiro;
            
            // Mostrar tela de jogo
            vm.info.pagina = './html/grid.html';
            $scope.$apply();

            // Envia ao servidor o resultado da Iniciativa
            socket.emit('playerIniciativa', vm.info.gameId);
        };

        hp.Host.iniciarJogo = function (jogadornome) {

            function contador() {
                console.log('Acabou o tempo, jogo começando, crau');
                vm.info.jogocomecou = true;
                $scope.$apply();
            };

            $timeout(contador, 5000);

        };

        hp.Host.atualizaTabuleiro = function (datajogada) {
            if (datajogada.nome == vm.info.jogadores[0]) {
                vm.info.estilo[datajogada.linha][datajogada.coluna] = ["jogada1"];
            } else {
                vm.info.estilo[datajogada.linha][datajogada.coluna] = ["jogada2"];
            };
        };

        /////////////////////////////////
        ///                           ///
        ///          PLAYER           ///
        ///                           ///
        /////////////////////////////////

        function onEntrarClick() {            
            // Mostra a tela de se juntar a um jogo.
            vm.info.pagina = './html/entrarJogo.html';
        };

        function onRegistrarClick() {

            console.log('Enviando dados do jogador para servidor...');

            var dadosJogador = {
                gameId: vm.temp.id, // colher dados digitados pelo usuário
                nome: vm.temp.nome,
            };

            vm.info.nome = vm.temp.nome;

            vm.info.gameId = vm.temp.id;
            meusDados.papel = 'Player';
            socket.emit('playerEntraJogo', dadosJogador);

        };

        function onPlayerJogadaClick(linha, coluna) {
            console.log("Clicou num quadro...");
            if (vm.info.suavez == true && meusDados.papel == 'Player') {
                if (!vm.info.tabuleiro[linha][coluna]) {
                    console.log("...e era sua vez!");
                    vm.info.estilo[linha][coluna] = ["jogada1"];
                    var datajogada = {
                        linha: linha,
                        coluna: coluna,
                        gameId: vm.info.gameId,
                        nome: vm.info.nome
                    };
                    console.log('Joguei, aguardando minha vez!!');
                    socket.emit('hostChecaJogada', datajogada);
                    vm.info.suavez = false;
                    vm.info.suavezmsg = "";
                }
            } else {
                console.log("...mas não era sua vez!");
            }
        };

        function onPlayerRestartClick() {
            socket.emit('playerJogoRestart', vm.info.gameId);
        };

        function cadastraOponente(data) {
            console.log('Oponente: ' + data);
            vm.info.oponente = data;
            $scope.$apply();
        };

        function suaVez() {
            vm.info.suavezmsg = "É a sua vez!";
            vm.info.suavez = true;
            $scope.$apply();
        };

        function playerVitoria(condicao) {
            if (condicao != 9) {
                vm.info.finalclasse = "finalvitoria";
                vm.info.suavezmsg = "Parabéns, você ganhou!";
            };
            terminaJogo(condicao);
        };

        function playerDerrota(condicao) {
            if (condicao != 9) {
                vm.info.finalclasse = "finalderrota";
                vm.info.suavezmsg = "Vixe, você perdeu..."
            };
            terminaJogo(condicao);
        };

        hp.Player.atualizaTelaEspera = function (playerdata) {
            meusDados.papel = 'Player';
            vm.info.gameId = playerdata.gameId;

            // Exibir mensagem de "Uniu ao jogo, aguardando novo jogo começar"
            vm.info.espera = true;
            vm.info.esperamsg = "Aguardando oponente!";
            console.log('Espera: ' + vm.info.espera);
            $scope.$apply();
        };

        hp.Player.playerSorteio = function (gamedata) {
            vm.info.tabuleiro = gamedata.tabuleiro;
            vm.info.pagina = './html/grid.html';

            $scope.$apply();
        };

        hp.Player.iniciarJogo = function () {
            
            $timeout(contador, 5000);
            function contador() {
                vm.info.jogocomecou = true;
                $scope.$apply();
            };
        };

        hp.Player.atualizaTabuleiro = function (datajogada) {
            vm.info.tabuleiro = datajogada.tabuleiro;
            if (vm.info.estilo[datajogada.linha][datajogada.coluna] == "") {
                vm.info.estilo[datajogada.linha][datajogada.coluna] = ["jogada2"];
            };
        }
    }
})();