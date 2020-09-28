angular.module('moveCtrl', [
 'ngDroplet'
]);

angularApp.controller('moveCtrl', function moveCtrl($rootScope, $scope, $mdToast, $mdDialog, $http, Notes, $location, $timeout) {
    $http.get('/listMove').then(function(data) {
        $scope.localList = data.data.files;
        console.log(data.data.files);
    });


    $scope.formatBytes = function(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    /**
     * @property interface
     * @type {Object}
     */
    $scope.interface = {};

    /**
     * @property uploadCount
     * @type {Number}
     */
    $scope.uploadCount = 0;

    /**
     * @property success
     * @type {Boolean}
     */
    $scope.success = false;

    /**
     * @property error
     * @type {Boolean}
     */
    $scope.error = false;

    // Listen for when the interface has been configured.
    $scope.$on('$dropletReady', function whenDropletReady() {

        $scope.interface.allowedExtensions(['wav', 'mp3', 'm4a', 'mp4', 'mov', 'mkv', 'avi', 'webm', 'ogg', 'oga', 'ogv', 'aac', 'flac']);
        $scope.interface.setRequestUrl('upload.html');
        $scope.interface.defineHTTPSuccess([/2.{2}/]);
        $scope.interface.useArray(false);

    });

    // Listen for when the files have been successfully uploaded.
    $scope.$on('$dropletSuccess', function onDropletSuccess(event, response, files) {

        $scope.uploadCount = files.length;
        $scope.success     = true;

        $scope.uploadList = files;

        $timeout(function timeout() {
            $scope.success = false;
        }, 5000);

    });

    // Listen for when the files have failed to upload.
    $scope.$on('$dropletError', function onDropletError(event, response) {

        $scope.error = true;
        console.log(response);

        $timeout(function timeout() {
            $scope.error = false;
        }, 5000);

    });


    var socket = io();
    $scope.dataPost = new Notes();
    $scope.dataPost.youtubeTags = [];
    $scope.localImage = "/uploads/move/tn.png";

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

    $scope.getVideoInfo = function (path) {
        $http.get("/getMoveInfo?path=" + path.name).then(function(response) {
            $scope.dataPost.originalPath = path.name;

            $scope.dataPost.content = $scope.dataPost.originalPath;

            var values = $scope.dataPost.content.split('-').map(i=>i.trim());
// creates : values = ["Artist","Title"]
            $scope.dataPost.youtubeArtist = values[0];
            $scope.dataPost.youtubeTitle = values[1];

            var random = (new Date()).toString();

            setTimeout(function () {
                $scope.imageSource = $scope.localImage + "?cb=" + random;
            }, 3000)
        });
    };

    $scope.moveVideo = function() {
        $scope.determinateValue = 0;
        $scope.determinateValue2 = 0;

        $scope.disableInputs = true;

        $scope.convertType = "video";

        $scope.dataPost.youtubeID = $scope.dataPost.originalPath;

        $http.post("/moveVideo", {'data': $scope.dataPost}).then(function (data, status, headers, config) {
            console.log(data);

            $scope.dataPost.shape = "image";
            var savePromise = $scope.dataPost.$save();
            // POST: /users/123/cards {number: '0123', name: 'Mike Smith'}
            // server returns: {id: 789, number: '0123', name: 'Mike Smith'}
            savePromise.then(function(data) {
                // Once the promise is resolved, the created instance
                // is populated with the data returned by the server
                $location.search({});
                $location.path("/saveAudio").search({id: data._id});
                $mdToast.show({
                    template: '<md-toast class="md-toast"><span>Complete</span></md-toast>',
                    hideDelay: 3000,
                    position: 'top right'
                })

            });

        },function (data, status, headers, config) {
            console.log(data);
            $mdToast.show(
                $mdToast.simple()
                    .textContent("Error: " + status)
                    .position("top right")
                    .hideDelay(3000)
            );
        });
    };

    $scope.moveAll = function() {
        $scope.determinateValue = 0;
        $scope.determinateValue2 = 0;

        $scope.disableInputs = true;

        $scope.convertType = "all";

        $scope.dataPost.youtubeID = $scope.dataPost.originalPath;


        $http.post("/moveAll", {'data': $scope.dataPost}).then(function (data, status, headers, config) {
            console.log(data);

        },function (data, status, headers, config) {
            console.log(data);
            $mdToast.show(
                $mdToast.simple()
                    .textContent("Error: " + status)
                    .position("top right")
                    .hideDelay(3000)
            );
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


    socket.on('convertPosition', function(data) {

        /*   var hms = data;   // your input string
           var a = hms.split(':'); // split it at the colons
           // minutes are worth 60 seconds. Hours are worth 60 minutes.
           var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
           console.log(seconds.toFixed(1));
   */
        $scope.determinateValue = data;
        $scope.$apply();

        if((data === "done") && ($scope.convertType === "audio")){
            // We can create an instance as wel
            $scope.dataPost.shape = "circularImage";
            var savePromise = $scope.dataPost.$save();
            // POST: /users/123/cards {number: '0123', name: 'Mike Smith'}
            // server returns: {id: 789, number: '0123', name: 'Mike Smith'}
            savePromise.then(function(data) {
                // Once the promise is resolved, the created instance
                // is populated with the data returned by the server
                $location.search({});
                $location.path("/saveAudio").search({id: data._id});
                $mdToast.show({
                    template: '<md-toast class="md-toast"><span>Complete</span></md-toast>',
                    hideDelay: 3000,
                    position: 'top right'
                })

            });
        } else if((data === "done") && ($scope.convertType === "video")) {
            $scope.dataPost.shape = "image";
            var savePromise = $scope.dataPost.$save();
            // POST: /users/123/cards {number: '0123', name: 'Mike Smith'}
            // server returns: {id: 789, number: '0123', name: 'Mike Smith'}
            savePromise.then(function(data) {
                // Once the promise is resolved, the created instance
                // is populated with the data returned by the server
                $location.search({});
                $location.path("/saveAudio").search({id: data._id});
                $mdToast.show({
                    template: '<md-toast class="md-toast"><span>Complete</span></md-toast>',
                    hideDelay: 3000,
                    position: 'top right'
                })

            });
        } else if((data === "done") && ($scope.convertType === "all")) {
            $scope.dataPost.shape = "image";
            $scope.dataPost.lastTime = 0;

            $scope.dataPost2 = new Notes();



            var savePromise = $scope.dataPost.$save();

            // POST: /users/123/cards {number: '0123', name: 'Mike Smith'}
            // server returns: {id: 789, number: '0123', name: 'Mike Smith'}
            savePromise.then(function(data) {
                // Once the promise is resolved, the created instance
                // is populated with the data returned by the server


                $scope.dataPost2 = data;

                $scope.dataPost2.shape = "circularImage";
                $scope.dataPost2._id = undefined;
                var savePromise2 = $scope.dataPost2.$save();
                // POST: /users/123/cards {number: '0123', name: 'Mike Smith'}
                // server returns: {id: 789, number: '0123', name: 'Mike Smith'}
                savePromise2.then(function(data2) {
                    // Once the promise is resolved, the created instance
                    // is populated with the data returned by the server
                    $location.search({});
                    $location.path("/saveAudio").search({id: data2._id});
                    $mdToast.show({
                        template: '<md-toast class="md-toast"><span>Complete</span></md-toast>',
                        hideDelay: 3000,
                        position: 'top right'
                    })

                });
            });
        }
        /* $scope.determinateValue = data;
         $scope.$apply();
         if(data === "done"){
             $location.search({});
             $scope.goToPage("/save");
             $mdToast.show({
                 template: '<md-toast class="md-toast"><span>Complete</span></md-toast>',
                 hideDelay: 3000,
                 position: 'top right'
             })
         }*/
    });


}).component('move', {
    templateUrl: '/templates/move.html'
});
