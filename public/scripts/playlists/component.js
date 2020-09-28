angular.module('playlistsCtrl', [

    ]);

angularApp.controller('playlistsCtrl', function moveCtrl($rootScope, $scope, $mdToast, $mdDialog, $http, Notes, $location, $timeout, Effects, $filter, Playlists, Songs) {
    $scope.showPlaylists = false;
    $scope.showEditMovie = false;
    $scope.enableDeletePlaylistBool = false;
    $scope.enableDeleteSongBool = false;

    $scope.updateEffectsList = function(){
        $scope.effects = Effects.query();

        $scope.effects.$promise.then(function(data) {
            $scope.effectsDatas = data;

            $scope.startNetwork();

        });
    };

    $scope.updateSongsList = function(){
        $scope.songsData = {};

        $scope.songs = Songs.query();

        $scope.songs.$promise.then(function(data) {
            $scope.songsData = data.map(function (obj) {
                return {
                    image: "/export/imgs/" + obj._id + ".png",
                    _id: obj._id,
                    shape: obj.shape,
                    label: obj.label,
                    tags: obj.tags,
                    delete: false,
                    createdAt: obj.createdAt,
                }
            });

            console.log($scope.songsData);
        });
    };


    $scope.updatePlaylistsList = function(){
        $scope.playlistListAllEdges = Playlists.query();

        $scope.playlistListAllEdges.$promise.then(function(data) {
            $scope.playlistListAllEdgesData = data.map(function (obj) {
                //console.log(obj.title[0] + " - " + obj.color[0][0].main);
                return {
                    edges: obj.edges,
                    nodes: obj.nodes,
                    delete: false,
                    title: obj.title,
                    _id: obj._id,
                    updatedAt: obj.updatedAt,
                }
            });
        });
    };

    $scope.enableDeletePlaylist = function(){
        if($scope.enableDeletePlaylistBool){
            let tempObjForDeletion = [];
            $scope.playlistListAllEdgesData.map(function (obj) {
                if(obj.delete){
                    tempObjForDeletion.push(obj._id)
                }
            });

            $http.post("/api/playlists/deleteMany", {'files': tempObjForDeletion}).then(function (dataSaved, status, headers, config) {
                $scope.updatePlaylistsList();
                $scope.enableDeletePlaylistBool = !$scope.enableDeletePlaylistBool;
                $mdToast.show(
                    $mdToast.simple()
                        .textContent(tempObjForDeletion.length + " Deleted")
                        .position("top right")
                        .hideDelay(3000)
                )
            });
        } else {
            $scope.enableDeletePlaylistBool = !$scope.enableDeletePlaylistBool;
        }
    }

    $scope.enableDeleteSong = function(){
        if($scope.enableDeleteSongBool){
            let tempObjForDeletion = [];
            $scope.songsData.map(function (obj) {
                if(obj.delete){
                    tempObjForDeletion.push(obj._id)
                }
            });

            $http.post("/api/songs/deleteMany", {'files': tempObjForDeletion}).then(function (dataSaved, status, headers, config) {
                $scope.updateSongsList();
                $scope.enableDeleteSongBool = !$scope.enableDeleteSongBool;
                $mdToast.show(
                    $mdToast.simple()
                        .textContent(tempObjForDeletion.length + " Deleted")
                        .position("top right")
                        .hideDelay(3000)
                )
            });
        } else {
            $scope.enableDeleteSongBool = !$scope.enableDeleteSongBool;
        }
    }

    $scope.updateListImportFolder = function(){
        $http.get('/listImportFolder').then(function(data) {

            $scope.localList = data.data.files;
        });
    };

    $scope.updateEffectsList();
    $scope.updateListImportFolder();


    $scope.selectedTabIndex = 0;

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

        var mask = 'mm:ss';
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

    $scope.addToPlaylist = function (path) {
        $scope.playlistList = Playlists.query();

        $scope.playlistList.$promise.then(function(data) {
            $scope.playlistListData = data;
            $scope.showPlaylists = true;


        });
    };

    $scope.getVideoInfo = function (path) {

        $scope.showEditMovie = false;

        $scope.dataPost = new Effects();
        $scope.dataPost.tags = [];
        $scope.localImage = "/import/tn.png";
        $scope.screenshotTime = '00:00:00';

        $scope.dataPost.path = path.name;
        $scope.dataPost.shape = "image";
        $scope.dataPost.title = $scope.dataPost.path;

        $scope.streams = {};

        $http.get("/getMovieInfo?path=" + path.name + '&time=' + $scope.screenshotTime).then(function(response) {
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
        $scope.dataPost = null;
        $scope.showEditMovie = true;


        $scope.movieDetail = Effects.get({id: movie._id});

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
            $scope.updateEffectsList();

            $mdToast.show(
                $mdToast.simple()
                    .textContent("Saved")
                    .position("top right")
                    .hideDelay(3000)
            );
        });
    };

    $scope.deletePlaylist = function(item) {
        $scope.playlistToDelete = Playlists.get({id: item}, function () {
            $scope.playlistToDelete.$delete(function() {
                $scope.updatePlaylistsList();

                $mdToast.show(
                    $mdToast.simple()
                        .textContent("Deleted")
                        .position("top right")
                        .hideDelay(3000)
                );
            });
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

            data.imgCover = $scope.imgCover;

            $http.post("/MoveEffect", {'data': data}).then(function () {
                $scope.updateListImportFolder();
                $scope.updateEffectsList();

                $scope.dataPost.path = null;
                $scope.dataPost.disableInputs = false;

                $scope.startNetwork();

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


    var nodeIds, shadowState, nodesArray, nodes, edgesArray, edges, network2;
    $scope.songs = Songs.query();


    function editSongCtrl($scope, $http, $mdDialog, $mdToast, Songs, Id, NodesData) {
        $scope.croppedOption = {
            viewMode: 2,
            initialAspectRatio: 0,
            wheelZoomRatio: 1,
            zoomOnWheel: true,
            zoomOnTouch: true,
            autoCropArea: 1,
            showZoomer: true,
            boundary: {
                width: 300,
                height: 300
            }
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

            $scope.interface.allowedExtensions(['png']);
            $scope.interface.setRequestUrl('uploadImageForSong.html');
            $scope.interface.defineHTTPSuccess([/2.{2}/]);
            $scope.interface.useArray(false);

        });

        // Listen for when the files have been successfully uploaded.
        $scope.$on('$dropletSuccess', function onDropletSuccess(event, response, files) {

            $scope.uploadCount = files.length;
            $scope.success     = true;

            $scope.uploadList = files;

            let random = (new Date()).toString();

            $scope.imageSource = "/import/tn.png?cb=" + random;

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

        // TODO: croppie set 0 zoom default!!!!
        setTimeout(function (){
            let inputZoomer = document.getElementsByClassName('cr-slider');
            inputZoomer[0].setAttribute('aria-valuenow', "0");
        }, 3000)

        $scope.formatRate = function(bytes, decimals = 2) {
            if (bytes === 0) return '0 Bytes';
            const k = 1000;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Hz', 'KHz', 'MHz', 'GHz', 'THz', 'PHz', 'EHz', 'ZHz', 'YHz'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        };

        $scope.formatBitrate = function(bytes, decimals = 1) {
            if (bytes === 0) return '0 Bytes';
            const k = 1000;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['bps', ' Kbps', 'Mbps', 'Gbps', 'Tbps', 'Pbps', 'Ebps', 'Zbps', 'Ybps'];
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
            let duration = new Date(1970, 0, 1).setSeconds(seconds);
            let mask = 'mm:ss';
            if(seconds >= 3600){
                mask = 'h:' + mask
            }

            return $filter('date')(duration, mask);
        };

        $scope.dataPost = Songs.get({id: Id}, function () {
            let random = (new Date()).toString();
            $scope.dataPost.$promise.then(function(data) {
                 $scope.dataPost = data;
                 $scope.imageSource = "/export/imgs/" + $scope.dataPost._id + ".png?cb=" + random;
            });
        });

        $scope.reloadSongData = function(data) {
            $http.get("/getAnySongInfo?path=" + encodeURIComponent(data.path)).then(function(response) {
                $scope.dataPost.ffmpeg = response.data.data;
                $scope.dataPost.size = $scope.formatSize(response.data.size);
                $scope.dataPost.path = response.data.path;
                $scope.dataPost.duration = $scope.formatDuration(response.data.data.format.duration);

                let random = (new Date()).toString();

                $scope.imageSource = "/export/imgs/" + $scope.dataPost._id + ".png?cb=" + random;
                $scope.dataPost.ffmpeg.native = "";
                $scope.dataPost.ffmpeg.common.picture = [];
            });
        };

        $scope.saveToDatabase = function() {
            let imageLater = {
                imgCover: $scope.dataPost.imgCover,
                _id: $scope.dataPost._id,
            };

            $scope.dataPost.imgCover = "";

            $scope.dataPost.$save(function(data) {
                $http.post("/writeSongsImg", {'data': imageLater}).then(function () {
                    let random = (new Date()).toString();

                    NodesData.update({
                        image: "/export/imgs/" + data._id + ".png?cb=" + random,
                        id: data._id,
                        label: data.label,
                        shape: data.shape,
                    });

                    $mdToast.show(
                        $mdToast.simple()
                            .textContent("SAVED")
                            .position("top right")
                            .hideDelay(3000)
                    );

                    $mdDialog.hide();
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

        $scope.hide = function() {
            $mdDialog.hide();
        };

        $scope.answer = function(answer) {
            $mdDialog.hide(answer);
        };
    }



    $scope.editSong = function(data){
        $mdDialog.show({
            controller: editSongCtrl,
            locals:{Id: data, NodesData: nodes},
            templateUrl: '/templates/edit-song-dialog.html',
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            targetEvent: angular.element(document.body),
            fullscreen: true,
            multiple: false,
            skipHide: true
        }).then(function() {
            // after all reload all

            $scope.saveNode();
            //network2.resize();

            network2.redraw();
            network2.stabilize();

        }, function(err) {
            console.error(err);
        });
    };

    let parsedAll = []



    $scope.startNetwork = function() {
        // this list is kept to remove a random node.. we do not add node 1 here because it's used for changes

        $scope.playlistListAllEdges = Playlists.query();

        let testPlaylistData = [];

        $scope.playlistListAllEdges.$promise.then(function(dataPlaylist) {
            console.log(dataPlaylist);
            $scope.playlistListAllEdgesData = dataPlaylist.map(function (obj) {
                //console.log(obj.title[0] + " - " + obj.color[0][0].main);
                return {
                        edges: obj.edges,
                        nodes: obj.nodes,
                        delete: false,
                        title: obj.title,
                        _id: obj._id,
                        updatedAt: obj.updatedAt,
                }
            });

            dataPlaylist.map(function (obj) {
                //console.log(obj.title[0] + " - " + obj.color[0][0].main);
                for(let i = 0; i < obj.edges.length; i++) {
                    testPlaylistData.push(obj.edges[i]);
                }
            });


            $scope.songs.$promise.then(function(data) {
                $scope.songsData = data;
                parsedAll = data;


                let nodes = null;
                let edges = null;
                // create an array with nodes

                $scope.effectsDatas.map(function (obj) {
                    parsedAll.push(obj);
                });

                nodes = parsedAll.map(function (obj) {
                    //console.log(obj.title[0] + " - " + obj.color[0][0].main);
                    return {
                        image: "/export/imgs/" + obj._id + ".png",
                        id: obj._id,
                        shape: obj.shape,
                        label: obj.label,
                        delete: false
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

                network2.on("doubleClick", function (params) {
                    let selectedObject = this.getNodeAt(params.pointer.DOM);

                    if(typeof selectedObject !== "undefined" || selectedObject != null) {
                        params.event = "[original event]";
                        //console.log('returns: ' + this.getNodeAt(params.pointer.DOM));
                        //$scope.toggleLeft(this.getNodeAt(params.pointer.DOM));

                        $scope.editSong(selectedObject);
                    }
                });
            })
        });
    };



    $scope.addNode = function(data) {

        nodes.add({
            image: "/export/imgs/" + data._id + ".png",
            id: data._id,
            shape: data.shape || "image",
            label: data.label
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
        $scope.selectedTabIndex = 1;

        $scope.playlistToEdit = Playlists.get({id: $scope.playlistIdToEdit});

        $scope.playlistToEdit.$promise.then(function(data) {
            $scope.playlistToEdit = data;

            /*let thiss = parsedAll.map(function (obj) {
                //console.log(obj.title[0] + " - " + obj.color[0][0].main);
                return {
                    image: "/export/imgs/" + obj._id + ".png",
                    id: obj._id,
                    shape: obj.shape,
                    label: obj.label,
                    //group: obj.group[0],
                    //tip: "fuck jej",
                    //color: obj.genre[0][0].color[0][0]
                };
            });

            $scope.setTheData(thiss, $scope.playlistToEdit.edges);
            network2.stabilize();*/



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
                $scope.updatePlaylistsList();

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
            $scope.updatePlaylistsList();
        }, function(err) {
            console.error(err);
        });
    };


}).component('playlists', {
    templateUrl: '/templates/playlists.html'
});
