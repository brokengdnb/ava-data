angular.module('csvCtrl', [
 'ngDroplet'
]);

angularApp.controller('csvCtrl', function searchCtrl($rootScope, $scope, $mdToast, $mdDialog, $http, Songs, $location, $timeout, Playlists, Effects) {

    let nodesArray, nodes, edgesArray, edges, network2;

    $scope.updateListImportFolder = function(){
        $http.get('/listImportFolder').then(function(data) {
            $scope.localList = data.data.files;
        });
    };

    $scope.updateListImportFolder();


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

    $scope.getVideoInfo = function (path) {

        function objectToArray(obj) {
            return Object.keys(obj).map(function (key) {
                obj[key].id = key;
                return obj[key];
            });
        }

        $http.get("/csv?path=" + path.name).then(function(response) {
            $scope.csvList = response.data.files.map(function (obj) {
                let array = objectToArray(obj);

                if(!obj.Artist){
                    let value = obj.Title.split('-').map(i=>i.trim());
                    obj.Artist = value[0];
                    obj.Title = value[1];
                }

                if(!obj.Title){
                    obj.Title = obj.Artist;
                    obj.Artist = "";
                }

                return {
                    Title: obj.Title,
                    trackNumber: array[0],
                    Location: obj.Location,
                    Duration: obj.Duration,
                    Key: obj.Key,
                    BPM: obj.BPM,
                    Artist: obj.Artist
                };
            });
        });
    };

    $scope.convertAll = function() {
        $http.post("/convertAll", {'data': $scope.dataPost}).then(function (data, status, headers, config) {
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



    function importCSVController($scope, $http, $mdDialog, $mdToast, Playlists) {
        $scope.entry = new Playlists();

        $scope.playlists = Playlists.query();
        $scope.playlists.$promise.then(function(data) {
            $scope.playlistsData = data;
        })

        $scope.choosePlaylist = function(data) {
            $mdDialog.hide(data);
        };

        $scope.save = function() {
            $scope.entry.$save(function(data) {
                $mdDialog.hide(data);
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



    $scope.startNetwork = function() {
        // this list is kept to remove a random node.. we do not add node 1 here because it's used for changes
        $scope.notes = Songs.query();
        $scope.playlistListAllEdges = Playlists.query();

        let testPlaylistData = [];

        $scope.playlistListAllEdges.$promise.then(function(dataPlaylist) {
            dataPlaylist.map(function (obj) {
                //console.log(obj.title[0] + " - " + obj.color[0][0].main);
                for(let i = 0; i < obj.edges.length; i++) {
                    testPlaylistData.push(obj.edges[i]);
                }
            });


            $scope.notes.$promise.then(function(data) {
                $scope.notesData = data;
                let parsedAll = $scope.notesData;


                var nodes = null;
                var edges = null;
                // create an array with nodes

               /* $scope.effectsDatas.map(function (obj) {
                    parsedAll.push(obj);
                });*/

                nodes = parsedAll.map(function (obj) {
                    //console.log(obj.title[0] + " - " + obj.color[0][0].main);
                    return {
                        image: "/export/imgs/" + obj._id + ".png",
                        id: obj._id,
                        shape: obj.shape || "circularImage",
                        label: obj.path,
                        //group: obj.group[0],
                        //tip: "fuck jej",
                        //color: obj.genre[0][0].color[0][0]
                    };
                });


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
            shape: data.shape
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



    $scope.addPlaylist = function(ev){
        $mdDialog.show({
            controller: importCSVController,
            templateUrl: '/templates/importCSV.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: false,
            multiple: true,
            skipHide: true
        }).then(function(dataPlaylist) {

            let nodesToAdd = $scope.csvList.map(function (obj) {
                //console.log(obj.title[0] + " - " + obj.color[0][0].main);
                return {
                    tags: [],
                    duration: 0,
                    ffmpeg: {},
                    shape: "circularImage",
                    label: obj.Title,
                    path: obj.Location,
                    size: 0,
                    image: "",
                    trackNumber: obj.trackNumber,
                    //group: obj.group[0],
                    //tip: "fuck jej",
                    //color: obj.genre[0][0].color[0][0]
                };
            });





            $scope.playlistIdToEdit = dataPlaylist._id;
            $scope.playlistToEdit = Playlists.get({id: $scope.playlistIdToEdit});

            $http.post("/getImportedCSV", {'data': $scope.csvList}).then(function (data, status, headers, config) {
                $scope.playlistToEdit.$promise.then(function(data) {
                    $scope.playlistToEdit = data;

                    $http.post("/api/songsMany", {'files': nodesToAdd}).then(function (dataSaved, status, headers, config) {
                        setTimeout(function () {
                            $http.post("/moveCsvImg", {'data': dataSaved}).then(function (dataMovingImg, status, headers, config) {

                                let editNodes = dataMovingImg.data.data.map(function (obj) {
                                    //console.log(obj.title[0] + " - " + obj.color[0][0].main);
                                    return {
                                        id: obj._id,
                                        shape: obj.shape,
                                        label: obj.label,
                                        image: "/export/imgs/" + obj._id + ".png"
                                        //group: obj.group[0],
                                        //tip: "fuck jej",
                                        //color: obj.genre[0][0].color[0][0]
                                    };
                                });

                                let allNodes = [];

                                $scope.playlistToEdit.nodes.map(function(node) {
                                    allNodes.push(node)
                                });

                                editNodes.map(function(node) {
                                    allNodes.push(node)
                                });

                                console.log(allNodes);

                                $scope.setTheData(allNodes, $scope.playlistToEdit.edges);
                                network2.stabilize();


                                for(let i = 0; i < dataMovingImg.data.data.length; i++) {

                                    let dalsi = i + 1;

                                    network2.body.data.edges.add([{
                                        from: dataMovingImg.data.data[i]._id,
                                        to: dataMovingImg.data.data[dalsi]._id
                                    }])
                                }
                            });
                        }, 4000)
                    });
                        /*$http.post("/api/songsMany", {'files': nodesToAdd}).then(function (dataSaved, status, headers, config) {
                            console.log(dataSaved);
                        });*/
                });
            });
        }, function(err) {
            console.error(err);
        });
    };

    $scope.startNetwork();

}).component('csv', {
    templateUrl: '/templates/csv.html'
});
