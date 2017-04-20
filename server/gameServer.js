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

    // Retorna o ID da sala (gameId) e o socket ID (hostSocketId) para o cliente
    this.emit('novoJogoCriado', {gameId: thisGameId, hostSocketId: this.id} );

    // Adicionando dados do host ao Back-End
    jogo[thisGameId] = { hostId: this.id, jogador: [], tabuleiro: tabuleiro };
    console.log("Jogos Ativos: ");
    console.log(jogo);

    // Entra na sala e espera pelos jogadores
    this.join(thisGameId.toString());
};

// Dois jogadores entraram no jogo, alerte o host!
function hostPreparaJogo(gameId) {
    var sock = this;
    var data = {
        gameId: gameId,
        tabuleiro: jogo[gameId].tabuleiro
    };

    console.log('Todos jogadores presentes. Preparando jogo...');
    io.sockets.in(gameId).emit('sorteiaIniciativa', data);

    io.to(jogo[gameId].jogador[0].id).emit('cadastraOponente', jogo[gameId].jogador[1].nome);
    io.to(jogo[gameId].jogador[1].id).emit('cadastraOponente', jogo[gameId].jogador[0].nome);
};


// Recebe do HOST a informação sobre qual jogador jogará primeiro
function playerIniciativa(gameId) {
    
    // Gera um número aleatório entre 0 e 1
    var iniciativa = Math.round(Math.random());

    // Marca o jogador que venceu a iniciativa como ativo
    // console.log("O jogador " + jogo[gameId].jogador[iniciativa].nome + " vai começar!");

    io.sockets.in(gameId).emit('iniciarJogo', jogo[gameId].jogador[iniciativa].nome);

    //io.to(jogo[gameId].jogador[iniciativa].id).emit('playerExecutaJogada');
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

    // Procurando ID da sala no objeto Socket.IO
    var sala = gameSocket.adapter.rooms[data.gameId];

    // Se a sala existir
    if (sala != undefined) {
        // conecta socket id ao data object
        console.log(data.nome + ' entra na sala: ' + data.gameId);
        
        jogo[data.gameId].jogador[jogo[data.gameId].jogador.length] = { nome: data.nome, id: sock.id };
        // Adicionando dados do player ao Back-End
        console.log("Jogo " + data.gameId + ": ");
        console.log(jogo[data.gameId]);
        
        //data.socketId = sock.id;
        console.log(data);

        // Entra na sala
        sock.join(data.gameId);

        // Emite um evento notificando os clientes que outro jogador entrou na sala.
        io.sockets.in(data.gameId).emit('playerEntraSala', data);

    } else {
        // Envia mensagem de erro ao de volta ao player
        console.log('Erro - Sala não exite!');
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

// Variável que armazena as informações dos jogos.
var jogo = {  };

//temp
var n = 1;

var venceu = 0;

