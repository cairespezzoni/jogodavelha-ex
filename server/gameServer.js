var io;
var gameSocket;

exports.initGame = function(sio, socket) {
    io = sio;
    gameSocket = socket;
    gameSocket.emit('conectado', { message: "Você está conectado!" });
    
    // Eventos Host
    gameSocket.on('hostCriarNovoJogo', hostCriarNovoJogo);
    gameSocket.on('hostSalaCheia', hostPreparaJogo);
    gameSocket.on('hostContagemTerminada', hostIniciaJogo);
    gameSocket.on('hostProxJogada', hostProxJogada);
    
    // Eventos Player
    gameSocket.on('playerEntraJogo', playerEntraJogo);
    gameSocket.on('playerJogada', playerJogada);
    gameSocket.on('playerRestart', playerRestart);

    // Eventos Jogo
    gameSocket.on('playerIniciativa', playerIniciativa);
}

//-------------------------- Funções do HOST ----------------------------
// Clicou no botão 'START' e o evento hostCriarNovoJogo ocorreu.
function hostCriarNovoJogo() {
    // Cria ID de sala Socket.IO único
    var thisGameId = (Math.random() * 100000) | 0;

    // Retorna o ID da sala (gameId) e o socket ID (meuSocketId) para o cliente
    this.emit('novoJogoCriado', {gameId: thisGameId, meuSocketId: this.id});

    // Entra na sala e espera pelos jogadores
    this.join(thisGameId.toString());
};

// Dois jogadores entraram no jogo, alerte o host!
function hostPreparaJogo(gameId) {
    var sock = this;
    var data = {
        meuSocketId: sock.id,
        gameId: gameId,
        tabuleiro: tabuleiro
    };

    console.log('Todos jogadores presentes. Preparando jogo...');
    io.sockets.in(data.gameId).emit('iniciaNovoJogo', data);
};

// Contador terminou, o jogo começa!
function hostIniciaJogo(gameId) {
    console.log('Jogo iniciado.');
    //iniciaJogo(gameId); Pede para iniciar o jogo!!
};

// Termina o jogo!
function hostProxJogada(data) {
    // Passa para próxima jogada e, caso verifique que o jogo terminou
    // envia a mensagem de que o jogo chegou ao seu fim
    if (true) {
        console.log('hostProxJogada');
    } else {
        io.sockets.in(data.gameId).emit('gameOver', data);
    }
};

//----------------------- Funções do PLAYER

/* Jogador clicou no botão 'INICIAR JOGO'
   Tentativa de conectar-se a sala correspondente
   ao gameId digitado pelo jogador.*/
function playerEntraJogo(data) {
    console.log("Player tenta entrar no jogo...");
    // Referência ao objeto socket Socket.IO do jogador
    var sock = this;

    console.log(gameSocket.adapter.rooms);

    // Procurando ID da sala no manager do objeto Socket.IO
    var sala = gameSocket.adapter.rooms[data.gameId];

    // Se a sala existir
    if (sala != undefined) {
        // conecta socket id ao data object
        console.log(data.jogadorNome + ' entra na sala: ' + data.gameId);
        data.meuSocketId = sock.id;

        // adiciona jogador ao array jogadores
        jogadores.push({
            nome: data.jogadorNome,
            socketId: sock.id,
            ativo: data.ativo
        });
        console.log(jogadores);

        // Entra na sala
        sock.join(data.gameId);

        if (jogadores.length > 1) {
            data.oponente = [ jogadores[jogadores.length - 2].nome, jogadores[jogadores.length - 1].nome ];
        };

        // Emite um evento notificando os clientes que outro jogador entrou na sala.
        io.sockets.in(data.gameId).emit('playerEntraSala', data);
    } else {
        // Envia mensagem de erro ao de volta ao player
        console.log('Erro - Sala não exite!')
        this.emit('erro', { message: "A sala não existe." });
    }
};

function playerJogada(data) {

    // Jogada do player está anexada ao data object
    // Emite um evento com a resposta para que esta seja checada pelo Host
    io.sockets.in(data.gameId).emit('hostChecaJogada', data);
};

// O jogo terminou e o player clicou no botão 'Reiniciar'
function playerRestart(data) {

    // Emite os dados do player de volta para os clientes na sala de jogo
    data.playerId = this.id;
    io.sockets.in(data.gameId).emit('jogadorEntraSala', data);
};

// ###############################################
// ###            Jogo da Veia                 ###
// ###############################################

var tabuleiro = [[ 0, 0, 0],
                 [ 0, 0, 0],
                 [ 0, 0, 0]];

//temp
var n = 1;

var vitoria =  [
                [[ n, n, n],
                 [ 8, 8, 8],
                 [ 8, 8, 8]],
                        
                [[ 8, 8, 8],
                 [ n, n, n],
                 [ 8, 8, 8]],

                [[ 8, 8, 8],
                 [ 8, 8, 8],
                 [ n, n, n]],

                [[ n, 8, 8],
                 [ n, 8, 8],
                 [ n, 8, 8]],

                [[ 8, n, 8],
                 [ 8, n, 8],
                 [ 8, n, 8]],

                [[ 8, 8, n],
                 [ 8, 8, n],
                 [ 8, 8, n]],

                [[ n, 8, 8],
                 [ 8, n, 8],
                 [ 8, 8, n]],

                [[ 8, 8, n],
                 [ 8, n, 8],
                 [ n, 8, 8]] 
];

var venceu = 0;

var jogadores = [];

function playerIniciativa(gameId, player) {

    // Marca o jogador que venceu a iniciativa como ativo
    console.log(jogadores[player].socketId);
    jogadores[player].ativo = true;

    io.to(jogadores[player].socketId).emit('playerAguardaJogada');
};