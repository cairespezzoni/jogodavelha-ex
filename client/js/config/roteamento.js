app.config(function($routeProvider, $locationProvider) {
    $routeProvider
        /*.when('/', {
            templateUrl: './html/intro.html',
            /*resolve: {
                delay: function($q, $timeout) {
                    var delay = $q.defer();
                    $timeout(delay.resolve, 1000);
                    return delay.promise;
                }
            }
        })*/
        .when('/criando-jogo', {
            templateUrl: './html/novoJogo.html'
        })
});