angular.module('saveAudioCtrl', [

]);

angularApp.controller('saveAudioCtrl', function saveAudioCtrl($scope, $rootScope, $location, Notes, Playlists, $mdToast, $mdDialog) {

    $scope.dataPost = {};
    var searchId = $location.search()['id'];

    $scope.noteToSave = Notes.get({id: searchId});
    $scope.notesAll = Notes.query();

    $scope.playlistList = Playlists.query();

    $scope.playlistList.$promise.then(function(data) {
        $scope.playlistListData = data;
    });

    $scope.notesAll.$promise.then(function(data) {
        $scope.notesAllData = data;
    });

    $scope.changeSearchInput = function() {

        //$location.path('/search').search({text: $scope.searchText})
        window.location = "#/search?text=" + $scope.searchText;
    };


    var nodeIds, shadowState, nodesArray, nodes, edgesArray, edges, network2;

    $scope.notes = Notes.query();


    $scope.startNetwork = function() {
        // this list is kept to remove a random node.. we do not add node 1 here because it's used for changes

        $scope.notes.$promise.then(function(data) {
            $scope.notesData = data;


            var nodes = null;
            var edges = null;
            // create an array with nodes

            nodes = $scope.notesData.map(function (obj) {
                //console.log(obj.title[0] + " - " + obj.color[0][0].main);
                return {
                    image: "/uploads/" + obj.youtubeID + ".png",
                    id: obj._id,
                    shape: obj.shape || "circularImage",
                    label: obj.youtubeTitle,
                    //group: obj.group[0],
                    //tip: "fuck jej",
                    //color: obj.genre[0][0].color[0][0]
                };
            });

            edgesArray = [

            ];
            edges = new vis.DataSet(edgesArray);

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

    };

    $scope.addNode = function(data) {
        nodes.add({
           image: "/uploads/" + data.youtubeID + ".png",
            id: data._id,
            shape: data.shape || "circularImage",
            label: data.youtubeTitle,
        });


        nodeIds.push(data._id);

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

            $scope.selectedTabIndex = 2;


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

    $scope.startNetwork();

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

    $scope.noteToSave.$promise.then(function(data) {
        $scope.dataPost = data;
      /*  $scope.audioUrl = "http://localhost:3000/uploads/" + $scope.dataPost.youtubeID + ".mp3";

        var sound      = document.createElement('audio');
        sound.id       = 'audio-player';
        sound.controls = 'controls';
        sound.src      = $scope.audioUrl;
        sound.type     = 'audio/mpeg';
        document.getElementById('song').appendChild(sound);*/

        $scope.videoUrl = "http://localhost:3000/uploads/" + $scope.dataPost.youtubeID + ".mp4";

        var sound      = document.createElement('video');
        sound.id       = 'video-player';
        sound.controls = 'controls';
        sound.src      = $scope.videoUrl;
        sound.type     = 'video/mp4';
        sound.width     = 360;
        document.getElementById('song').appendChild(sound);


    });


    //$scope.dataPost = $rootScope.dataPost;

       //audio.play("http://localhost:3000/uploads/" + $scope.dataPost.youtubeID + ".m4a");    //     <---  Thats All You Need !

        //$scope.videoUrl = "http://localhost:3000/uploads/" + $scope.dataPost.youtubeID + ".mp4";
        //$scope.audioUrl = "http://localhost:3000/uploads/" + $scope.dataPost.youtubeID + ".mp3";

        //document.getElementById('song').innerHTML = '<audio id="audio-player" controls="controls" src="' + $scope.audioUrl + '" type="audio/mpeg">';


}).component('saveAudio', {
    templateUrl: '/templates/saveAudio.html'
});
