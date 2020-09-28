angular.module('indexCtrl', [

]);

angularApp.controller('indexCtrl', function indexCtrl($location, youtubeFactory, $scope, $http, $mdToast, $mdDialog, $window, Notes, Collections) {

    $scope.goToPage = function(path){
        $location.path(path);
    };

    $scope.collections = Collections.query();
    $scope.notes = Notes.query();

    $scope.collections.$promise.then(function(data) {
        $scope.collectionsDatas = data;
    });

    $scope.notes.$promise.then(function(data) {
        $scope.notesData = data;



        var nodes = null;
        var edges = null;
        var network = null;

        // Called when the Visualization API is loaded.

        // create people.
        // value corresponds with the age of the person

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



        // create connections between people
        // value corresponds with the amount of contact between two people
        edges = [

        ];

        // create a network

        var container = document.getElementById('mynetwork');
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
        network = new vis.Network(container, data, options);





        function loadJSON(path, success, error) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        success(JSON.parse(xhr.responseText));
                    }
                    else {
                        error(xhr);
                    }
                }
            };
            xhr.open('GET', path, true);
            xhr.send();
        }


        function getScaleFreeNetwork(nodeCount) {
            var nodes = [];
            var edges = [];
            var connectionCount = [];

            // randomly create some nodes and edges
            for (var i = 0; i < nodeCount; i++) {
                nodes.push({
                    id: i,
                    label: String(i)
                });

                connectionCount[i] = 0;

                // create edges in a scale-free-network way
                if (i == 1) {
                    var from = i;
                    var to = 0;
                    edges.push({
                        from: from,
                        to: to
                    });
                    connectionCount[from]++;
                    connectionCount[to]++;
                }
                else if (i > 1) {
                    var conn = edges.length * 2;
                    var rand = Math.floor(seededRandom() * conn);
                    var cum = 0;
                    var j = 0;
                    while (j < connectionCount.length && cum < rand) {
                        cum += connectionCount[j];
                        j++;
                    }


                    var from = i;
                    var to = j;
                    edges.push({
                        from: from,
                        to: to
                    });
                    connectionCount[from]++;
                    connectionCount[to]++;
                }
            }

            return {nodes:nodes, edges:edges};
        }

        var randomSeed = 764; // Math.round(Math.random()*1000);
        function seededRandom() {
            var x = Math.sin(randomSeed++) * 10000;
            return x - Math.floor(x);
        }

        function getScaleFreeNetworkSeeded(nodeCount, seed) {
            if (seed) {
                randomSeed = Number(seed);
            }
            var nodes = [];
            var edges = [];
            var connectionCount = [];
            var edgesId = 0;


            // randomly create some nodes and edges
            for (var i = 0; i < nodeCount; i++) {
                nodes.push({
                    id: i,
                    label: String(i)
                });

                connectionCount[i] = 0;

                // create edges in a scale-free-network way
                if (i == 1) {
                    var from = i;
                    var to = 0;
                    edges.push({
                        id: edgesId++,
                        from: from,
                        to: to
                    });
                    connectionCount[from]++;
                    connectionCount[to]++;
                }
                else if (i > 1) {
                    var conn = edges.length * 2;
                    var rand = Math.floor(seededRandom() * conn);
                    var cum = 0;
                    var j = 0;
                    while (j < connectionCount.length && cum < rand) {
                        cum += connectionCount[j];
                        j++;
                    }


                    var from = i;
                    var to = j;
                    edges.push({
                        id: edgesId++,
                        from: from,
                        to: to
                    });
                    connectionCount[from]++;
                    connectionCount[to]++;
                }
            }

            return {nodes:nodes, edges:edges};
        }


        var container;
        var exportArea;
        var importButton;
        var exportButton;

        function init() {
            container = document.getElementById('mynetwork');
            exportArea = document.getElementById('input_output');
            importButton = document.getElementById('import_button');
            exportButton = document.getElementById('export_button');

            draw();
        }



            //nodes.forEach(addConnections);
            // pretty print node data


            function addConnections(elem, index) {
            // need to replace this with a tree of the network, then get child direct children of the element
                elem.connections = objectToArray(network.body.data.edges._data);

        }

        $scope.destroyNetwork = function() {
            network.destroy();
        };

        function clearOutputArea() {
            exportArea.value = "";
        }

        function draw() {
            // create a network of nodes

            clearOutputArea();
        }

        $scope.exportNetwork = function() {
            clearOutputArea();

            var nodes = objectToArray(network.getPositions());

            nodes.forEach(addConnections);

            // pretty print node data
            var exportValue = JSON.stringify(nodes, undefined, 2);

            exportArea.value = exportValue;

            resizeExportArea();
        };

        $scope.importNetwork = function() {
            var inputValue = exportArea.value;
            var inputData = JSON.parse(inputValue);

            var data = {
                nodes: getNodeData(inputData),
                edges: getEdgeData(inputData)
            };

            network = new vis.Network(container, data, {});

            resizeExportArea();
        };

        function getNodeData(data) {
            var networkNodes = [];

            data.forEach(function(elem, index, array) {
                networkNodes.push({id: elem.id, label: elem.id, x: elem.x, y: elem.y});
            });

            return new vis.DataSet(networkNodes);
        }

        function getNodeById(data, id) {
            for (var n = 0; n < data.length; n++) {
                if (data[n].id == id) {  // double equals since id can be numeric or string
                    return data[n];
                }
            };

            throw 'Can not find id \'' + id + '\' in data';
        }

        function getEdgeData(data) {
            var networkEdges = [];

            data.forEach(function(node) {
                // add the connection
                node.connections.forEach(function(connId, cIndex, conns) {
                    networkEdges.push({from: node.id, to: connId});
                    let cNode = getNodeById(data, connId);

                    var elementConnections = cNode.connections;

                    // remove the connection from the other node to prevent duplicate connections
                    var duplicateIndex = elementConnections.findIndex(function(connection) {
                        return connection == node.id; // double equals since id can be numeric or string
                    });


                    if (duplicateIndex != -1) {
                        elementConnections.splice(duplicateIndex, 1);
                    };
                });
            });

            return new vis.DataSet(networkEdges);
        }

        function objectToArray(obj) {
            return Object.keys(obj).map(function (key) {
                obj[key].id = key;
                return obj[key];
            });
        }

        function resizeExportArea() {
            exportArea.style.height = (1 + exportArea.scrollHeight) + "px";
        }

        init();















        $scope.delete = function(_id) {
            $scope.entry = Notes.get({id: _id}, function () {
                $scope.entry.$delete(function() {
                    $scope.notes = Notes.query();

                    $scope.notes.$promise.then(function(data) {
                        $scope.notesData = data;
                    });


                    $mdToast.show(
                        $mdToast.simple()
                            .textContent("Deleted")
                            .position("bottom right")
                            .hideDelay(3000)
                    );
                });
            });


        }



    });

    $scope.generate = function() {
        $window.location = '/backup';
        $mdDialog.hide();
        $mdToast.show(
            $mdToast.simple()
                .textContent("Downloading BackUp file... now")
                .position("bottom right")
                .hideDelay(3333)
        );
    };

    $scope.upload = function() {
        var formData = new FormData();
        formData.append('file', $scope.file);
        console.log(formData);
        $http.post('/backup', formData, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).then(function () {
            $mdDialog.hide();
            $mdToast.show(
                $mdToast.simple()
                    .textContent("Database was restored from BackUp file")
                    .position("bottom right")
                    .hideDelay(3333)
            );
        });
    };

    function schemaDialogCtrl($scope, $http, $mdDialog, Schema, dataToPass) {
        $scope.schema = Schema.get({collections: dataToPass}, function(data) {
            $scope.schemaData = data.paths;
            $scope.schemaName = dataToPass;
        });

        $scope.hide = function() {
            $mdDialog.hide();
        };

        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        $scope.answer = function(answer) {
            $mdDialog.hide(answer);
        };
    }
    $scope.schemaDialog = function(ev, data) {
        $mdDialog.show({
            locals:{dataToPass: data},
            controller: schemaDialogCtrl,
            templateUrl: '/templates/schemaDialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true
        });
    };





}).component('index', {
    templateUrl: '/templates/index.html'
});
