app.controller('veiaCtrl', ['$scope', function($scope) {

    var turno = false;
    var grid = [ 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var jogadores = [{
        nome: 'Jãozinho',
        grid: [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
    }, {
        nome: 'Mariazinha',
        grid: [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
    }];

    $scope.muda = function(index) {
        if (turno) {
            $scope.ativa1 = !$scope.ativa1;
            $scope.ativa2 = false;
            turno = !turno;
        } else {
            $scope.ativa2 = !$scope.ativa2;
            $scope.ativa1 = false;
            turno = !turno;
        }
    }
}]);