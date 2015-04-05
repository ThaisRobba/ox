# ox
Ox is a tiny, opinionated-yet-open 2D game framework for the web. It offers a rigid structure that facilitates development. Its goals are to be easy to learn, modular and lightweight.

It weights at ~3kbytes gzipped and minified, meaning it can be easily used for competitions like 13kJS and for mobile games. Don't let this fool you - Ox is powerful!

### Features

- Entity system
- Fixed time step game loop
- Transparent canvas context
- Animated sprites
- Scene manager
- Assets preloading

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

Clone this repo, install npm, Browserify and BrowserSync.

### Loading assets

Within the src folder, open assets.js. You will see an object literal containing three arrays: one for png images, one for json data files and one for audio files.

    module.exports = {
      //load player.png and add it to ox.images
      images: ['player'],
      
      //load weapons.json and add it to ox.data
      data: ['weapons'],
      
      //load powerup.mp3 and add it to ox.audio
      audio: ['powerup']
    }

Easy peasy!

### Using assets

Ok, so you got your images loaded. Now let's create a new entity for the player. Open src/entities.js, you will see a similar pattern from the assets. Add a property called player and have it require player.js, like this:

    module.exports = {
      player: require('./entities/player.js')
    };

Create a file named player.js inside src/entities. Entities are simple objects with three important functions:

- init
- draw
- update

The init function runs only once, when the entity is first added onto the scene.

The draw function is called up to 60 times per second and should be used to render images.

The update function is where you add game logic - this will be run up to 60 times per second.

To get a simple sprite moving, we use the code below:

    module.exports = {
      init: function() {
        this.x = 0;
      },
      
      draw: function(dt) {
        ox.canvas.drawSprite('player', this.x, 0);
      },
      
      update: function(dt) {
        this.x += 100 * dt;
      }
    }

### What is dt?

Dt is short for delta time. It allows your game to run exactly the same in different machines, no matter how fast or slow they might be. This includes skipping frames on slower machines and restraining how fast things should happen on more powerful computers.

    module.exports = {
      init: function() {
        this.x = 0;
      },
      
      update: function(dt) {
        this.x += 100 * dt;
      }
    }

### Roadmap

- Special UI entity
- Input (mouse, touch, keyboard)
- Tweening
- Particles
- Pre-Rendering
- Pruning of code base
- Better sample project
- Better loading scene

### Disclaimer

This is very much a work in progress and should not be used in production. That said, it is open source so go crazy.
