app.controller('socketCtrl', ['$scope', function ($scope) {
    
    // Métodos de envio/recebimento de dados via Socket.IO
    var IO = {

        init: function () {
            IO.socket = io.connect();
            IO.bindEvents();
        },

        bindEvents: function() {
            IO.socket.on('conectado', IO.onConectado);
            IO.socket.on('novoJogoCriado', IO.onNovoJogoCriado);
            IO.socket.on('jogadorEntraSala', IO.jogadorEntraSala);
            IO.socket.on('iniciaNovoJogo', IO.iniciaNovoJogo);
            IO.socket.on('hostChecaJogada', IO.hostChecaJogada);
            IO.socket.on('gameOver', IO.gameOver);
            IO.socket.on('erro', IO.erro);
        },

        onConectado: function() {
            Jogo.meuSocketId = IO.socket.socket.sessionid;
        },

        onNovoJogoCriado: function(data) {
            Host.iniciaJogo(data);
        },

        jogadorEntraSala: function(data) {
            Jogo[Jogo.meuPapel[0]].atualizaTelaEspera(data);
        },

        iniciaNovoJogo: function(data) {
            Jogo[Jogo.meuPapel[0]].jogoContagem(data);
        },

        hostChecaJogada: function(data) {
            if (Jogo.meuPapel[0] === 'Host') {
                Jogo.Host.checaJogada(data);
            };
        },

        gameOver: function(data) {
            Jogo[Jogo.meuPapel[0]].endGame(data);
        },

        erro: function(data) {
            alert(data.message);
        }
    };

    $scope.Jogo = {
        gameId: 0,
        meuPapel: ['', 0],
        meuSocketId: '',

        init: function() {
            Jogo.mostraTelaInicial();
        },

        mostraTelaInicial: function() {
            // Exibir tela inicial
        },

        Host: {
            //jogadores: [],
            jogoNovo: false,
            numJogadoresNaSala: 0,
            
            onCriarJogoClick: function() {
                IO.socket.emit('hostCreateNewGame');
            },

            iniciaJogo: function(data) {
                Jogo.gameId = data.gameId;
                Jogo.meuSocketId = data.meuSocketId;
                Jogo.meuPapel = ['Host', 0];
                Jogo.Host.numJogadoresNaSala = 0;

                Jogo.Host.mostraTelaNovoJogo();
            },

            mostraTelaNovoJogo: function() {
                // Exibir tela de jogo novo
                // Exibir URL e Jogo.gameId para que o outro jogador possa pegar o código
            },

            atualizaTelaEspera: function(data) {
                if (Jogo.Host.jogoNovo) {
                    Jogo.Host.mostraTelaNovoJogo();
                };

                // Adicionar novo jogador na tela de espera
                console.log("Jogador " + data.jogadorNome + " entrou no jogo!");

                $scope.jogador[Jogo.meuPapel[1]].push(data);

                Jogo.Host.numJogadoresNaSala += 1;

                if( Jogo.Host.numJogadoresNaSala === 2) {
                    IO.socket.emit('hostSalaCheia', Jogo.gameId);
                };
            },

            jogoContagem : function() {

                // Mostrar nova tela  de contagem para início

                // Começar contagem na tela (talvez)
                Jogo.jogoContagem($scope.tempoContagem, 5, function() {
                    IO.socket.emit('hostContagemTerminada', Jogo.gameId);
                });

                // Exibir nomes dos jogadores na tela
                // Jogo.Host.players[X].jogadorNome
            },

            checaJogada: function(data) {
                var data = {
                    gameId: Jogo.gameId,
                }

                IO.socket.emit('hostProxJogada', data);
            },
            
            endGame: function(data) {
                var p1 = $scope.jogadores[0];
                var p1Name = p1.nome;

                var p2 = $scope.jogadores[1];
                var p2Name = p2.nome;

                // Encontrar quem foi o vencedor.

                // Mostrar vencedor (ou mensagem de empate)
                Jogo.Host.numJogadoresNaSala = 0;
                Jogo.Host.jogoNovo = true;
            },

            restartGame: function() {
                // exibir tela de novo jogo
                // usar mesmo Jogo.gameId
            }
        },

        Player: {
            hostSocketId: '',
            meuNome: '',

            onJoinClick: function() {
                // Mostra a tela de se juntar a um jogo.
            },

            onPlayerStartClick: function() {
                var data = {
                    gameId: '', // colher dados digitados pelo usuário
                    jogadorNome: '' || 'anonimo',
                    ativo: false
                };

                IO.socket.emit('playerJoinGame', data);

                Jogo.meuPapel = ['Player', 1];
                Jogo.Player.meuNome = data.jogadorNome;
            },

            onPlayerJogadaClick: function() {
                // colher dados de qual campo o usuário clicou
                var jogada = '';

                var data = {
                    gameId: Jogo.gameId,
                    playerId: Jogo.meuSocketId,
                    jogada: jogada
                };
                
                IO.socket.emit('playerJogada', data);
            },

            onPlayerRestart: function() {
                var data = {
                    gameId: Jogo.gameId,
                    jogadorNome: Jogo.Player.meuNome
                };

                IO.socket.emit('playerRestart', data);
                // Mostrar mensagem de esperando Host iniciar novo jogo
            },

            atualizaTelaEspera: function(data) {
                if (IO.socket.sessionid === data.meuSocketId) {
                    Jogo.meuPapel = ['Player', 1];
                    Jogo.gameId = data.gameId;

                    // Exibir mensagem de "Uniu ao jogo, aguardando novo jogo começar"
                }
            },

            jogoContagem: function(hostData) {
                Jogo.Player.hostSocketId = hostData.meuSocketId;
                // mostrar mensagem de "Preparado?"
            },

            endGame: function() {
                // mostrar mensagem de fim de jogo com opções de
                // Reiniciar ou Quitar
            }
        },

        countDown: function(tempoIni, callback) {
            
            $scope.contador = tempoIni;

            var timer = setInterval(countItDown, 1000);

            function countItDown() {
                $scope.contador -= 1;

                if($scope.contador <= 0) {
                    clearInterval(timer);
                    callback();
                    return;
                }
            }
        }
    };

    init();

}])();