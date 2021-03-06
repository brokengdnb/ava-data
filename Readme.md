> ...ok so let's create a decent REST API database server, with pre & post custom data manipulation, suited up in Material Design (UI) and all of that render in 2D map to visualise songs in a mix & playlists, why? because my memory does not work so I create one...

> As a DJ as well as VDJ in one... 3,2,1 and here... we... go... 


---

- [Demo](#demo)
- [Code](#code)
- [Run](#run)
- [Index](#index)
- [Idea](#idea)
- [TODO](#todo)
- [Support](#support)
- [License](#license)

## Demo



## Code

- [AVA-DATA-1.0.zip (~70MB)](https://github.com/brokengdnb/ava-data/releases/tag/v1)

> MD5
- ...

## Run

```bash
git clone https://github.com/brokengdnb/ava-data && cd ava-data/
npm install
bower install
npm run start
```
> woala just like that... and is on [http://localhost:3000/](http://localhost:3000/ "http://localhost:3000/")

[![MVC](https://github.com/brokengdnb/ava-data/blob/master/demo-img/home.png?raw=true "preview")](https://github.com/brokengdnb/ava-data/demo-img/home.png?raw=true "preview")

## Index

...so simple and so open for more complexity, plugins, pages and more:

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

As you can see in a "body" tag I'm using just one element and that render whole aplication in one page, then it depands and all requests are split between front end getting data & back end doing some extra work:

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


[![MVC](https://github.com/brokengdnb/ava-data/blob/master/demo-img/mvc.png?raw=true "preview")](https://github.com/brokengdnb/ava-data/demo-img/mvc.png?raw=true "preview")


as well as REST-API communications on server split on seperate models, controlers and views, you can see all details on  [http://localhost:3000/api-docs/](http://localhost:3000/api-docs/ "http://localhost:3000/api-docs/") using Swagger UI

[![api](https://github.com/brokengdnb/ava-data/blob/master/demo-img/api.png?raw=true "preview")](https://github.com/brokengdnb/ava-data/demo-img/api.png "preview")

```javascript
module.exports = (app) => {
    const notes = require('../controllers/note.controller.js');
    const cors = require('cors');

    app.use(cors());

    // Create a new Note
    app.post('/api/notes', notes.create);

    // Retrieve all Notes
    app.get('/api/notes', notes.findAll);

    // Retrieve a single Note with noteId
    app.get('/api/notes/:noteId', notes.findOne);

    // Update a Note with noteId
    app.post('/api/notes/:noteId', notes.update);

    // Delete a Note with noteId
    app.delete('/api/notes/:noteId', notes.delete);
}
```

## Idea

> The idea started in summer 2013, knowlage, technology and libraries comes by 2018 and all together finished by 2020 but it's still growing... evolving.

So the idea is that I have 3 main elements that I would like to mix:

 - ### music [(project EMI)](https://github.com/brokengdnb/emi "(project EMI)")

[![MVC](https://github.com/brokengdnb/ava-data/blob/master/demo-img/emi.png?raw=true "preview")](https://github.com/brokengdnb/ava-data/demo-img/emi.png?raw=true "preview")

 - ### movies

[![MVC](https://github.com/brokengdnb/ava-data/blob/master/demo-img/movies.png?raw=true "preview")](https://github.com/brokengdnb/ava-data/demo-img/movies.png?raw=true "preview")

 - ### video effects

[![MVC](https://github.com/brokengdnb/ava-data/blob/master/demo-img/effects.png?raw=true "preview")](https://github.com/brokengdnb/ava-data/demo-img/effects.png?raw=true "preview")

## That can be imported by 3 different ways:
- ### online (YouTube, Soundcloud, etc.)

[![MVC](https://github.com/brokengdnb/ava-data/blob/master/demo-img/youtube.png?raw=true "preview")](https://github.com/brokengdnb/ava-data/demo-img/youtube.png?raw=true "preview")

- ### offline (local)
 - ### move
 - ### convert

[![MVC](https://github.com/brokengdnb/ava-data/blob/master/demo-img/local.png?raw=true "preview")](https://github.com/brokengdnb/ava-data/demo-img/local.png?raw=true "preview")

Online is simply text to find API for getting YouTube (limit 1000 requests/day) or any other kind of media (Audio/Video) from anywhere. Or direct Offline internal import. That require specific format .mp4 with settings and parameters for web based seamless playing on any device (iOS, PC, Android, TV) so If I already have that file ready from previous I can just move it or I can convert audio or video or both of ANY kind of file (.avi .flv .mkv. or whatever) to global format for any device... even my old-school PSP :) or iPhone 5-11

[![MVC](https://github.com/brokengdnb/ava-data/blob/master/demo-img/csv.png?raw=true "preview")](https://github.com/brokengdnb/ava-data/demo-img/csv.png?raw=true "preview")

That's individual import for each of element, once that is solved I started creating playlists. In project EMI once I get the right songs with the right effects in right order, I'm exporting CSV file of those "files/songs" and that will get imported as well with direct connections between each other.

[![MVC](https://github.com/brokengdnb/ava-data/blob/master/demo-img/playlist.png?raw=true "preview")](https://github.com/brokengdnb/ava-data/demo-img/playlist.png?raw=true "preview")

Squere is video effect connected to specific song (dot), gray 'new' dots mean exit or income from playlist to another one and red dots means that song does not have image cover, by double click on it you can open modal and drag & drop a new cover image as well as import or edit original ID3 tags.

[![MVC](https://github.com/brokengdnb/ava-data/blob/master/demo-img/edit.png?raw=true "preview")](https://github.com/brokengdnb/ava-data/demo-img/edit.png?raw=true "preview")

## Todo

- connect automatic searcher for cover images based on title, some open source API for official album & single covers?
- fix a multiple delete function for movies & effects, so far it's just one by one but solution is already on songs, just copy/paste that solution... but I'm lazy xD
- add multiple online responds for just one request
- dynamic change API key for youtube after reaching 1000 requests/day
- by Drag & Drop get & map external storage for files
- copy files into that storage as a backup and write ID3 tags into original file as well
- export pure JSON & images for offline sever-less PWA
- fix Safari bugs, but in this case I'm using Chrome and that's bullet proof

## Support

- **OS X (tested on Mojave 10.14.6)**
- Linux
- ~~Windows~~  => *(I don't have one and I will **NOT** support this platform, never ever)"*


## License

The MIT License.

Copyright (c) 2020 BrokenG