(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  images: [
    'pony',
    'pony2',
    'pony3',
    'pony4',
    'pony5',
    'coin',
    'coinTwisted',
    'coin2'
    ],

  data: ['example'],

  audio: []
}

},{}],2:[function(require,module,exports){
module.exports = {
  init: function () {
    this.value = 100;
  },
  update: function () {
    this.value++;
  }
};

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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

},{"./keyboard":10,"./loader":11,"./mouse":13}],7:[function(require,module,exports){
var components = {"counter": require("../components/counter"), "counter2": require("../components/counter2"), "poney": require("../components/poney"), "sprite": require("../components/sprite")};
var list = [];
for (var key in components) {
  list.push(components[key])
}
console.log("hey", components, list);

module.exports = {
  current: [],
  dirtyZ: false,
  spawn: function (name, options) {
    console.log("spawning " + name)
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
},{"../components/counter":2,"../components/counter2":3,"../components/poney":4,"../components/sprite":5}],8:[function(require,module,exports){
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
    components: require('./componentsManager'),
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
  ox.loop.run();
};
},{"./canvas":6,"./componentsManager":7,"./gameLoop":9,"./keyboard":10,"./loader":11,"./localStorage":12,"./mouse":13,"./scenesManager":14}],9:[function(require,module,exports){
var entities = require('./componentsManager'),
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
},{"./canvas":6,"./componentsManager":7,"./scenesManager":14}],10:[function(require,module,exports){
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

},{"./scenesManager":14}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{"./scenesManager":14}],14:[function(require,module,exports){
module.exports = {
  current: null,
  list: require('../scenes'),
  set: function (name) {
    if (!this.list[name]) throw new Error("Scene '" + name + "' does not exist!");
    this.current = this.list[name];
    if (this.current.init) this.current.init();
  }
}

},{"../scenes":15}],15:[function(require,module,exports){
module.exports = {
  loading: require('./scenes/loading'),
  main: require('./scenes/main')
};

},{"./scenes/loading":16,"./scenes/main":17}],16:[function(require,module,exports){
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
},{"../assets.js":1}],17:[function(require,module,exports){
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
},{}]},{},[8]);
