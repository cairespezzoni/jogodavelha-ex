var io;
var gameSocket;

exports.initGame = function(sio, socket) {
    io = sio;
    gameSocket = socket;
    gameSocket.emit('conectado', { message: "Conectou-se ao servidor!" });
    
    // Eventos Host
    gameSocket.on('hostCriarNovoJogo', hostCriarNovoJogo);
    gameSocket.on('hostPreparaJogo', hostPreparaJogo);
    gameSocket.on('hostChecaJogada', hostChecaJogada);
    //gameSocket.on('hostContagemTerminada', hostIniciaJogo);
    //gameSocket.on('hostProxJogada', hostProxJogada);
    
    // Eventos Player
    gameSocket.on('playerEntraJogo', playerEntraJogo);
    gameSocket.on('playerJogada', playerJogada);
    gameSocket.on('playerRestart', playerRestart);

    // Eventos Jogo
    gameSocket.on('playerIniciativa', playerIniciativa);
}

        /////////////////////////////////
        ///                           ///
        ///          HOST             ///
        ///                           ///
        /////////////////////////////////
        
// Clicou no botão 'START' e o evento hostCriarNovoJogo ocorreu.
function hostCriarNovoJogo() {
    // Cria ID de sala Socket.IO único
    var thisGameId = (Math.random() * 100000) | 0;

    // Retorna o ID da sala (gameId) e o socket ID (hostSocketId) para o cliente
    this.emit('novoJogoCriado', {gameId: thisGameId, hostSocketId: this.id} );

    // Adicionando dados do host ao Back-End
    jogo[thisGameId] = { hostId: this.id, jogador: [], tabuleiro: [[ 0, 0, 0], [ 0, 0, 0], [ 0, 0, 0]] };
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
    console.log("O jogador " + jogo[gameId].jogador[iniciativa].nome + " vai começar!");

    io.sockets.in(gameId).emit('iniciarJogo', jogo[gameId].jogador[iniciativa].nome);
    io.to(jogo[gameId].jogador[iniciativa].id).emit('suaVez');
};

function hostChecaJogada(datajogada) { // datajogada = { linha, coluna, gameId, nome }

    var jogada;
    var id;
    var oponenteid;


    if (jogo[datajogada.gameId].jogador[0].nome == datajogada.nome) {
        id = 0;
        jogada = -1;
        oponenteid = 1;
    } else if (jogo[datajogada.gameId].jogador[1].nome == datajogada.nome) {
        id = 1;
        jogada = 1;
        oponenteid = 0;
    };

    jogo[datajogada.gameId].tabuleiro[datajogada.linha][datajogada.coluna] = jogada;

    var resultado = hostChecaVitoria(datajogada.gameId, jogada);
    var newdatajogada = {
        tabuleiro: jogo[datajogada.gameId].tabuleiro,
        nome: datajogada.nome,
        linha: datajogada.linha,
        coluna: datajogada.coluna
    };

    io.sockets.in(datajogada.gameId).emit('atualizaTabuleiro', newdatajogada);

    if (resultado) {
        
        io.to(jogo[datajogada.gameId].jogador[id].id).emit('playerVitoria', resultado);
        io.to(jogo[datajogada.gameId].jogador[oponenteid].id).emit('playerDerrota', resultado);
        io.to(jogo[datajogada.gameId].hostId).emit('hostFimJogo', newdatajogada);

    } else {
    
        io.to(jogo[datajogada.gameId].jogador[oponenteid].id).emit('suaVez');
        console.log(jogo[datajogada.gameId].tabuleiro);

    };
};

function hostChecaVitoria(gameId, n) {
    var vitoria = [[[ n, n, n], [ 8, 8, 8], [ 8, 8, 8]], // condição de vitória 1
                   [[ 8, 8, 8], [ n, n, n], [ 8, 8, 8]], // condição de vitória 2
                   [[ 8, 8, 8], [ 8, 8, 8], [ n, n, n]], // condição de vitória 3
                   [[ n, 8, 8], [ n, 8, 8], [ n, 8, 8]], // condição de vitória 4
                   [[ 8, n, 8], [ 8, n, 8], [ 8, n, 8]], // condição de vitória 5
                   [[ 8, 8, n], [ 8, 8, n], [ 8, 8, n]], // condição de vitória 6
                   [[ n, 8, 8], [ 8, n, 8], [ 8, 8, n]], // condição de vitória 7
                   [[ 8, 8, n], [ 8, n, 8], [ n, 8, 8]]  // condição de vitória 8
    ];
    var venceu = 0;
    var empate = 0;

    // testar vitória
    // Compara o estado atual do jogo com o array de condições de vitória
    for (var condicao = 0; condicao < vitoria.length; condicao++) {
        for (var linha = 0; linha < vitoria[condicao].length; linha++) {
            for (var coluna = 0; coluna < vitoria[condicao][linha].length; coluna++) {
                //console.log("Condicao: " + condicao + ", Linha: " + linha + ", Coluna: " + coluna);
                //console.log(jogo[gameId].tabuleiro[linha][coluna] + " compara com " + vitoria[condicao][linha][coluna]);
                if (jogo[gameId].tabuleiro[linha][coluna] === vitoria[condicao][linha][coluna] &&
                    jogo[gameId].tabuleiro[linha][coluna] === n) {
                        venceu++;
                        //console.log(jogo[gameId].tabuleiro[linha][coluna] === vitoria[condicao][linha][coluna]);
                }
                if (jogo[gameId].tabuleiro[linha][coluna] != 0) {
                    empate++;
                }
            }
        }
        if (venceu === 3) {
            console.log(venceu + " - O jogador " + n + " venceu na condição " + (condicao + 1) + ", jogo terminou!");
            return condicao + 1; // Vitória do jogador ativo, retorna inteiro de 1~8
        } else if (empate === 9) {
            console.log("Empatou!!!!!!!!!!!!");
            return 9; // Empate entre jogadores, retorna 9
        }
        venceu = 0;
        empate = 0;
    };
    return 0; // Vitória = False
};

        /////////////////////////////////
        ///                           ///
        ///          PLAYER           ///
        ///                           ///
        /////////////////////////////////

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

/*var tabuleiro = [[ 0, 0, 0],
                 [ 0, 0, 0],
                 [ 0, 0, 0]];*/

// Variável que armazena as informações dos jogos.
var jogo = {  };

//temp
var n = 1;
var venceu = 0;

