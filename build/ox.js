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
  keyboard = require('./keyboard'),
  mouse = require('./mouse');

var context = document.getElementById('canvas').getContext('2d');

context.drawSprite = function (src, x, y, width, height, frame) {
  if (typeof width === 'number') {
    context.drawImage(
      images[src],
      width * frame[0],
      height * frame[1],
      width, height, x, y, width, height);
  } else {
    context.drawImage(images[src], x, y);
  }
};

canvas.tabIndex = 1000;
canvas.style.outline = "none";
canvas.onkeydown = keyboard.keyDown.bind(keyboard);
canvas.onkeyup = keyboard.keyUp.bind(keyboard);
canvas.onmousemove = mouse.onMove.bind(mouse);
canvas.onmousedown = mouse.onDown.bind(mouse);
canvas.onmouseup = mouse.onUp.bind(mouse);
canvas.height = 2000;
canvas.style.cursor = "none";

module.exports = context;

},{"./keyboard":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/keyboard.js","./loader":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/loader.js","./mouse":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/mouse.js"}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/core.js":[function(require,module,exports){
window.onload = function () {
  this.ox = {
    canvas: require('./canvas').canvas,
    context: require('./canvas'),
    images: require('./loader').images,
    audio: require('./loader').audio,
    data: require('./loader').data,
    keyboard: require('./keyboard'),
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

  ox.loop.calculateDelta();
  ox.scenes.set('loading');
  ox.loop.run();
};

},{"./canvas":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/canvas.js","./entitiesManager":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/entitiesManager.js","./gameLoop":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/gameLoop.js","./keyboard":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/keyboard.js","./loader":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/loader.js","./localStorage":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/localStorage.js","./mouse":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/mouse.js","./scenesManager":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/scenesManager.js"}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/entitiesManager.js":[function(require,module,exports){
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

},{"./canvas":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/canvas.js","./entitiesManager":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/entitiesManager.js","./scenesManager":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/scenesManager.js"}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/keyboard.js":[function(require,module,exports){
var scene = require('./scenesManager');
module.exports = {
  isPressed: {},

  keyDown: function (e) {
    if (e.keyCode === 32 || (e.keyCode >= 37 && e.keyCode <= 40))
      e.preventDefault();
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
var scene = require('./scenesManager');

module.exports = {
  x: 0,
  y: 0,
  isPressed: {},

  onMove: function (e) {
    ox.mouse.x = e.clientX - ox.canvas.offsetLeft;
    ox.mouse.y = e.clientY - ox.canvas.offsetTop;
    if (scene.current.mouseMove) scene.current.mouseMove(ox.mouse)
  },
  onUp: function (e) {
    if (scene.current.mouseUp) scene.current.mouseUp(e);
  },
  onDown: function (e) {
    if (scene.current.mouseDown) scene.current.mouseDown(e);
  }
}

/**
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
**/

},{"./scenesManager":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/scenesManager.js"}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/scenesManager.js":[function(require,module,exports){
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
    ox.context.fillStyle = 'blue'
    ox.context.fillRect(80, 80, 100, 200)
    ox.context.strokeStyle = 'grey'
    ox.context.strokeRect(80, 80, 100, 200)
    ox.context.drawSprite('pony', this.x, 0);
    ox.context.drawSprite('pony', this.x + 10, 0);
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
    ox.context.drawSprite(this.src, this.x, this.y);
  },

  drawAnimation: function () {
    ox.context.drawSprite(this.src, this.x, this.y, this.width, this.height, this.frames[this.frame]);
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
    ox.context.fillStyle = "black"
    ox.context.fillRect(0, 0, ox.canvas.width, ox.canvas.height)
    ox.context.fillStyle = "rgb(46, 238, 245)"
    ox.context.fillRect(ox.canvas.width / 4, 2 * ox.canvas.height / 3, ox.canvas.width / 2, 1)
    ox.context.fillStyle = "grey"
    ox.context.save()
    ox.context.translate(ox.canvas.width / 4, 2 * ox.canvas.height / 3)
    ox.context.scale(-1, 1)
    ox.context.fillRect(-ox.canvas.width / 2, 0, ox.canvas.width / 2 * ox.preloader.assetsToLoad / this.barLength, 1)
    ox.context.restore()
    ox.context.fillStyle = "white"
    ox.context.font = '200% sans-serif'
    ox.context.fillText('loading...', ox.canvas.width / 2 - 68, ox.canvas.height / 2 + 10);
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
      animation: 'spin',
      animations: {
        spin: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        idle: [8, 4, 8, 4, 8, 4, 8, 4, 8, 4, 8, 4, 8, 4, 8, 4]
      },
      height: 40,
      frameRate: 30,
      width: 44,
    });

    this.sprite2.play('spin', {
      loop: false
    });

  },
  testing: function () {
    console.log("I was called when the animation ended.")
  },

  update: function (dt) {
    this.sprite2.x = ox.mouse.x;
    this.sprite2.y = ox.mouse.y;
  },

  keyDown: function (key) {
    console.log("keyDown: " + key)
  },

  keyPress: function (key) {
    console.log("keyPress: " + key)
  },

  keyUp: function (key) {
    console.log("keyUp: " + key)
  },

  mouseDown: function (e) {
    console.log("Clicked at: " + ox.mouse.x + ", " + ox.mouse.y)
  },

  mouseUp: function (e) {
    console.log("Released at: " + ox.mouse.x + ", " + ox.mouse.y)

  }
};

},{}]},{},["/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/core.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXNzZXRzLmpzIiwic3JjL2VuZ2luZS9jYW52YXMuanMiLCJzcmMvZW5naW5lL2NvcmUuanMiLCJzcmMvZW5naW5lL2VudGl0aWVzTWFuYWdlci5qcyIsInNyYy9lbmdpbmUvZ2FtZUxvb3AuanMiLCJzcmMvZW5naW5lL2tleWJvYXJkLmpzIiwic3JjL2VuZ2luZS9sb2FkZXIuanMiLCJzcmMvZW5naW5lL2xvY2FsU3RvcmFnZS5qcyIsInNyYy9lbmdpbmUvbW91c2UuanMiLCJzcmMvZW5naW5lL3NjZW5lc01hbmFnZXIuanMiLCJzcmMvZW50aXRpZXMuanMiLCJzcmMvZW50aXRpZXMvY291bnRlci5qcyIsInNyYy9lbnRpdGllcy9jb3VudGVyMi5qcyIsInNyYy9lbnRpdGllcy9wb25leS5qcyIsInNyYy9lbnRpdGllcy9zcHJpdGUuanMiLCJzcmMvc2NlbmVzLmpzIiwic3JjL3NjZW5lcy9sb2FkaW5nLmpzIiwic3JjL3NjZW5lcy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGltYWdlczogW1xuICAgICdwb255JyxcbiAgICAncG9ueTInLFxuICAgICdwb255MycsXG4gICAgJ3Bvbnk0JyxcbiAgICAncG9ueTUnLFxuICAgICdjb2luJyxcbiAgICAnY29pblR3aXN0ZWQnLFxuICAgICdjb2luMiddLFxuXG4gIGRhdGE6IFsnZXhhbXBsZSddLFxuXG4gIGF1ZGlvOiBbXVxufVxuIiwidmFyIGltYWdlcyA9IHJlcXVpcmUoJy4vbG9hZGVyJykuaW1hZ2VzLFxuICBrZXlib2FyZCA9IHJlcXVpcmUoJy4va2V5Ym9hcmQnKSxcbiAgbW91c2UgPSByZXF1aXJlKCcuL21vdXNlJyk7XG5cbnZhciBjb250ZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpLmdldENvbnRleHQoJzJkJyk7XG5cbmNvbnRleHQuZHJhd1Nwcml0ZSA9IGZ1bmN0aW9uIChzcmMsIHgsIHksIHdpZHRoLCBoZWlnaHQsIGZyYW1lKSB7XG4gIGlmICh0eXBlb2Ygd2lkdGggPT09ICdudW1iZXInKSB7XG4gICAgY29udGV4dC5kcmF3SW1hZ2UoXG4gICAgICBpbWFnZXNbc3JjXSxcbiAgICAgIHdpZHRoICogZnJhbWVbMF0sXG4gICAgICBoZWlnaHQgKiBmcmFtZVsxXSxcbiAgICAgIHdpZHRoLCBoZWlnaHQsIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuICB9IGVsc2Uge1xuICAgIGNvbnRleHQuZHJhd0ltYWdlKGltYWdlc1tzcmNdLCB4LCB5KTtcbiAgfVxufTtcblxuY2FudmFzLnRhYkluZGV4ID0gMTAwMDtcbmNhbnZhcy5zdHlsZS5vdXRsaW5lID0gXCJub25lXCI7XG5jYW52YXMub25rZXlkb3duID0ga2V5Ym9hcmQua2V5RG93bi5iaW5kKGtleWJvYXJkKTtcbmNhbnZhcy5vbmtleXVwID0ga2V5Ym9hcmQua2V5VXAuYmluZChrZXlib2FyZCk7XG5jYW52YXMub25tb3VzZW1vdmUgPSBtb3VzZS5vbk1vdmUuYmluZChtb3VzZSk7XG5jYW52YXMub25tb3VzZWRvd24gPSBtb3VzZS5vbkRvd24uYmluZChtb3VzZSk7XG5jYW52YXMub25tb3VzZXVwID0gbW91c2Uub25VcC5iaW5kKG1vdXNlKTtcbmNhbnZhcy5oZWlnaHQgPSAyMDAwO1xuY2FudmFzLnN0eWxlLmN1cnNvciA9IFwibm9uZVwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbnRleHQ7XG4iLCJ3aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLm94ID0ge1xuICAgIGNhbnZhczogcmVxdWlyZSgnLi9jYW52YXMnKS5jYW52YXMsXG4gICAgY29udGV4dDogcmVxdWlyZSgnLi9jYW52YXMnKSxcbiAgICBpbWFnZXM6IHJlcXVpcmUoJy4vbG9hZGVyJykuaW1hZ2VzLFxuICAgIGF1ZGlvOiByZXF1aXJlKCcuL2xvYWRlcicpLmF1ZGlvLFxuICAgIGRhdGE6IHJlcXVpcmUoJy4vbG9hZGVyJykuZGF0YSxcbiAgICBrZXlib2FyZDogcmVxdWlyZSgnLi9rZXlib2FyZCcpLFxuICAgIG1vdXNlOiByZXF1aXJlKCcuL21vdXNlJyksXG4gICAgc2NlbmVzOiByZXF1aXJlKCcuL3NjZW5lc01hbmFnZXInKSxcbiAgICBlbnRpdGllczogcmVxdWlyZSgnLi9lbnRpdGllc01hbmFnZXInKSxcbiAgICBzYXZlOiByZXF1aXJlKCcuL2xvY2FsU3RvcmFnZScpLFxuICAgIGxvb3A6IHJlcXVpcmUoJy4vZ2FtZUxvb3AnKSxcbiAgICBwcmVsb2FkZXI6IHJlcXVpcmUoJy4vbG9hZGVyJyksXG4gICAgc3ByaXRlOiBmdW5jdGlvbiAoc3JjLCBvcHRpb25zKSB7XG4gICAgICB2YXIgb2JqID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgIG9iai5zcmMgPSBzcmM7XG4gICAgICByZXR1cm4gdGhpcy5lbnRpdGllcy5zcGF3bignc3ByaXRlJywgb2JqKTtcbiAgICB9LFxuICAgIHNwYXduOiBmdW5jdGlvbiAobmFtZSwgb3B0aW9ucykge1xuICAgICAgdGhpcy5saXN0ID0gdGhpcy5lbnRpdGllcy5saXN0O1xuICAgICAgcmV0dXJuIHRoaXMuZW50aXRpZXMuc3Bhd24obmFtZSwgb3B0aW9ucyk7XG4gICAgfVxuICB9O1xuXG4gIG94Lmxvb3AuY2FsY3VsYXRlRGVsdGEoKTtcbiAgb3guc2NlbmVzLnNldCgnbG9hZGluZycpO1xuICBveC5sb29wLnJ1bigpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBjdXJyZW50OiBbXSxcbiAgbGlzdDogcmVxdWlyZSgnLi4vZW50aXRpZXMnKSxcbiAgZGlydHlaOiBmYWxzZSxcbiAgc3Bhd246IGZ1bmN0aW9uIChuYW1lLCBvcHRpb25zKSB7XG4gICAgaWYgKCF0aGlzLmxpc3RbbmFtZV0pIHRocm93IG5ldyBFcnJvcihcIkVudGl0eSAnXCIgKyBuYW1lICsgXCInIGRvZXMgbm90IGV4aXN0IGFuZCBjYW5ub3QgYmUgc3Bhd25lZC5cIik7XG4gICAgdmFyIG9iaiA9IG9wdGlvbnMgfHwge307XG4gICAgZm9yICh2YXIga2V5IGluIHRoaXMubGlzdFtuYW1lXSkge1xuICAgICAgb2JqW2tleV0gPSB0aGlzLmxpc3RbbmFtZV1ba2V5XTtcbiAgICB9XG4gICAgb2JqLmRlc3Ryb3kgPSB0aGlzLmRlc3Ryb3kuYmluZChvYmopO1xuICAgIG9iai5yZXZpdmUgPSB0aGlzLnJldml2ZS5iaW5kKG9iaik7XG4gICAgb2JqLmlzQWxpdmUgPSB0cnVlO1xuICAgIHRoaXMuY3VycmVudC5wdXNoKG9iaik7XG4gICAgaWYgKG9iai5pbml0KSB7XG4gICAgICBvYmouaW5pdCgpO1xuICAgIH07XG4gICAgb2JqLmlzUmVhZHkgPSB0cnVlXG4gICAgcmV0dXJuIG9iajtcbiAgfSxcbiAgY2hlY2taOiBmdW5jdGlvbiAoZW50aXR5KSB7XG4gICAgaWYgKHR5cGVvZiBlbnRpdHkueiA9PT0gJ3VuZGVmaW5lZCcpIGVudGl0eS56ID0gMDtcbiAgICBpZiAoZW50aXR5LnogIT09IGVudGl0eS5sYXN0Wikge1xuICAgICAgZW50aXR5Lmxhc3RaID0gZW50aXR5Lno7XG4gICAgICB0aGlzLmRpcnR5WiA9IHRydWU7XG4gICAgfVxuICB9LFxuICBzb3J0QnlaOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jdXJyZW50LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIHJldHVybiBhLnogLSBiLno7XG4gICAgfSk7XG4gIH0sXG4gIGRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlzQWxpdmUgPSBmYWxzZTtcbiAgfSxcbiAgcmV2aXZlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pc0FsaXZlID0gdHJ1ZTtcbiAgfVxufTtcbiIsInZhciBlbnRpdGllcyA9IHJlcXVpcmUoJy4vZW50aXRpZXNNYW5hZ2VyJyksXG4gIHNjZW5lcyA9IHJlcXVpcmUoJy4vc2NlbmVzTWFuYWdlcicpLFxuICBjb250ZXh0ID0gcmVxdWlyZSgnLi9jYW52YXMnKTtcbnZhciBjYW1lcmEgPSB7XG4gIHg6IDEsXG4gIHk6IDIwXG59XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc3BlZWQ6IDEsXG4gIGR0OiAwLFxuICBzdGVwOiAxIC8gNjAsXG4gIGxhc3REZWx0YTogbmV3IERhdGUoKSxcbiAgbm93OiBuZXcgRGF0ZSgpLFxuICBjYWxjdWxhdGVEZWx0YTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMubGFzdERlbHRhID0gdGhpcy5ub3c7XG4gICAgdGhpcy5ub3cgPSBuZXcgRGF0ZSgpO1xuICAgIHRoaXMuZHQgKz0gTWF0aC5taW4oMSwgKHRoaXMubm93IC0gdGhpcy5sYXN0RGVsdGEpIC8gMTAwMCkgKiB0aGlzLnNwZWVkO1xuICB9LFxuICBydW46IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmNhbGN1bGF0ZURlbHRhKCk7XG5cbiAgICBpZiAoZW50aXRpZXMuZGlydHlaKSB7XG4gICAgICBlbnRpdGllcy5zb3J0QnlaKCk7XG4gICAgICBlbnRpdGllcy5kaXJ0eVogPSBmYWxzZTtcbiAgICB9XG5cbiAgICB3aGlsZSAodGhpcy5kdCA+IHRoaXMuc3RlcCkge1xuICAgICAgdGhpcy5kdCAtPSB0aGlzLnN0ZXA7XG4gICAgICB0aGlzLnVwZGF0ZSh0aGlzLnN0ZXApO1xuICAgIH1cbiAgICB0aGlzLmRyYXcodGhpcy5kdCk7XG5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5ydW4uYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgZHJhdzogZnVuY3Rpb24gKGR0KSB7XG4gICAgdmFyIHRpbWUgPSBuZXcgRGF0ZTtcbiAgICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBjb250ZXh0LmNhbnZhcy53aWR0aCwgY29udGV4dC5jYW52YXMuaGVpZ2h0KTtcbiAgICAvLyAgICBveC5jYW52YXMuc2F2ZSgpO1xuICAgIC8vICAgIGNhbWVyYS55ICs9IC41O1xuICAgIC8vICAgIGlmIChjYW1lcmEueSA+IDMwKSBjYW1lcmEueSA9IC0xMDtcbiAgICAvLyAgICBveC5jYW52YXMudHJhbnNsYXRlKGNhbWVyYS54LCBjYW1lcmEueSk7XG5cbiAgICBpZiAoc2NlbmVzLmN1cnJlbnQuZHJhdykgc2NlbmVzLmN1cnJlbnQuZHJhdyhkdCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGVudGl0aWVzLmN1cnJlbnQubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHZhciBlbnRpdHkgPSBlbnRpdGllcy5jdXJyZW50W2ldO1xuICAgICAgaWYgKGVudGl0eS5pc0FsaXZlICYmIGVudGl0eS5kcmF3KSBlbnRpdHkuZHJhdyhkdCk7XG4gICAgfVxuICAgIC8vICAgIG94LmNhbnZhcy5yZXN0b3JlKCk7XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcbiAgICBpZiAoc2NlbmVzLmN1cnJlbnQudXBkYXRlKSBzY2VuZXMuY3VycmVudC51cGRhdGUoZHQpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBlbnRpdGllcy5jdXJyZW50Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB2YXIgZW50aXR5ID0gZW50aXRpZXMuY3VycmVudFtpXTtcbiAgICAgIGlmIChlbnRpdHkuaXNBbGl2ZSAmJiBlbnRpdHkudXBkYXRlKSBlbnRpdHkudXBkYXRlKGR0KTtcbiAgICB9XG4gIH1cbn1cbiIsInZhciBzY2VuZSA9IHJlcXVpcmUoJy4vc2NlbmVzTWFuYWdlcicpO1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzUHJlc3NlZDoge30sXG5cbiAga2V5RG93bjogZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoZS5rZXlDb2RlID09PSAzMiB8fCAoZS5rZXlDb2RlID49IDM3ICYmIGUua2V5Q29kZSA8PSA0MCkpXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKHNjZW5lLmN1cnJlbnQua2V5RG93bikgc2NlbmUuY3VycmVudC5rZXlEb3duKHRoaXMua2V5c1tlLmtleUNvZGVdKTtcbiAgICB0aGlzLmtleVByZXNzKGUpO1xuICB9LFxuXG4gIGtleVByZXNzOiBmdW5jdGlvbiAoZSkge1xuICAgIGlmICh0aGlzLmlzUHJlc3NlZFtlLmtleUNvZGVdKSByZXR1cm47XG4gICAgaWYgKHNjZW5lLmN1cnJlbnQua2V5UHJlc3MpIHNjZW5lLmN1cnJlbnQua2V5UHJlc3ModGhpcy5rZXlzW2Uua2V5Q29kZV0pO1xuICAgIHRoaXMuaXNQcmVzc2VkW2Uua2V5Q29kZV0gPSB0cnVlO1xuICB9LFxuXG4gIGtleVVwOiBmdW5jdGlvbiAoZSkge1xuICAgIGlmIChzY2VuZS5jdXJyZW50LmtleVVwKSBzY2VuZS5jdXJyZW50LmtleVVwKHRoaXMua2V5c1tlLmtleUNvZGVdKTtcbiAgICB0aGlzLmlzUHJlc3NlZFtlLmtleUNvZGVdID0gZmFsc2U7XG4gIH0sXG5cbiAga2V5czoge1xuICAgIDg6ICdiYWNrc3BhY2UnLFxuICAgIDk6ICd0YWInLFxuICAgIDEzOiAnZW50ZXInLFxuICAgIDE2OiAnc2hpZnQnLFxuICAgIDE3OiAnY3RybCcsXG4gICAgMTg6ICdhbHQnLFxuICAgIDE5OiAncGF1c2UnLFxuICAgIDIwOiAnY2Fwc19sb2NrJyxcbiAgICAyNzogJ2VzYycsXG4gICAgMzI6ICdzcGFjZWJhcicsXG4gICAgMzM6ICdwYWdlX3VwJyxcbiAgICAzNDogJ3BhZ2VfZG93bicsXG4gICAgMzU6ICdlbmQnLFxuICAgIDM2OiAnaG9tZScsXG4gICAgMzc6ICdsZWZ0JyxcbiAgICAzODogJ3VwJyxcbiAgICAzOTogJ3JpZ2h0JyxcbiAgICA0MDogJ2Rvd24nLFxuICAgIDQ0OiAncHJpbnRfc2NyZWVuJyxcbiAgICA0NTogJ2luc2VydCcsXG4gICAgNDY6ICdkZWxldGUnLFxuICAgIDQ4OiAnMCcsXG4gICAgNDk6ICcxJyxcbiAgICA1MDogJzInLFxuICAgIDUxOiAnMycsXG4gICAgNTI6ICc0JyxcbiAgICA1MzogJzUnLFxuICAgIDU0OiAnNicsXG4gICAgNTU6ICc3JyxcbiAgICA1NjogJzgnLFxuICAgIDU3OiAnOScsXG4gICAgNjU6ICdhJyxcbiAgICA2NjogJ2InLFxuICAgIDY3OiAnYycsXG4gICAgNjg6ICdkJyxcbiAgICA2OTogJ2UnLFxuICAgIDcwOiAnZicsXG4gICAgNzE6ICdnJyxcbiAgICA3MjogJ2gnLFxuICAgIDczOiAnaScsXG4gICAgNzQ6ICdqJyxcbiAgICA3NTogJ2snLFxuICAgIDc2OiAnbCcsXG4gICAgNzc6ICdtJyxcbiAgICA3ODogJ24nLFxuICAgIDc5OiAnbycsXG4gICAgODA6ICdwJyxcbiAgICA4MTogJ3EnLFxuICAgIDgyOiAncicsXG4gICAgODM6ICdzJyxcbiAgICA4NDogJ3QnLFxuICAgIDg1OiAndScsXG4gICAgODY6ICd2JyxcbiAgICA4NzogJ3cnLFxuICAgIDg4OiAneCcsXG4gICAgODk6ICd5JyxcbiAgICA5MDogJ3onLFxuICAgIDk2OiAnbnVtX3plcm8nLFxuICAgIDk3OiAnbnVtX29uZScsXG4gICAgOTg6ICdudW1fdHdvJyxcbiAgICA5OTogJ251bV90aHJlZScsXG4gICAgMTAwOiAnbnVtX2ZvdXInLFxuICAgIDEwMTogJ251bV9maXZlJyxcbiAgICAxMDI6ICdudW1fc2l4JyxcbiAgICAxMDM6ICdudW1fc2V2ZW4nLFxuICAgIDEwNDogJ251bV9laWdodCcsXG4gICAgMTA1OiAnbnVtX25pbmUnLFxuICAgIDEwNjogJ251bV9tdWx0aXBseScsXG4gICAgMTA3OiAnbnVtX3BsdXMnLFxuICAgIDEwOTogJ251bV9taW51cycsXG4gICAgMTEwOiAnbnVtX3BlcmlvZCcsXG4gICAgMTExOiAnbnVtX2RpdmlzaW9uJyxcbiAgICAxMTI6ICdmMScsXG4gICAgMTEzOiAnZjInLFxuICAgIDExNDogJ2YzJyxcbiAgICAxMTU6ICdmNCcsXG4gICAgMTE2OiAnZjUnLFxuICAgIDExNzogJ2Y2JyxcbiAgICAxMTg6ICdmNycsXG4gICAgMTE5OiAnZjgnLFxuICAgIDEyMDogJ2Y5JyxcbiAgICAxMjE6ICdmMTAnLFxuICAgIDEyMjogJ2YxMScsXG4gICAgMTIzOiAnZjEyJyxcbiAgICAxODY6ICdzZW1pY29sb24nLFxuICAgIDE4NzogJ3BsdXMnLFxuICAgIDE4OTogJ21pbnVzJyxcbiAgICAxOTI6ICdncmF2ZV9hY2NlbnQnLFxuICAgIDIyMjogJ3NpbmdsZV9xdW90ZSdcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGltYWdlczoge30sXG4gIGRhdGE6IHt9LFxuICBhdWRpbzoge30sXG4gIGFzc2V0c1RvTG9hZDogMCxcblxuICBsb2FkSW1hZ2U6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhpcy5pbWFnZXNbbmFtZV0gPSBuZXcgSW1hZ2UoKTtcbiAgICB0aGlzLmltYWdlc1tuYW1lXS5vbmxvYWQgPSB0aGlzLmFzc2V0c1RvTG9hZC0tO1xuICAgIHRoaXMuaW1hZ2VzW25hbWVdLnNyYyA9IFwiaW1hZ2VzL1wiICsgbmFtZSArIFwiLnBuZ1wiO1xuICB9LFxuXG4gIGxvYWREYXRhOiBmdW5jdGlvbiAoZmlsZSkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdDtcbiAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0ICYmIHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICBzZWxmLmRhdGFbZmlsZV0gPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICBzZWxmLmFzc2V0c1RvTG9hZC0tO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB4aHIub3BlbihcIkdFVFwiLCBcImRhdGEvXCIgKyBmaWxlICsgXCIuanNvblwiKTtcbiAgICB4aHIuc2VuZCgpO1xuICB9LFxuXG4gIGxvYWRBdWRpbzogZnVuY3Rpb24gKG5hbWUpIHt9LFxuXG4gIGxvYWQ6IGZ1bmN0aW9uIChvYmopIHtcbiAgICBpZiAob2JqLmltYWdlcykge1xuICAgICAgdGhpcy5hc3NldHNUb0xvYWQgKz0gb2JqLmltYWdlcy5sZW5ndGg7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9iai5pbWFnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5sb2FkSW1hZ2Uob2JqLmltYWdlc1tpXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG9iai5kYXRhKSB7XG4gICAgICB0aGlzLmFzc2V0c1RvTG9hZCArPSBvYmouZGF0YS5sZW5ndGg7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG9iai5kYXRhLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHRoaXMubG9hZERhdGEob2JqLmRhdGFbal0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChvYmouYXVkaW8pIHtcbiAgICAgIHRoaXMuYXNzZXRzVG9Mb2FkICs9IG9iai5hdWRpby5sZW5ndGg7XG4gICAgICBmb3IgKHZhciBrID0gMDsgayA8IG9iai5hdWRpby5sZW5ndGg7IGsrKykge1xuICAgICAgICB0aGlzLmxvYWRBdWRpbyhvYmouYXVkaW9ba10pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIHN0b3JlOiBmdW5jdGlvbiAobnVtLCBvYmopIHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShudW0sIEpTT04uc3RyaW5naWZ5KG9iaikpO1xuICB9LFxuICBsb2FkOiBmdW5jdGlvbiAobnVtKSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0obnVtKSk7XG4gIH0sXG4gIHJlbW92ZTogZnVuY3Rpb24gKG51bSkge1xuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKG51bSk7XG4gIH1cbn1cbiIsInZhciBzY2VuZSA9IHJlcXVpcmUoJy4vc2NlbmVzTWFuYWdlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgeDogMCxcbiAgeTogMCxcbiAgaXNQcmVzc2VkOiB7fSxcblxuICBvbk1vdmU6IGZ1bmN0aW9uIChlKSB7XG4gICAgb3gubW91c2UueCA9IGUuY2xpZW50WCAtIG94LmNhbnZhcy5vZmZzZXRMZWZ0O1xuICAgIG94Lm1vdXNlLnkgPSBlLmNsaWVudFkgLSBveC5jYW52YXMub2Zmc2V0VG9wO1xuICAgIGlmIChzY2VuZS5jdXJyZW50Lm1vdXNlTW92ZSkgc2NlbmUuY3VycmVudC5tb3VzZU1vdmUob3gubW91c2UpXG4gIH0sXG4gIG9uVXA6IGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKHNjZW5lLmN1cnJlbnQubW91c2VVcCkgc2NlbmUuY3VycmVudC5tb3VzZVVwKGUpO1xuICB9LFxuICBvbkRvd246IGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKHNjZW5lLmN1cnJlbnQubW91c2VEb3duKSBzY2VuZS5jdXJyZW50Lm1vdXNlRG93bihlKTtcbiAgfVxufVxuXG4vKipcbiAgaXNQcmVzc2VkOiB7fSxcbiAga2V5RG93bjogZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoc2NlbmUuY3VycmVudC5rZXlEb3duKSBzY2VuZS5jdXJyZW50LmtleURvd24odGhpcy5rZXlzW2Uua2V5Q29kZV0pO1xuICAgIHRoaXMua2V5UHJlc3MoZSk7XG4gIH0sXG4gIGtleVByZXNzOiBmdW5jdGlvbiAoZSkge1xuICAgIGlmICh0aGlzLmlzUHJlc3NlZFtlLmtleUNvZGVdKSByZXR1cm47XG4gICAgaWYgKHNjZW5lLmN1cnJlbnQua2V5UHJlc3MpIHNjZW5lLmN1cnJlbnQua2V5UHJlc3ModGhpcy5rZXlzW2Uua2V5Q29kZV0pO1xuICAgIHRoaXMuaXNQcmVzc2VkW2Uua2V5Q29kZV0gPSB0cnVlO1xuICB9LFxuICBrZXlVcDogZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoc2NlbmUuY3VycmVudC5rZXlVcCkgc2NlbmUuY3VycmVudC5rZXlVcCh0aGlzLmtleXNbZS5rZXlDb2RlXSk7XG4gICAgdGhpcy5pc1ByZXNzZWRbZS5rZXlDb2RlXSA9IGZhbHNlO1xuICB9LFxuKiovXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3VycmVudDogbnVsbCxcbiAgbGlzdDogcmVxdWlyZSgnLi4vc2NlbmVzJyksXG4gIHNldDogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBpZiAoIXRoaXMubGlzdFtuYW1lXSkgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgJ1wiICsgbmFtZSArIFwiJyBkb2VzIG5vdCBleGlzdCFcIik7XG4gICAgdGhpcy5jdXJyZW50ID0gdGhpcy5saXN0W25hbWVdO1xuICAgIGlmICh0aGlzLmN1cnJlbnQuaW5pdCkgdGhpcy5jdXJyZW50LmluaXQoKTtcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNwcml0ZTogcmVxdWlyZSgnLi9lbnRpdGllcy9zcHJpdGUuanMnKSxcbiAgY291bnRlcjogcmVxdWlyZSgnLi9lbnRpdGllcy9jb3VudGVyLmpzJyksXG4gIGNvdW50ZXIyOiByZXF1aXJlKCcuL2VudGl0aWVzL2NvdW50ZXIyLmpzJyksXG4gIHBvbmV5OiByZXF1aXJlKCcuL2VudGl0aWVzL3BvbmV5LmpzJylcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudmFsdWUgPSAxMDA7XG4gIH0sXG4gIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudmFsdWUrKztcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52ID0gMTAxO1xuICAgIHRoaXMudmFsdWUgPSAwO1xuICAgIHRoaXMuYyA9IG94LmVudGl0aWVzLnNwYXduKCdjb3VudGVyJyk7XG4gIH0sXG4gIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudmFsdWUrKztcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy54ID0gMDtcbiAgfSxcblxuICBkcmF3OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy54Kys7XG4gICAgb3guY29udGV4dC5maWxsU3R5bGUgPSAnYmx1ZSdcbiAgICBveC5jb250ZXh0LmZpbGxSZWN0KDgwLCA4MCwgMTAwLCAyMDApXG4gICAgb3guY29udGV4dC5zdHJva2VTdHlsZSA9ICdncmV5J1xuICAgIG94LmNvbnRleHQuc3Ryb2tlUmVjdCg4MCwgODAsIDEwMCwgMjAwKVxuICAgIG94LmNvbnRleHQuZHJhd1Nwcml0ZSgncG9ueScsIHRoaXMueCwgMCk7XG4gICAgb3guY29udGV4dC5kcmF3U3ByaXRlKCdwb255JywgdGhpcy54ICsgMTAsIDApO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnNyY1dpZHRoID0gb3guaW1hZ2VzW3RoaXMuc3JjXS53aWR0aDtcbiAgICB0aGlzLndpZHRoID0gdGhpcy53aWR0aCB8fCB0aGlzLnNyY1dpZHRoO1xuICAgIHRoaXMuc3JjSGVpZ2h0ID0gb3guaW1hZ2VzW3RoaXMuc3JjXS5oZWlnaHQ7XG4gICAgdGhpcy5oZWlnaHQgPSB0aGlzLmhlaWdodCB8fCB0aGlzLnNyY0hlaWdodDtcbiAgICB0aGlzLnggPSB0aGlzLnggfHwgMDtcbiAgICB0aGlzLnkgPSB0aGlzLnkgfHwgMDtcbiAgICBpZiAodGhpcy5hbmltYXRpb24pIHtcbiAgICAgIHRoaXMuaW5pdEFuaW1hdGlvbigpO1xuICAgICAgdGhpcy51cGRhdGUgPSB0aGlzLnVwZGF0ZUFuaW1hdGlvbjtcbiAgICAgIHRoaXMuZHJhdyA9IHRoaXMuZHJhd0FuaW1hdGlvbjtcbiAgICB9XG4gIH0sXG5cbiAgaW5pdEFuaW1hdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaXNQbGF5aW5nID0gdHJ1ZTtcbiAgICB0aGlzLmlzRmluaXNoZWQgPSBmYWxzZTtcbiAgICBpZiAodHlwZW9mIHRoaXMubG9vcCAhPT0gJ2Jvb2xlYW4nKSB0aGlzLmxvb3AgPSB0cnVlO1xuICAgIHRoaXMuY291bnRlciA9IDA7XG4gICAgdGhpcy5mcmFtZVJhdGUgPSA2MCAvIHRoaXMuZnJhbWVSYXRlIHx8IDE7XG4gICAgdGhpcy5jYWxjdWxhdGVGcmFtZXMoKTtcblxuICAgIGlmICh0aGlzLmFuaW1hdGlvbnMpIHtcbiAgICAgIHRoaXMuYW5pbWF0aW9uQXJyYXkgPSB0aGlzLmFuaW1hdGlvbnNbdGhpcy5hbmltYXRpb25dXG4gICAgICB0aGlzLmFycmF5Q291bnRlciA9IDA7XG4gICAgICB0aGlzLmZyYW1lID0gdGhpcy5hbmltYXRpb25BcnJheVt0aGlzLmFycmF5Q291bnRlcl07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZnJhbWUgPSAwO1xuICAgIH1cbiAgfSxcblxuICBkcmF3OiBmdW5jdGlvbiAoKSB7XG4gICAgb3guY29udGV4dC5kcmF3U3ByaXRlKHRoaXMuc3JjLCB0aGlzLngsIHRoaXMueSk7XG4gIH0sXG5cbiAgZHJhd0FuaW1hdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIG94LmNvbnRleHQuZHJhd1Nwcml0ZSh0aGlzLnNyYywgdGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB0aGlzLmZyYW1lc1t0aGlzLmZyYW1lXSk7XG4gIH0sXG5cbiAgY2FsY3VsYXRlRnJhbWVzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHggPSB5ID0gMDtcbiAgICB0aGlzLmZyYW1lcyA9IFtbMCwgMF1dO1xuXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCB0aGlzLnNyY0hlaWdodCAvIHRoaXMuaGVpZ2h0ICogdGhpcy5zcmNXaWR0aCAvIHRoaXMud2lkdGg7IGkrKykge1xuICAgICAgaWYgKHggPCB0aGlzLnNyY1dpZHRoIC8gdGhpcy53aWR0aCAtIDEpIHtcbiAgICAgICAgeCsrO1xuICAgICAgfSBlbHNlIGlmICh5IDwgdGhpcy5zcmNIZWlnaHQgLyB0aGlzLmhlaWdodCAtIDEpIHtcbiAgICAgICAgeSsrO1xuICAgICAgICB4ID0gMDtcbiAgICAgIH1cbiAgICAgIHRoaXMuZnJhbWVzLnB1c2goW3gsIHldKTtcbiAgICB9XG4gIH0sXG5cbiAgdXBkYXRlQW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLmlzUGxheWluZykgcmV0dXJuO1xuICAgIGlmICh0aGlzLmlzRmluaXNoZWQpIHJldHVybiB0aGlzLmZpbmlzaGVkKCk7XG5cbiAgICB0aGlzLmNvdW50ZXIgKz0gMTtcbiAgICBpZiAodGhpcy5jb3VudGVyID4gdGhpcy5mcmFtZVJhdGUpIHtcbiAgICAgIHRoaXMuY291bnRlciA9IDA7XG4gICAgICBpZiAodGhpcy5hbmltYXRpb25zKSB0aGlzLm11bHRpcGxlQW5pbWF0aW9ucygpO1xuICAgICAgZWxzZSB0aGlzLnNpbmdsZUFuaW1hdGlvbigpO1xuICAgIH1cbiAgfSxcblxuICBtdWx0aXBsZUFuaW1hdGlvbnM6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5hcnJheUNvdW50ZXIgPT09IHRoaXMuYW5pbWF0aW9uQXJyYXkubGVuZ3RoIC0gMSkge1xuICAgICAgaWYgKCF0aGlzLmxvb3ApIHRoaXMuaXNGaW5pc2hlZCA9IHRydWU7XG4gICAgICB0aGlzLmZyYW1lID0gdGhpcy5hbmltYXRpb25BcnJheVswXVxuICAgICAgdGhpcy5hcnJheUNvdW50ZXIgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFycmF5Q291bnRlcisrO1xuICAgICAgdGhpcy5mcmFtZSA9IHRoaXMuYW5pbWF0aW9uQXJyYXlbdGhpcy5hcnJheUNvdW50ZXJdXG4gICAgfVxuICB9LFxuXG4gIHNpbmdsZUFuaW1hdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmZyYW1lID09PSAodGhpcy5mcmFtZXMubGVuZ3RoIC0gMSkpIHtcbiAgICAgIGlmICghdGhpcy5sb29wKSB0aGlzLmlzRmluaXNoZWQgPSB0cnVlO1xuICAgICAgdGhpcy5mcmFtZSA9IDBcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5mcmFtZSArPSAxO1xuICAgIH1cbiAgfSxcblxuICBmaW5pc2hlZDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc3RvcCgpO1xuICAgIGlmICh0aGlzLm9uRmluaXNoKSB0aGlzLm9uRmluaXNoKCk7XG4gIH0sXG5cbiAgcGxheTogZnVuY3Rpb24gKGFuaW1hdGlvbiwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gb3B0aW9ucykge1xuICAgICAgICB0aGlzW2tleV0gPSBvcHRpb25zW2tleV1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5hbmltYXRpb25zKSB7XG4gICAgICBpZiAoYW5pbWF0aW9uKSB0aGlzLmFuaW1hdGlvbiA9IGFuaW1hdGlvbjtcbiAgICAgIHRoaXMuYW5pbWF0aW9uQXJyYXkgPSB0aGlzLmFuaW1hdGlvbnNbdGhpcy5hbmltYXRpb25dO1xuICAgICAgdGhpcy5hcnJheUNvdW50ZXIgPSAwO1xuICAgICAgdGhpcy5mcmFtZSA9IHRoaXMuYW5pbWF0aW9uQXJyYXlbdGhpcy5hcnJheUNvdW50ZXJdO1xuICAgIH1cbiAgICB0aGlzLmlzRmluaXNoZWQgPSBmYWxzZTtcbiAgICB0aGlzLmlzUGxheWluZyA9IHRydWU7XG4gIH0sXG5cbiAgc3RvcDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaXNQbGF5aW5nID0gZmFsc2U7XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgbG9hZGluZzogcmVxdWlyZSgnLi9zY2VuZXMvbG9hZGluZy5qcycpLFxuICBtYWluOiByZXF1aXJlKCcuL3NjZW5lcy9tYWluLmpzJylcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIG94LnByZWxvYWRlci5sb2FkKHJlcXVpcmUoJy4uL2Fzc2V0cy5qcycpKTtcbiAgICB0aGlzLmJhckxlbmd0aCA9IG94LnByZWxvYWRlci5hc3NldHNUb0xvYWQ7XG4gIH0sXG5cbiAgZHJhdzogZnVuY3Rpb24gKCkge1xuICAgIG94LmNvbnRleHQuZmlsbFN0eWxlID0gXCJibGFja1wiXG4gICAgb3guY29udGV4dC5maWxsUmVjdCgwLCAwLCBveC5jYW52YXMud2lkdGgsIG94LmNhbnZhcy5oZWlnaHQpXG4gICAgb3guY29udGV4dC5maWxsU3R5bGUgPSBcInJnYig0NiwgMjM4LCAyNDUpXCJcbiAgICBveC5jb250ZXh0LmZpbGxSZWN0KG94LmNhbnZhcy53aWR0aCAvIDQsIDIgKiBveC5jYW52YXMuaGVpZ2h0IC8gMywgb3guY2FudmFzLndpZHRoIC8gMiwgMSlcbiAgICBveC5jb250ZXh0LmZpbGxTdHlsZSA9IFwiZ3JleVwiXG4gICAgb3guY29udGV4dC5zYXZlKClcbiAgICBveC5jb250ZXh0LnRyYW5zbGF0ZShveC5jYW52YXMud2lkdGggLyA0LCAyICogb3guY2FudmFzLmhlaWdodCAvIDMpXG4gICAgb3guY29udGV4dC5zY2FsZSgtMSwgMSlcbiAgICBveC5jb250ZXh0LmZpbGxSZWN0KC1veC5jYW52YXMud2lkdGggLyAyLCAwLCBveC5jYW52YXMud2lkdGggLyAyICogb3gucHJlbG9hZGVyLmFzc2V0c1RvTG9hZCAvIHRoaXMuYmFyTGVuZ3RoLCAxKVxuICAgIG94LmNvbnRleHQucmVzdG9yZSgpXG4gICAgb3guY29udGV4dC5maWxsU3R5bGUgPSBcIndoaXRlXCJcbiAgICBveC5jb250ZXh0LmZvbnQgPSAnMjAwJSBzYW5zLXNlcmlmJ1xuICAgIG94LmNvbnRleHQuZmlsbFRleHQoJ2xvYWRpbmcuLi4nLCBveC5jYW52YXMud2lkdGggLyAyIC0gNjgsIG94LmNhbnZhcy5oZWlnaHQgLyAyICsgMTApO1xuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmIChveC5wcmVsb2FkZXIuYXNzZXRzVG9Mb2FkID09PSAwKSBveC5zY2VuZXMuc2V0KCdtYWluJyk7XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucG9uZXkgPSBveC5zcGF3bigncG9uZXknKTtcbiAgICB0aGlzLnN0YXRpY1BvbnkgPSBveC5zcHJpdGUoJ3BvbnknKTtcbiAgICB0aGlzLnNwcml0ZTIgPSBveC5zcHJpdGUoJ2NvaW4yJywge1xuICAgICAgYW5pbWF0aW9uOiAnc3BpbicsXG4gICAgICBhbmltYXRpb25zOiB7XG4gICAgICAgIHNwaW46IFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5XSxcbiAgICAgICAgaWRsZTogWzgsIDQsIDgsIDQsIDgsIDQsIDgsIDQsIDgsIDQsIDgsIDQsIDgsIDQsIDgsIDRdXG4gICAgICB9LFxuICAgICAgaGVpZ2h0OiA0MCxcbiAgICAgIGZyYW1lUmF0ZTogMzAsXG4gICAgICB3aWR0aDogNDQsXG4gICAgfSk7XG5cbiAgICB0aGlzLnNwcml0ZTIucGxheSgnc3BpbicsIHtcbiAgICAgIGxvb3A6IGZhbHNlXG4gICAgfSk7XG5cbiAgfSxcbiAgdGVzdGluZzogZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKFwiSSB3YXMgY2FsbGVkIHdoZW4gdGhlIGFuaW1hdGlvbiBlbmRlZC5cIilcbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuICAgIHRoaXMuc3ByaXRlMi54ID0gb3gubW91c2UueDtcbiAgICB0aGlzLnNwcml0ZTIueSA9IG94Lm1vdXNlLnk7XG4gIH0sXG5cbiAga2V5RG93bjogZnVuY3Rpb24gKGtleSkge1xuICAgIGNvbnNvbGUubG9nKFwia2V5RG93bjogXCIgKyBrZXkpXG4gIH0sXG5cbiAga2V5UHJlc3M6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICBjb25zb2xlLmxvZyhcImtleVByZXNzOiBcIiArIGtleSlcbiAgfSxcblxuICBrZXlVcDogZnVuY3Rpb24gKGtleSkge1xuICAgIGNvbnNvbGUubG9nKFwia2V5VXA6IFwiICsga2V5KVxuICB9LFxuXG4gIG1vdXNlRG93bjogZnVuY3Rpb24gKGUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkNsaWNrZWQgYXQ6IFwiICsgb3gubW91c2UueCArIFwiLCBcIiArIG94Lm1vdXNlLnkpXG4gIH0sXG5cbiAgbW91c2VVcDogZnVuY3Rpb24gKGUpIHtcbiAgICBjb25zb2xlLmxvZyhcIlJlbGVhc2VkIGF0OiBcIiArIG94Lm1vdXNlLnggKyBcIiwgXCIgKyBveC5tb3VzZS55KVxuXG4gIH1cbn07XG4iXX0=
