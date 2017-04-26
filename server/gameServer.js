var io;
var gameSocket;
var jogo = {  }; // Variável que armazena as informações dos jogos.

exports.initGame = function(sio, socket) {
    io = sio;
    gameSocket = socket;
    gameSocket.emit('conectado', { message: "Conectou-se ao servidor!" });
    
    // Eventos Host
    gameSocket.on('hostCriarNovoJogo', hostCriarNovoJogo);
    gameSocket.on('hostPreparaJogo', hostPreparaJogo);
    gameSocket.on('hostChecaJogada', hostChecaJogada);
    
    // Eventos Player
    gameSocket.on('playerEntraJogo', playerEntraJogo);
    gameSocket.on('playerJogoRestart', playerJogoRestart);

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
        coluna: datajogada.coluna,
        resultado: resultado
    };

    io.sockets.in(datajogada.gameId).emit('atualizaTabuleiro', newdatajogada);

    if (resultado) {
        
        io.to(jogo[datajogada.gameId].jogador[id].id).emit('playerVitoria', resultado);
        io.to(jogo[datajogada.gameId].jogador[oponenteid].id).emit('playerDerrota', resultado);
        io.to(jogo[datajogada.gameId].hostId).emit('hostFimJogo', newdatajogada);

    } else {
    
        io.to(jogo[datajogada.gameId].jogador[oponenteid].id).emit('suaVez');
        //console.log(jogo[datajogada.gameId].tabuleiro);

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

    // testar vitória
    // Compara o estado atual do jogo com o array de condições de vitória
    for (var condicao = 0; condicao < vitoria.length; condicao++) {
        empate = 0;
        //console.log("---------------------Condição: " + condicao);
        //console.log(jogo[gameId].tabuleiro);
        for (var linha = 0; linha < vitoria[condicao].length; linha++) {
            //console.log("Linha: " + linha);
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
                //console.log("Vencimento: " + venceu);
                //console.log("Empate: " + empate);
            }
        }
        if (venceu === 3) {
            console.log(venceu + " - O jogador " + n + " venceu na condição " + (condicao + 1) + ", jogo terminou!");
            return condicao + 1; // Vitória do jogador ativo, retorna inteiro de 1~8
        } 
        venceu = 0;
    };

    if (empate === 9) {
            console.log(venceu + " - O jogador " + n + " empatou na condição " + (condicao + 1) + ", jogo terminou!" + "");
            //console.log("Empatou!!!!!!!!!!!!");
            return 9; // Empate entre jogadores, retorna 9
    } else {
        return 0; // Vitória = False
    };
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
        
        var i;

        if( jogo[data.gameId].jogador.length === 0 ) {
            // Adicionar novo jogador na tela de espera
            i = 0;
        } else if( jogo[data.gameId].jogador.length === 1) {
            i = 1;
        } else {
            console.log('Sala cheia!!!!!');
            io.to(sock.id).emit('salaCheia');
            return 0;
        };
        
        // conecta socket id ao data object
        console.log(data.nome + ' entra na sala: ' + data.gameId);

        // Adicionando dados do player ao Back-End
        jogo[data.gameId].jogador[i] = { nome: data.nome, id: sock.id };

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

// O jogo terminou e o player clicou no botão 'Reiniciar'
function playerJogoRestart(gameId) {

    var newdata = { 
        gameId: gameId,
        pagina: "./html/grid.html",
        espera: true,
        esperamsg: "",
        estilo: [["","",""], ["","",""], ["","",""]],
        jogocomecou: false,
        suavez: false,
        suavezmsg: "",
        final: false,
        finalclasse: "finalempate"
    };

    // Emite os dados do player de volta para os clientes na sala de jogo
    jogo[gameId].tabuleiro = [[ 0, 0, 0], [ 0, 0, 0], [ 0, 0, 0]];
    io.sockets.in(gameId).emit('reiniciaJogo', newdata);
};