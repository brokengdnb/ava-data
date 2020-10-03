---
layout:     post
title:      AVA (Data)
date:       2013-08-30
summary:    ...just an idea in the middle of nowhere
categories: project
---

> ...ok so let's create a decent REST API database, with pre/post custom manipulation suited up in Material Design (UI) and all of that render in 2D map of songs to visualise seamless mix as a DJ as well as VDJ at once... at glance 3,2,1 and here... we... go...

---

- [Demo](#demo)
- [Code](#code)
- [Run](#run)
- [Index](#index)
- [Idea](#idea)
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
> just like that... and is on [http://localhost:3000/](http://localhost:3000/ "http://localhost:3000/")

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

So the idea is that I have 3 main elements that I would like to mix:
 - music
 - movies
 - video effects

That can be imported by 3 different ways:
- online (YouTube, Soundcloud, etc.)
- offline
 - move
 - convert

Online is simply text to find API for getting YouTube (limit 1000 requests/day) or any other kind of media (Audio/Video) from anywhere or Offline internal import. That require specific format .mp4 with settings and parameters for seamless playing on any device (iOS, PC, Android, Television, Projectors) so If I already have that file ready from previous times I can just move it or I can create "new" one from ANY kind of file (.avi .flv .mkv. or whatever).

That's individual import for each of element, once that is solved I started creating playlists. In project EMI once I get the right songs with the right effects in the right order, I'm exporting CSV file of those "files/songs" and that will get imported as well with direct connections between each other.

Red dots means that song does not have image cover, by double click you can open modal and drag & drop a new cover image as well as import or edit original ID3 tags.



## Support

- **OS X (tasted on 10.14.6)**
- Linux
- ~~Windows~~  => *(I don't have one and I will **NOT** support this platform. Call Microsoft service in India or your local IT "experts"*


## License

The MIT License.

Copyright (c) 2020 BrokenG