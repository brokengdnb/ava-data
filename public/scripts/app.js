var angularApp = angular.module('ngApp', [
    'ngMaterial',
    'ngMessages',
    'ngAnimate',
    'ngRoute',
    'ngResource',
    'jtt_youtube',
    'indexCtrl',
    'searchCtrl',
    'localCtrl',
    'saveAudioCtrl',
    'angularCroppie',
    'moveCtrl',
    'homeCtrl',
    'moviesCtrl',
    'songsCtrl',
    'effectsCtrl',
    'csvCtrl'
]).config(['$locationProvider', '$routeProvider', '$mdThemingProvider',
    function config($locationProvider, $routeProvider, $mdThemingProvider) {
        $mdThemingProvider.theme('input-dark', 'default')
            .primaryPalette('yellow')
            .dark();
        $mdThemingProvider.theme('default')
            .dark().primaryPalette('blue-grey', {
            'default': '700', // by default use shade 400 from the pink palette for primary intentions
            'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
            'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
            'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
        })
        // If you specify less than all of the keys, it will inherit from the
        // default shades
            .accentPalette('yellow', {
                'default': '700' // use shade 200 for default, and keep all other shades the same
            });

        $routeProvider.
        when('/', {
            template: '<home></home>',
            activetab: 'home',
            activename: 'Home',
            reloadOnSearch : false
        }).
        when('/search', {
            template: '<search></search>',
            activetab: 'search',
            activename: 'Search',
            reloadOnSearch : false
        }).
        when('/index', {
            template: '<index></index>',
            activetab: 'index',
            activename: 'Index',
            reloadOnSearch : false
        }).
        when('/saveAudio', {
            template: '<save-audio></save-audio>',
            activetab: 'save-audio',
            activename: 'Save Audio',
            reloadOnSearch : false
        }).
        when('/saveVideo', {
            template: '<save-video></save-video>',
            activetab: 'save-video',
            activename: 'Save Video',
            reloadOnSearch : false
        }).
        when('/local', {
            template: '<local></local>',
            activetab: 'local',
            activename: 'Local',
            reloadOnSearch : false
        }). when('/move', {
            template: '<move></move>',
            activetab: 'move',
            activename: 'Move',
            reloadOnSearch : false
        }). when('/movies', {
            template: '<movies></movies>',
            activetab: 'movies',
            activename: 'Movies',
            reloadOnSearch : false
        }). when('/songs', {
            template: '<songs></songs>',
            activetab: 'songs',
            activename: 'Songs',
            reloadOnSearch : false
        }). when('/effects', {
            template: '<effects></effects>',
            activetab: 'effects',
            activename: 'Effects',
            reloadOnSearch : false
        }). when('/csv', {
            template: '<csv></csv>',
            activetab: 'csv',
            activename: 'Csv',
            reloadOnSearch : false
        }). when('/playlists', {
            template: '<playlists></playlists>',
            activetab: 'playlists',
            activename: 'Playlists',
            reloadOnSearch : false
        }).
        otherwise('/');

        // sinitation hack
        angular.lowercase = angular.$$lowercase;
        // route hack
        $locationProvider.hashPrefix('');
    }
]).run(function($templateCache) {
    $templateCache.put('/templates/index.html');

    // Load the IFrame Player API code asynchronously.
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/player_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


}).filter('secondsToHHmmss', function($filter) {
    return function(seconds) {
        return $filter('date')(new Date(0, 0, 0).setSeconds(seconds), 'HH:mm:ss');
    };
}).filter('capitalize', function() {
    return function(input) {
        return (angular.isString(input) && input.length > 0) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : input;
    }
}).filter('prettyJSON', function () {
    function prettyPrintJson(json) {
        return JSON ? JSON.stringify(json, null, '  ') : 'your browser doesnt support JSON so cant pretty print';
    }
    return prettyPrintJson;
}).directive('progressbar', function ProgressbarDirective() {

    return {

        /**
         * @property restrict
         * @type {String}
         */
        restrict: 'A',

        /**
         * @property scope
         * @type {Object}
         */
        scope: {
            model: '=ngModel'
        },

        /**
         * @property ngModel
         * @type {String}
         */
        require: 'ngModel',

        /**
         * @method link
         * @param scope {Object}
         * @param element {Object}
         * @return {void}
         */
        link: function link(scope, element) {

            var progressBar = new ProgressBar.Path(element[0], {
                strokeWidth: 2
            });

            scope.$watch('model', function() {

                progressBar.animate(scope.model / 100, {
                    duration: 1000
                });

            });

            scope.$on('$dropletSuccess', function onSuccess() {
                progressBar.animate(0);
            });

            scope.$on('$dropletError', function onSuccess() {
                progressBar.animate(0);
            });

        }

    }

}).directive('file', function () {
    return {
        scope: {
            file: '='
        },
        link: function (scope, el, attrs) {
            el.bind('change', function (event) {
                var file = event.target.files[0];
                scope.file = file ? file : undefined;
                scope.$apply();
            });
        }
    }
}).service('scrollAndResizeListener', function($window, $document, $timeout) {
    var id = 0,
        listeners = {},
        scrollTimeoutId,
        resizeTimeoutId;

    function invokeListeners() {
        var clientHeight = $document[0].documentElement.clientHeight,
            clientWidth = $document[0].documentElement.clientWidth;

        for (var key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                listeners[key](clientHeight, clientWidth); // call listener with given arguments
            }
        }
    }


    $window.addEventListener('scroll', function() {
        // cancel previous timeout (simulates stop event)
        $timeout.cancel(scrollTimeoutId);

        // wait for 200ms and then invoke listeners (simulates stop event)
        scrollTimeoutId = $timeout(invokeListeners, 200);
    });


    $window.addEventListener('resize', function() {
        $timeout.cancel(resizeTimeoutId);
        resizeTimeoutId = $timeout(invokeListeners, 200);
    });


    return {
        bindListener: function(listener) {
            var index = ++id;

            listeners[id] = listener;

            return function() {
                delete listeners[index];
            }
        }
    };
}).directive('imageLazySrc', function ($document, scrollAndResizeListener) {
    return {
        restrict: 'A',
        link: function ($scope, $element, $attributes) {
            var listenerRemover;

            function isInView(clientHeight, clientWidth) {
                // get element position
                var imageRect = $element[0].getBoundingClientRect();

                if (
                    (imageRect.top >= 0 && imageRect.bottom <= clientHeight)
                    &&
                    (imageRect.left >= 0 && imageRect.right <= clientWidth)
                ) {
                    $element[0].src = $attributes.imageLazySrc; // set src attribute on element (it will load image)

                    // unbind event listeners when image src has been set
                    listenerRemover();
                }
            }

            // bind listener
            listenerRemover = scrollAndResizeListener.bindListener(isInView);

            // unbind event listeners if element was destroyed
            // it happens when you change view, etc
            $element.on('$destroy', function () {
                listenerRemover();
            });


            // explicitly call scroll listener (because, some images are in viewport already and we haven't scrolled yet)
            isInView(
                $document[0].documentElement.clientHeight,
                $document[0].documentElement.clientWidth
            );
        }
    };
}).factory('audio',function ($document) {
    var audioElement = $document[0].getElementById('audio'); // <-- Magic trick here
    return {
        audioElement: audioElement,

        play: function(filename) {
            audioElement.src = filename;
            audioElement.play();     //  <-- Thats all you need
        }
        // Exersise for the reader - extend this service to include other functions
        // like pausing, etc, etc.

    }
}).factory('Schema',
    function($resource) {
        return $resource('/schema/:id', {id: '@_id'}, {
            'query':  {method:'GET', isArray:true},
            'get':    {method:'GET'},
            'update': {method:'PUT'},
            'save':   {method:'POST'},
            'remove': {method:'DELETE'},
            'delete': {method:'DELETE'}
        });
    }
).factory('Collections',
    function($resource) {
        return $resource('/collections/:id', {id: '@_id'}, {
            'query':  {method:'GET', isArray:true},
            'get':    {method:'GET'},
            'update': {method:'PUT'},
            'save':   {method:'POST'},
            'remove': {method:'DELETE'},
            'delete': {method:'DELETE'}
        });
    }
).factory('Notes',
    function($resource) {
        return $resource('/api/notes/:id', {id: '@_id'}, {
            'query':  {method:'GET', isArray:true},
            'get':    {method:'GET'},
            'update': {method:'PUT'},
            'save':   {method:'POST'},
            'remove': {method:'DELETE'},
            'delete': {method:'DELETE'}
        });
    }
).factory('Playlists',
    function($resource) {
        return $resource('/api/playlists/:id', {id: '@_id'}, {
            'query':  {method:'GET', isArray:true},
            'get':    {method:'GET'},
            'update': {method:'PUT'},
            'save':   {method:'POST'},
            'remove': {method:'DELETE'},
            'delete': {method:'DELETE'}
        });
    }
).factory('Movies',
    function($resource) {
        return $resource('/api/movies/:id', {id: '@_id'}, {
            'query':  {method:'GET', isArray:true},
            'get':    {method:'GET'},
            'update': {method:'PUT'},
            'save':   {method:'POST'},
            'remove': {method:'DELETE'},
            'delete': {method:'DELETE'}
        });
    }
).factory('Songs',
    function($resource) {
        return $resource('/api/songs/:id', {id: '@_id'}, {
            'query':  {method:'GET', isArray:true},
            'get':    {method:'GET'},
            'update': {method:'PUT'},
            'save':   {method:'POST'},
            'remove': {method:'DELETE'},
            'delete': {method:'DELETE'}
        });
    }
).factory('Effects',
        function($resource) {
            return $resource('/api/effects/:id', {id: '@_id'}, {
                'query':  {method:'GET', isArray:true},
                'get':    {method:'GET'},
                'update': {method:'PUT'},
                'save':   {method:'POST'},
                'remove': {method:'DELETE'},
                'delete': {method:'DELETE'}
            });
        }
    );
