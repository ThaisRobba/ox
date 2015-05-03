# ox
Ox is a tiny, opinionated-yet-open 2D game framework for the web. It offers a rigid structure that facilitates development. Its goals are to be easy to learn, modular and lightweight.

It weights at ~3.8kbytes gzipped and minified, meaning it can be easily used for competitions like 13kJS and for mobile games. 

### Features

- Powerful and simple Entity system
- Fixed time step game loop
- Transparent canvas context
- Animated sprites
- Scene manager
- Assets preloading
- Automated asset management, live server reload
- Tiny at *3.8kbytes*

### Anatomy of an Ox project

Upon cloning this repo (or downloading it), you should have a basic skeleton for a game.

- audio
- build
- data
- images
- src
  - engine
  - entities
  - scenes

## Getting started:

[Download the framework](https://github.com/OttoRobba/ox/archive/v0.2.1.zip) with the basic template, then cd to the folder you extracted and run `npm install`. Then just run `npm start`. Now just start developing! :D

**Note: This branch is constantly modified, use the [release channel](https://github.com/OttoRobba/ox/releases) for stable releases**

### Roadmap

- Special UI entity
- Tweening
- Particles
- Pre-Rendering
- Pruning of code base
- Better sample project
- Better loading scene
- Less dependencies
- Powerful plugin architecture
- Video documentation

### Disclaimer

This is very much a work in progress and while it is stable enough it should not be used in production. That said, it is open source so go crazy.
