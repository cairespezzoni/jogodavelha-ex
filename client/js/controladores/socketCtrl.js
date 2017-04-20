(function() {
    'use strict';

    angular
        .module('app')
        .controller('SocketCtrl', SocketCtrl);

    SocketCtrl.inject = ['$scope'];
    function SocketCtrl($scope) {

        var vm = this;

        // Host
        vm.onCriarClick = onCriarClick;
        // Player
        vm.onEntrarClick = onEntrarClick;
        vm.onRegistrarClick = onRegistrarClick;

        vm.info = {
            url: window.location.href,
            pagina: "./html/intro.html",
            gameId: undefined,
            jogadores: [],
            espera: false,
            tabuleiro: [],
            nome: undefined,
            oponente: undefined
        };

        var meusDados = {
            hostSocketId: '',
            socketId: '',
            papel: '',
        };

        console.log('Iniciando socketCtrl');
        var socket = io.connect('http://192.168.10.248:3000');
        escutandoEventos();

        //////////////////////////////////////////////////////
        
        function escutandoEventos() {
            socket.on('conectado', onConectado);
            socket.on('novoJogoCriado', iniciarJogo);
            socket.on('playerEntraSala', playerEntraSala);
            socket.on('iniciaNovoJogo', iniciaNovoJogo);
            socket.on('cadastraOponente', cadastraOponente);
            /*socket.on('hostChecaJogada', IO.hostChecaJogada);
            socket.on('gameOver', IO.gameOver);
            socket.on('erro', IO.erro);

            socket.on('playerAguardaJogada', IO.playerAguardaJogada);*/
        };

        function onConectado(data) {
            console.log(data.message);
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

        function iniciaNovoJogo(data) {
            console.log('Começando novo jogo - ' + meusDados.papel);
            hp[meusDados.papel].playerSorteio(data);
        };        

        /////////////////////////////////
        ///                           ///
        ///          HOST             ///
        ///                           ///
        /////////////////////////////////
        
        function onCriarClick() {
            socket.emit('hostCriarNovoJogo');
        };

        function iniciarJogo(serverdata) {
            vm.info.gameId = serverdata.gameId;
            meusDados.socketId = serverdata.meuSocketId;
            meusDados.papel = 'Host';
            //vm.Jogo.Host.numJogadoresNaSala = 0;
            
            // Exibir tela de jogo novo
            vm.info.pagina = "./html/novoJogo.html";
        };

        hp.Host.atualizaTelaEspera = function (playerdata) {
            console.log("Jogador " + playerdata.nome + " entrou no jogo!");
            
            if( vm.info.jogadores.length === 0 ) {
                
                // Adicionar novo jogador na tela de espera
                vm.info.jogadores.push(playerdata);
                console.log(vm.info.jogadores);

            } else if( vm.info.jogadores.length === 1) {
                
                vm.info.jogadores.push(playerdata);
                var newdata = {
                    jogador1: { 
                        nome: vm.info.jogadores[0].nome,
                        socketId: vm.info.jogadores[0].socketId
                    },
                    jogador2: { 
                        nome: vm.info.jogadores[1].nome,
                        socketId: vm.info.jogadores[1].socketId
                    },
                    gameId: vm.info.gameId
                };
                console.log(newdata);

                vm.info.nome = vm.info.jogadores[0].nome;
                vm.info.oponente = vm.info.jogadores[1].nome;
                socket.emit('hostSalaCheia', newdata);

            } else {
                
                console.log('Sala cheia!!!!!');

            };

            $scope.$apply();
        };

        hp.Host.playerSorteio =  function (gamedata) {
                    
            vm.info.tabuleiro = gamedata.tabuleiro;
            
            // Mostrar tela de jogo
            vm.info.pagina = './html/grid.html';
            $scope.$apply();

            // Gera um número aleatório entre 0 e 1
            var iniciativa = Math.round(Math.random());

            // Envia ao servidor o resultado da Iniciativa
            socket.emit('playerIniciativa', vm.info.gameId, iniciativa);
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
                ativo: false
            };

            vm.info.nome = vm.temp.nome;

            console.log(dadosJogador);

            meusDados.papel = 'Player';
            socket.emit('playerEntraJogo', dadosJogador);

        };

        function cadastraOponente(data) {
            console.log('Oponente: ' + data);
            vm.info.oponente = data;
            $scope.$apply();
        };

        hp.Player.atualizaTelaEspera = function (playerdata) {
            meusDados.papel = 'Player';
            vm.info.gameId = playerdata.gameId;

            // Exibir mensagem de "Uniu ao jogo, aguardando novo jogo começar"
            vm.info.espera = true;
            console.log('Espera: ' + vm.info.espera);
            $scope.$apply();
        };

        hp.Player.playerSorteio = function (data) {
            vm.info.tabuleiro = data.tabuleiro;
            vm.info.pagina = './html/grid.html';
            meusDados.hostSocketId = data.meuSocketId;

            $scope.$apply();
        };

/////////////////////////  OLD   //////////////////////////////
        // Métodos de envio/recebimento de dados via Socket.IO
        var IO = {

            hostChecaJogada: function(data) {
                if (vm.Jogo.meuPapel === 'Host') {
                    vm.Jogo.Host.checaJogada(data);
                };
            },

            gameOver: function(data) {
                vm.Jogo[vm.Jogo.meuPapel].endGame(data);
            },

            erro: function(data) {
                alert(data.message);
            },

            playerAguardaJogada: function() {
                console.log('Minha vez de jogar...');
                
            }
        };

        vm.Jogo = {
            Host: {
               
                checaJogada: function(data) {
                    /*var data = {
                        gameId: vm.Jogo.gameId,
                    }

                    IO.socket.emit('hostProxJogada', data);*/
                },
                
                endGame: function(data) {
                    /*var p1 = vm.jogadores[0];
                    var p1Name = p1.nome;

                    var p2 = vm.jogadores[1];
                    var p2Name = p2.nome;

                    // Encontrar quem foi o vencedor.

                    // Mostrar vencedor (ou mensagem de empate)
                    vm.Jogo.Host.numJogadoresNaSala = 0;
                    vm.Jogo.Host.jogoNovo = true;*/
                },

                restartGame: function() {
                    // exibir tela de novo jogo
                    // usar mesmo Jogo.gameId
                }
            },

            Player: {

                onPlayerJogadaClick: function() {
                    // colher dados de qual campo o usuário clicou
                    var jogada = '';

                    var data = {
                        gameId: vm.Jogo.gameId,
                        playerId: vm.Jogo.meuSocketId,
                        jogada: jogada
                    };
                    
                    IO.socket.emit('playerJogada', data);
                },

                onPlayerRestart: function() {
                    var data = {
                        gameId: vm.Jogo.gameId,
                        jogadorNome: vm.Jogo.Player.meuNome
                    };

                    IO.socket.emit('playerRestart', data);
                    // Mostrar mensagem de esperando Host iniciar novo jogo
                },

                endGame: function() {
                    // mostrar mensagem de fim de jogo com opções de
                    // Reiniciar ou Quitar
                }
            }
        };

        //vm.Jogo.init();
    }
})();