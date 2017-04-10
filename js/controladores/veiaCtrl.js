app.controller('veiaCtrl', ['$scope', function($scope) {

    $scope.cerquilha = [[ 0, 0, 0],
                        [ 0, 0, 0],
                        [ 0, 0, 0]];

    var checaVitoria = function(n) {
        var _vitoria = [
                        [[ n, n, n],  // if ($scope.cerquilha[0][0] = 1 &&
                         [ 8, 8, 8],  //     $scope.cerquilha[0][1] = 1 &&
                         [ 8, 8, 8]], //     $scope.cerquilha[0][2] = 1
                             
                        [[ 8, 8, 8],  // if ($scope.cerquilha[1][0] = 1 &&
                         [ n, n, n],  //     $scope.cerquilha[1][1] = 1 &&
                         [ 8, 8, 8]], //     $scope.cerquilha[1][2] = 1

                        [[ 8, 8, 8],  // if ($scope.cerquilha[2][0] = 1 &&
                         [ 8, 8, 8],  //     $scope.cerquilha[2][1] = 1 &&
                         [ n, n, n]], //     $scope.cerquilha[2][2] = 1

                        [[ n, 8, 8],  // if ($scope.cerquilha[0][0] = 1 &&
                         [ 8, n, 8],  //     $scope.cerquilha[1][1] = 1 &&
                         [ 8, 8, n]], //     $scope.cerquilha[2][2] = 1

                        [[ 8, 8, n],  // if ($scope.cerquilha[0][2] = 1 &&
                         [ 8, n, 8],  //     $scope.cerquilha[1][1] = 1 &&
                         [ n, 8, 8]]  //     $scope.cerquilha[2][0] = 1
        ];

        var _venceu = 0;

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
                };
            } else if (!$scope.jogador[0].ativo && $scope.jogador[1].ativo) {
                $scope.jogador[0].ativo = true;
                $scope.jogador[1].ativo = false;
                $scope.cerquilha[linha][coluna] = -1;
                $scope.estilo[linha][coluna] = "jogador2";
                if (checaVitoria(-1)) {
                    $scope.vitoria = "Jogador 2";
                };
            };
        };
    };
}]);