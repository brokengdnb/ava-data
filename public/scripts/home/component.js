angular.module('homeCtrl', [

]);

angularApp.controller('homeCtrl', function homeCtrl($location, youtubeFactory, $scope, $http) {

    $scope.goToPage = function(path){
        $location.path(path);
    };

    $scope.goToTV = function() {
        $http.get('/localIP').then(function(data) {
            $scope.goToPage(data.data.local);
        });
    };

}).component('home', {
    templateUrl: '/templates/home.html'
});
