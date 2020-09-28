angular.module('saveVideoCtrl', [

]);

angularApp.controller('saveVideoCtrl', function saveVideoCtrl($scope, $rootScope, $location, Notes) {

    $scope.dataPost = {};
    var searchId = $location.search()['id'];

    $scope.noteToSave = Notes.get({id: searchId});

    $scope.noteToSave.$promise.then(function(data) {
        $scope.dataPost = data;
        $scope.videoUrl = "http://localhost:3000/uploads/" + $scope.dataPost.youtubeID + ".mp4";

        var sound      = document.createElement('video');
        sound.id       = 'video-player';
        sound.controls = 'controls';
        sound.src      = $scope.videoUrl;
        sound.type     = 'video/mp4';
        sound.width     = 360;
        document.getElementById('video').appendChild(sound);


    });


    //$scope.dataPost = $rootScope.dataPost;

       //audio.play("http://localhost:3000/uploads/" + $scope.dataPost.youtubeID + ".m4a");    //     <---  Thats All You Need !

        //$scope.videoUrl = "http://localhost:3000/uploads/" + $scope.dataPost.youtubeID + ".mp4";
        //$scope.audioUrl = "http://localhost:3000/uploads/" + $scope.dataPost.youtubeID + ".mp3";

        //document.getElementById('song').innerHTML = '<audio id="audio-player" controls="controls" src="' + $scope.audioUrl + '" type="audio/mpeg">';


}).component('saveVideo', {
    templateUrl: '/templates/saveVideo.html'
});
