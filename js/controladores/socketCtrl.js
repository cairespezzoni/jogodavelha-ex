app.controller('socketCtrl', ['$scope', function ($scope) {

    // Métodos de envio/recebimento de dados via Socket.IO
    var IO = {

        init: function () {
            console.log('Iniciando socketCtrl');
            IO.socket = io.connect('http://192.168.10.248:3000');
            console.log(IO.socket);
            IO.escutandoEventos();
            $scope.pagina = "./html/intro.html";
        },

        escutandoEventos: function() {
            IO.socket.on('conectado', IO.onConectado);
            IO.socket.on('novoJogoCriado', IO.onNovoJogoCriado);
            IO.socket.on('playerEntraSala', IO.playerEntraSala);
            IO.socket.on('iniciaNovoJogo', IO.iniciaNovoJogo);
            IO.socket.on('hostChecaJogada', IO.hostChecaJogada);
            IO.socket.on('gameOver', IO.gameOver);
            IO.socket.on('erro', IO.erro);
        },

        onConectado: function() {
            console.log('SessionId: ' + IO.socket.sessionid);
            $scope.Jogo.meuSocketId = IO.socket.sessionid;
        },

        onNovoJogoCriado: function(data) {
            $scope.Jogo.Host.iniciaJogo(data);
        },

        playerEntraSala: function(data) {
            $scope.Jogo[$scope.Jogo.meuPapel].atualizaTelaEspera(data);
        },

        iniciaNovoJogo: function(data) {
            $scope.Jogo[$scope.Jogo.meuPapel].jogoContagem(data);
        },

        hostChecaJogada: function(data) {
            if ($scope.Jogo.meuPapel === 'Host') {
                $scope.Jogo.Host.checaJogada(data);
            };
        },

        gameOver: function(data) {
            $scope.Jogo[$scope.Jogo.meuPapel].endGame(data);
        },

        erro: function(data) {
            alert(data.message);
        }
    };

    $scope.Jogo = {
        gameId: 0,
        meuPapel: '',
        meuSocketId: '',

        init: function() {
            $scope.Jogo.mostraTelaInicial();
        },

        mostraTelaInicial: function() {
            // Exibir tela inicial
            $scope.telaIntro = true;
        },

        Host: {
            jogadores: [],
            jogoNovo: false,
            numJogadoresNaSala: 0,
            
            onCriarClick: function() {
                IO.socket.emit('hostCriarNovoJogo');
            },

            iniciaJogo: function(data) {
                $scope.Jogo.gameId = data.gameId;
                $scope.Jogo.meuSocketId = data.meuSocketId;
                $scope.Jogo.meuPapel = 'Host';
                $scope.Jogo.Host.numJogadoresNaSala = 0;

                $scope.Jogo.Host.mostraTelaNovoJogo();
            },

            mostraTelaNovoJogo: function() {
                // Exibir tela de jogo novo
                console.log('mostraTelaNovoJogoHost');
                $scope.pagina = "./html/novoJogo.html";

                // Exibir URL e Jogo.gameId para que o outro jogador possa pegar o código
                $scope.Jogo.Host.url = window.location.href;
            },

            atualizaTelaEspera: function(data) {
                console.log("Jogador " + data.jogadorNome + " entrou no jogo!");
                
                if ($scope.Jogo.Host.jogoNovo) {
                    $scope.Jogo.Host.mostraTelaNovoJogo();
                };

                // Adicionar novo jogador na tela de espera
                $scope.Jogo.Host.jogadores.push(data);
                //console.log($scope.Jogo.Host.jogadores);
                $scope.$apply();

                $scope.Jogo.Host.numJogadoresNaSala += 1;

                if( $scope.Jogo.Host.numJogadoresNaSala === 2) {
                    IO.socket.emit('hostSalaCheia', $scope.Jogo.gameId);
                };
            },

            jogoContagem : function() {

                // Mostrar nova tela  de contagem para início

                // Começar contagem na tela (talvez)
                $scope.Jogo.jogoContagem($scope.tempoContagem, 5, function() {
                    IO.socket.emit('hostContagemTerminada', $scope.Jogo.gameId);
                });

                // Exibir nomes dos jogadores na tela
                // $scope.Jogo.Host.players[X].jogadorNome

                // Cara ou coroa deve ser executado aqui ou logo antes deste método
            },

            checaJogada: function(data) {
                var data = {
                    gameId: $scope.Jogo.gameId,
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
                $scope.Jogo.Host.numJogadoresNaSala = 0;
                $scope.Jogo.Host.jogoNovo = true;
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
                $scope.pagina = './html/entrarJogo.html';
            },

            onPlayerComecaClick: function() {

                console.log('Enviando dados do jogador para servidor...');

                var data = {
                    gameId: $scope.Jogo.Player.gameId, // colher dados digitados pelo usuário
                    jogadorNome: $scope.Jogo.Player.meuNome,
                    ativo: false
                };

                console.log(data);

                IO.socket.emit('playerEntraJogo', data);

                $scope.Jogo.meuPapel = 'Player';
            },

            onPlayerJogadaClick: function() {
                // colher dados de qual campo o usuário clicou
                var jogada = '';

                var data = {
                    gameId: $scope.Jogo.gameId,
                    playerId: $scope.Jogo.meuSocketId,
                    jogada: jogada
                };
                
                IO.socket.emit('playerJogada', data);
            },

            onPlayerRestart: function() {
                var data = {
                    gameId: $scope.Jogo.gameId,
                    jogadorNome: $scope.Jogo.Player.meuNome
                };

                IO.socket.emit('playerRestart', data);
                // Mostrar mensagem de esperando Host iniciar novo jogo
            },

            atualizaTelaEspera: function(data) {
                if (IO.socket.sessionid === data.meuSocketId) {
                    $scope.Jogo.meuPapel = 'Player';
                    $scope.Jogo.gameId = data.gameId;

                    // Exibir mensagem de "Uniu ao jogo, aguardando novo jogo começar"
                }
            },

            jogoContagem: function(hostData) {
                // O $scope.Jogo é iniciado aqui!!
                
                $scope.Jogo.Player.hostSocketId = hostData.meuSocketId;
                // mostrar mensagem de "Preparado?"
            },

            endGame: function() {
                // mostrar mensagem de fim de jogo com opções de
                // Reiniciar ou Quitar
            }
        },

        contagem: function(tempoIni, callback) {
            
            $scope.contador = tempoIni;

            var timer = setInterval(contando, 1000);

            function contando() {
                $scope.contador -= 1;

                if($scope.contador <= 0) {
                    clearInterval(timer);
                    callback();
                    return;
                }
            }
        }
    };

    IO.init();
    $scope.Jogo.init();

}]);