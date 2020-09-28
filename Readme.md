> ...ok so let's create a decent REST API database, with pre/post custom manipulation suited up in Material Design UI and all of that render in 2D map of songs to play seamless mix as a DJ as well as VDJ at once... at glance, not so hard to image but fucking loooong way to take that to reality and here we are...

[![preview](https://github.com/brokengdnb/ava/blob/master/about.png?raw=true "preview")](https://github.com/brokengdnb/me "preview")

---

- [Index](#index.html)
- [Demo](#demo)
- [Downloads](#downloads)
- [Compilation](#compilation)
- [License](#license)


## Index.html

It's sooo beauty just... so simple and so open for more complexity, plugins, pages and more:

```jade
mixin links(names)
    each name in names
        link(rel="stylesheet", type="text/css", href=name)
mixin scripts(names)
    each name in names
        script(type="text/javascript", src=name)
mixin scriptsBowerAngular(names)
    each name in names
        script(type="text/javascript", src="/bower_components/"+name+"/"+name+".min.js")
html(lang="en")
    head
        title=appName
        meta(name="mobile-web-app-capable" content="yes")
        meta(name="viewport" content="width=device-width, initial-scale=1")
        meta(name="theme-color" content="#000")

        +links([
            "/bower_components/angular-material/angular-material.min.css",
            "/styles/main.css",
            "/styles/croppie.css",
            "/styles/vis.css"
        ])

        +scriptsBowerAngular([
            "angular",
            "angular-animate",
            "angular-aria",
            "angular-material",
            "angular-messages",
            "angular-resource",
            "angular-route",
        ])

        +scripts([
            "/bower_components/angular-youtube-api-factory/dist/angular-youtube-api-factory.min.js",
            "/scripts/WSAvcPlayer.js",
            "/scripts/ng-droplet.min.js",
            "/scripts/progressbar.min.js",
            "/scripts/NodePlayer.js",
            "/scripts/croppie.min.js",
            "/scripts/angular-croppie.js",
            "/scripts/socket.io.slim.js",
            "/scripts/ua-parser.min.js",
            "/scripts/jquery.min.js",
            "/scripts/vis.js",
            "/scripts/app.js",
            "/scripts/index/component.js",
            "/scripts/search/component.js",
            "/scripts/saveAudio/component.js",
            "/scripts/saveVideo/component.js",
            "/scripts/local/component.js",
            "/scripts/move/component.js",
            "/scripts/home/component.js",
            "/scripts/movie/component.js",
            "/scripts/songs/component.js",
            "/scripts/effects/component.js",
            "/scripts/csv/component.js",
            "/scripts/playlists/component.js"
        ])
    body(ng-app="ngApp")
        div(ng-view)

```

As you can see in a "body" tag I'm using just one element and that render whole aplication in one page, then it depands and also the app will request only what is needed at that request. Then all requests are split between front & back end.

```javascript
// definition of front-end routers:
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
	// etc... and then back-end API factory

.factory('Songs',
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
// etc...
```
I tried to keep default model MVC and rendering custom templates on a go as well.


[![preview](https://github.com/brokengdnb/ava-data/blob/master/mvc.png?raw=true "preview")](https://github.com/brokengdnb/ava-data "preview")


## Demo

[![demo](https://github.com/brokengdnb/me/blob/master/demo.gif?raw=true "demo")](https://github.com/brokengdnb/me "demo")

## Downloads

- [AVA-1.0.zip (~70MB)](https://github.com/brokengdnb/ava-data/releases/tag/v1)

> MD5
- ...

## Compilation

```bash
git clone https://github.com/brokengdnb/ava-data && cd ava-data/
npm install
bower install
npm run start
```
> simple as that...

## Support

- **OS X (tasted on 10.14.6)**
- Linux
- ~~Windows~~  => *(I don't have one and I will **NOT** support this platform. Call Microsoft service in India or your local IT "experts"*


## License

The MIT License.

Copyright (c) 2020 BrokenG


