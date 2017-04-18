(function() {
    'use strict';

    angular
        .module('app')
        .controller('SocketCtrl', SocketCtrl);

    SocketCtrl.inject = ['$scope'];
    function SocketCtrl($scope) {

        var vm = this;

        // Métodos de envio/recebimento de dados via Socket.IO
        var IO = {

            init: function () {
                console.log('Iniciando socketCtrl');
                IO.socket = io.connect('http://192.168.10.248:3000');
                IO.escutandoEventos();
                vm.pagina = "./html/intro.html";
            },

            escutandoEventos: function() {
                IO.socket.on('conectado', IO.onConectado);
                IO.socket.on('novoJogoCriado', IO.onNovoJogoCriado);
                IO.socket.on('playerEntraSala', IO.playerEntraSala);
                IO.socket.on('iniciaNovoJogo', IO.iniciaNovoJogo);
                IO.socket.on('hostChecaJogada', IO.hostChecaJogada);
                IO.socket.on('gameOver', IO.gameOver);
                IO.socket.on('erro', IO.erro);

                IO.socket.on('playerAguardaJogada', IO.playerAguardaJogada);
            },

            onConectado: function() {
                //console.log('SessionId: ' + IO.socket.sessionid);
                vm.Jogo.meuSocketId = IO.socket.sessionid;
            },

            onNovoJogoCriado: function(data) {
                vm.Jogo.Host.iniciaJogo(data);
            },

            playerEntraSala: function(data) {
                vm.Jogo[vm.Jogo.meuPapel].atualizaTelaEspera(data);
            },

            iniciaNovoJogo: function(data) {
                console.log('Começando novo jogo - ' + vm.Jogo.meuPapel);
                vm.Jogo[vm.Jogo.meuPapel].playerSorteio(data);
            },

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
            gameId: 0,
            meuPapel: '',
            meuSocketId: '',
            tabuleiro: [],

            Host: {
                jogadores: [],
                jogoNovo: false,
                numJogadoresNaSala: 0,
                
                onCriarClick: function() {
                    IO.socket.emit('hostCriarNovoJogo');
                },

                iniciaJogo: function(data) {
                    vm.Jogo.gameId = data.gameId;
                    vm.Jogo.meuSocketId = data.meuSocketId;
                    vm.Jogo.meuPapel = 'Host';
                    vm.Jogo.Host.numJogadoresNaSala = 0;

                    vm.Jogo.Host.mostraTelaNovoJogo();
                },

                mostraTelaNovoJogo: function() {
                    // Exibir tela de jogo novo
                    vm.pagina = "./html/novoJogo.html";

                    // Exibir URL e Jogo.gameId para que o outro jogador possa pegar o código
                    vm.Jogo.Host.url = window.location.href;
                },

                
                atualizaTelaEspera : function(data) {
                    console.log("Jogador " + data.jogadorNome + " entrou no jogo!");
                    
                    if (vm.Jogo.Host.jogoNovo) {
                        vm.Jogo.Host.mostraTelaNovoJogo();
                    };

                    if( vm.Jogo.Host.numJogadoresNaSala < 2) {
                        // Adicionar novo jogador na tela de espera
                        vm.Jogo.Host.jogadores.push(data);
                        console.log(vm.Jogo.Host.jogadores);
                        vm.Jogo.Host.numJogadoresNaSala += 1;

                    } else if( vm.Jogo.Host.numJogadoresNaSala === 2) {
                        vm.Jogo.Host.jogadores.push(data);
                        console.log(vm.Jogo.Host.jogadores);
                        IO.socket.emit('hostSalaCheia', vm.Jogo.gameId);
                    } else {
                        console.log('Sala cheia!!!!!');
                    };

                    vm.Jogo.Host.numJogadoresNaSala += 1;

                    $scope.$apply();
                },

                playerSorteio : function(data) {
                    
                    vm.Jogo.tabuleiro = data.tabuleiro;
                    
                    // Mostrar nova tela  de contagem para início
                    vm.pagina = './html/grid.html';
                    $scope.$apply();

                    // Gera um número aleatório entre 0 e 1
                    var iniciativa = Math.round(Math.random());

                    // Envia ao servidor o resultado da Iniciativa
                    IO.socket.emit('playerIniciativa', vm.Jogo.gameId, iniciativa);
                },

                checaJogada: function(data) {
                    var data = {
                        gameId: vm.Jogo.gameId,
                    }

                    IO.socket.emit('hostProxJogada', data);
                },
                
                endGame: function(data) {
                    var p1 = vm.jogadores[0];
                    var p1Name = p1.nome;

                    var p2 = vm.jogadores[1];
                    var p2Name = p2.nome;

                    // Encontrar quem foi o vencedor.

                    // Mostrar vencedor (ou mensagem de empate)
                    vm.Jogo.Host.numJogadoresNaSala = 0;
                    vm.Jogo.Host.jogoNovo = true;
                },

                restartGame: function() {
                    // exibir tela de novo jogo
                    // usar mesmo Jogo.gameId
                }
            },

            Player: {
                hostSocketId: '',
                gameId: undefined,
                meuNome: 'Anônimo',

                onEntrarClick: function() {
                    console.log('Clicou para Entrar em um jogo.');
                    
                    // Mostra a tela de se juntar a um jogo.
                    vm.pagina = './html/entrarJogo.html';
                },

                onPlayerComecaClick: function() {

                    console.log('Enviando dados do jogador para servidor...');

                    if (vm.Jogo.Player.meuNome) {
                        var data = {
                            gameId: vm.Jogo.Player.gameId, // colher dados digitados pelo usuário
                            jogadorNome: vm.Jogo.Player.meuNome,
                            ativo: false,
                            oponente: ''
                        };

                        console.log(data);

                        IO.socket.emit('playerEntraJogo', data);

                        vm.Jogo.meuPapel = 'Player';
                    }
                },

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

                atualizaTelaEspera: function(data) {
                    console.log(IO.socket.id + ' = ' + data.meuSocketId);
                    if (IO.socket.id === data.meuSocketId) {
                        vm.Jogo.meuPapel = 'Player';
                        vm.Jogo.gameId = data.gameId;

                        vm.Jogo.Player.nomeOponente = data.oponente[0];

                        // Exibir mensagem de "Uniu ao jogo, aguardando novo jogo começar"
                        vm.Jogo.listaEspera = true;
                        console.log('Lista de espera: ' + vm.Jogo.listaEspera);
                    } else {
                        console.log(data.oponente[1]);
                        vm.Jogo.Player.nomeOponente = data.oponente[1];
                    };
                },

                playerSorteio : function(data) {
                    vm.Jogo.tabuleiro = data.tabuleiro;
                    vm.pagina = './html/grid.html';
                    vm.Jogo.Player.hostSocketId = data.meuSocketId;

                    $scope.$apply();
                },

                endGame: function() {
                    // mostrar mensagem de fim de jogo com opções de
                    // Reiniciar ou Quitar
                }
            }
        };

        IO.init();
        //vm.Jogo.init();
    }
})();