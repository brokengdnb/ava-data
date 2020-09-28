angular.module('songsCtrl', [
 'ngDroplet'
]);

angularApp.controller('songsCtrl', function searchCtrl($rootScope, $scope, $mdToast, $mdDialog, $http, Songs, $location, $timeout, $filter, Playlists) {

    $scope.canBeOriginalDeleted = false;
    $scope.mainPanel = false;
    $scope.showPlaylists = false;

    /*$scope.updateMoviesList = function(){
        $scope.movies = Movies.query();

        $scope.movies.$promise.then(function(data) {
            $scope.moviesDatas = data;
        });
    };*/

    $scope.updateSongsList = function(){
        $scope.songs = Songs.query();

        $scope.songs.$promise.then(function(data) {
            $scope.songsData = data;
        })
    };

    $scope.updateListImportFolder = function(){
        $http.get('/listImportFolder').then(function(data) {
            $scope.localList = data.data.files;
        });
    };

    $scope.dataPost = {};

    //$scope.updateMoviesList();
    $scope.updateListImportFolder();



    $scope.formatBytes = function(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    $scope.formatRate = function(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1000;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Hz', 'KHz', 'MHz', 'GHz', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    $scope.formatBitrate = function(bytes, decimals = 1) {
        if (bytes === 0) return '0 Bytes';

        const k = 1000;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['bps', ' Kbps', 'Mbps', 'Gbps', 'Tbps', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    $scope.formatSize = function(bytes, decimals = 1) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', ' KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    $scope.formatDuration = function(seconds){
        if(!seconds) return
        var duration = new Date(1970, 0, 1).setSeconds(seconds);

        var mask = 'mm:ss';
        if(seconds >= 3600){
            mask = 'h:' + mask
        }


        return $filter('date')(duration, mask);
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

        $scope.interface.allowedExtensions(['wav', 'mp3', 'm4a', 'mp4', 'mov', 'mkv', 'avi', 'webm', 'ogg', 'oga', 'ogv', 'aac', 'flac', 'm4v']);
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
    $scope.dataPost = new Songs();
    $scope.dataPost.tags = [];
    $scope.localImage = "/import/tn.png";

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

    $scope.deleteImportedSong = function (removedSong) {
        $http.post("/removeImportedSong", {'data': removedSong}).then(function (data, status, headers, config) {
            if(data.data.local === "ok") {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent("Original deleted")
                        .position("top right")
                        .hideDelay(500)
                );

                $scope.canBeOriginalDeleted = false;

                //TODO: update list
            }
        });
    }

    $scope.getVideoInfo = function (path) {
        $http.get("/getImportedSongInfo?path=" + path.name).then(function(response) {
            $scope.dataPost.ffmpeg = response.data.data;
            $scope.dataPost.size = $scope.formatSize(response.data.size);
            $scope.dataPost.path = response.data.path;
            $scope.dataPost.shape = response.data.shape || "circularImage";
            $scope.dataPost.duration = $scope.formatDuration(response.data.data.format.duration);



            $scope.mainPanel = true;

            var random = (new Date()).toString();

            setTimeout(function () {
                $scope.imageSource = $scope.localImage + "?cb=" + random;
            }, 3000)
        });
    };

    $scope.deleteSong = function(_id) {
        $scope.entry = Songs.get({id: _id}, function () {
            $scope.entry.$delete(function() {

                $http.post("/removeSongAndImg", {'data': _id}).then(function (data, status, headers, config) {

                    $scope.notes = Songs.query();

                    $scope.notes.$promise.then(function(data) {
                        $scope.notesData = data;
                    });

                    $mdToast.show(
                        $mdToast.simple()
                            .textContent("Deleted")
                            .position("top right")
                            .hideDelay(3000)
                    );
                });


            });
        });


    }

    $scope.convertAll = function() {
        $scope.determinateValue = 0;
        $scope.determinateValue2 = 0;

        $scope.disableInputs = true;

        $scope.dataPost.ffmpeg.native = "";
        $scope.dataPost.ffmpeg.common.picture = [];

        $http.post("/tagImportedSong", {'data': $scope.dataPost}).then(function (data, status, headers, config) {
            if(data.data.local === "ok"){

                $scope.determinateValue = null;
                $scope.disableInputs = false;


                $scope.mainPanel = false;

                var savePromise = $scope.dataPost.$save();
                // POST: /users/123/cards {number: '0123', name: 'Mike Smith'}
                // server returns: {id: 789, number: '0123', name: 'Mike Smith'}
                savePromise.then(function(saved) {
                    $http.post("/moveImportedSong", {'data': saved}).then(function (data, status, headers, config) {

                        $scope.playlistList = Playlists.query();

                        $scope.playlistList.$promise.then(function(data) {
                            $scope.playlistListData = data;
                            $scope.canBeOriginalDeleted = true;
                            $scope.showPlaylists = true;

                            $scope.updateSongsList();

                            $mdToast.show(
                                $mdToast.simple()
                                    .textContent("Moved")
                                    .position("top right")
                                    .hideDelay(2000)
                            );

                        });
                    });
                });
            }

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
        } else {
            console.info(data)
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



    // playlist magic

    var nodeIds, shadowState, nodesArray, nodes, edgesArray, edges, network2;

    $scope.notes = Songs.query();


    $scope.startNetwork = function() {
        // this list is kept to remove a random node.. we do not add node 1 here because it's used for changes

        $scope.playlistListAllEdges = Playlists.query();

        let testPlaylistData = [];

        $scope.playlistListAllEdges.$promise.then(function(dataPlaylist) {
            dataPlaylist.map(function (obj) {
                //console.log(obj.title[0] + " - " + obj.color[0][0].main);
                for(var i = 0; i < obj.edges.length; i++) {
                    testPlaylistData.push(obj.edges[i]);
                }
            });

            $scope.notes.$promise.then(function(data) {
                $scope.notesData = data;


                var nodes = null;
                var edges = null;
                // create an array with nodes

                nodes = $scope.notesData.map(function (obj) {
                    //console.log(obj.title[0] + " - " + obj.color[0][0].main);
                    return {
                        image: "/export/imgs/" + obj._id + ".png",
                        id: obj._id,
                        shape: obj.shape || "circularImage",
                        label: obj.label,
                        //group: obj.group[0],
                        //tip: "fuck jej",
                        //color: obj.genre[0][0].color[0][0]
                    };
                });

                edgesArray = [

                ];


                edges = new vis.DataSet(testPlaylistData);

                // create a network
                var container = document.getElementById('playlistsNetwork');
                var data = {
                    nodes: nodes,
                    edges: edges
                };
                var options = {
                    manipulation: {
                        enabled: true
                    },
                    clickToUse: true,
                    nodes: {
                        borderWidth:3,
                        size:33,
                        shadow:true,
                        color: {
                            border: '#FFFFFF',
                            background: '#666666'
                        },
                        font:{color:'#eeeeee'}
                    },
                    edges: {
                        color: '#fffff',
                        shadow:true,
                        arrows: {to : true }
                    }
                };

                network2 = new vis.Network(container, data, options);



            });
        });
    };



    $scope.addNode = function(data) {

        nodes.add({
            image: "/export/imgs/" + data._id + ".png",
            id: data._id,
            shape: data.shape || "circularImage",
            label: data.path,
        });


        //nodeIds.push(data._id);

    };

    function objectToArray(obj) {
        return Object.keys(obj).map(function (key) {
            obj[key].id = key;
            return obj[key];
        });
    }

    $scope.playlistIdToEdit = "";

    $scope.changePlaylist = function(id) {
        $scope.playlistIdToEdit = id;

        $scope.playlistToEdit = Playlists.get({id: $scope.playlistIdToEdit});

        $scope.playlistToEdit.$promise.then(function(data) {
            $scope.playlistToEdit = data;

            $scope.setTheData($scope.playlistToEdit.nodes, $scope.playlistToEdit.edges);
            network2.stabilize();
        });


    };

    $scope.saveNode = function() {
        $scope.playlistToEdit = Playlists.get({id: $scope.playlistIdToEdit});

        $scope.playlistToEdit.$promise.then(function(data) {
            $scope.playlistToEdit = data;

            $scope.playlistToEdit.nodes = objectToArray(network2.body.data.nodes._data);
            $scope.playlistToEdit.edges = objectToArray(network2.body.data.edges._data);

            $scope.playlistToEdit.$update(function() {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent("ok")
                        .position("top right")
                        //.theme("success-toast")
                        .hideDelay(3000)
                );
            });
        });



        //nodes.forEach(addConnections);
        // pretty prifdnt node data
        //var exportValue = JSON.stringify(edgesToSave, undefined, 2);

        //console.log(nodesToSave);

    };

    $scope.startNetwork();


    $scope.resetAllNodes = function() {
        nodes.clear();
        edges.clear();
        nodes.add(nodesArray);
        edges.add(edgesArray);
    };

    $scope.resetAllNodesStabilize = function() {
        //$scope.resetAllNodes();
        //network.stabilize();
    };

    $scope.setTheData = function(nodesArrayData, edgesArrayData) {
        nodes = new vis.DataSet(nodesArrayData);
        edges = new vis.DataSet(edgesArrayData);
        network2.setData({nodes:nodes, edges:edges})
    };


    $scope.resetAll = function() {
        if (network2 !== null) {
            network2.destroy();
            network2 = null;
        }
        $scope.startNetwork();
    };

    function addPlaylistController($scope, $http, $mdDialog, $mdToast, Playlists) {
        $scope.entry = new Playlists();


        $scope.save = function() {
            $scope.entry.$save(function(data) {
                $mdDialog.hide();
                $mdToast.show(
                    $mdToast.simple()
                        .textContent("SAVED")
                        .position("top right")
                        .hideDelay(3000)
                );
            });
        };

        $scope.hide = function() {
            $mdDialog.hide();
        };

        $scope.answer = function(answer) {
            $mdDialog.hide(answer);
        };
    }

    $scope.deletePlaylist = function(_id){
        $scope.entryToDelete = Playlists.get({id: _id}, function () {
            $scope.entryToDelete.$delete(function() {
                $scope.playlistList = Playlists.query();

                $scope.playlistList.$promise.then(function(dataPlaylist) {
                    $scope.playlistListData = dataPlaylist;
                });

                $mdToast.show(
                    $mdToast.simple()
                        .textContent("Deleted")
                        .position("top right")
                        .hideDelay(3000)
                );
            });
        });
    };

    $scope.addPlaylist = function(ev){
        $mdDialog.show({
            controller: addPlaylistController,
            templateUrl: '/templates/addPlaylist.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: false,
            multiple: true,
            skipHide: true
        }).then(function() {
            $scope.playlistList = Playlists.query();

            $scope.playlistList.$promise.then(function(dataPlaylist) {
                $scope.playlistListData = dataPlaylist;
            });
        }, function(err) {
            console.error(err);
        });
    };

}).component('songs', {
    templateUrl: '/templates/songs.html'
});
