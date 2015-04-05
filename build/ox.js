(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/otto/Dropbox/GameDev/JavaScript/ox/src/assets.js":[function(require,module,exports){
module.exports = {
  images: ['pony', 'pony2', 'pony3', 'pony4', 'pony5', 'coin', 'coinTwisted', 'coin2'],
  data: ['example'],
  audio: []
}

},{}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/canvas.js":[function(require,module,exports){
var images = require('./loader').images,
  canvas = document.getElementById('canvas').getContext('2d');
canvas.drawSprite = function (src, x, y, width, height, frame) {
  if (typeof width === 'number') {
    canvas.drawImage(
      images[src],
      width * frame[0],
      height * frame[1],
      width, height, x, y, width, height);
  } else {
    canvas.drawImage(images[src], x, y);
  }
};

module.exports = canvas;

},{"./loader":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/loader.js"}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/core.js":[function(require,module,exports){
window.onload = function () {
  this.ox = {
    canvas: require('./canvas'),
    images: require('./loader').images,
    audio: require('./loader').audio,
    data: require('./loader').data,
    mouse: require('./mouse'),
    scenes: require('./scenesManager'),
    entities: require('./entitiesManager'),
    save: require('./localStorage'),
    loop: require('./gameLoop'),
    preloader: require('./loader'),
    sprite: function (src, options) {
      var obj = options || {};
      obj.src = src;
      return this.entities.spawn('sprite', obj);
    },
    spawn: function (name, options) {
      this.list = this.entities.list;
      this.entities.spawn(name, options);
    }
  };
  ox.loop.calculateDelta();
  ox.scenes.set('loading');
  ox.loop.run();
};

},{"./canvas":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/canvas.js","./entitiesManager":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/entitiesManager.js","./gameLoop":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/gameLoop.js","./loader":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/loader.js","./localStorage":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/localStorage.js","./mouse":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/mouse.js","./scenesManager":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/scenesManager.js"}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/entitiesManager.js":[function(require,module,exports){
module.exports = {
  current: [],
  list: require('../entities'),
  dirtyZ: false,
  spawn: function (name, options) {
    if (!this.list[name]) throw new Error("Entity '" + name + "' does not exist and cannot be spawned.");
    var obj = options || {};
    for (var key in this.list[name]) {
      obj[key] = this.list[name][key];
    }
    obj.destroy = this.destroy.bind(obj);
    obj.revive = this.revive.bind(obj);
    obj.isAlive = true;
    this.current.push(obj);
    if (obj.init) {
      obj.init();
    };
    obj.isReady = true
    return obj;
  },
  checkZ: function (entity) {
    if (typeof entity.z === 'undefined') entity.z = 0;
    if (entity.z !== entity.lastZ) {
      entity.lastZ = entity.z;
      this.dirtyZ = true;
    }
  },
  sortByZ: function () {
    this.current.sort(function (a, b) {
      return a.z - b.z;
    });
  },
  destroy: function () {
    this.isAlive = false;
  },
  revive: function () {
    this.isAlive = true;
  }
};

},{"../entities":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/entities.js"}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/gameLoop.js":[function(require,module,exports){
var entities = require('./entitiesManager'),
  scenes = require('./scenesManager'),
  context = require('./canvas');
var camera = {
  x: 1,
  y: 20
}
module.exports = {
  speed: 1,
  dt: 0,
  step: 1 / 60,
  lastDelta: new Date(),
  now: new Date(),
  calculateDelta: function () {
    this.lastDelta = this.now;
    this.now = new Date();
    this.dt += Math.min(1, (this.now - this.lastDelta) / 1000) * this.speed;
  },
  run: function () {
    this.calculateDelta();

    if (entities.dirtyZ) {
      entities.sortByZ();
      entities.dirtyZ = false;
    }

    while (this.dt > this.step) {
      this.dt -= this.step;
      this.update(this.step);
    }
    this.draw(this.dt);

    requestAnimationFrame(this.run.bind(this));
  },

  draw: function (dt) {
    var time = new Date;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    //    ox.canvas.save();
    //    camera.y += .5;
    //    if (camera.y > 30) camera.y = -10;
    //    ox.canvas.translate(camera.x, camera.y);

    if (scenes.current.draw) scenes.current.draw(dt);
    for (var i = 0, len = entities.current.length; i < len; i++) {
      var entity = entities.current[i];
      if (entity.isAlive) {
        if (entity.draw) entity.draw(dt);
      }
    }
    //    ox.canvas.restore();
  },

  update: function (dt) {
    if (scenes.current.update) scenes.current.update(dt);
    for (var i = 0, len = entities.current.length; i < len; i++) {
      var entity = entities.current[i];
      if (entity.isAlive) {
        if (entity.update) entity.update(dt);
      }
    }
  }
}

},{"./canvas":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/canvas.js","./entitiesManager":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/entitiesManager.js","./scenesManager":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/scenesManager.js"}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/loader.js":[function(require,module,exports){
module.exports = {
  images: {},
  data: {},
  audio: {},
  assetsToLoad: 0,

  loadImage: function (name) {
    this.images[name] = new Image();
    this.images[name].onload = this.assetsToLoad--;
    this.images[name].src = "images/" + name + ".png";
  },

  loadData: function (file) {
    var self = this,
      xhr = new XMLHttpRequest;
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        self.data[file] = JSON.parse(xhr.responseText);
        self.assetsToLoad--;
      }
    };

    xhr.open("GET", "data/" + file + ".json");
    xhr.send();
  },

  loadAudio: function (name) {},

  load: function (obj) {
    if (obj.images) {
      this.assetsToLoad += obj.images.length;
      for (var i = 0; i < obj.images.length; i++) {
        this.loadImage(obj.images[i]);
      }
    }

    if (obj.data) {
      this.assetsToLoad += obj.data.length;
      for (var j = 0; j < obj.data.length; j++) {
        this.loadData(obj.data[j]);
      }
    }

    if (obj.audio) {
      this.assetsToLoad += obj.audio.length;
      for (var k = 0; k < obj.audio.length; k++) {
        this.loadAudio(obj.audio[k]);
      }
    }
  }
}

},{}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/localStorage.js":[function(require,module,exports){
module.exports = {
  store: function (num, obj) {
    localStorage.setItem(num, JSON.stringify(obj));
  },
  load: function (num) {
    return JSON.parse(localStorage.getItem(num));
  },
  remove: function (num) {
    localStorage.removeItem(num);
  }
}

},{}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/mouse.js":[function(require,module,exports){
module.exports = {
  x: 0,
  y: 0
}

},{}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/scenesManager.js":[function(require,module,exports){
module.exports = {
  current: null,
  list: require('../scenes'),
  set: function (name) {
    if (!this.list[name]) throw new Error("Scene '" + name + "' does not exist!");
    this.current = this.list[name];
    if (this.current.init) this.current.init();
  }
}

},{"../scenes":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/scenes.js"}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/entities.js":[function(require,module,exports){
module.exports = {
  sprite: require('./entities/sprite.js'),
  counter: require('./entities/counter.js'),
  counter2: require('./entities/counter2.js'),
  poney: require('./entities/poney.js')
};

},{"./entities/counter.js":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/entities/counter.js","./entities/counter2.js":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/entities/counter2.js","./entities/poney.js":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/entities/poney.js","./entities/sprite.js":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/entities/sprite.js"}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/entities/counter.js":[function(require,module,exports){
module.exports = {
  init: function () {
    this.value = 100;
  },
  update: function () {
    this.value++;
  }
};

},{}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/entities/counter2.js":[function(require,module,exports){
module.exports = {
  init: function () {
    this.v = 101;
    this.value = 0;
    this.c = ox.entities.spawn('counter');
  },
  update: function () {
    this.value++;
  }
};

},{}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/entities/poney.js":[function(require,module,exports){
module.exports = {
  init: function () {
    this.x = 0;
  },

  draw: function () {
    this.x++;
    ox.canvas.fillStyle = 'blue'
    ox.canvas.fillRect(80, 80, 100, 200)
    ox.canvas.strokeStyle = 'grey'
    ox.canvas.strokeRect(80, 80, 100, 200)
    ox.canvas.drawSprite('pony', this.x, 0);
    ox.canvas.drawSprite('pony', this.x + 10, 0);
  }
};

},{}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/entities/sprite.js":[function(require,module,exports){
module.exports = {
  init: function () {
    this.srcWidth = ox.images[this.src].width;
    this.width = this.width || this.srcWidth;
    this.srcHeight = ox.images[this.src].height;
    this.height = this.height || this.srcHeight;
    this.x = this.x || 0;
    this.y = this.y || 0;
    if (this.animation) {
      this.initAnimation();
      this.update = this.updateAnimation;
      this.draw = this.drawAnimation;
    }
  },

  draw: function () {
    ox.canvas.drawSprite(this.src, this.x, this.y);
  },

  drawAnimation: function () {
    ox.canvas.drawSprite(this.src, this.x, this.y, this.width, this.height, this.frames[this.frame]);
  },

  initAnimation: function () {
    this.isPlaying = true;
    this.isFinished = false;
    if (typeof this.loop !== 'boolean') this.loop = true;
    this.counter = 0;
    this.frameRate = 60 / this.frameRate || 1;
    this.calculateFrames();

    if (this.animations) {
      this.animationArray = this.animations[this.animation]
      this.arrayCounter = 0;
      this.frame = this.animationArray[this.arrayCounter];
    } else {
      this.frame = 0;
    }
  },

  calculateFrames: function () {
    var x = y = 0;
    this.frames = [[0, 0]];

    for (var i = 1; i < this.srcHeight / this.height * this.srcWidth / this.width; i++) {
      if (x < this.srcWidth / this.width - 1) {
        x++;
      } else if (y < this.srcHeight / this.height - 1) {
        y++;
        x = 0;
      }
      this.frames.push([x, y]);
    }
  },

  updateAnimation: function () {
    if (!this.isPlaying) return;
    if (this.isFinished) return this.finished();
    this.counter += 1;
    if (this.counter > this.frameRate) {
      this.counter = 0;
      if (this.animations) this.multipleAnimations();
      else this.singleAnimation();
    }
  },

  multipleAnimations: function () {
    if (this.arrayCounter === this.animationArray.length - 1) {
      if (!this.loop) this.isFinished = true;
      this.frame = this.animationArray[0]
      this.arrayCounter = 0;
    } else {
      this.arrayCounter++;
      this.frame = this.animationArray[this.arrayCounter]
    }
  },

  singleAnimation: function () {
    if (this.frame === (this.frames.length - 1)) {
      if (!this.loop) this.isFinished = true;
      this.frame = 0
    } else {
      this.frame += 1;
    }
  },

  finished: function () {
    this.stop();
    this.update = null;
    if (this.onFinish) this.onFinish();
  },

  play: function (animation, options) {
    if (options) {
      for (var key in options) {
        this[key] = options[key]
      }
    }

    if (this.animations) {
      if (animation) this.animation = animation;
      this.animationArray = this.animations[this.animation];
      this.arrayCounter = 0;
      this.frame = this.animationArray[this.arrayCounter];
    }

    this.isFinished = false;
    this.isPlaying = true;
  },

  stop: function () {
    this.isPlaying = false;
  }
};

},{}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/scenes.js":[function(require,module,exports){
module.exports = {
  loading: require('./scenes/loading.js'),
  main: require('./scenes/main.js')
};

},{"./scenes/loading.js":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/scenes/loading.js","./scenes/main.js":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/scenes/main.js"}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/scenes/loading.js":[function(require,module,exports){
module.exports = {
  init: function () {
    ox.preloader.load(require('../assets.js'));
    this.barLength = ox.preloader.assetsToLoad;
  },

  draw: function () {
    ox.canvas.fillStyle = "black"
    ox.canvas.fillRect(0, 0, ox.canvas.width, ox.canvas.height)
    ox.canvas.fillStyle = "rgb(46, 238, 245)"
    ox.canvas.fillRect(ox.canvas.width / 4, 2 * ox.canvas.height / 3, ox.canvas.width / 2, 1)
    ox.canvas.fillStyle = "grey"
    ox.canvas.save()
    ox.canvas.translate(ox.canvas.width / 4, 2 * ox.canvas.height / 3)
    ox.canvas.scale(-1, 1)
    ox.canvas.fillRect(-ox.canvas.width / 2, 0, ox.canvas.width / 2 * ox.preloader.assetsToLoad / this.barLength, 1)
    ox.canvas.restore()
    ox.canvas.fillStyle = "white"
    ox.canvas.font = '200% sans-serif'
    ox.canvas.fillText('loading...', ox.canvas.width / 2 - 68, ox.canvas.height / 2 + 10);
  },

  update: function () {
    if (ox.preloader.assetsToLoad === 0) ox.scenes.set('main');
  }
};

},{"../assets.js":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/assets.js"}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/scenes/main.js":[function(require,module,exports){
module.exports = {
  init: function () {
    var test = ox.spawn('counter2');
    this.x = 0;
    this.poney = ox.spawn('poney');

    //    this.sprite3 = ox.sprite('coin2', {
    //      x: 20,
    //      animation: 'spin',
    //      height: 40,
    //      width: 44
    //    });
    //
    //    this.sprite = ox.sprite('coin2', {
    //      animation: 'spin2',
    //      loop: false,
    //      height: 40,
    //      width: 44
    //    });
    this.test = ox.sprite('pony');

    this.sprite2 = ox.sprite('coin2', {
      x: 80,
      y: 1,
      animation: 'spin',
      animations: {
        spin: [0, 1, 2, 3, 4, 4, 4, 4, 5, 6, 7, 8],
        idle: [8, 4, 8, 4, 8, 4, 8, 4, 8, 4, 8, 4, 8, 4, 8, 4]
      },
      height: 40,
      frameRate: 60,
      width: 44
    });

    this.sprite2.play('spin', {
      loop: false,
      onFinish: function () {
        this.x = 10;
        console.log("Finished!")
        this.destroy();
        ox.scenes.current.testing();
      },
      onStart: function () {
        console.log("animation started!");
      }
    });

  },
  testing: function () {
    console.log("I was called!")

  },

  update: function (dt) {

    this.x += 10
    if (this.x > 300) this.x -= 400;
    if (this.x < 399 && !this.isPlaying) {
      this.sprite2.play('spin', true);
      this.isPlaying = true;
    }
  }
};

},{}]},{},["/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/core.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXNzZXRzLmpzIiwic3JjL2VuZ2luZS9jYW52YXMuanMiLCJzcmMvZW5naW5lL2NvcmUuanMiLCJzcmMvZW5naW5lL2VudGl0aWVzTWFuYWdlci5qcyIsInNyYy9lbmdpbmUvZ2FtZUxvb3AuanMiLCJzcmMvZW5naW5lL2xvYWRlci5qcyIsInNyYy9lbmdpbmUvbG9jYWxTdG9yYWdlLmpzIiwic3JjL2VuZ2luZS9tb3VzZS5qcyIsInNyYy9lbmdpbmUvc2NlbmVzTWFuYWdlci5qcyIsInNyYy9lbnRpdGllcy5qcyIsInNyYy9lbnRpdGllcy9jb3VudGVyLmpzIiwic3JjL2VudGl0aWVzL2NvdW50ZXIyLmpzIiwic3JjL2VudGl0aWVzL3BvbmV5LmpzIiwic3JjL2VudGl0aWVzL3Nwcml0ZS5qcyIsInNyYy9zY2VuZXMuanMiLCJzcmMvc2NlbmVzL2xvYWRpbmcuanMiLCJzcmMvc2NlbmVzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbWFnZXM6IFsncG9ueScsICdwb255MicsICdwb255MycsICdwb255NCcsICdwb255NScsICdjb2luJywgJ2NvaW5Ud2lzdGVkJywgJ2NvaW4yJ10sXG4gIGRhdGE6IFsnZXhhbXBsZSddLFxuICBhdWRpbzogW11cbn1cbiIsInZhciBpbWFnZXMgPSByZXF1aXJlKCcuL2xvYWRlcicpLmltYWdlcyxcbiAgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpLmdldENvbnRleHQoJzJkJyk7XG5jYW52YXMuZHJhd1Nwcml0ZSA9IGZ1bmN0aW9uIChzcmMsIHgsIHksIHdpZHRoLCBoZWlnaHQsIGZyYW1lKSB7XG4gIGlmICh0eXBlb2Ygd2lkdGggPT09ICdudW1iZXInKSB7XG4gICAgY2FudmFzLmRyYXdJbWFnZShcbiAgICAgIGltYWdlc1tzcmNdLFxuICAgICAgd2lkdGggKiBmcmFtZVswXSxcbiAgICAgIGhlaWdodCAqIGZyYW1lWzFdLFxuICAgICAgd2lkdGgsIGhlaWdodCwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gIH0gZWxzZSB7XG4gICAgY2FudmFzLmRyYXdJbWFnZShpbWFnZXNbc3JjXSwgeCwgeSk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gY2FudmFzO1xuIiwid2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5veCA9IHtcbiAgICBjYW52YXM6IHJlcXVpcmUoJy4vY2FudmFzJyksXG4gICAgaW1hZ2VzOiByZXF1aXJlKCcuL2xvYWRlcicpLmltYWdlcyxcbiAgICBhdWRpbzogcmVxdWlyZSgnLi9sb2FkZXInKS5hdWRpbyxcbiAgICBkYXRhOiByZXF1aXJlKCcuL2xvYWRlcicpLmRhdGEsXG4gICAgbW91c2U6IHJlcXVpcmUoJy4vbW91c2UnKSxcbiAgICBzY2VuZXM6IHJlcXVpcmUoJy4vc2NlbmVzTWFuYWdlcicpLFxuICAgIGVudGl0aWVzOiByZXF1aXJlKCcuL2VudGl0aWVzTWFuYWdlcicpLFxuICAgIHNhdmU6IHJlcXVpcmUoJy4vbG9jYWxTdG9yYWdlJyksXG4gICAgbG9vcDogcmVxdWlyZSgnLi9nYW1lTG9vcCcpLFxuICAgIHByZWxvYWRlcjogcmVxdWlyZSgnLi9sb2FkZXInKSxcbiAgICBzcHJpdGU6IGZ1bmN0aW9uIChzcmMsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBvYmogPSBvcHRpb25zIHx8IHt9O1xuICAgICAgb2JqLnNyYyA9IHNyYztcbiAgICAgIHJldHVybiB0aGlzLmVudGl0aWVzLnNwYXduKCdzcHJpdGUnLCBvYmopO1xuICAgIH0sXG4gICAgc3Bhd246IGZ1bmN0aW9uIChuYW1lLCBvcHRpb25zKSB7XG4gICAgICB0aGlzLmxpc3QgPSB0aGlzLmVudGl0aWVzLmxpc3Q7XG4gICAgICB0aGlzLmVudGl0aWVzLnNwYXduKG5hbWUsIG9wdGlvbnMpO1xuICAgIH1cbiAgfTtcbiAgb3gubG9vcC5jYWxjdWxhdGVEZWx0YSgpO1xuICBveC5zY2VuZXMuc2V0KCdsb2FkaW5nJyk7XG4gIG94Lmxvb3AucnVuKCk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGN1cnJlbnQ6IFtdLFxuICBsaXN0OiByZXF1aXJlKCcuLi9lbnRpdGllcycpLFxuICBkaXJ0eVo6IGZhbHNlLFxuICBzcGF3bjogZnVuY3Rpb24gKG5hbWUsIG9wdGlvbnMpIHtcbiAgICBpZiAoIXRoaXMubGlzdFtuYW1lXSkgdGhyb3cgbmV3IEVycm9yKFwiRW50aXR5ICdcIiArIG5hbWUgKyBcIicgZG9lcyBub3QgZXhpc3QgYW5kIGNhbm5vdCBiZSBzcGF3bmVkLlwiKTtcbiAgICB2YXIgb2JqID0gb3B0aW9ucyB8fCB7fTtcbiAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5saXN0W25hbWVdKSB7XG4gICAgICBvYmpba2V5XSA9IHRoaXMubGlzdFtuYW1lXVtrZXldO1xuICAgIH1cbiAgICBvYmouZGVzdHJveSA9IHRoaXMuZGVzdHJveS5iaW5kKG9iaik7XG4gICAgb2JqLnJldml2ZSA9IHRoaXMucmV2aXZlLmJpbmQob2JqKTtcbiAgICBvYmouaXNBbGl2ZSA9IHRydWU7XG4gICAgdGhpcy5jdXJyZW50LnB1c2gob2JqKTtcbiAgICBpZiAob2JqLmluaXQpIHtcbiAgICAgIG9iai5pbml0KCk7XG4gICAgfTtcbiAgICBvYmouaXNSZWFkeSA9IHRydWVcbiAgICByZXR1cm4gb2JqO1xuICB9LFxuICBjaGVja1o6IGZ1bmN0aW9uIChlbnRpdHkpIHtcbiAgICBpZiAodHlwZW9mIGVudGl0eS56ID09PSAndW5kZWZpbmVkJykgZW50aXR5LnogPSAwO1xuICAgIGlmIChlbnRpdHkueiAhPT0gZW50aXR5Lmxhc3RaKSB7XG4gICAgICBlbnRpdHkubGFzdFogPSBlbnRpdHkuejtcbiAgICAgIHRoaXMuZGlydHlaID0gdHJ1ZTtcbiAgICB9XG4gIH0sXG4gIHNvcnRCeVo6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmN1cnJlbnQuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgcmV0dXJuIGEueiAtIGIuejtcbiAgICB9KTtcbiAgfSxcbiAgZGVzdHJveTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaXNBbGl2ZSA9IGZhbHNlO1xuICB9LFxuICByZXZpdmU6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlzQWxpdmUgPSB0cnVlO1xuICB9XG59O1xuIiwidmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi9lbnRpdGllc01hbmFnZXInKSxcbiAgc2NlbmVzID0gcmVxdWlyZSgnLi9zY2VuZXNNYW5hZ2VyJyksXG4gIGNvbnRleHQgPSByZXF1aXJlKCcuL2NhbnZhcycpO1xudmFyIGNhbWVyYSA9IHtcbiAgeDogMSxcbiAgeTogMjBcbn1cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzcGVlZDogMSxcbiAgZHQ6IDAsXG4gIHN0ZXA6IDEgLyA2MCxcbiAgbGFzdERlbHRhOiBuZXcgRGF0ZSgpLFxuICBub3c6IG5ldyBEYXRlKCksXG4gIGNhbGN1bGF0ZURlbHRhOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5sYXN0RGVsdGEgPSB0aGlzLm5vdztcbiAgICB0aGlzLm5vdyA9IG5ldyBEYXRlKCk7XG4gICAgdGhpcy5kdCArPSBNYXRoLm1pbigxLCAodGhpcy5ub3cgLSB0aGlzLmxhc3REZWx0YSkgLyAxMDAwKSAqIHRoaXMuc3BlZWQ7XG4gIH0sXG4gIHJ1bjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY2FsY3VsYXRlRGVsdGEoKTtcblxuICAgIGlmIChlbnRpdGllcy5kaXJ0eVopIHtcbiAgICAgIGVudGl0aWVzLnNvcnRCeVooKTtcbiAgICAgIGVudGl0aWVzLmRpcnR5WiA9IGZhbHNlO1xuICAgIH1cblxuICAgIHdoaWxlICh0aGlzLmR0ID4gdGhpcy5zdGVwKSB7XG4gICAgICB0aGlzLmR0IC09IHRoaXMuc3RlcDtcbiAgICAgIHRoaXMudXBkYXRlKHRoaXMuc3RlcCk7XG4gICAgfVxuICAgIHRoaXMuZHJhdyh0aGlzLmR0KTtcblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnJ1bi5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICBkcmF3OiBmdW5jdGlvbiAoZHQpIHtcbiAgICB2YXIgdGltZSA9IG5ldyBEYXRlO1xuICAgIGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIGNvbnRleHQuY2FudmFzLndpZHRoLCBjb250ZXh0LmNhbnZhcy5oZWlnaHQpO1xuICAgIC8vICAgIG94LmNhbnZhcy5zYXZlKCk7XG4gICAgLy8gICAgY2FtZXJhLnkgKz0gLjU7XG4gICAgLy8gICAgaWYgKGNhbWVyYS55ID4gMzApIGNhbWVyYS55ID0gLTEwO1xuICAgIC8vICAgIG94LmNhbnZhcy50cmFuc2xhdGUoY2FtZXJhLngsIGNhbWVyYS55KTtcblxuICAgIGlmIChzY2VuZXMuY3VycmVudC5kcmF3KSBzY2VuZXMuY3VycmVudC5kcmF3KGR0KTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZW50aXRpZXMuY3VycmVudC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgdmFyIGVudGl0eSA9IGVudGl0aWVzLmN1cnJlbnRbaV07XG4gICAgICBpZiAoZW50aXR5LmlzQWxpdmUpIHtcbiAgICAgICAgaWYgKGVudGl0eS5kcmF3KSBlbnRpdHkuZHJhdyhkdCk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vICAgIG94LmNhbnZhcy5yZXN0b3JlKCk7XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcbiAgICBpZiAoc2NlbmVzLmN1cnJlbnQudXBkYXRlKSBzY2VuZXMuY3VycmVudC51cGRhdGUoZHQpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBlbnRpdGllcy5jdXJyZW50Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB2YXIgZW50aXR5ID0gZW50aXRpZXMuY3VycmVudFtpXTtcbiAgICAgIGlmIChlbnRpdHkuaXNBbGl2ZSkge1xuICAgICAgICBpZiAoZW50aXR5LnVwZGF0ZSkgZW50aXR5LnVwZGF0ZShkdCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW1hZ2VzOiB7fSxcbiAgZGF0YToge30sXG4gIGF1ZGlvOiB7fSxcbiAgYXNzZXRzVG9Mb2FkOiAwLFxuXG4gIGxvYWRJbWFnZTogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aGlzLmltYWdlc1tuYW1lXSA9IG5ldyBJbWFnZSgpO1xuICAgIHRoaXMuaW1hZ2VzW25hbWVdLm9ubG9hZCA9IHRoaXMuYXNzZXRzVG9Mb2FkLS07XG4gICAgdGhpcy5pbWFnZXNbbmFtZV0uc3JjID0gXCJpbWFnZXMvXCIgKyBuYW1lICsgXCIucG5nXCI7XG4gIH0sXG5cbiAgbG9hZERhdGE6IGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0O1xuICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQgJiYgeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgIHNlbGYuZGF0YVtmaWxlXSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIHNlbGYuYXNzZXRzVG9Mb2FkLS07XG4gICAgICB9XG4gICAgfTtcblxuICAgIHhoci5vcGVuKFwiR0VUXCIsIFwiZGF0YS9cIiArIGZpbGUgKyBcIi5qc29uXCIpO1xuICAgIHhoci5zZW5kKCk7XG4gIH0sXG5cbiAgbG9hZEF1ZGlvOiBmdW5jdGlvbiAobmFtZSkge30sXG5cbiAgbG9hZDogZnVuY3Rpb24gKG9iaikge1xuICAgIGlmIChvYmouaW1hZ2VzKSB7XG4gICAgICB0aGlzLmFzc2V0c1RvTG9hZCArPSBvYmouaW1hZ2VzLmxlbmd0aDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb2JqLmltYWdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLmxvYWRJbWFnZShvYmouaW1hZ2VzW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAob2JqLmRhdGEpIHtcbiAgICAgIHRoaXMuYXNzZXRzVG9Mb2FkICs9IG9iai5kYXRhLmxlbmd0aDtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgb2JqLmRhdGEubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdGhpcy5sb2FkRGF0YShvYmouZGF0YVtqXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG9iai5hdWRpbykge1xuICAgICAgdGhpcy5hc3NldHNUb0xvYWQgKz0gb2JqLmF1ZGlvLmxlbmd0aDtcbiAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgb2JqLmF1ZGlvLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIHRoaXMubG9hZEF1ZGlvKG9iai5hdWRpb1trXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgc3RvcmU6IGZ1bmN0aW9uIChudW0sIG9iaikge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKG51bSwgSlNPTi5zdHJpbmdpZnkob2JqKSk7XG4gIH0sXG4gIGxvYWQ6IGZ1bmN0aW9uIChudW0pIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShudW0pKTtcbiAgfSxcbiAgcmVtb3ZlOiBmdW5jdGlvbiAobnVtKSB7XG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0obnVtKTtcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIHg6IDAsXG4gIHk6IDBcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBjdXJyZW50OiBudWxsLFxuICBsaXN0OiByZXF1aXJlKCcuLi9zY2VuZXMnKSxcbiAgc2V0OiBmdW5jdGlvbiAobmFtZSkge1xuICAgIGlmICghdGhpcy5saXN0W25hbWVdKSB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSAnXCIgKyBuYW1lICsgXCInIGRvZXMgbm90IGV4aXN0IVwiKTtcbiAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLmxpc3RbbmFtZV07XG4gICAgaWYgKHRoaXMuY3VycmVudC5pbml0KSB0aGlzLmN1cnJlbnQuaW5pdCgpO1xuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgc3ByaXRlOiByZXF1aXJlKCcuL2VudGl0aWVzL3Nwcml0ZS5qcycpLFxuICBjb3VudGVyOiByZXF1aXJlKCcuL2VudGl0aWVzL2NvdW50ZXIuanMnKSxcbiAgY291bnRlcjI6IHJlcXVpcmUoJy4vZW50aXRpZXMvY291bnRlcjIuanMnKSxcbiAgcG9uZXk6IHJlcXVpcmUoJy4vZW50aXRpZXMvcG9uZXkuanMnKVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52YWx1ZSA9IDEwMDtcbiAgfSxcbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52YWx1ZSsrO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnYgPSAxMDE7XG4gICAgdGhpcy52YWx1ZSA9IDA7XG4gICAgdGhpcy5jID0gb3guZW50aXRpZXMuc3Bhd24oJ2NvdW50ZXInKTtcbiAgfSxcbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52YWx1ZSsrO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnggPSAwO1xuICB9LFxuXG4gIGRyYXc6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLngrKztcbiAgICBveC5jYW52YXMuZmlsbFN0eWxlID0gJ2JsdWUnXG4gICAgb3guY2FudmFzLmZpbGxSZWN0KDgwLCA4MCwgMTAwLCAyMDApXG4gICAgb3guY2FudmFzLnN0cm9rZVN0eWxlID0gJ2dyZXknXG4gICAgb3guY2FudmFzLnN0cm9rZVJlY3QoODAsIDgwLCAxMDAsIDIwMClcbiAgICBveC5jYW52YXMuZHJhd1Nwcml0ZSgncG9ueScsIHRoaXMueCwgMCk7XG4gICAgb3guY2FudmFzLmRyYXdTcHJpdGUoJ3BvbnknLCB0aGlzLnggKyAxMCwgMCk7XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc3JjV2lkdGggPSBveC5pbWFnZXNbdGhpcy5zcmNdLndpZHRoO1xuICAgIHRoaXMud2lkdGggPSB0aGlzLndpZHRoIHx8IHRoaXMuc3JjV2lkdGg7XG4gICAgdGhpcy5zcmNIZWlnaHQgPSBveC5pbWFnZXNbdGhpcy5zcmNdLmhlaWdodDtcbiAgICB0aGlzLmhlaWdodCA9IHRoaXMuaGVpZ2h0IHx8IHRoaXMuc3JjSGVpZ2h0O1xuICAgIHRoaXMueCA9IHRoaXMueCB8fCAwO1xuICAgIHRoaXMueSA9IHRoaXMueSB8fCAwO1xuICAgIGlmICh0aGlzLmFuaW1hdGlvbikge1xuICAgICAgdGhpcy5pbml0QW5pbWF0aW9uKCk7XG4gICAgICB0aGlzLnVwZGF0ZSA9IHRoaXMudXBkYXRlQW5pbWF0aW9uO1xuICAgICAgdGhpcy5kcmF3ID0gdGhpcy5kcmF3QW5pbWF0aW9uO1xuICAgIH1cbiAgfSxcblxuICBkcmF3OiBmdW5jdGlvbiAoKSB7XG4gICAgb3guY2FudmFzLmRyYXdTcHJpdGUodGhpcy5zcmMsIHRoaXMueCwgdGhpcy55KTtcbiAgfSxcblxuICBkcmF3QW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgb3guY2FudmFzLmRyYXdTcHJpdGUodGhpcy5zcmMsIHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdGhpcy5mcmFtZXNbdGhpcy5mcmFtZV0pO1xuICB9LFxuXG4gIGluaXRBbmltYXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlzUGxheWluZyA9IHRydWU7XG4gICAgdGhpcy5pc0ZpbmlzaGVkID0gZmFsc2U7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmxvb3AgIT09ICdib29sZWFuJykgdGhpcy5sb29wID0gdHJ1ZTtcbiAgICB0aGlzLmNvdW50ZXIgPSAwO1xuICAgIHRoaXMuZnJhbWVSYXRlID0gNjAgLyB0aGlzLmZyYW1lUmF0ZSB8fCAxO1xuICAgIHRoaXMuY2FsY3VsYXRlRnJhbWVzKCk7XG5cbiAgICBpZiAodGhpcy5hbmltYXRpb25zKSB7XG4gICAgICB0aGlzLmFuaW1hdGlvbkFycmF5ID0gdGhpcy5hbmltYXRpb25zW3RoaXMuYW5pbWF0aW9uXVxuICAgICAgdGhpcy5hcnJheUNvdW50ZXIgPSAwO1xuICAgICAgdGhpcy5mcmFtZSA9IHRoaXMuYW5pbWF0aW9uQXJyYXlbdGhpcy5hcnJheUNvdW50ZXJdO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZyYW1lID0gMDtcbiAgICB9XG4gIH0sXG5cbiAgY2FsY3VsYXRlRnJhbWVzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHggPSB5ID0gMDtcbiAgICB0aGlzLmZyYW1lcyA9IFtbMCwgMF1dO1xuXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCB0aGlzLnNyY0hlaWdodCAvIHRoaXMuaGVpZ2h0ICogdGhpcy5zcmNXaWR0aCAvIHRoaXMud2lkdGg7IGkrKykge1xuICAgICAgaWYgKHggPCB0aGlzLnNyY1dpZHRoIC8gdGhpcy53aWR0aCAtIDEpIHtcbiAgICAgICAgeCsrO1xuICAgICAgfSBlbHNlIGlmICh5IDwgdGhpcy5zcmNIZWlnaHQgLyB0aGlzLmhlaWdodCAtIDEpIHtcbiAgICAgICAgeSsrO1xuICAgICAgICB4ID0gMDtcbiAgICAgIH1cbiAgICAgIHRoaXMuZnJhbWVzLnB1c2goW3gsIHldKTtcbiAgICB9XG4gIH0sXG5cbiAgdXBkYXRlQW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLmlzUGxheWluZykgcmV0dXJuO1xuICAgIGlmICh0aGlzLmlzRmluaXNoZWQpIHJldHVybiB0aGlzLmZpbmlzaGVkKCk7XG4gICAgdGhpcy5jb3VudGVyICs9IDE7XG4gICAgaWYgKHRoaXMuY291bnRlciA+IHRoaXMuZnJhbWVSYXRlKSB7XG4gICAgICB0aGlzLmNvdW50ZXIgPSAwO1xuICAgICAgaWYgKHRoaXMuYW5pbWF0aW9ucykgdGhpcy5tdWx0aXBsZUFuaW1hdGlvbnMoKTtcbiAgICAgIGVsc2UgdGhpcy5zaW5nbGVBbmltYXRpb24oKTtcbiAgICB9XG4gIH0sXG5cbiAgbXVsdGlwbGVBbmltYXRpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuYXJyYXlDb3VudGVyID09PSB0aGlzLmFuaW1hdGlvbkFycmF5Lmxlbmd0aCAtIDEpIHtcbiAgICAgIGlmICghdGhpcy5sb29wKSB0aGlzLmlzRmluaXNoZWQgPSB0cnVlO1xuICAgICAgdGhpcy5mcmFtZSA9IHRoaXMuYW5pbWF0aW9uQXJyYXlbMF1cbiAgICAgIHRoaXMuYXJyYXlDb3VudGVyID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5hcnJheUNvdW50ZXIrKztcbiAgICAgIHRoaXMuZnJhbWUgPSB0aGlzLmFuaW1hdGlvbkFycmF5W3RoaXMuYXJyYXlDb3VudGVyXVxuICAgIH1cbiAgfSxcblxuICBzaW5nbGVBbmltYXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5mcmFtZSA9PT0gKHRoaXMuZnJhbWVzLmxlbmd0aCAtIDEpKSB7XG4gICAgICBpZiAoIXRoaXMubG9vcCkgdGhpcy5pc0ZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuZnJhbWUgPSAwXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZnJhbWUgKz0gMTtcbiAgICB9XG4gIH0sXG5cbiAgZmluaXNoZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnN0b3AoKTtcbiAgICB0aGlzLnVwZGF0ZSA9IG51bGw7XG4gICAgaWYgKHRoaXMub25GaW5pc2gpIHRoaXMub25GaW5pc2goKTtcbiAgfSxcblxuICBwbGF5OiBmdW5jdGlvbiAoYW5pbWF0aW9uLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBvcHRpb25zKSB7XG4gICAgICAgIHRoaXNba2V5XSA9IG9wdGlvbnNba2V5XVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmFuaW1hdGlvbnMpIHtcbiAgICAgIGlmIChhbmltYXRpb24pIHRoaXMuYW5pbWF0aW9uID0gYW5pbWF0aW9uO1xuICAgICAgdGhpcy5hbmltYXRpb25BcnJheSA9IHRoaXMuYW5pbWF0aW9uc1t0aGlzLmFuaW1hdGlvbl07XG4gICAgICB0aGlzLmFycmF5Q291bnRlciA9IDA7XG4gICAgICB0aGlzLmZyYW1lID0gdGhpcy5hbmltYXRpb25BcnJheVt0aGlzLmFycmF5Q291bnRlcl07XG4gICAgfVxuXG4gICAgdGhpcy5pc0ZpbmlzaGVkID0gZmFsc2U7XG4gICAgdGhpcy5pc1BsYXlpbmcgPSB0cnVlO1xuICB9LFxuXG4gIHN0b3A6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlzUGxheWluZyA9IGZhbHNlO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGxvYWRpbmc6IHJlcXVpcmUoJy4vc2NlbmVzL2xvYWRpbmcuanMnKSxcbiAgbWFpbjogcmVxdWlyZSgnLi9zY2VuZXMvbWFpbi5qcycpXG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICBveC5wcmVsb2FkZXIubG9hZChyZXF1aXJlKCcuLi9hc3NldHMuanMnKSk7XG4gICAgdGhpcy5iYXJMZW5ndGggPSBveC5wcmVsb2FkZXIuYXNzZXRzVG9Mb2FkO1xuICB9LFxuXG4gIGRyYXc6IGZ1bmN0aW9uICgpIHtcbiAgICBveC5jYW52YXMuZmlsbFN0eWxlID0gXCJibGFja1wiXG4gICAgb3guY2FudmFzLmZpbGxSZWN0KDAsIDAsIG94LmNhbnZhcy53aWR0aCwgb3guY2FudmFzLmhlaWdodClcbiAgICBveC5jYW52YXMuZmlsbFN0eWxlID0gXCJyZ2IoNDYsIDIzOCwgMjQ1KVwiXG4gICAgb3guY2FudmFzLmZpbGxSZWN0KG94LmNhbnZhcy53aWR0aCAvIDQsIDIgKiBveC5jYW52YXMuaGVpZ2h0IC8gMywgb3guY2FudmFzLndpZHRoIC8gMiwgMSlcbiAgICBveC5jYW52YXMuZmlsbFN0eWxlID0gXCJncmV5XCJcbiAgICBveC5jYW52YXMuc2F2ZSgpXG4gICAgb3guY2FudmFzLnRyYW5zbGF0ZShveC5jYW52YXMud2lkdGggLyA0LCAyICogb3guY2FudmFzLmhlaWdodCAvIDMpXG4gICAgb3guY2FudmFzLnNjYWxlKC0xLCAxKVxuICAgIG94LmNhbnZhcy5maWxsUmVjdCgtb3guY2FudmFzLndpZHRoIC8gMiwgMCwgb3guY2FudmFzLndpZHRoIC8gMiAqIG94LnByZWxvYWRlci5hc3NldHNUb0xvYWQgLyB0aGlzLmJhckxlbmd0aCwgMSlcbiAgICBveC5jYW52YXMucmVzdG9yZSgpXG4gICAgb3guY2FudmFzLmZpbGxTdHlsZSA9IFwid2hpdGVcIlxuICAgIG94LmNhbnZhcy5mb250ID0gJzIwMCUgc2Fucy1zZXJpZidcbiAgICBveC5jYW52YXMuZmlsbFRleHQoJ2xvYWRpbmcuLi4nLCBveC5jYW52YXMud2lkdGggLyAyIC0gNjgsIG94LmNhbnZhcy5oZWlnaHQgLyAyICsgMTApO1xuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmIChveC5wcmVsb2FkZXIuYXNzZXRzVG9Mb2FkID09PSAwKSBveC5zY2VuZXMuc2V0KCdtYWluJyk7XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciB0ZXN0ID0gb3guc3Bhd24oJ2NvdW50ZXIyJyk7XG4gICAgdGhpcy54ID0gMDtcbiAgICB0aGlzLnBvbmV5ID0gb3guc3Bhd24oJ3BvbmV5Jyk7XG5cbiAgICAvLyAgICB0aGlzLnNwcml0ZTMgPSBveC5zcHJpdGUoJ2NvaW4yJywge1xuICAgIC8vICAgICAgeDogMjAsXG4gICAgLy8gICAgICBhbmltYXRpb246ICdzcGluJyxcbiAgICAvLyAgICAgIGhlaWdodDogNDAsXG4gICAgLy8gICAgICB3aWR0aDogNDRcbiAgICAvLyAgICB9KTtcbiAgICAvL1xuICAgIC8vICAgIHRoaXMuc3ByaXRlID0gb3guc3ByaXRlKCdjb2luMicsIHtcbiAgICAvLyAgICAgIGFuaW1hdGlvbjogJ3NwaW4yJyxcbiAgICAvLyAgICAgIGxvb3A6IGZhbHNlLFxuICAgIC8vICAgICAgaGVpZ2h0OiA0MCxcbiAgICAvLyAgICAgIHdpZHRoOiA0NFxuICAgIC8vICAgIH0pO1xuICAgIHRoaXMudGVzdCA9IG94LnNwcml0ZSgncG9ueScpO1xuXG4gICAgdGhpcy5zcHJpdGUyID0gb3guc3ByaXRlKCdjb2luMicsIHtcbiAgICAgIHg6IDgwLFxuICAgICAgeTogMSxcbiAgICAgIGFuaW1hdGlvbjogJ3NwaW4nLFxuICAgICAgYW5pbWF0aW9uczoge1xuICAgICAgICBzcGluOiBbMCwgMSwgMiwgMywgNCwgNCwgNCwgNCwgNSwgNiwgNywgOF0sXG4gICAgICAgIGlkbGU6IFs4LCA0LCA4LCA0LCA4LCA0LCA4LCA0LCA4LCA0LCA4LCA0LCA4LCA0LCA4LCA0XVxuICAgICAgfSxcbiAgICAgIGhlaWdodDogNDAsXG4gICAgICBmcmFtZVJhdGU6IDYwLFxuICAgICAgd2lkdGg6IDQ0XG4gICAgfSk7XG5cbiAgICB0aGlzLnNwcml0ZTIucGxheSgnc3BpbicsIHtcbiAgICAgIGxvb3A6IGZhbHNlLFxuICAgICAgb25GaW5pc2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy54ID0gMTA7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiRmluaXNoZWQhXCIpXG4gICAgICAgIHRoaXMuZGVzdHJveSgpO1xuICAgICAgICBveC5zY2VuZXMuY3VycmVudC50ZXN0aW5nKCk7XG4gICAgICB9LFxuICAgICAgb25TdGFydDogZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImFuaW1hdGlvbiBzdGFydGVkIVwiKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICB9LFxuICB0ZXN0aW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coXCJJIHdhcyBjYWxsZWQhXCIpXG5cbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuXG4gICAgdGhpcy54ICs9IDEwXG4gICAgaWYgKHRoaXMueCA+IDMwMCkgdGhpcy54IC09IDQwMDtcbiAgICBpZiAodGhpcy54IDwgMzk5ICYmICF0aGlzLmlzUGxheWluZykge1xuICAgICAgdGhpcy5zcHJpdGUyLnBsYXkoJ3NwaW4nLCB0cnVlKTtcbiAgICAgIHRoaXMuaXNQbGF5aW5nID0gdHJ1ZTtcbiAgICB9XG4gIH1cbn07XG4iXX0=
