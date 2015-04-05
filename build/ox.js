(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/otto/Dropbox/GameDev/JavaScript/ox/src/assets.js":[function(require,module,exports){
module.exports = {
  images: [
    'pony',
    'pony2',
    'pony3',
    'pony4',
    'pony5',
    'coin',
    'coinTwisted',
    'coin2'],

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
    input: require('./input'),
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
      return this.entities.spawn(name, options);
    }
  };
  this.onkeydown = ox.input.keyDown.bind(ox.input);
  this.onkeyup = ox.input.keyUp.bind(ox.input);

  ox.loop.calculateDelta();
  ox.scenes.set('loading');
  ox.loop.run();
};

},{"./canvas":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/canvas.js","./entitiesManager":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/entitiesManager.js","./gameLoop":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/gameLoop.js","./input":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/input.js","./loader":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/loader.js","./localStorage":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/localStorage.js","./mouse":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/mouse.js","./scenesManager":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/scenesManager.js"}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/entitiesManager.js":[function(require,module,exports){
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
      if (entity.isAlive && entity.draw) entity.draw(dt);
    }
    //    ox.canvas.restore();
  },

  update: function (dt) {
    if (scenes.current.update) scenes.current.update(dt);
    for (var i = 0, len = entities.current.length; i < len; i++) {
      var entity = entities.current[i];
      if (entity.isAlive && entity.update) entity.update(dt);
    }
  }
}

},{"./canvas":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/canvas.js","./entitiesManager":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/entitiesManager.js","./scenesManager":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/scenesManager.js"}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/input.js":[function(require,module,exports){
var scene = require('./scenesManager');

module.exports = {
  isPressed: {},
  keyDown: function (e) {
    if (scene.current.keyDown) scene.current.keyDown(this.keys[e.keyCode]);
    this.keyPress(e);
  },
  keyPress: function (e) {
    if (this.isPressed[e.keyCode]) return;
    if (scene.current.keyPress) scene.current.keyPress(this.keys[e.keyCode]);
    this.isPressed[e.keyCode] = true;
  },
  keyUp: function (e) {
    if (scene.current.keyUp) scene.current.keyUp(this.keys[e.keyCode]);
    this.isPressed[e.keyCode] = false;
  },

  keys: {
    8: 'backspace',
    9: 'tab',
    13: 'enter',
    16: 'shift',
    17: 'ctrl',
    18: 'alt',
    19: 'pause',
    20: 'caps_lock',
    27: 'esc',
    32: 'spacebar',
    33: 'page_up',
    34: 'page_down',
    35: 'end',
    36: 'home',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    44: 'print_screen',
    45: 'insert',
    46: 'delete',
    48: '0',
    49: '1',
    50: '2',
    51: '3',
    52: '4',
    53: '5',
    54: '6',
    55: '7',
    56: '8',
    57: '9',
    65: 'a',
    66: 'b',
    67: 'c',
    68: 'd',
    69: 'e',
    70: 'f',
    71: 'g',
    72: 'h',
    73: 'i',
    74: 'j',
    75: 'k',
    76: 'l',
    77: 'm',
    78: 'n',
    79: 'o',
    80: 'p',
    81: 'q',
    82: 'r',
    83: 's',
    84: 't',
    85: 'u',
    86: 'v',
    87: 'w',
    88: 'x',
    89: 'y',
    90: 'z',
    96: 'num_zero',
    97: 'num_one',
    98: 'num_two',
    99: 'num_three',
    100: 'num_four',
    101: 'num_five',
    102: 'num_six',
    103: 'num_seven',
    104: 'num_eight',
    105: 'num_nine',
    106: 'num_multiply',
    107: 'num_plus',
    109: 'num_minus',
    110: 'num_period',
    111: 'num_division',
    112: 'f1',
    113: 'f2',
    114: 'f3',
    115: 'f4',
    116: 'f5',
    117: 'f6',
    118: 'f7',
    119: 'f8',
    120: 'f9',
    121: 'f10',
    122: 'f11',
    123: 'f12',
    186: 'semicolon',
    187: 'plus',
    189: 'minus',
    192: 'grave_accent',
    222: 'single_quote'
  }
}

},{"./scenesManager":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/scenesManager.js"}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/loader.js":[function(require,module,exports){
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

  draw: function () {
    ox.canvas.drawSprite(this.src, this.x, this.y);
  },

  drawAnimation: function () {
    ox.canvas.drawSprite(this.src, this.x, this.y, this.width, this.height, this.frames[this.frame]);
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
    this.poney = ox.spawn('poney');
    this.staticPony = ox.sprite('pony');
    this.sprite2 = ox.sprite('coin2', {
      x: 80,
      y: 1,
      animation: 'spin',
      animations: {
        spin: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        idle: [8, 4, 8, 4, 8, 4, 8, 4, 8, 4, 8, 4, 8, 4, 8, 4]
      },
      height: 40,
      frameRate: 30,
      width: 44,
      onFinish: function () {
        this.x = 10;
        this.destroy();
        ox.scenes.current.testing();
      }
    });

    this.sprite2.play('spin', {
      loop: false
    });

  },
  testing: function () {
    console.log("I was called when the animation ended.")
  },

  update: function (dt) {

  },

  keyDown: function (key) {
    console.log("keyDown!" + key)
  },

  keyPress: function (key) {
    console.log("keyPress!" + key)
  },

  keyUp: function (key) {
    console.log("keyUp! " + key)
  }
};

},{}]},{},["/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/core.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXNzZXRzLmpzIiwic3JjL2VuZ2luZS9jYW52YXMuanMiLCJzcmMvZW5naW5lL2NvcmUuanMiLCJzcmMvZW5naW5lL2VudGl0aWVzTWFuYWdlci5qcyIsInNyYy9lbmdpbmUvZ2FtZUxvb3AuanMiLCJzcmMvZW5naW5lL2lucHV0LmpzIiwic3JjL2VuZ2luZS9sb2FkZXIuanMiLCJzcmMvZW5naW5lL2xvY2FsU3RvcmFnZS5qcyIsInNyYy9lbmdpbmUvbW91c2UuanMiLCJzcmMvZW5naW5lL3NjZW5lc01hbmFnZXIuanMiLCJzcmMvZW50aXRpZXMuanMiLCJzcmMvZW50aXRpZXMvY291bnRlci5qcyIsInNyYy9lbnRpdGllcy9jb3VudGVyMi5qcyIsInNyYy9lbnRpdGllcy9wb25leS5qcyIsInNyYy9lbnRpdGllcy9zcHJpdGUuanMiLCJzcmMvc2NlbmVzLmpzIiwic3JjL3NjZW5lcy9sb2FkaW5nLmpzIiwic3JjL3NjZW5lcy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGltYWdlczogW1xuICAgICdwb255JyxcbiAgICAncG9ueTInLFxuICAgICdwb255MycsXG4gICAgJ3Bvbnk0JyxcbiAgICAncG9ueTUnLFxuICAgICdjb2luJyxcbiAgICAnY29pblR3aXN0ZWQnLFxuICAgICdjb2luMiddLFxuXG4gIGRhdGE6IFsnZXhhbXBsZSddLFxuXG4gIGF1ZGlvOiBbXVxufVxuIiwidmFyIGltYWdlcyA9IHJlcXVpcmUoJy4vbG9hZGVyJykuaW1hZ2VzLFxuICBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJykuZ2V0Q29udGV4dCgnMmQnKTtcbmNhbnZhcy5kcmF3U3ByaXRlID0gZnVuY3Rpb24gKHNyYywgeCwgeSwgd2lkdGgsIGhlaWdodCwgZnJhbWUpIHtcbiAgaWYgKHR5cGVvZiB3aWR0aCA9PT0gJ251bWJlcicpIHtcbiAgICBjYW52YXMuZHJhd0ltYWdlKFxuICAgICAgaW1hZ2VzW3NyY10sXG4gICAgICB3aWR0aCAqIGZyYW1lWzBdLFxuICAgICAgaGVpZ2h0ICogZnJhbWVbMV0sXG4gICAgICB3aWR0aCwgaGVpZ2h0LCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcbiAgfSBlbHNlIHtcbiAgICBjYW52YXMuZHJhd0ltYWdlKGltYWdlc1tzcmNdLCB4LCB5KTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjYW52YXM7XG4iLCJ3aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLm94ID0ge1xuICAgIGNhbnZhczogcmVxdWlyZSgnLi9jYW52YXMnKSxcbiAgICBpbWFnZXM6IHJlcXVpcmUoJy4vbG9hZGVyJykuaW1hZ2VzLFxuICAgIGF1ZGlvOiByZXF1aXJlKCcuL2xvYWRlcicpLmF1ZGlvLFxuICAgIGRhdGE6IHJlcXVpcmUoJy4vbG9hZGVyJykuZGF0YSxcbiAgICBpbnB1dDogcmVxdWlyZSgnLi9pbnB1dCcpLFxuICAgIG1vdXNlOiByZXF1aXJlKCcuL21vdXNlJyksXG4gICAgc2NlbmVzOiByZXF1aXJlKCcuL3NjZW5lc01hbmFnZXInKSxcbiAgICBlbnRpdGllczogcmVxdWlyZSgnLi9lbnRpdGllc01hbmFnZXInKSxcbiAgICBzYXZlOiByZXF1aXJlKCcuL2xvY2FsU3RvcmFnZScpLFxuICAgIGxvb3A6IHJlcXVpcmUoJy4vZ2FtZUxvb3AnKSxcbiAgICBwcmVsb2FkZXI6IHJlcXVpcmUoJy4vbG9hZGVyJyksXG4gICAgc3ByaXRlOiBmdW5jdGlvbiAoc3JjLCBvcHRpb25zKSB7XG4gICAgICB2YXIgb2JqID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgIG9iai5zcmMgPSBzcmM7XG4gICAgICByZXR1cm4gdGhpcy5lbnRpdGllcy5zcGF3bignc3ByaXRlJywgb2JqKTtcbiAgICB9LFxuICAgIHNwYXduOiBmdW5jdGlvbiAobmFtZSwgb3B0aW9ucykge1xuICAgICAgdGhpcy5saXN0ID0gdGhpcy5lbnRpdGllcy5saXN0O1xuICAgICAgcmV0dXJuIHRoaXMuZW50aXRpZXMuc3Bhd24obmFtZSwgb3B0aW9ucyk7XG4gICAgfVxuICB9O1xuICB0aGlzLm9ua2V5ZG93biA9IG94LmlucHV0LmtleURvd24uYmluZChveC5pbnB1dCk7XG4gIHRoaXMub25rZXl1cCA9IG94LmlucHV0LmtleVVwLmJpbmQob3guaW5wdXQpO1xuXG4gIG94Lmxvb3AuY2FsY3VsYXRlRGVsdGEoKTtcbiAgb3guc2NlbmVzLnNldCgnbG9hZGluZycpO1xuICBveC5sb29wLnJ1bigpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBjdXJyZW50OiBbXSxcbiAgbGlzdDogcmVxdWlyZSgnLi4vZW50aXRpZXMnKSxcbiAgZGlydHlaOiBmYWxzZSxcbiAgc3Bhd246IGZ1bmN0aW9uIChuYW1lLCBvcHRpb25zKSB7XG4gICAgaWYgKCF0aGlzLmxpc3RbbmFtZV0pIHRocm93IG5ldyBFcnJvcihcIkVudGl0eSAnXCIgKyBuYW1lICsgXCInIGRvZXMgbm90IGV4aXN0IGFuZCBjYW5ub3QgYmUgc3Bhd25lZC5cIik7XG4gICAgdmFyIG9iaiA9IG9wdGlvbnMgfHwge307XG4gICAgZm9yICh2YXIga2V5IGluIHRoaXMubGlzdFtuYW1lXSkge1xuICAgICAgb2JqW2tleV0gPSB0aGlzLmxpc3RbbmFtZV1ba2V5XTtcbiAgICB9XG4gICAgb2JqLmRlc3Ryb3kgPSB0aGlzLmRlc3Ryb3kuYmluZChvYmopO1xuICAgIG9iai5yZXZpdmUgPSB0aGlzLnJldml2ZS5iaW5kKG9iaik7XG4gICAgb2JqLmlzQWxpdmUgPSB0cnVlO1xuICAgIHRoaXMuY3VycmVudC5wdXNoKG9iaik7XG4gICAgaWYgKG9iai5pbml0KSB7XG4gICAgICBvYmouaW5pdCgpO1xuICAgIH07XG4gICAgb2JqLmlzUmVhZHkgPSB0cnVlXG4gICAgcmV0dXJuIG9iajtcbiAgfSxcbiAgY2hlY2taOiBmdW5jdGlvbiAoZW50aXR5KSB7XG4gICAgaWYgKHR5cGVvZiBlbnRpdHkueiA9PT0gJ3VuZGVmaW5lZCcpIGVudGl0eS56ID0gMDtcbiAgICBpZiAoZW50aXR5LnogIT09IGVudGl0eS5sYXN0Wikge1xuICAgICAgZW50aXR5Lmxhc3RaID0gZW50aXR5Lno7XG4gICAgICB0aGlzLmRpcnR5WiA9IHRydWU7XG4gICAgfVxuICB9LFxuICBzb3J0QnlaOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jdXJyZW50LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIHJldHVybiBhLnogLSBiLno7XG4gICAgfSk7XG4gIH0sXG4gIGRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlzQWxpdmUgPSBmYWxzZTtcbiAgfSxcbiAgcmV2aXZlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pc0FsaXZlID0gdHJ1ZTtcbiAgfVxufTtcbiIsInZhciBlbnRpdGllcyA9IHJlcXVpcmUoJy4vZW50aXRpZXNNYW5hZ2VyJyksXG4gIHNjZW5lcyA9IHJlcXVpcmUoJy4vc2NlbmVzTWFuYWdlcicpLFxuICBjb250ZXh0ID0gcmVxdWlyZSgnLi9jYW52YXMnKTtcbnZhciBjYW1lcmEgPSB7XG4gIHg6IDEsXG4gIHk6IDIwXG59XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc3BlZWQ6IDEsXG4gIGR0OiAwLFxuICBzdGVwOiAxIC8gNjAsXG4gIGxhc3REZWx0YTogbmV3IERhdGUoKSxcbiAgbm93OiBuZXcgRGF0ZSgpLFxuICBjYWxjdWxhdGVEZWx0YTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMubGFzdERlbHRhID0gdGhpcy5ub3c7XG4gICAgdGhpcy5ub3cgPSBuZXcgRGF0ZSgpO1xuICAgIHRoaXMuZHQgKz0gTWF0aC5taW4oMSwgKHRoaXMubm93IC0gdGhpcy5sYXN0RGVsdGEpIC8gMTAwMCkgKiB0aGlzLnNwZWVkO1xuICB9LFxuICBydW46IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmNhbGN1bGF0ZURlbHRhKCk7XG5cbiAgICBpZiAoZW50aXRpZXMuZGlydHlaKSB7XG4gICAgICBlbnRpdGllcy5zb3J0QnlaKCk7XG4gICAgICBlbnRpdGllcy5kaXJ0eVogPSBmYWxzZTtcbiAgICB9XG5cbiAgICB3aGlsZSAodGhpcy5kdCA+IHRoaXMuc3RlcCkge1xuICAgICAgdGhpcy5kdCAtPSB0aGlzLnN0ZXA7XG4gICAgICB0aGlzLnVwZGF0ZSh0aGlzLnN0ZXApO1xuICAgIH1cbiAgICB0aGlzLmRyYXcodGhpcy5kdCk7XG5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5ydW4uYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgZHJhdzogZnVuY3Rpb24gKGR0KSB7XG4gICAgdmFyIHRpbWUgPSBuZXcgRGF0ZTtcbiAgICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBjb250ZXh0LmNhbnZhcy53aWR0aCwgY29udGV4dC5jYW52YXMuaGVpZ2h0KTtcbiAgICAvLyAgICBveC5jYW52YXMuc2F2ZSgpO1xuICAgIC8vICAgIGNhbWVyYS55ICs9IC41O1xuICAgIC8vICAgIGlmIChjYW1lcmEueSA+IDMwKSBjYW1lcmEueSA9IC0xMDtcbiAgICAvLyAgICBveC5jYW52YXMudHJhbnNsYXRlKGNhbWVyYS54LCBjYW1lcmEueSk7XG5cbiAgICBpZiAoc2NlbmVzLmN1cnJlbnQuZHJhdykgc2NlbmVzLmN1cnJlbnQuZHJhdyhkdCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGVudGl0aWVzLmN1cnJlbnQubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHZhciBlbnRpdHkgPSBlbnRpdGllcy5jdXJyZW50W2ldO1xuICAgICAgaWYgKGVudGl0eS5pc0FsaXZlICYmIGVudGl0eS5kcmF3KSBlbnRpdHkuZHJhdyhkdCk7XG4gICAgfVxuICAgIC8vICAgIG94LmNhbnZhcy5yZXN0b3JlKCk7XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcbiAgICBpZiAoc2NlbmVzLmN1cnJlbnQudXBkYXRlKSBzY2VuZXMuY3VycmVudC51cGRhdGUoZHQpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBlbnRpdGllcy5jdXJyZW50Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB2YXIgZW50aXR5ID0gZW50aXRpZXMuY3VycmVudFtpXTtcbiAgICAgIGlmIChlbnRpdHkuaXNBbGl2ZSAmJiBlbnRpdHkudXBkYXRlKSBlbnRpdHkudXBkYXRlKGR0KTtcbiAgICB9XG4gIH1cbn1cbiIsInZhciBzY2VuZSA9IHJlcXVpcmUoJy4vc2NlbmVzTWFuYWdlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNQcmVzc2VkOiB7fSxcbiAga2V5RG93bjogZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoc2NlbmUuY3VycmVudC5rZXlEb3duKSBzY2VuZS5jdXJyZW50LmtleURvd24odGhpcy5rZXlzW2Uua2V5Q29kZV0pO1xuICAgIHRoaXMua2V5UHJlc3MoZSk7XG4gIH0sXG4gIGtleVByZXNzOiBmdW5jdGlvbiAoZSkge1xuICAgIGlmICh0aGlzLmlzUHJlc3NlZFtlLmtleUNvZGVdKSByZXR1cm47XG4gICAgaWYgKHNjZW5lLmN1cnJlbnQua2V5UHJlc3MpIHNjZW5lLmN1cnJlbnQua2V5UHJlc3ModGhpcy5rZXlzW2Uua2V5Q29kZV0pO1xuICAgIHRoaXMuaXNQcmVzc2VkW2Uua2V5Q29kZV0gPSB0cnVlO1xuICB9LFxuICBrZXlVcDogZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoc2NlbmUuY3VycmVudC5rZXlVcCkgc2NlbmUuY3VycmVudC5rZXlVcCh0aGlzLmtleXNbZS5rZXlDb2RlXSk7XG4gICAgdGhpcy5pc1ByZXNzZWRbZS5rZXlDb2RlXSA9IGZhbHNlO1xuICB9LFxuXG4gIGtleXM6IHtcbiAgICA4OiAnYmFja3NwYWNlJyxcbiAgICA5OiAndGFiJyxcbiAgICAxMzogJ2VudGVyJyxcbiAgICAxNjogJ3NoaWZ0JyxcbiAgICAxNzogJ2N0cmwnLFxuICAgIDE4OiAnYWx0JyxcbiAgICAxOTogJ3BhdXNlJyxcbiAgICAyMDogJ2NhcHNfbG9jaycsXG4gICAgMjc6ICdlc2MnLFxuICAgIDMyOiAnc3BhY2ViYXInLFxuICAgIDMzOiAncGFnZV91cCcsXG4gICAgMzQ6ICdwYWdlX2Rvd24nLFxuICAgIDM1OiAnZW5kJyxcbiAgICAzNjogJ2hvbWUnLFxuICAgIDM3OiAnbGVmdCcsXG4gICAgMzg6ICd1cCcsXG4gICAgMzk6ICdyaWdodCcsXG4gICAgNDA6ICdkb3duJyxcbiAgICA0NDogJ3ByaW50X3NjcmVlbicsXG4gICAgNDU6ICdpbnNlcnQnLFxuICAgIDQ2OiAnZGVsZXRlJyxcbiAgICA0ODogJzAnLFxuICAgIDQ5OiAnMScsXG4gICAgNTA6ICcyJyxcbiAgICA1MTogJzMnLFxuICAgIDUyOiAnNCcsXG4gICAgNTM6ICc1JyxcbiAgICA1NDogJzYnLFxuICAgIDU1OiAnNycsXG4gICAgNTY6ICc4JyxcbiAgICA1NzogJzknLFxuICAgIDY1OiAnYScsXG4gICAgNjY6ICdiJyxcbiAgICA2NzogJ2MnLFxuICAgIDY4OiAnZCcsXG4gICAgNjk6ICdlJyxcbiAgICA3MDogJ2YnLFxuICAgIDcxOiAnZycsXG4gICAgNzI6ICdoJyxcbiAgICA3MzogJ2knLFxuICAgIDc0OiAnaicsXG4gICAgNzU6ICdrJyxcbiAgICA3NjogJ2wnLFxuICAgIDc3OiAnbScsXG4gICAgNzg6ICduJyxcbiAgICA3OTogJ28nLFxuICAgIDgwOiAncCcsXG4gICAgODE6ICdxJyxcbiAgICA4MjogJ3InLFxuICAgIDgzOiAncycsXG4gICAgODQ6ICd0JyxcbiAgICA4NTogJ3UnLFxuICAgIDg2OiAndicsXG4gICAgODc6ICd3JyxcbiAgICA4ODogJ3gnLFxuICAgIDg5OiAneScsXG4gICAgOTA6ICd6JyxcbiAgICA5NjogJ251bV96ZXJvJyxcbiAgICA5NzogJ251bV9vbmUnLFxuICAgIDk4OiAnbnVtX3R3bycsXG4gICAgOTk6ICdudW1fdGhyZWUnLFxuICAgIDEwMDogJ251bV9mb3VyJyxcbiAgICAxMDE6ICdudW1fZml2ZScsXG4gICAgMTAyOiAnbnVtX3NpeCcsXG4gICAgMTAzOiAnbnVtX3NldmVuJyxcbiAgICAxMDQ6ICdudW1fZWlnaHQnLFxuICAgIDEwNTogJ251bV9uaW5lJyxcbiAgICAxMDY6ICdudW1fbXVsdGlwbHknLFxuICAgIDEwNzogJ251bV9wbHVzJyxcbiAgICAxMDk6ICdudW1fbWludXMnLFxuICAgIDExMDogJ251bV9wZXJpb2QnLFxuICAgIDExMTogJ251bV9kaXZpc2lvbicsXG4gICAgMTEyOiAnZjEnLFxuICAgIDExMzogJ2YyJyxcbiAgICAxMTQ6ICdmMycsXG4gICAgMTE1OiAnZjQnLFxuICAgIDExNjogJ2Y1JyxcbiAgICAxMTc6ICdmNicsXG4gICAgMTE4OiAnZjcnLFxuICAgIDExOTogJ2Y4JyxcbiAgICAxMjA6ICdmOScsXG4gICAgMTIxOiAnZjEwJyxcbiAgICAxMjI6ICdmMTEnLFxuICAgIDEyMzogJ2YxMicsXG4gICAgMTg2OiAnc2VtaWNvbG9uJyxcbiAgICAxODc6ICdwbHVzJyxcbiAgICAxODk6ICdtaW51cycsXG4gICAgMTkyOiAnZ3JhdmVfYWNjZW50JyxcbiAgICAyMjI6ICdzaW5nbGVfcXVvdGUnXG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbWFnZXM6IHt9LFxuICBkYXRhOiB7fSxcbiAgYXVkaW86IHt9LFxuICBhc3NldHNUb0xvYWQ6IDAsXG5cbiAgbG9hZEltYWdlOiBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRoaXMuaW1hZ2VzW25hbWVdID0gbmV3IEltYWdlKCk7XG4gICAgdGhpcy5pbWFnZXNbbmFtZV0ub25sb2FkID0gdGhpcy5hc3NldHNUb0xvYWQtLTtcbiAgICB0aGlzLmltYWdlc1tuYW1lXS5zcmMgPSBcImltYWdlcy9cIiArIG5hbWUgKyBcIi5wbmdcIjtcbiAgfSxcblxuICBsb2FkRGF0YTogZnVuY3Rpb24gKGZpbGUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3Q7XG4gICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCAmJiB4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgc2VsZi5kYXRhW2ZpbGVdID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgc2VsZi5hc3NldHNUb0xvYWQtLTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgeGhyLm9wZW4oXCJHRVRcIiwgXCJkYXRhL1wiICsgZmlsZSArIFwiLmpzb25cIik7XG4gICAgeGhyLnNlbmQoKTtcbiAgfSxcblxuICBsb2FkQXVkaW86IGZ1bmN0aW9uIChuYW1lKSB7fSxcblxuICBsb2FkOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgaWYgKG9iai5pbWFnZXMpIHtcbiAgICAgIHRoaXMuYXNzZXRzVG9Mb2FkICs9IG9iai5pbWFnZXMubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvYmouaW1hZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMubG9hZEltYWdlKG9iai5pbWFnZXNbaV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChvYmouZGF0YSkge1xuICAgICAgdGhpcy5hc3NldHNUb0xvYWQgKz0gb2JqLmRhdGEubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBvYmouZGF0YS5sZW5ndGg7IGorKykge1xuICAgICAgICB0aGlzLmxvYWREYXRhKG9iai5kYXRhW2pdKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAob2JqLmF1ZGlvKSB7XG4gICAgICB0aGlzLmFzc2V0c1RvTG9hZCArPSBvYmouYXVkaW8ubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBvYmouYXVkaW8ubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgdGhpcy5sb2FkQXVkaW8ob2JqLmF1ZGlvW2tdKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBzdG9yZTogZnVuY3Rpb24gKG51bSwgb2JqKSB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0obnVtLCBKU09OLnN0cmluZ2lmeShvYmopKTtcbiAgfSxcbiAgbG9hZDogZnVuY3Rpb24gKG51bSkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKG51bSkpO1xuICB9LFxuICByZW1vdmU6IGZ1bmN0aW9uIChudW0pIHtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShudW0pO1xuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgeDogMCxcbiAgeTogMFxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGN1cnJlbnQ6IG51bGwsXG4gIGxpc3Q6IHJlcXVpcmUoJy4uL3NjZW5lcycpLFxuICBzZXQ6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgaWYgKCF0aGlzLmxpc3RbbmFtZV0pIHRocm93IG5ldyBFcnJvcihcIlNjZW5lICdcIiArIG5hbWUgKyBcIicgZG9lcyBub3QgZXhpc3QhXCIpO1xuICAgIHRoaXMuY3VycmVudCA9IHRoaXMubGlzdFtuYW1lXTtcbiAgICBpZiAodGhpcy5jdXJyZW50LmluaXQpIHRoaXMuY3VycmVudC5pbml0KCk7XG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBzcHJpdGU6IHJlcXVpcmUoJy4vZW50aXRpZXMvc3ByaXRlLmpzJyksXG4gIGNvdW50ZXI6IHJlcXVpcmUoJy4vZW50aXRpZXMvY291bnRlci5qcycpLFxuICBjb3VudGVyMjogcmVxdWlyZSgnLi9lbnRpdGllcy9jb3VudGVyMi5qcycpLFxuICBwb25leTogcmVxdWlyZSgnLi9lbnRpdGllcy9wb25leS5qcycpXG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnZhbHVlID0gMTAwO1xuICB9LFxuICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnZhbHVlKys7XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudiA9IDEwMTtcbiAgICB0aGlzLnZhbHVlID0gMDtcbiAgICB0aGlzLmMgPSBveC5lbnRpdGllcy5zcGF3bignY291bnRlcicpO1xuICB9LFxuICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnZhbHVlKys7XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMueCA9IDA7XG4gIH0sXG5cbiAgZHJhdzogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMueCsrO1xuICAgIG94LmNhbnZhcy5maWxsU3R5bGUgPSAnYmx1ZSdcbiAgICBveC5jYW52YXMuZmlsbFJlY3QoODAsIDgwLCAxMDAsIDIwMClcbiAgICBveC5jYW52YXMuc3Ryb2tlU3R5bGUgPSAnZ3JleSdcbiAgICBveC5jYW52YXMuc3Ryb2tlUmVjdCg4MCwgODAsIDEwMCwgMjAwKVxuICAgIG94LmNhbnZhcy5kcmF3U3ByaXRlKCdwb255JywgdGhpcy54LCAwKTtcbiAgICBveC5jYW52YXMuZHJhd1Nwcml0ZSgncG9ueScsIHRoaXMueCArIDEwLCAwKTtcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zcmNXaWR0aCA9IG94LmltYWdlc1t0aGlzLnNyY10ud2lkdGg7XG4gICAgdGhpcy53aWR0aCA9IHRoaXMud2lkdGggfHwgdGhpcy5zcmNXaWR0aDtcbiAgICB0aGlzLnNyY0hlaWdodCA9IG94LmltYWdlc1t0aGlzLnNyY10uaGVpZ2h0O1xuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5oZWlnaHQgfHwgdGhpcy5zcmNIZWlnaHQ7XG4gICAgdGhpcy54ID0gdGhpcy54IHx8IDA7XG4gICAgdGhpcy55ID0gdGhpcy55IHx8IDA7XG4gICAgaWYgKHRoaXMuYW5pbWF0aW9uKSB7XG4gICAgICB0aGlzLmluaXRBbmltYXRpb24oKTtcbiAgICAgIHRoaXMudXBkYXRlID0gdGhpcy51cGRhdGVBbmltYXRpb247XG4gICAgICB0aGlzLmRyYXcgPSB0aGlzLmRyYXdBbmltYXRpb247XG4gICAgfVxuICB9LFxuXG4gIGluaXRBbmltYXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlzUGxheWluZyA9IHRydWU7XG4gICAgdGhpcy5pc0ZpbmlzaGVkID0gZmFsc2U7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmxvb3AgIT09ICdib29sZWFuJykgdGhpcy5sb29wID0gdHJ1ZTtcbiAgICB0aGlzLmNvdW50ZXIgPSAwO1xuICAgIHRoaXMuZnJhbWVSYXRlID0gNjAgLyB0aGlzLmZyYW1lUmF0ZSB8fCAxO1xuICAgIHRoaXMuY2FsY3VsYXRlRnJhbWVzKCk7XG5cbiAgICBpZiAodGhpcy5hbmltYXRpb25zKSB7XG4gICAgICB0aGlzLmFuaW1hdGlvbkFycmF5ID0gdGhpcy5hbmltYXRpb25zW3RoaXMuYW5pbWF0aW9uXVxuICAgICAgdGhpcy5hcnJheUNvdW50ZXIgPSAwO1xuICAgICAgdGhpcy5mcmFtZSA9IHRoaXMuYW5pbWF0aW9uQXJyYXlbdGhpcy5hcnJheUNvdW50ZXJdO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZyYW1lID0gMDtcbiAgICB9XG4gIH0sXG5cbiAgZHJhdzogZnVuY3Rpb24gKCkge1xuICAgIG94LmNhbnZhcy5kcmF3U3ByaXRlKHRoaXMuc3JjLCB0aGlzLngsIHRoaXMueSk7XG4gIH0sXG5cbiAgZHJhd0FuaW1hdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIG94LmNhbnZhcy5kcmF3U3ByaXRlKHRoaXMuc3JjLCB0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIHRoaXMuZnJhbWVzW3RoaXMuZnJhbWVdKTtcbiAgfSxcblxuXG5cbiAgY2FsY3VsYXRlRnJhbWVzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHggPSB5ID0gMDtcbiAgICB0aGlzLmZyYW1lcyA9IFtbMCwgMF1dO1xuXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCB0aGlzLnNyY0hlaWdodCAvIHRoaXMuaGVpZ2h0ICogdGhpcy5zcmNXaWR0aCAvIHRoaXMud2lkdGg7IGkrKykge1xuICAgICAgaWYgKHggPCB0aGlzLnNyY1dpZHRoIC8gdGhpcy53aWR0aCAtIDEpIHtcbiAgICAgICAgeCsrO1xuICAgICAgfSBlbHNlIGlmICh5IDwgdGhpcy5zcmNIZWlnaHQgLyB0aGlzLmhlaWdodCAtIDEpIHtcbiAgICAgICAgeSsrO1xuICAgICAgICB4ID0gMDtcbiAgICAgIH1cbiAgICAgIHRoaXMuZnJhbWVzLnB1c2goW3gsIHldKTtcbiAgICB9XG4gIH0sXG5cbiAgdXBkYXRlQW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLmlzUGxheWluZykgcmV0dXJuO1xuICAgIGlmICh0aGlzLmlzRmluaXNoZWQpIHJldHVybiB0aGlzLmZpbmlzaGVkKCk7XG5cbiAgICB0aGlzLmNvdW50ZXIgKz0gMTtcbiAgICBpZiAodGhpcy5jb3VudGVyID4gdGhpcy5mcmFtZVJhdGUpIHtcbiAgICAgIHRoaXMuY291bnRlciA9IDA7XG4gICAgICBpZiAodGhpcy5hbmltYXRpb25zKSB0aGlzLm11bHRpcGxlQW5pbWF0aW9ucygpO1xuICAgICAgZWxzZSB0aGlzLnNpbmdsZUFuaW1hdGlvbigpO1xuICAgIH1cbiAgfSxcblxuICBtdWx0aXBsZUFuaW1hdGlvbnM6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5hcnJheUNvdW50ZXIgPT09IHRoaXMuYW5pbWF0aW9uQXJyYXkubGVuZ3RoIC0gMSkge1xuICAgICAgaWYgKCF0aGlzLmxvb3ApIHRoaXMuaXNGaW5pc2hlZCA9IHRydWU7XG4gICAgICB0aGlzLmZyYW1lID0gdGhpcy5hbmltYXRpb25BcnJheVswXVxuICAgICAgdGhpcy5hcnJheUNvdW50ZXIgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFycmF5Q291bnRlcisrO1xuICAgICAgdGhpcy5mcmFtZSA9IHRoaXMuYW5pbWF0aW9uQXJyYXlbdGhpcy5hcnJheUNvdW50ZXJdXG4gICAgfVxuICB9LFxuXG4gIHNpbmdsZUFuaW1hdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmZyYW1lID09PSAodGhpcy5mcmFtZXMubGVuZ3RoIC0gMSkpIHtcbiAgICAgIGlmICghdGhpcy5sb29wKSB0aGlzLmlzRmluaXNoZWQgPSB0cnVlO1xuICAgICAgdGhpcy5mcmFtZSA9IDBcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5mcmFtZSArPSAxO1xuICAgIH1cbiAgfSxcblxuICBmaW5pc2hlZDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc3RvcCgpO1xuICAgIGlmICh0aGlzLm9uRmluaXNoKSB0aGlzLm9uRmluaXNoKCk7XG4gIH0sXG5cbiAgcGxheTogZnVuY3Rpb24gKGFuaW1hdGlvbiwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gb3B0aW9ucykge1xuICAgICAgICB0aGlzW2tleV0gPSBvcHRpb25zW2tleV1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5hbmltYXRpb25zKSB7XG4gICAgICBpZiAoYW5pbWF0aW9uKSB0aGlzLmFuaW1hdGlvbiA9IGFuaW1hdGlvbjtcbiAgICAgIHRoaXMuYW5pbWF0aW9uQXJyYXkgPSB0aGlzLmFuaW1hdGlvbnNbdGhpcy5hbmltYXRpb25dO1xuICAgICAgdGhpcy5hcnJheUNvdW50ZXIgPSAwO1xuICAgICAgdGhpcy5mcmFtZSA9IHRoaXMuYW5pbWF0aW9uQXJyYXlbdGhpcy5hcnJheUNvdW50ZXJdO1xuICAgIH1cbiAgICB0aGlzLmlzRmluaXNoZWQgPSBmYWxzZTtcbiAgICB0aGlzLmlzUGxheWluZyA9IHRydWU7XG4gIH0sXG5cbiAgc3RvcDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaXNQbGF5aW5nID0gZmFsc2U7XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgbG9hZGluZzogcmVxdWlyZSgnLi9zY2VuZXMvbG9hZGluZy5qcycpLFxuICBtYWluOiByZXF1aXJlKCcuL3NjZW5lcy9tYWluLmpzJylcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIG94LnByZWxvYWRlci5sb2FkKHJlcXVpcmUoJy4uL2Fzc2V0cy5qcycpKTtcbiAgICB0aGlzLmJhckxlbmd0aCA9IG94LnByZWxvYWRlci5hc3NldHNUb0xvYWQ7XG4gIH0sXG5cbiAgZHJhdzogZnVuY3Rpb24gKCkge1xuICAgIG94LmNhbnZhcy5maWxsU3R5bGUgPSBcImJsYWNrXCJcbiAgICBveC5jYW52YXMuZmlsbFJlY3QoMCwgMCwgb3guY2FudmFzLndpZHRoLCBveC5jYW52YXMuaGVpZ2h0KVxuICAgIG94LmNhbnZhcy5maWxsU3R5bGUgPSBcInJnYig0NiwgMjM4LCAyNDUpXCJcbiAgICBveC5jYW52YXMuZmlsbFJlY3Qob3guY2FudmFzLndpZHRoIC8gNCwgMiAqIG94LmNhbnZhcy5oZWlnaHQgLyAzLCBveC5jYW52YXMud2lkdGggLyAyLCAxKVxuICAgIG94LmNhbnZhcy5maWxsU3R5bGUgPSBcImdyZXlcIlxuICAgIG94LmNhbnZhcy5zYXZlKClcbiAgICBveC5jYW52YXMudHJhbnNsYXRlKG94LmNhbnZhcy53aWR0aCAvIDQsIDIgKiBveC5jYW52YXMuaGVpZ2h0IC8gMylcbiAgICBveC5jYW52YXMuc2NhbGUoLTEsIDEpXG4gICAgb3guY2FudmFzLmZpbGxSZWN0KC1veC5jYW52YXMud2lkdGggLyAyLCAwLCBveC5jYW52YXMud2lkdGggLyAyICogb3gucHJlbG9hZGVyLmFzc2V0c1RvTG9hZCAvIHRoaXMuYmFyTGVuZ3RoLCAxKVxuICAgIG94LmNhbnZhcy5yZXN0b3JlKClcbiAgICBveC5jYW52YXMuZmlsbFN0eWxlID0gXCJ3aGl0ZVwiXG4gICAgb3guY2FudmFzLmZvbnQgPSAnMjAwJSBzYW5zLXNlcmlmJ1xuICAgIG94LmNhbnZhcy5maWxsVGV4dCgnbG9hZGluZy4uLicsIG94LmNhbnZhcy53aWR0aCAvIDIgLSA2OCwgb3guY2FudmFzLmhlaWdodCAvIDIgKyAxMCk7XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKG94LnByZWxvYWRlci5hc3NldHNUb0xvYWQgPT09IDApIG94LnNjZW5lcy5zZXQoJ21haW4nKTtcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5wb25leSA9IG94LnNwYXduKCdwb25leScpO1xuICAgIHRoaXMuc3RhdGljUG9ueSA9IG94LnNwcml0ZSgncG9ueScpO1xuICAgIHRoaXMuc3ByaXRlMiA9IG94LnNwcml0ZSgnY29pbjInLCB7XG4gICAgICB4OiA4MCxcbiAgICAgIHk6IDEsXG4gICAgICBhbmltYXRpb246ICdzcGluJyxcbiAgICAgIGFuaW1hdGlvbnM6IHtcbiAgICAgICAgc3BpbjogWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDldLFxuICAgICAgICBpZGxlOiBbOCwgNCwgOCwgNCwgOCwgNCwgOCwgNCwgOCwgNCwgOCwgNCwgOCwgNCwgOCwgNF1cbiAgICAgIH0sXG4gICAgICBoZWlnaHQ6IDQwLFxuICAgICAgZnJhbWVSYXRlOiAzMCxcbiAgICAgIHdpZHRoOiA0NCxcbiAgICAgIG9uRmluaXNoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMueCA9IDEwO1xuICAgICAgICB0aGlzLmRlc3Ryb3koKTtcbiAgICAgICAgb3guc2NlbmVzLmN1cnJlbnQudGVzdGluZygpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5zcHJpdGUyLnBsYXkoJ3NwaW4nLCB7XG4gICAgICBsb29wOiBmYWxzZVxuICAgIH0pO1xuXG4gIH0sXG4gIHRlc3Rpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZyhcIkkgd2FzIGNhbGxlZCB3aGVuIHRoZSBhbmltYXRpb24gZW5kZWQuXCIpXG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcblxuICB9LFxuXG4gIGtleURvd246IGZ1bmN0aW9uIChrZXkpIHtcbiAgICBjb25zb2xlLmxvZyhcImtleURvd24hXCIgKyBrZXkpXG4gIH0sXG5cbiAga2V5UHJlc3M6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICBjb25zb2xlLmxvZyhcImtleVByZXNzIVwiICsga2V5KVxuICB9LFxuXG4gIGtleVVwOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgY29uc29sZS5sb2coXCJrZXlVcCEgXCIgKyBrZXkpXG4gIH1cbn07XG4iXX0=
