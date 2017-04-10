app.controller('veiaCtrl', ['$scope', function($scope) {

    // Armazena o estado atual do jogo. [0 = Vazio, 1 = Jogador1 e -1 = Jogador2]
    $scope.cerquilha = [[ 0, 0, 0],
                        [ 0, 0, 0],
                        [ 0, 0, 0]];

    // Função que checa se um jogador ganhou o jogo ou não, chamada quando o jogador clica na célula
    var checaVitoria = function(n) {
        // variável que armazena as possíveis configurações de vitória do jogo
        var _vitoria = [
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

        var _venceu = 0; // variável que compara o estado atual do jogo com as condições de vitória, determinado o vencedor.

        // Compara o estado atual do jogo com o array de condições de vitória
        for (var condicao = 0; condicao < _vitoria.length; condicao++) {
            for (var linha = 0; linha < _vitoria[condicao].length; linha++) {
                for (var coluna = 0; coluna < _vitoria[condicao][linha].length; coluna++) {
                    console.log("Condicao: " + condicao + ", Linha: " + linha + ", Coluna: " + coluna);
                    console.log($scope.cerquilha[linha][coluna] + " compara com " + _vitoria[condicao][linha][coluna]);
                    if ($scope.cerquilha[linha][coluna] === _vitoria[condicao][linha][coluna] &&
                        $scope.cerquilha[linha][coluna] === n) {
                            _venceu++;
                            console.log($scope.cerquilha[linha][coluna] === _vitoria[condicao][linha][coluna]);
                    }
                }
            }
            if (_venceu === 3) {
                console.log(_venceu + " - O jogador " + n + " venceu, jogo terminou!");
                return true;
            }
            _venceu = 0;
        };
        return false;
    };

    $scope.estilo =    [["","",""],
                        ["","",""],
                        ["","",""]];

    $scope.jogador = [{
        nome: 'Jãozinho',
        ativo: true
    }, {
        nome: 'Mariazinha',
        ativo: false
    }];

    $scope.muda = function(linha, coluna) {
        if (!$scope.cerquilha[linha][coluna]) {
            
            if ($scope.jogador[0].ativo && !$scope.jogador[1].ativo) {
                $scope.jogador[0].ativo = false;
                $scope.jogador[1].ativo = true;
                $scope.cerquilha[linha][coluna] = 1;
                $scope.estilo[linha][coluna] = "jogador1";
                if (checaVitoria(1)) {
                    $scope.vitoria = "Jogador 1";
                    $scope.jogador[1] = false;
                };
            } else if (!$scope.jogador[0].ativo && $scope.jogador[1].ativo) {
                $scope.jogador[0].ativo = true;
                $scope.jogador[1].ativo = false;
                $scope.cerquilha[linha][coluna] = -1;
                $scope.estilo[linha][coluna] = "jogador2";
                if (checaVitoria(-1)) {
                    $scope.vitoria = "Jogador 2";
                    $scope.jogador[0] = false;
                };
            };
        };
    };
}]);