angular.module('moviesCtrl', [

    ]);

angularApp.controller('moviesCtrl', function moveCtrl($rootScope, $scope, $mdToast, $mdDialog, $http, Notes, $location, $timeout, Movies, $filter) {

    $scope.updateMoviesList = function(){
        $scope.movies = Movies.query();

        $scope.movies.$promise.then(function(data) {
            $scope.moviesDatas = data;
        });
    };

    $scope.updateListImportFolder = function(){
        $http.get('/listImportFolder').then(function(data) {
            $scope.localList = data.data.files;
        });
    };

    $scope.updateMoviesList();
    $scope.updateListImportFolder();

    $scope.selectedMoviesTabIndex = 0;

    $scope.formatBytes = function(bytes, decimals = 1) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    $scope.formatBitRate = function(bytes, decimals = 3) {
        if (bytes === 0) return '0 Bytes';

        const k = 1000;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps', 'Pbps', 'Ebps', 'Zbps', 'Ybps'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    var socket = io();
    $scope.dataPost = new Movies();
    $scope.dataPost.tags = [];
    $scope.localImage = "/import/tn.png";
    $scope.screenshotTime = '00:00:00';

    $scope.croppedOption = {
        viewMode: 3,
        initialAspectRatio: 1,
        wheelZoomRatio: 0,
        zoomOnWheel: false,
        zoomOnTouch: false,
        autoCropArea: 0.5,
        showZoomer: false,
        boundary: {
            width: 300,
            height: 300
        }
    };

    $scope.screenshotTimeParser = function(seconds){
        if(!seconds) return
        var duration = new Date(1970, 0, 1).setSeconds(seconds);

        var mask = 'mm:ss';
        if(seconds >= 3600){
            mask = 'hh:,' + mask
        }


        return $filter('date')(duration, mask);
    };

    $scope.durationParser = function(seconds){
        if(!seconds) return
        var duration = new Date(1970, 0, 1).setSeconds(seconds);

        var mask = 'mm';
        if(seconds >= 3600){
            mask = 'h:' + mask
        }


        return $filter('date')(duration, mask);
    };

    $scope.getTimeForScreenIMG = function() {
        let video = document.getElementById("preViewVideo");
        $scope.screenshotTime = $scope.screenshotTimeParser(video.currentTime);
    };

    $scope.reloadScreenIMG = function() {
        $http.get("/getMovieInfo?path=" + $scope.dataPost.path + '&time=' + $scope.screenshotTime).then(function(response) {
            var random = (new Date()).toString();

            setTimeout(function () {
                $scope.imageSource = $scope.localImage + "?cb=" + random;
            }, 3000)
        });
    };

    $scope.getVideoInfo = function (path) {
        $scope.dataPost.path = path.name;


        let titleFormat = $scope.dataPost.path.split('.').map(i=>i.trim());
        let yearFormat = $scope.dataPost.path.split('(').map(i=>i.trim());

        $scope.dataPost.title = titleFormat[0];
        $scope.dataPost.year = yearFormat[1];

        let betterTitle = $scope.dataPost.title.split('(').map(i=>i.trim());
        let betterYear = $scope.dataPost.year.split(')').map(i=>i.trim());

        $scope.dataPost.year = betterYear[0];
        $scope.dataPost.title = betterTitle[0];

        $scope.streams = {};


        $http.get("/getMovieInfo?path=" + path.name + '&time=' + $scope.screenshotTime).then(function(response) {
            $scope.dataPost.path = path.name;

            $scope.dataPost.streams = $scope.streams = response.data.info.streams;
            $scope.dataPost.duration = $scope.durationParser(response.data.info.format.duration);
            $scope.dataPost.size = $scope.formatBytes(response.data.info.format.size);

            var random = (new Date()).toString();

            setTimeout(function () {
                $scope.imageSource = $scope.localImage + "?cb=" + random;
            }, 3000)
        });
    };

    $scope.showDetail = function(movie) {
        $scope.movieDetail = Movies.get({id: movie._id});

        $scope.movieDetail.$promise.then(function(data) {
            $scope.editMovie = data;
            $scope.editMovie.filename = $scope.movieDetail._id + ".mp4";
        });
    };

    $scope.saveMovie = function(item) {
        var savePromise = $scope.editMovie.$save();
        // POST: /users/123/cards {number: '0123', name: 'Mike Smith'}
        // server returns: {id: 789, number: '0123', name: 'Mike Smith'}
        savePromise.then(function(data) {
            $scope.updateMoviesList();

            $mdToast.show(
                $mdToast.simple()
                    .textContent("Saved")
                    .position("top right")
                    .hideDelay(3000)
            );
        });
    };

    $scope.deleteMovie = function(item) {
            $scope.editMovie.$delete(function() {
                $scope.updateMoviesList();
                $scope.editMovie = null;
                $mdToast.show(
                    $mdToast.simple()
                        .textContent("Deleted")
                        .position("top right")
                        .hideDelay(3000)
                );
            });
    };

    $scope.addToDatabase = function() {
        $scope.determinateValue = 0;
        $scope.determinateValue2 = 0;

        $scope.disableInputs = true;



        let savePromise = $scope.dataPost.$save();

        // POST: /users/123/cards {number: '0123', name: 'Mike Smith'}
        // server returns: {id: 789, number: '0123', name: 'Mike Smith'}
        savePromise.then(function(data) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent("Added to database")
                    .position("top right")
                    .hideDelay(2000)
            );

            $http.post("/MoveMovie", {'data': data}).then(function () {
                $scope.updateListImportFolder();
                $scope.updateMoviesList();

                $scope.selectedMoviesTabIndex = 1
                $scope.dataPost.path = null;
            }, function (data, status, headers, config) {
                console.error(data);
                $mdToast.show(
                    $mdToast.simple()
                        .textContent("Error: " + data.statusText)
                        .position("top right")
                        .hideDelay(3000)
                );
            });
        });
    };

    /*$scope.moveAudio = function() {
        $scope.disableInputs = true;

        $scope.determinateValue = 0;
        $scope.determinateValue2 = 0;

        $scope.convertType = "audio";

        $http.post("/moveAudio", {'data': $scope.dataPost}).then(function (data, status, headers, config) {
            console.log(data);

        }, function (data, status, headers, config) {
            console.log(data);
            $mdToast.show(
                $mdToast.simple()
                    .textContent("Error: " + status)
                    .position("top right")
                    .hideDelay(3000)
            );
        });
    };*/

    socket.on('YTFFactive', function(data) {
        $scope.YTFFactive = data;
        $scope.$apply();
    });




}).component('movies', {
    templateUrl: '/templates/movies.html'
});
