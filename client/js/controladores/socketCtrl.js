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

            IO.socket.on('playerAguardaJogada', IO.playerAguardaJogada);
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
            console.log('Começando novo jogo - ' + $scope.Jogo.meuPapel);
            $scope.Jogo[$scope.Jogo.meuPapel].playerSorteio(data);
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
        },


        playerAguardaJogada: function() {
            console.log('Minha vez de jogar...');
            
        }
    };

    $scope.Jogo = {
        gameId: 0,
        meuPapel: '',
        meuSocketId: '',
        tabuleiro: [],

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
                $scope.pagina = "./html/novoJogo.html";

                // Exibir URL e Jogo.gameId para que o outro jogador possa pegar o código
                $scope.Jogo.Host.url = window.location.href;
            },

            
            atualizaTelaEspera : function(data) {
                console.log("Jogador " + data.jogadorNome + " entrou no jogo!");
                
                if ($scope.Jogo.Host.jogoNovo) {
                    $scope.Jogo.Host.mostraTelaNovoJogo();
                };

                if( $scope.Jogo.Host.numJogadoresNaSala < 2) {
                    // Adicionar novo jogador na tela de espera
                    $scope.Jogo.Host.jogadores.push(data);
                    console.log($scope.Jogo.Host.jogadores);
                    $scope.Jogo.Host.numJogadoresNaSala += 1;

                } else if( $scope.Jogo.Host.numJogadoresNaSala === 2) {
                    $scope.Jogo.Host.jogadores.push(data);
                    console.log($scope.Jogo.Host.jogadores);
                    IO.socket.emit('hostSalaCheia', $scope.Jogo.gameId, nomeJogadores);
                } else {
                    console.log('Sala cheia!!!!!');
                };

                $scope.Jogo.Host.numJogadoresNaSala += 1;
                $scope.$apply();
            },

            playerSorteio : function(data, nomeJogadores) {
                
                $scope.Jogo.tabuleiro = data.tabuleiro;
                
                // Mostrar nova tela  de contagem para início
                $scope.pagina = './html/grid.html';
                $scope.$apply();

                // Gera um número aleatório entre 0 e 1
                var iniciativa = Math.round(Math.random());

                // Envia ao servidor o resultado da Iniciativa
                IO.socket.emit('playerIniciativa', $scope.Jogo.gameId, iniciativa);
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

                if ($scope.Jogo.Player.meuNome) {
                    var data = {
                        gameId: $scope.Jogo.Player.gameId, // colher dados digitados pelo usuário
                        jogadorNome: $scope.Jogo.Player.meuNome,
                        ativo: false,
                        oponente: ''
                    };

                    console.log(data);

                    IO.socket.emit('playerEntraJogo', data);

                    $scope.Jogo.meuPapel = 'Player';
                }
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
                console.log(IO.socket.id + ' = ' + data.meuSocketId);
                if (IO.socket.id === data.meuSocketId) {
                    $scope.Jogo.meuPapel = 'Player';
                    $scope.Jogo.gameId = data.gameId;

                    console.log(data.oponente[0]);
                    $scope.Jogo.Player.nomeOponente = data.oponente[0];

                    // Exibir mensagem de "Uniu ao jogo, aguardando novo jogo começar"
                    $scope.Jogo.listaEspera = true;
                    console.log('Lista de espera: ' + $scope.Jogo.listaEspera);
                } else {
                    console.log(data.oponente[1]);
                    $scope.Jogo.Player.nomeOponente = data.oponente[1];
                };
            },

            playerSorteio : function(data, nomeJogadores) {
                $scope.Jogo.tabuleiro = data.tabuleiro;
                $scope.pagina = './html/grid.html';
                $scope.Jogo.Player.hostSocketId = data.meuSocketId;

                if (IO.socket.id === data.meuSocketId) {
                    $scope.Jogo.Player.nomeOponente = nomeJogadores[1];
                } else {
                    $scope.Jogo.Player.nomeOponente = nomeJogadores[0];
                };

                $scope.$apply();
            },

            endGame: function() {
                // mostrar mensagem de fim de jogo com opções de
                // Reiniciar ou Quitar
            }
        }
    };

    IO.init();
    $scope.Jogo.init();

}]);