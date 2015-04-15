(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = [
  './images/coin.png',
  './images/coin2.png',
  './images/coinTwisted.png',
  './images/pony.png',
  './images/pony2.png',
  './images/pony3.png',
  './images/pony4.png',
  './data/example.json'
];
},{}],2:[function(require,module,exports){
var context = require('./canvas');

module.exports = {
  set: function (x, y) {
    this.x = x;
    this.y = y;
  },

  start: function () {
    context.save();
    context.translate(this.x, this.y);
  }
};
},{"./canvas":3}],3:[function(require,module,exports){
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

},{"./keyboard":7,"./loader":8,"./mouse":10}],4:[function(require,module,exports){
window.onload = function () {
  this.ox = {
    canvas: require('./canvas').canvas,
    context: require('./canvas'),
    camera: require('./camera'),
    images: require('./loader').images,
    audio: require('./loader').audio,
    data: require('./loader').data,
    keyboard: require('./keyboard'),
    mouse: require('./mouse'),
    scenes: require('./scenesManager'),
    components: require('./entitiesManager'),
    save: require('./localStorage'),
    loop: require('./gameLoop'),
    preloader: require('./loader'),
    sprite: function (src, options) {
      var obj = options || {};
      obj.src = src;
      return this.components.spawn('sprite', obj);
    },
    spawn: function (name, options) {
      this.list = this.components.list;
      return this.components.spawn(name, options);
    }
  };

  ox.loop.calculateDelta();
  ox.scenes.set('loading');
  ox.loop.init();
};

},{"./camera":2,"./canvas":3,"./entitiesManager":5,"./gameLoop":6,"./keyboard":7,"./loader":8,"./localStorage":9,"./mouse":10,"./scenesManager":11}],5:[function(require,module,exports){
module.exports = {
  current: [],
  list: require('../entities.js'),
  dirtyZ: false,
  spawn: function (name, options) {
    if (!this.list[name]) throw new Error("Component '" + name + "' does not exist and cannot be spawned.");
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

},{"../entities.js":12}],6:[function(require,module,exports){
var entities = require('./entitiesManager'),
  scenes = require('./scenesManager'),
  context = require('./canvas'),
  camera = require('./camera');

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
  init: function () {
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

    requestAnimationFrame(this.init.bind(this));
  },

  draw: function (dt) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    camera.start();
    if (scenes.current.draw) scenes.current.draw(dt);
    for (var i = 0, len = entities.current.length; i < len; i++) {
      var entity = entities.current[i];
      if (entity.draw) entity.draw(dt);
    }
    context.restore();
  },

  update: function (dt) {
    if (scenes.current.update) scenes.current.update(dt);
    for (var i = 0, len = entities.current.length; i < len; i++) {
      var entity = entities.current[i];
      if (entity.update) entity.update(dt);
    }
  }
}

},{"./camera":2,"./canvas":3,"./entitiesManager":5,"./scenesManager":11}],7:[function(require,module,exports){
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

},{"./scenesManager":11}],8:[function(require,module,exports){
module.exports = {
  images: {},
  data: {},
  audio: {},
  assetsToLoad: 0,

  loadImage: function (path) {
    var name = path.slice(9, path.length);
    this.images[name] = new Image();
    this.images[name].onload = this.assetsToLoad--;
    this.images[name].src = path;
  },

  loadData: function (path) {
    console.log(path)
    var file = path.slice(7, path.length - 5),
      self = this,
      xhr = new XMLHttpRequest;

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        self.data[file] = JSON.parse(xhr.responseText);
        self.assetsToLoad--;
      }
    };

    xhr.open("GET", path);
    xhr.send();
  },

  loadAudio: function (name) {},

  load: function (list) {
    this.assetsToLoad += list.length;

    for (var i = 0; i < list.length; i++) {
      if (list[i].indexOf('./images') > -1) {
        this.loadImage(list[i]);
      } else if (list[i].indexOf('./data') > -1) {
        this.loadData(list[i]);
      } else if (list[i].indexOf('./audio') > -1) {
        this.loadAudio(list[i]);
      }
    }
  }
};
},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
var scene = require('./scenesManager');

module.exports = {
  x: 0,
  y: 0,
  isDown: false,

  onMove: function (e) {
    ox.mouse.x = e.clientX - ox.canvas.offsetLeft;
    ox.mouse.y = e.clientY - ox.canvas.offsetTop;
    if (scene.current.mouseMove) scene.current.mouseMove(ox.mouse)
  },
  onUp: function (e) {
    if (scene.current.mouseUp) scene.current.mouseUp(e);
    this.isDown = false;
  },
  onDown: function (e) {
    if (scene.current.mouseDown) scene.current.mouseDown(e);
    this.isDown = true;
  }
}
},{"./scenesManager":11}],11:[function(require,module,exports){
module.exports = {
  current: null,
  list: require('../scenes.js'),
  set: function (name) {
    if (!this.list[name]) throw new Error("Scene '" + name + "' does not exist!");
    this.current = this.list[name];
    if (this.current.init) this.current.init();
  }
}

},{"../scenes.js":17}],12:[function(require,module,exports){
module.exports = {
  counter: require('./entities/counter.js'),
  counter2: require('./entities/counter2.js'),
  poney: require('./entities/poney.js'),
  sprite: require('./entities/sprite.js')
};
},{"./entities/counter.js":13,"./entities/counter2.js":14,"./entities/poney.js":15,"./entities/sprite.js":16}],13:[function(require,module,exports){
module.exports = {
  init: function () {
    this.value = 100;
  },
  update: function () {
    this.value++;
  }
};

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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
    ox.context.drawSprite('pony.png', this.x, 0);
    ox.context.drawSprite('pony.png', this.x + 10, 0);
  }
};
},{}],16:[function(require,module,exports){
module.exports = {
  init: function () {
    this.isVisible = true;
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
},{}],17:[function(require,module,exports){
module.exports = {
  loading: require('./scenes/loading.js'),
  main: require('./scenes/main.js')
};
},{"./scenes/loading.js":18,"./scenes/main.js":19}],18:[function(require,module,exports){
module.exports = {
  init: function () {
    ox.preloader.load(require('../assets.js'));
    this.barLength = ox.preloader.assetsToLoad;
  },

  draw: function () {
    ox.context.fillStyle = "black"
    ox.context.fillRect(0, 0, ox.canvas.width, ox.canvas.height)
    ox.context.fillStyle = "rgb(46, 238, 245)"
    ox.context.fillRect(ox.canvas.width / 4, ox.canvas.height / 2 + 32, ox.canvas.width / 2, 1)
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

},{"../assets.js":1}],19:[function(require,module,exports){
module.exports = {
  init: function () {
    this.poney = ox.spawn('poney');
    this.staticPony = ox.sprite('pony.png');
    this.sprite2 = ox.sprite('coin2.png', {
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
      loop: true
    });

    this.sprite3 = ox.sprite('pony.png', {
      x: 100,
      y: 100
    });

  },

  update: function (dt) {
    this.sprite2.x = ox.mouse.x;
    this.sprite2.y = ox.mouse.y;

    ox.camera.set(ox.mouse.x, ox.mouse.y);
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
},{}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9hc3NldHMuanMiLCJzcmMvZW5naW5lL2NhbWVyYS5qcyIsInNyYy9lbmdpbmUvY2FudmFzLmpzIiwic3JjL2VuZ2luZS9jb3JlLmpzIiwic3JjL2VuZ2luZS9lbnRpdGllc01hbmFnZXIuanMiLCJzcmMvZW5naW5lL2dhbWVMb29wLmpzIiwic3JjL2VuZ2luZS9rZXlib2FyZC5qcyIsInNyYy9lbmdpbmUvbG9hZGVyLmpzIiwic3JjL2VuZ2luZS9sb2NhbFN0b3JhZ2UuanMiLCJzcmMvZW5naW5lL21vdXNlLmpzIiwic3JjL2VuZ2luZS9zY2VuZXNNYW5hZ2VyLmpzIiwic3JjL2VudGl0aWVzLmpzIiwic3JjL2VudGl0aWVzL2NvdW50ZXIuanMiLCJzcmMvZW50aXRpZXMvY291bnRlcjIuanMiLCJzcmMvZW50aXRpZXMvcG9uZXkuanMiLCJzcmMvZW50aXRpZXMvc3ByaXRlLmpzIiwic3JjL3NjZW5lcy5qcyIsInNyYy9zY2VuZXMvbG9hZGluZy5qcyIsInNyYy9zY2VuZXMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IFtcbiAgJy4vaW1hZ2VzL2NvaW4ucG5nJyxcbiAgJy4vaW1hZ2VzL2NvaW4yLnBuZycsXG4gICcuL2ltYWdlcy9jb2luVHdpc3RlZC5wbmcnLFxuICAnLi9pbWFnZXMvcG9ueS5wbmcnLFxuICAnLi9pbWFnZXMvcG9ueTIucG5nJyxcbiAgJy4vaW1hZ2VzL3BvbnkzLnBuZycsXG4gICcuL2ltYWdlcy9wb255NC5wbmcnLFxuICAnLi9kYXRhL2V4YW1wbGUuanNvbidcbl07IiwidmFyIGNvbnRleHQgPSByZXF1aXJlKCcuL2NhbnZhcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2V0OiBmdW5jdGlvbiAoeCwgeSkge1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgfSxcblxuICBzdGFydDogZnVuY3Rpb24gKCkge1xuICAgIGNvbnRleHQuc2F2ZSgpO1xuICAgIGNvbnRleHQudHJhbnNsYXRlKHRoaXMueCwgdGhpcy55KTtcbiAgfVxufTsiLCJ2YXIgaW1hZ2VzID0gcmVxdWlyZSgnLi9sb2FkZXInKS5pbWFnZXMsXG4gIGtleWJvYXJkID0gcmVxdWlyZSgnLi9rZXlib2FyZCcpLFxuICBtb3VzZSA9IHJlcXVpcmUoJy4vbW91c2UnKTtcblxudmFyIGNvbnRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJykuZ2V0Q29udGV4dCgnMmQnKTtcblxuY29udGV4dC5kcmF3U3ByaXRlID0gZnVuY3Rpb24gKHNyYywgeCwgeSwgd2lkdGgsIGhlaWdodCwgZnJhbWUpIHtcbiAgaWYgKHR5cGVvZiB3aWR0aCA9PT0gJ251bWJlcicpIHtcbiAgICBjb250ZXh0LmRyYXdJbWFnZShcbiAgICAgIGltYWdlc1tzcmNdLFxuICAgICAgd2lkdGggKiBmcmFtZVswXSxcbiAgICAgIGhlaWdodCAqIGZyYW1lWzFdLFxuICAgICAgd2lkdGgsIGhlaWdodCwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gIH0gZWxzZSB7XG4gICAgY29udGV4dC5kcmF3SW1hZ2UoaW1hZ2VzW3NyY10sIHgsIHkpO1xuICB9XG59O1xuXG5jYW52YXMudGFiSW5kZXggPSAxMDAwO1xuY2FudmFzLnN0eWxlLm91dGxpbmUgPSBcIm5vbmVcIjtcbmNhbnZhcy5vbmtleWRvd24gPSBrZXlib2FyZC5rZXlEb3duLmJpbmQoa2V5Ym9hcmQpO1xuY2FudmFzLm9ua2V5dXAgPSBrZXlib2FyZC5rZXlVcC5iaW5kKGtleWJvYXJkKTtcbmNhbnZhcy5vbm1vdXNlbW92ZSA9IG1vdXNlLm9uTW92ZS5iaW5kKG1vdXNlKTtcbmNhbnZhcy5vbm1vdXNlZG93biA9IG1vdXNlLm9uRG93bi5iaW5kKG1vdXNlKTtcbmNhbnZhcy5vbm1vdXNldXAgPSBtb3VzZS5vblVwLmJpbmQobW91c2UpO1xuY2FudmFzLmhlaWdodCA9IDIwMDA7XG5jYW52YXMuc3R5bGUuY3Vyc29yID0gXCJub25lXCI7XG5cbm1vZHVsZS5leHBvcnRzID0gY29udGV4dDtcbiIsIndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMub3ggPSB7XG4gICAgY2FudmFzOiByZXF1aXJlKCcuL2NhbnZhcycpLmNhbnZhcyxcbiAgICBjb250ZXh0OiByZXF1aXJlKCcuL2NhbnZhcycpLFxuICAgIGNhbWVyYTogcmVxdWlyZSgnLi9jYW1lcmEnKSxcbiAgICBpbWFnZXM6IHJlcXVpcmUoJy4vbG9hZGVyJykuaW1hZ2VzLFxuICAgIGF1ZGlvOiByZXF1aXJlKCcuL2xvYWRlcicpLmF1ZGlvLFxuICAgIGRhdGE6IHJlcXVpcmUoJy4vbG9hZGVyJykuZGF0YSxcbiAgICBrZXlib2FyZDogcmVxdWlyZSgnLi9rZXlib2FyZCcpLFxuICAgIG1vdXNlOiByZXF1aXJlKCcuL21vdXNlJyksXG4gICAgc2NlbmVzOiByZXF1aXJlKCcuL3NjZW5lc01hbmFnZXInKSxcbiAgICBjb21wb25lbnRzOiByZXF1aXJlKCcuL2VudGl0aWVzTWFuYWdlcicpLFxuICAgIHNhdmU6IHJlcXVpcmUoJy4vbG9jYWxTdG9yYWdlJyksXG4gICAgbG9vcDogcmVxdWlyZSgnLi9nYW1lTG9vcCcpLFxuICAgIHByZWxvYWRlcjogcmVxdWlyZSgnLi9sb2FkZXInKSxcbiAgICBzcHJpdGU6IGZ1bmN0aW9uIChzcmMsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBvYmogPSBvcHRpb25zIHx8IHt9O1xuICAgICAgb2JqLnNyYyA9IHNyYztcbiAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHMuc3Bhd24oJ3Nwcml0ZScsIG9iaik7XG4gICAgfSxcbiAgICBzcGF3bjogZnVuY3Rpb24gKG5hbWUsIG9wdGlvbnMpIHtcbiAgICAgIHRoaXMubGlzdCA9IHRoaXMuY29tcG9uZW50cy5saXN0O1xuICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy5zcGF3bihuYW1lLCBvcHRpb25zKTtcbiAgICB9XG4gIH07XG5cbiAgb3gubG9vcC5jYWxjdWxhdGVEZWx0YSgpO1xuICBveC5zY2VuZXMuc2V0KCdsb2FkaW5nJyk7XG4gIG94Lmxvb3AuaW5pdCgpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBjdXJyZW50OiBbXSxcbiAgbGlzdDogcmVxdWlyZSgnLi4vZW50aXRpZXMuanMnKSxcbiAgZGlydHlaOiBmYWxzZSxcbiAgc3Bhd246IGZ1bmN0aW9uIChuYW1lLCBvcHRpb25zKSB7XG4gICAgaWYgKCF0aGlzLmxpc3RbbmFtZV0pIHRocm93IG5ldyBFcnJvcihcIkNvbXBvbmVudCAnXCIgKyBuYW1lICsgXCInIGRvZXMgbm90IGV4aXN0IGFuZCBjYW5ub3QgYmUgc3Bhd25lZC5cIik7XG4gICAgdmFyIG9iaiA9IG9wdGlvbnMgfHwge307XG4gICAgZm9yICh2YXIga2V5IGluIHRoaXMubGlzdFtuYW1lXSkge1xuICAgICAgb2JqW2tleV0gPSB0aGlzLmxpc3RbbmFtZV1ba2V5XTtcbiAgICB9XG4gICAgb2JqLmRlc3Ryb3kgPSB0aGlzLmRlc3Ryb3kuYmluZChvYmopO1xuICAgIG9iai5yZXZpdmUgPSB0aGlzLnJldml2ZS5iaW5kKG9iaik7XG4gICAgb2JqLmlzQWxpdmUgPSB0cnVlO1xuICAgIHRoaXMuY3VycmVudC5wdXNoKG9iaik7XG4gICAgaWYgKG9iai5pbml0KSB7XG4gICAgICBvYmouaW5pdCgpO1xuICAgIH07XG4gICAgb2JqLmlzUmVhZHkgPSB0cnVlXG4gICAgcmV0dXJuIG9iajtcbiAgfSxcbiAgY2hlY2taOiBmdW5jdGlvbiAoZW50aXR5KSB7XG4gICAgaWYgKHR5cGVvZiBlbnRpdHkueiA9PT0gJ3VuZGVmaW5lZCcpIGVudGl0eS56ID0gMDtcbiAgICBpZiAoZW50aXR5LnogIT09IGVudGl0eS5sYXN0Wikge1xuICAgICAgZW50aXR5Lmxhc3RaID0gZW50aXR5Lno7XG4gICAgICB0aGlzLmRpcnR5WiA9IHRydWU7XG4gICAgfVxuICB9LFxuICBzb3J0QnlaOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jdXJyZW50LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIHJldHVybiBhLnogLSBiLno7XG4gICAgfSk7XG4gIH0sXG4gIGRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlzQWxpdmUgPSBmYWxzZTtcbiAgfSxcbiAgcmV2aXZlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pc0FsaXZlID0gdHJ1ZTtcbiAgfVxufTtcbiIsInZhciBlbnRpdGllcyA9IHJlcXVpcmUoJy4vZW50aXRpZXNNYW5hZ2VyJyksXG4gIHNjZW5lcyA9IHJlcXVpcmUoJy4vc2NlbmVzTWFuYWdlcicpLFxuICBjb250ZXh0ID0gcmVxdWlyZSgnLi9jYW52YXMnKSxcbiAgY2FtZXJhID0gcmVxdWlyZSgnLi9jYW1lcmEnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNwZWVkOiAxLFxuICBkdDogMCxcbiAgc3RlcDogMSAvIDYwLFxuICBsYXN0RGVsdGE6IG5ldyBEYXRlKCksXG4gIG5vdzogbmV3IERhdGUoKSxcbiAgY2FsY3VsYXRlRGVsdGE6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmxhc3REZWx0YSA9IHRoaXMubm93O1xuICAgIHRoaXMubm93ID0gbmV3IERhdGUoKTtcbiAgICB0aGlzLmR0ICs9IE1hdGgubWluKDEsICh0aGlzLm5vdyAtIHRoaXMubGFzdERlbHRhKSAvIDEwMDApICogdGhpcy5zcGVlZDtcbiAgfSxcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY2FsY3VsYXRlRGVsdGEoKTtcblxuICAgIGlmIChlbnRpdGllcy5kaXJ0eVopIHtcbiAgICAgIGVudGl0aWVzLnNvcnRCeVooKTtcbiAgICAgIGVudGl0aWVzLmRpcnR5WiA9IGZhbHNlO1xuICAgIH1cblxuICAgIHdoaWxlICh0aGlzLmR0ID4gdGhpcy5zdGVwKSB7XG4gICAgICB0aGlzLmR0IC09IHRoaXMuc3RlcDtcbiAgICAgIHRoaXMudXBkYXRlKHRoaXMuc3RlcCk7XG4gICAgfVxuICAgIHRoaXMuZHJhdyh0aGlzLmR0KTtcblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmluaXQuYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgZHJhdzogZnVuY3Rpb24gKGR0KSB7XG4gICAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgY29udGV4dC5jYW52YXMud2lkdGgsIGNvbnRleHQuY2FudmFzLmhlaWdodCk7XG4gICAgY2FtZXJhLnN0YXJ0KCk7XG4gICAgaWYgKHNjZW5lcy5jdXJyZW50LmRyYXcpIHNjZW5lcy5jdXJyZW50LmRyYXcoZHQpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBlbnRpdGllcy5jdXJyZW50Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB2YXIgZW50aXR5ID0gZW50aXRpZXMuY3VycmVudFtpXTtcbiAgICAgIGlmIChlbnRpdHkuZHJhdykgZW50aXR5LmRyYXcoZHQpO1xuICAgIH1cbiAgICBjb250ZXh0LnJlc3RvcmUoKTtcbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuICAgIGlmIChzY2VuZXMuY3VycmVudC51cGRhdGUpIHNjZW5lcy5jdXJyZW50LnVwZGF0ZShkdCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGVudGl0aWVzLmN1cnJlbnQubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHZhciBlbnRpdHkgPSBlbnRpdGllcy5jdXJyZW50W2ldO1xuICAgICAgaWYgKGVudGl0eS51cGRhdGUpIGVudGl0eS51cGRhdGUoZHQpO1xuICAgIH1cbiAgfVxufVxuIiwidmFyIHNjZW5lID0gcmVxdWlyZSgnLi9zY2VuZXNNYW5hZ2VyJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNQcmVzc2VkOiB7fSxcblxuICBrZXlEb3duOiBmdW5jdGlvbiAoZSkge1xuICAgIGlmIChlLmtleUNvZGUgPT09IDMyIHx8IChlLmtleUNvZGUgPj0gMzcgJiYgZS5rZXlDb2RlIDw9IDQwKSlcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAoc2NlbmUuY3VycmVudC5rZXlEb3duKSBzY2VuZS5jdXJyZW50LmtleURvd24odGhpcy5rZXlzW2Uua2V5Q29kZV0pO1xuICAgIHRoaXMua2V5UHJlc3MoZSk7XG4gIH0sXG5cbiAga2V5UHJlc3M6IGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKHRoaXMuaXNQcmVzc2VkW2Uua2V5Q29kZV0pIHJldHVybjtcbiAgICBpZiAoc2NlbmUuY3VycmVudC5rZXlQcmVzcykgc2NlbmUuY3VycmVudC5rZXlQcmVzcyh0aGlzLmtleXNbZS5rZXlDb2RlXSk7XG4gICAgdGhpcy5pc1ByZXNzZWRbZS5rZXlDb2RlXSA9IHRydWU7XG4gIH0sXG5cbiAga2V5VXA6IGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKHNjZW5lLmN1cnJlbnQua2V5VXApIHNjZW5lLmN1cnJlbnQua2V5VXAodGhpcy5rZXlzW2Uua2V5Q29kZV0pO1xuICAgIHRoaXMuaXNQcmVzc2VkW2Uua2V5Q29kZV0gPSBmYWxzZTtcbiAgfSxcblxuICBrZXlzOiB7XG4gICAgODogJ2JhY2tzcGFjZScsXG4gICAgOTogJ3RhYicsXG4gICAgMTM6ICdlbnRlcicsXG4gICAgMTY6ICdzaGlmdCcsXG4gICAgMTc6ICdjdHJsJyxcbiAgICAxODogJ2FsdCcsXG4gICAgMTk6ICdwYXVzZScsXG4gICAgMjA6ICdjYXBzX2xvY2snLFxuICAgIDI3OiAnZXNjJyxcbiAgICAzMjogJ3NwYWNlYmFyJyxcbiAgICAzMzogJ3BhZ2VfdXAnLFxuICAgIDM0OiAncGFnZV9kb3duJyxcbiAgICAzNTogJ2VuZCcsXG4gICAgMzY6ICdob21lJyxcbiAgICAzNzogJ2xlZnQnLFxuICAgIDM4OiAndXAnLFxuICAgIDM5OiAncmlnaHQnLFxuICAgIDQwOiAnZG93bicsXG4gICAgNDQ6ICdwcmludF9zY3JlZW4nLFxuICAgIDQ1OiAnaW5zZXJ0JyxcbiAgICA0NjogJ2RlbGV0ZScsXG4gICAgNDg6ICcwJyxcbiAgICA0OTogJzEnLFxuICAgIDUwOiAnMicsXG4gICAgNTE6ICczJyxcbiAgICA1MjogJzQnLFxuICAgIDUzOiAnNScsXG4gICAgNTQ6ICc2JyxcbiAgICA1NTogJzcnLFxuICAgIDU2OiAnOCcsXG4gICAgNTc6ICc5JyxcbiAgICA2NTogJ2EnLFxuICAgIDY2OiAnYicsXG4gICAgNjc6ICdjJyxcbiAgICA2ODogJ2QnLFxuICAgIDY5OiAnZScsXG4gICAgNzA6ICdmJyxcbiAgICA3MTogJ2cnLFxuICAgIDcyOiAnaCcsXG4gICAgNzM6ICdpJyxcbiAgICA3NDogJ2onLFxuICAgIDc1OiAnaycsXG4gICAgNzY6ICdsJyxcbiAgICA3NzogJ20nLFxuICAgIDc4OiAnbicsXG4gICAgNzk6ICdvJyxcbiAgICA4MDogJ3AnLFxuICAgIDgxOiAncScsXG4gICAgODI6ICdyJyxcbiAgICA4MzogJ3MnLFxuICAgIDg0OiAndCcsXG4gICAgODU6ICd1JyxcbiAgICA4NjogJ3YnLFxuICAgIDg3OiAndycsXG4gICAgODg6ICd4JyxcbiAgICA4OTogJ3knLFxuICAgIDkwOiAneicsXG4gICAgOTY6ICdudW1femVybycsXG4gICAgOTc6ICdudW1fb25lJyxcbiAgICA5ODogJ251bV90d28nLFxuICAgIDk5OiAnbnVtX3RocmVlJyxcbiAgICAxMDA6ICdudW1fZm91cicsXG4gICAgMTAxOiAnbnVtX2ZpdmUnLFxuICAgIDEwMjogJ251bV9zaXgnLFxuICAgIDEwMzogJ251bV9zZXZlbicsXG4gICAgMTA0OiAnbnVtX2VpZ2h0JyxcbiAgICAxMDU6ICdudW1fbmluZScsXG4gICAgMTA2OiAnbnVtX211bHRpcGx5JyxcbiAgICAxMDc6ICdudW1fcGx1cycsXG4gICAgMTA5OiAnbnVtX21pbnVzJyxcbiAgICAxMTA6ICdudW1fcGVyaW9kJyxcbiAgICAxMTE6ICdudW1fZGl2aXNpb24nLFxuICAgIDExMjogJ2YxJyxcbiAgICAxMTM6ICdmMicsXG4gICAgMTE0OiAnZjMnLFxuICAgIDExNTogJ2Y0JyxcbiAgICAxMTY6ICdmNScsXG4gICAgMTE3OiAnZjYnLFxuICAgIDExODogJ2Y3JyxcbiAgICAxMTk6ICdmOCcsXG4gICAgMTIwOiAnZjknLFxuICAgIDEyMTogJ2YxMCcsXG4gICAgMTIyOiAnZjExJyxcbiAgICAxMjM6ICdmMTInLFxuICAgIDE4NjogJ3NlbWljb2xvbicsXG4gICAgMTg3OiAncGx1cycsXG4gICAgMTg5OiAnbWludXMnLFxuICAgIDE5MjogJ2dyYXZlX2FjY2VudCcsXG4gICAgMjIyOiAnc2luZ2xlX3F1b3RlJ1xuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW1hZ2VzOiB7fSxcbiAgZGF0YToge30sXG4gIGF1ZGlvOiB7fSxcbiAgYXNzZXRzVG9Mb2FkOiAwLFxuXG4gIGxvYWRJbWFnZTogZnVuY3Rpb24gKHBhdGgpIHtcbiAgICB2YXIgbmFtZSA9IHBhdGguc2xpY2UoOSwgcGF0aC5sZW5ndGgpO1xuICAgIHRoaXMuaW1hZ2VzW25hbWVdID0gbmV3IEltYWdlKCk7XG4gICAgdGhpcy5pbWFnZXNbbmFtZV0ub25sb2FkID0gdGhpcy5hc3NldHNUb0xvYWQtLTtcbiAgICB0aGlzLmltYWdlc1tuYW1lXS5zcmMgPSBwYXRoO1xuICB9LFxuXG4gIGxvYWREYXRhOiBmdW5jdGlvbiAocGF0aCkge1xuICAgIGNvbnNvbGUubG9nKHBhdGgpXG4gICAgdmFyIGZpbGUgPSBwYXRoLnNsaWNlKDcsIHBhdGgubGVuZ3RoIC0gNSksXG4gICAgICBzZWxmID0gdGhpcyxcbiAgICAgIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdDtcblxuICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQgJiYgeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgIHNlbGYuZGF0YVtmaWxlXSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIHNlbGYuYXNzZXRzVG9Mb2FkLS07XG4gICAgICB9XG4gICAgfTtcblxuICAgIHhoci5vcGVuKFwiR0VUXCIsIHBhdGgpO1xuICAgIHhoci5zZW5kKCk7XG4gIH0sXG5cbiAgbG9hZEF1ZGlvOiBmdW5jdGlvbiAobmFtZSkge30sXG5cbiAgbG9hZDogZnVuY3Rpb24gKGxpc3QpIHtcbiAgICB0aGlzLmFzc2V0c1RvTG9hZCArPSBsaXN0Lmxlbmd0aDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGxpc3RbaV0uaW5kZXhPZignLi9pbWFnZXMnKSA+IC0xKSB7XG4gICAgICAgIHRoaXMubG9hZEltYWdlKGxpc3RbaV0pO1xuICAgICAgfSBlbHNlIGlmIChsaXN0W2ldLmluZGV4T2YoJy4vZGF0YScpID4gLTEpIHtcbiAgICAgICAgdGhpcy5sb2FkRGF0YShsaXN0W2ldKTtcbiAgICAgIH0gZWxzZSBpZiAobGlzdFtpXS5pbmRleE9mKCcuL2F1ZGlvJykgPiAtMSkge1xuICAgICAgICB0aGlzLmxvYWRBdWRpbyhsaXN0W2ldKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIHN0b3JlOiBmdW5jdGlvbiAobnVtLCBvYmopIHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShudW0sIEpTT04uc3RyaW5naWZ5KG9iaikpO1xuICB9LFxuICBsb2FkOiBmdW5jdGlvbiAobnVtKSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0obnVtKSk7XG4gIH0sXG4gIHJlbW92ZTogZnVuY3Rpb24gKG51bSkge1xuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKG51bSk7XG4gIH1cbn1cbiIsInZhciBzY2VuZSA9IHJlcXVpcmUoJy4vc2NlbmVzTWFuYWdlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgeDogMCxcbiAgeTogMCxcbiAgaXNEb3duOiBmYWxzZSxcblxuICBvbk1vdmU6IGZ1bmN0aW9uIChlKSB7XG4gICAgb3gubW91c2UueCA9IGUuY2xpZW50WCAtIG94LmNhbnZhcy5vZmZzZXRMZWZ0O1xuICAgIG94Lm1vdXNlLnkgPSBlLmNsaWVudFkgLSBveC5jYW52YXMub2Zmc2V0VG9wO1xuICAgIGlmIChzY2VuZS5jdXJyZW50Lm1vdXNlTW92ZSkgc2NlbmUuY3VycmVudC5tb3VzZU1vdmUob3gubW91c2UpXG4gIH0sXG4gIG9uVXA6IGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKHNjZW5lLmN1cnJlbnQubW91c2VVcCkgc2NlbmUuY3VycmVudC5tb3VzZVVwKGUpO1xuICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XG4gIH0sXG4gIG9uRG93bjogZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoc2NlbmUuY3VycmVudC5tb3VzZURvd24pIHNjZW5lLmN1cnJlbnQubW91c2VEb3duKGUpO1xuICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcbiAgfVxufSIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBjdXJyZW50OiBudWxsLFxuICBsaXN0OiByZXF1aXJlKCcuLi9zY2VuZXMuanMnKSxcbiAgc2V0OiBmdW5jdGlvbiAobmFtZSkge1xuICAgIGlmICghdGhpcy5saXN0W25hbWVdKSB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSAnXCIgKyBuYW1lICsgXCInIGRvZXMgbm90IGV4aXN0IVwiKTtcbiAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLmxpc3RbbmFtZV07XG4gICAgaWYgKHRoaXMuY3VycmVudC5pbml0KSB0aGlzLmN1cnJlbnQuaW5pdCgpO1xuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY291bnRlcjogcmVxdWlyZSgnLi9lbnRpdGllcy9jb3VudGVyLmpzJyksXG4gIGNvdW50ZXIyOiByZXF1aXJlKCcuL2VudGl0aWVzL2NvdW50ZXIyLmpzJyksXG4gIHBvbmV5OiByZXF1aXJlKCcuL2VudGl0aWVzL3BvbmV5LmpzJyksXG4gIHNwcml0ZTogcmVxdWlyZSgnLi9lbnRpdGllcy9zcHJpdGUuanMnKVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudmFsdWUgPSAxMDA7XG4gIH0sXG4gIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudmFsdWUrKztcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52ID0gMTAxO1xuICAgIHRoaXMudmFsdWUgPSAwO1xuICAgIHRoaXMuYyA9IG94LmVudGl0aWVzLnNwYXduKCdjb3VudGVyJyk7XG4gIH0sXG4gIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudmFsdWUrKztcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy54ID0gMDtcbiAgfSxcblxuICBkcmF3OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy54Kys7XG4gICAgb3guY29udGV4dC5maWxsU3R5bGUgPSAnYmx1ZSdcbiAgICBveC5jb250ZXh0LmZpbGxSZWN0KDgwLCA4MCwgMTAwLCAyMDApXG4gICAgb3guY29udGV4dC5zdHJva2VTdHlsZSA9ICdncmV5J1xuICAgIG94LmNvbnRleHQuc3Ryb2tlUmVjdCg4MCwgODAsIDEwMCwgMjAwKVxuICAgIG94LmNvbnRleHQuZHJhd1Nwcml0ZSgncG9ueS5wbmcnLCB0aGlzLngsIDApO1xuICAgIG94LmNvbnRleHQuZHJhd1Nwcml0ZSgncG9ueS5wbmcnLCB0aGlzLnggKyAxMCwgMCk7XG4gIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlzVmlzaWJsZSA9IHRydWU7XG4gICAgdGhpcy5zcmNXaWR0aCA9IG94LmltYWdlc1t0aGlzLnNyY10ud2lkdGg7XG4gICAgdGhpcy53aWR0aCA9IHRoaXMud2lkdGggfHwgdGhpcy5zcmNXaWR0aDtcbiAgICB0aGlzLnNyY0hlaWdodCA9IG94LmltYWdlc1t0aGlzLnNyY10uaGVpZ2h0O1xuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5oZWlnaHQgfHwgdGhpcy5zcmNIZWlnaHQ7XG4gICAgdGhpcy54ID0gdGhpcy54IHx8IDA7XG4gICAgdGhpcy55ID0gdGhpcy55IHx8IDA7XG4gICAgaWYgKHRoaXMuYW5pbWF0aW9uKSB7XG4gICAgICB0aGlzLmluaXRBbmltYXRpb24oKTtcbiAgICAgIHRoaXMudXBkYXRlID0gdGhpcy51cGRhdGVBbmltYXRpb247XG4gICAgICB0aGlzLmRyYXcgPSB0aGlzLmRyYXdBbmltYXRpb247XG4gICAgfVxuICB9LFxuXG4gIGluaXRBbmltYXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlzUGxheWluZyA9IHRydWU7XG4gICAgdGhpcy5pc0ZpbmlzaGVkID0gZmFsc2U7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmxvb3AgIT09ICdib29sZWFuJykgdGhpcy5sb29wID0gdHJ1ZTtcbiAgICB0aGlzLmNvdW50ZXIgPSAwO1xuICAgIHRoaXMuZnJhbWVSYXRlID0gNjAgLyB0aGlzLmZyYW1lUmF0ZSB8fCAxO1xuICAgIHRoaXMuY2FsY3VsYXRlRnJhbWVzKCk7XG5cbiAgICBpZiAodGhpcy5hbmltYXRpb25zKSB7XG4gICAgICB0aGlzLmFuaW1hdGlvbkFycmF5ID0gdGhpcy5hbmltYXRpb25zW3RoaXMuYW5pbWF0aW9uXVxuICAgICAgdGhpcy5hcnJheUNvdW50ZXIgPSAwO1xuICAgICAgdGhpcy5mcmFtZSA9IHRoaXMuYW5pbWF0aW9uQXJyYXlbdGhpcy5hcnJheUNvdW50ZXJdO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZyYW1lID0gMDtcbiAgICB9XG4gIH0sXG5cbiAgZHJhdzogZnVuY3Rpb24gKCkge1xuICAgIG94LmNvbnRleHQuZHJhd1Nwcml0ZSh0aGlzLnNyYywgdGhpcy54LCB0aGlzLnkpO1xuICB9LFxuXG4gIGRyYXdBbmltYXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICBveC5jb250ZXh0LmRyYXdTcHJpdGUodGhpcy5zcmMsIHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdGhpcy5mcmFtZXNbdGhpcy5mcmFtZV0pO1xuICB9LFxuXG4gIGNhbGN1bGF0ZUZyYW1lczogZnVuY3Rpb24gKCkge1xuICAgIHZhciB4ID0geSA9IDA7XG4gICAgdGhpcy5mcmFtZXMgPSBbWzAsIDBdXTtcblxuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgdGhpcy5zcmNIZWlnaHQgLyB0aGlzLmhlaWdodCAqIHRoaXMuc3JjV2lkdGggLyB0aGlzLndpZHRoOyBpKyspIHtcbiAgICAgIGlmICh4IDwgdGhpcy5zcmNXaWR0aCAvIHRoaXMud2lkdGggLSAxKSB7XG4gICAgICAgIHgrKztcbiAgICAgIH0gZWxzZSBpZiAoeSA8IHRoaXMuc3JjSGVpZ2h0IC8gdGhpcy5oZWlnaHQgLSAxKSB7XG4gICAgICAgIHkrKztcbiAgICAgICAgeCA9IDA7XG4gICAgICB9XG4gICAgICB0aGlzLmZyYW1lcy5wdXNoKFt4LCB5XSk7XG4gICAgfVxuICB9LFxuXG4gIHVwZGF0ZUFuaW1hdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5pc1BsYXlpbmcpIHJldHVybjtcbiAgICBpZiAodGhpcy5pc0ZpbmlzaGVkKSByZXR1cm4gdGhpcy5maW5pc2hlZCgpO1xuXG4gICAgdGhpcy5jb3VudGVyICs9IDE7XG4gICAgaWYgKHRoaXMuY291bnRlciA+IHRoaXMuZnJhbWVSYXRlKSB7XG4gICAgICB0aGlzLmNvdW50ZXIgPSAwO1xuICAgICAgaWYgKHRoaXMuYW5pbWF0aW9ucykgdGhpcy5tdWx0aXBsZUFuaW1hdGlvbnMoKTtcbiAgICAgIGVsc2UgdGhpcy5zaW5nbGVBbmltYXRpb24oKTtcbiAgICB9XG4gIH0sXG5cbiAgbXVsdGlwbGVBbmltYXRpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuYXJyYXlDb3VudGVyID09PSB0aGlzLmFuaW1hdGlvbkFycmF5Lmxlbmd0aCAtIDEpIHtcbiAgICAgIGlmICghdGhpcy5sb29wKSB0aGlzLmlzRmluaXNoZWQgPSB0cnVlO1xuICAgICAgdGhpcy5mcmFtZSA9IHRoaXMuYW5pbWF0aW9uQXJyYXlbMF1cbiAgICAgIHRoaXMuYXJyYXlDb3VudGVyID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5hcnJheUNvdW50ZXIrKztcbiAgICAgIHRoaXMuZnJhbWUgPSB0aGlzLmFuaW1hdGlvbkFycmF5W3RoaXMuYXJyYXlDb3VudGVyXVxuICAgIH1cbiAgfSxcblxuICBzaW5nbGVBbmltYXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5mcmFtZSA9PT0gKHRoaXMuZnJhbWVzLmxlbmd0aCAtIDEpKSB7XG4gICAgICBpZiAoIXRoaXMubG9vcCkgdGhpcy5pc0ZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuZnJhbWUgPSAwXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZnJhbWUgKz0gMTtcbiAgICB9XG4gIH0sXG5cbiAgZmluaXNoZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnN0b3AoKTtcbiAgICBpZiAodGhpcy5vbkZpbmlzaCkgdGhpcy5vbkZpbmlzaCgpO1xuICB9LFxuXG4gIHBsYXk6IGZ1bmN0aW9uIChhbmltYXRpb24sIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgZm9yICh2YXIga2V5IGluIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpc1trZXldID0gb3B0aW9uc1trZXldXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYW5pbWF0aW9ucykge1xuICAgICAgaWYgKGFuaW1hdGlvbikgdGhpcy5hbmltYXRpb24gPSBhbmltYXRpb247XG4gICAgICB0aGlzLmFuaW1hdGlvbkFycmF5ID0gdGhpcy5hbmltYXRpb25zW3RoaXMuYW5pbWF0aW9uXTtcbiAgICAgIHRoaXMuYXJyYXlDb3VudGVyID0gMDtcbiAgICAgIHRoaXMuZnJhbWUgPSB0aGlzLmFuaW1hdGlvbkFycmF5W3RoaXMuYXJyYXlDb3VudGVyXTtcbiAgICB9XG4gICAgdGhpcy5pc0ZpbmlzaGVkID0gZmFsc2U7XG4gICAgdGhpcy5pc1BsYXlpbmcgPSB0cnVlO1xuICB9LFxuXG4gIHN0b3A6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlzUGxheWluZyA9IGZhbHNlO1xuICB9XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBsb2FkaW5nOiByZXF1aXJlKCcuL3NjZW5lcy9sb2FkaW5nLmpzJyksXG4gIG1haW46IHJlcXVpcmUoJy4vc2NlbmVzL21haW4uanMnKVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIG94LnByZWxvYWRlci5sb2FkKHJlcXVpcmUoJy4uL2Fzc2V0cy5qcycpKTtcbiAgICB0aGlzLmJhckxlbmd0aCA9IG94LnByZWxvYWRlci5hc3NldHNUb0xvYWQ7XG4gIH0sXG5cbiAgZHJhdzogZnVuY3Rpb24gKCkge1xuICAgIG94LmNvbnRleHQuZmlsbFN0eWxlID0gXCJibGFja1wiXG4gICAgb3guY29udGV4dC5maWxsUmVjdCgwLCAwLCBveC5jYW52YXMud2lkdGgsIG94LmNhbnZhcy5oZWlnaHQpXG4gICAgb3guY29udGV4dC5maWxsU3R5bGUgPSBcInJnYig0NiwgMjM4LCAyNDUpXCJcbiAgICBveC5jb250ZXh0LmZpbGxSZWN0KG94LmNhbnZhcy53aWR0aCAvIDQsIG94LmNhbnZhcy5oZWlnaHQgLyAyICsgMzIsIG94LmNhbnZhcy53aWR0aCAvIDIsIDEpXG4gICAgb3guY29udGV4dC5maWxsU3R5bGUgPSBcImdyZXlcIlxuICAgIG94LmNvbnRleHQuc2F2ZSgpXG4gICAgb3guY29udGV4dC50cmFuc2xhdGUob3guY2FudmFzLndpZHRoIC8gNCwgMiAqIG94LmNhbnZhcy5oZWlnaHQgLyAzKVxuICAgIG94LmNvbnRleHQuc2NhbGUoLTEsIDEpXG4gICAgb3guY29udGV4dC5maWxsUmVjdCgtb3guY2FudmFzLndpZHRoIC8gMiwgMCwgb3guY2FudmFzLndpZHRoIC8gMiAqIG94LnByZWxvYWRlci5hc3NldHNUb0xvYWQgLyB0aGlzLmJhckxlbmd0aCwgMSlcbiAgICBveC5jb250ZXh0LnJlc3RvcmUoKVxuICAgIG94LmNvbnRleHQuZmlsbFN0eWxlID0gXCJ3aGl0ZVwiXG4gICAgb3guY29udGV4dC5mb250ID0gJzIwMCUgc2Fucy1zZXJpZidcbiAgICBveC5jb250ZXh0LmZpbGxUZXh0KCdsb2FkaW5nLi4uJywgb3guY2FudmFzLndpZHRoIC8gMiAtIDY4LCBveC5jYW52YXMuaGVpZ2h0IC8gMiArIDEwKTtcbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAob3gucHJlbG9hZGVyLmFzc2V0c1RvTG9hZCA9PT0gMCkgb3guc2NlbmVzLnNldCgnbWFpbicpO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnBvbmV5ID0gb3guc3Bhd24oJ3BvbmV5Jyk7XG4gICAgdGhpcy5zdGF0aWNQb255ID0gb3guc3ByaXRlKCdwb255LnBuZycpO1xuICAgIHRoaXMuc3ByaXRlMiA9IG94LnNwcml0ZSgnY29pbjIucG5nJywge1xuICAgICAgYW5pbWF0aW9uOiAnc3BpbicsXG4gICAgICBhbmltYXRpb25zOiB7XG4gICAgICAgIHNwaW46IFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5XSxcbiAgICAgICAgaWRsZTogWzgsIDQsIDgsIDQsIDgsIDQsIDgsIDQsIDgsIDQsIDgsIDQsIDgsIDQsIDgsIDRdXG4gICAgICB9LFxuICAgICAgaGVpZ2h0OiA0MCxcbiAgICAgIGZyYW1lUmF0ZTogMzAsXG4gICAgICB3aWR0aDogNDQsXG4gICAgfSk7XG5cbiAgICB0aGlzLnNwcml0ZTIucGxheSgnc3BpbicsIHtcbiAgICAgIGxvb3A6IHRydWVcbiAgICB9KTtcblxuICAgIHRoaXMuc3ByaXRlMyA9IG94LnNwcml0ZSgncG9ueS5wbmcnLCB7XG4gICAgICB4OiAxMDAsXG4gICAgICB5OiAxMDBcbiAgICB9KTtcblxuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG4gICAgdGhpcy5zcHJpdGUyLnggPSBveC5tb3VzZS54O1xuICAgIHRoaXMuc3ByaXRlMi55ID0gb3gubW91c2UueTtcblxuICAgIG94LmNhbWVyYS5zZXQob3gubW91c2UueCwgb3gubW91c2UueSk7XG4gIH0sXG5cbiAga2V5RG93bjogZnVuY3Rpb24gKGtleSkge1xuICAgIGNvbnNvbGUubG9nKFwia2V5RG93bjogXCIgKyBrZXkpXG4gIH0sXG5cbiAga2V5UHJlc3M6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICBjb25zb2xlLmxvZyhcImtleVByZXNzOiBcIiArIGtleSlcbiAgfSxcblxuICBrZXlVcDogZnVuY3Rpb24gKGtleSkge1xuICAgIGNvbnNvbGUubG9nKFwia2V5VXA6IFwiICsga2V5KVxuICB9LFxuXG4gIG1vdXNlRG93bjogZnVuY3Rpb24gKGUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkNsaWNrZWQgYXQ6IFwiICsgb3gubW91c2UueCArIFwiLCBcIiArIG94Lm1vdXNlLnkpXG4gIH0sXG5cbiAgbW91c2VVcDogZnVuY3Rpb24gKGUpIHtcbiAgICBjb25zb2xlLmxvZyhcIlJlbGVhc2VkIGF0OiBcIiArIG94Lm1vdXNlLnggKyBcIiwgXCIgKyBveC5tb3VzZS55KVxuXG4gIH1cbn07Il19
