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
module.exports = {
  current: [],
  list: {"counter": require("../components/counter"), "counter2": require("../components/counter2"), "poney": require("../components/poney"), "sprite": require("../components/sprite")},
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
  list: {"loading": require("../scenes/loading"), "main": require("../scenes/main")},
  set: function (name) {
    if (!this.list[name]) throw new Error("Scene '" + name + "' does not exist!");
    this.current = this.list[name];
    if (this.current.init) this.current.init();
  }
}
},{"../scenes/loading":15,"../scenes/main":16}],15:[function(require,module,exports){
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
},{"../assets.js":1}],16:[function(require,module,exports){
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
},{}]},{},[8])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9hc3NldHMuanMiLCJzcmMvY29tcG9uZW50cy9jb3VudGVyLmpzIiwic3JjL2NvbXBvbmVudHMvY291bnRlcjIuanMiLCJzcmMvY29tcG9uZW50cy9wb25leS5qcyIsInNyYy9jb21wb25lbnRzL3Nwcml0ZS5qcyIsInNyYy9lbmdpbmUvY2FudmFzLmpzIiwic3JjL2VuZ2luZS9jb21wb25lbnRzTWFuYWdlci5qcyIsInNyYy9lbmdpbmUvY29yZS5qcyIsInNyYy9lbmdpbmUvZ2FtZUxvb3AuanMiLCJzcmMvZW5naW5lL2tleWJvYXJkLmpzIiwic3JjL2VuZ2luZS9sb2FkZXIuanMiLCJzcmMvZW5naW5lL2xvY2FsU3RvcmFnZS5qcyIsInNyYy9lbmdpbmUvbW91c2UuanMiLCJzcmMvZW5naW5lL3NjZW5lc01hbmFnZXIuanMiLCJzcmMvc2NlbmVzL2xvYWRpbmcuanMiLCJzcmMvc2NlbmVzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbWFnZXM6IFtcbiAgICAncG9ueScsXG4gICAgJ3BvbnkyJyxcbiAgICAncG9ueTMnLFxuICAgICdwb255NCcsXG4gICAgJ3Bvbnk1JyxcbiAgICAnY29pbicsXG4gICAgJ2NvaW5Ud2lzdGVkJyxcbiAgICAnY29pbjInXG4gICAgXSxcblxuICBkYXRhOiBbJ2V4YW1wbGUnXSxcblxuICBhdWRpbzogW11cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52YWx1ZSA9IDEwMDtcbiAgfSxcbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52YWx1ZSsrO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnYgPSAxMDE7XG4gICAgdGhpcy52YWx1ZSA9IDA7XG4gICAgdGhpcy5jID0gb3guZW50aXRpZXMuc3Bhd24oJ2NvdW50ZXInKTtcbiAgfSxcbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52YWx1ZSsrO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnggPSAwO1xuICB9LFxuXG4gIGRyYXc6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLngrKztcbiAgICBveC5jb250ZXh0LmZpbGxTdHlsZSA9ICdibHVlJ1xuICAgIG94LmNvbnRleHQuZmlsbFJlY3QoODAsIDgwLCAxMDAsIDIwMClcbiAgICBveC5jb250ZXh0LnN0cm9rZVN0eWxlID0gJ2dyZXknXG4gICAgb3guY29udGV4dC5zdHJva2VSZWN0KDgwLCA4MCwgMTAwLCAyMDApXG4gICAgb3guY29udGV4dC5kcmF3U3ByaXRlKCdwb255JywgdGhpcy54LCAwKTtcbiAgICBveC5jb250ZXh0LmRyYXdTcHJpdGUoJ3BvbnknLCB0aGlzLnggKyAxMCwgMCk7XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc3JjV2lkdGggPSBveC5pbWFnZXNbdGhpcy5zcmNdLndpZHRoO1xuICAgIHRoaXMud2lkdGggPSB0aGlzLndpZHRoIHx8IHRoaXMuc3JjV2lkdGg7XG4gICAgdGhpcy5zcmNIZWlnaHQgPSBveC5pbWFnZXNbdGhpcy5zcmNdLmhlaWdodDtcbiAgICB0aGlzLmhlaWdodCA9IHRoaXMuaGVpZ2h0IHx8IHRoaXMuc3JjSGVpZ2h0O1xuICAgIHRoaXMueCA9IHRoaXMueCB8fCAwO1xuICAgIHRoaXMueSA9IHRoaXMueSB8fCAwO1xuICAgIGlmICh0aGlzLmFuaW1hdGlvbikge1xuICAgICAgdGhpcy5pbml0QW5pbWF0aW9uKCk7XG4gICAgICB0aGlzLnVwZGF0ZSA9IHRoaXMudXBkYXRlQW5pbWF0aW9uO1xuICAgICAgdGhpcy5kcmF3ID0gdGhpcy5kcmF3QW5pbWF0aW9uO1xuICAgIH1cbiAgfSxcblxuICBpbml0QW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pc1BsYXlpbmcgPSB0cnVlO1xuICAgIHRoaXMuaXNGaW5pc2hlZCA9IGZhbHNlO1xuICAgIGlmICh0eXBlb2YgdGhpcy5sb29wICE9PSAnYm9vbGVhbicpIHRoaXMubG9vcCA9IHRydWU7XG4gICAgdGhpcy5jb3VudGVyID0gMDtcbiAgICB0aGlzLmZyYW1lUmF0ZSA9IDYwIC8gdGhpcy5mcmFtZVJhdGUgfHwgMTtcbiAgICB0aGlzLmNhbGN1bGF0ZUZyYW1lcygpO1xuXG4gICAgaWYgKHRoaXMuYW5pbWF0aW9ucykge1xuICAgICAgdGhpcy5hbmltYXRpb25BcnJheSA9IHRoaXMuYW5pbWF0aW9uc1t0aGlzLmFuaW1hdGlvbl1cbiAgICAgIHRoaXMuYXJyYXlDb3VudGVyID0gMDtcbiAgICAgIHRoaXMuZnJhbWUgPSB0aGlzLmFuaW1hdGlvbkFycmF5W3RoaXMuYXJyYXlDb3VudGVyXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5mcmFtZSA9IDA7XG4gICAgfVxuICB9LFxuXG4gIGRyYXc6IGZ1bmN0aW9uICgpIHtcbiAgICBveC5jb250ZXh0LmRyYXdTcHJpdGUodGhpcy5zcmMsIHRoaXMueCwgdGhpcy55KTtcbiAgfSxcblxuICBkcmF3QW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgb3guY29udGV4dC5kcmF3U3ByaXRlKHRoaXMuc3JjLCB0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIHRoaXMuZnJhbWVzW3RoaXMuZnJhbWVdKTtcbiAgfSxcblxuICBjYWxjdWxhdGVGcmFtZXM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgeCA9IHkgPSAwO1xuICAgIHRoaXMuZnJhbWVzID0gW1swLCAwXV07XG5cbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IHRoaXMuc3JjSGVpZ2h0IC8gdGhpcy5oZWlnaHQgKiB0aGlzLnNyY1dpZHRoIC8gdGhpcy53aWR0aDsgaSsrKSB7XG4gICAgICBpZiAoeCA8IHRoaXMuc3JjV2lkdGggLyB0aGlzLndpZHRoIC0gMSkge1xuICAgICAgICB4Kys7XG4gICAgICB9IGVsc2UgaWYgKHkgPCB0aGlzLnNyY0hlaWdodCAvIHRoaXMuaGVpZ2h0IC0gMSkge1xuICAgICAgICB5Kys7XG4gICAgICAgIHggPSAwO1xuICAgICAgfVxuICAgICAgdGhpcy5mcmFtZXMucHVzaChbeCwgeV0pO1xuICAgIH1cbiAgfSxcblxuICB1cGRhdGVBbmltYXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuaXNQbGF5aW5nKSByZXR1cm47XG4gICAgaWYgKHRoaXMuaXNGaW5pc2hlZCkgcmV0dXJuIHRoaXMuZmluaXNoZWQoKTtcblxuICAgIHRoaXMuY291bnRlciArPSAxO1xuICAgIGlmICh0aGlzLmNvdW50ZXIgPiB0aGlzLmZyYW1lUmF0ZSkge1xuICAgICAgdGhpcy5jb3VudGVyID0gMDtcbiAgICAgIGlmICh0aGlzLmFuaW1hdGlvbnMpIHRoaXMubXVsdGlwbGVBbmltYXRpb25zKCk7XG4gICAgICBlbHNlIHRoaXMuc2luZ2xlQW5pbWF0aW9uKCk7XG4gICAgfVxuICB9LFxuXG4gIG11bHRpcGxlQW5pbWF0aW9uczogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmFycmF5Q291bnRlciA9PT0gdGhpcy5hbmltYXRpb25BcnJheS5sZW5ndGggLSAxKSB7XG4gICAgICBpZiAoIXRoaXMubG9vcCkgdGhpcy5pc0ZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuZnJhbWUgPSB0aGlzLmFuaW1hdGlvbkFycmF5WzBdXG4gICAgICB0aGlzLmFycmF5Q291bnRlciA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYXJyYXlDb3VudGVyKys7XG4gICAgICB0aGlzLmZyYW1lID0gdGhpcy5hbmltYXRpb25BcnJheVt0aGlzLmFycmF5Q291bnRlcl1cbiAgICB9XG4gIH0sXG5cbiAgc2luZ2xlQW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuZnJhbWUgPT09ICh0aGlzLmZyYW1lcy5sZW5ndGggLSAxKSkge1xuICAgICAgaWYgKCF0aGlzLmxvb3ApIHRoaXMuaXNGaW5pc2hlZCA9IHRydWU7XG4gICAgICB0aGlzLmZyYW1lID0gMFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZyYW1lICs9IDE7XG4gICAgfVxuICB9LFxuXG4gIGZpbmlzaGVkOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zdG9wKCk7XG4gICAgaWYgKHRoaXMub25GaW5pc2gpIHRoaXMub25GaW5pc2goKTtcbiAgfSxcblxuICBwbGF5OiBmdW5jdGlvbiAoYW5pbWF0aW9uLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBvcHRpb25zKSB7XG4gICAgICAgIHRoaXNba2V5XSA9IG9wdGlvbnNba2V5XVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmFuaW1hdGlvbnMpIHtcbiAgICAgIGlmIChhbmltYXRpb24pIHRoaXMuYW5pbWF0aW9uID0gYW5pbWF0aW9uO1xuICAgICAgdGhpcy5hbmltYXRpb25BcnJheSA9IHRoaXMuYW5pbWF0aW9uc1t0aGlzLmFuaW1hdGlvbl07XG4gICAgICB0aGlzLmFycmF5Q291bnRlciA9IDA7XG4gICAgICB0aGlzLmZyYW1lID0gdGhpcy5hbmltYXRpb25BcnJheVt0aGlzLmFycmF5Q291bnRlcl07XG4gICAgfVxuICAgIHRoaXMuaXNGaW5pc2hlZCA9IGZhbHNlO1xuICAgIHRoaXMuaXNQbGF5aW5nID0gdHJ1ZTtcbiAgfSxcblxuICBzdG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pc1BsYXlpbmcgPSBmYWxzZTtcbiAgfVxufTsiLCJ2YXIgaW1hZ2VzID0gcmVxdWlyZSgnLi9sb2FkZXInKS5pbWFnZXMsXG4gIGtleWJvYXJkID0gcmVxdWlyZSgnLi9rZXlib2FyZCcpLFxuICBtb3VzZSA9IHJlcXVpcmUoJy4vbW91c2UnKTtcblxudmFyIGNvbnRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJykuZ2V0Q29udGV4dCgnMmQnKTtcblxuY29udGV4dC5kcmF3U3ByaXRlID0gZnVuY3Rpb24gKHNyYywgeCwgeSwgd2lkdGgsIGhlaWdodCwgZnJhbWUpIHtcbiAgaWYgKHR5cGVvZiB3aWR0aCA9PT0gJ251bWJlcicpIHtcbiAgICBjb250ZXh0LmRyYXdJbWFnZShcbiAgICAgIGltYWdlc1tzcmNdLFxuICAgICAgd2lkdGggKiBmcmFtZVswXSxcbiAgICAgIGhlaWdodCAqIGZyYW1lWzFdLFxuICAgICAgd2lkdGgsIGhlaWdodCwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gIH0gZWxzZSB7XG4gICAgY29udGV4dC5kcmF3SW1hZ2UoaW1hZ2VzW3NyY10sIHgsIHkpO1xuICB9XG59O1xuXG5jYW52YXMudGFiSW5kZXggPSAxMDAwO1xuY2FudmFzLnN0eWxlLm91dGxpbmUgPSBcIm5vbmVcIjtcbmNhbnZhcy5vbmtleWRvd24gPSBrZXlib2FyZC5rZXlEb3duLmJpbmQoa2V5Ym9hcmQpO1xuY2FudmFzLm9ua2V5dXAgPSBrZXlib2FyZC5rZXlVcC5iaW5kKGtleWJvYXJkKTtcbmNhbnZhcy5vbm1vdXNlbW92ZSA9IG1vdXNlLm9uTW92ZS5iaW5kKG1vdXNlKTtcbmNhbnZhcy5vbm1vdXNlZG93biA9IG1vdXNlLm9uRG93bi5iaW5kKG1vdXNlKTtcbmNhbnZhcy5vbm1vdXNldXAgPSBtb3VzZS5vblVwLmJpbmQobW91c2UpO1xuY2FudmFzLmhlaWdodCA9IDIwMDA7XG5jYW52YXMuc3R5bGUuY3Vyc29yID0gXCJub25lXCI7XG5cbm1vZHVsZS5leHBvcnRzID0gY29udGV4dDtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBjdXJyZW50OiBbXSxcbiAgbGlzdDoge1wiY291bnRlclwiOiByZXF1aXJlKFwiLi4vY29tcG9uZW50cy9jb3VudGVyXCIpLCBcImNvdW50ZXIyXCI6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL2NvdW50ZXIyXCIpLCBcInBvbmV5XCI6IHJlcXVpcmUoXCIuLi9jb21wb25lbnRzL3BvbmV5XCIpLCBcInNwcml0ZVwiOiByZXF1aXJlKFwiLi4vY29tcG9uZW50cy9zcHJpdGVcIil9LFxuICBkaXJ0eVo6IGZhbHNlLFxuICBzcGF3bjogZnVuY3Rpb24gKG5hbWUsIG9wdGlvbnMpIHtcbiAgICBpZiAoIXRoaXMubGlzdFtuYW1lXSkgdGhyb3cgbmV3IEVycm9yKFwiQ29tcG9uZW50ICdcIiArIG5hbWUgKyBcIicgZG9lcyBub3QgZXhpc3QgYW5kIGNhbm5vdCBiZSBzcGF3bmVkLlwiKTtcbiAgICB2YXIgb2JqID0gb3B0aW9ucyB8fCB7fTtcbiAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5saXN0W25hbWVdKSB7XG4gICAgICBvYmpba2V5XSA9IHRoaXMubGlzdFtuYW1lXVtrZXldO1xuICAgIH1cbiAgICBvYmouZGVzdHJveSA9IHRoaXMuZGVzdHJveS5iaW5kKG9iaik7XG4gICAgb2JqLnJldml2ZSA9IHRoaXMucmV2aXZlLmJpbmQob2JqKTtcbiAgICBvYmouaXNBbGl2ZSA9IHRydWU7XG4gICAgdGhpcy5jdXJyZW50LnB1c2gob2JqKTtcbiAgICBpZiAob2JqLmluaXQpIHtcbiAgICAgIG9iai5pbml0KCk7XG4gICAgfTtcbiAgICBvYmouaXNSZWFkeSA9IHRydWVcbiAgICByZXR1cm4gb2JqO1xuICB9LFxuICBjaGVja1o6IGZ1bmN0aW9uIChlbnRpdHkpIHtcbiAgICBpZiAodHlwZW9mIGVudGl0eS56ID09PSAndW5kZWZpbmVkJykgZW50aXR5LnogPSAwO1xuICAgIGlmIChlbnRpdHkueiAhPT0gZW50aXR5Lmxhc3RaKSB7XG4gICAgICBlbnRpdHkubGFzdFogPSBlbnRpdHkuejtcbiAgICAgIHRoaXMuZGlydHlaID0gdHJ1ZTtcbiAgICB9XG4gIH0sXG4gIHNvcnRCeVo6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmN1cnJlbnQuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgcmV0dXJuIGEueiAtIGIuejtcbiAgICB9KTtcbiAgfSxcbiAgZGVzdHJveTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaXNBbGl2ZSA9IGZhbHNlO1xuICB9LFxuICByZXZpdmU6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlzQWxpdmUgPSB0cnVlO1xuICB9XG59OyIsIndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMub3ggPSB7XG4gICAgY2FudmFzOiByZXF1aXJlKCcuL2NhbnZhcycpLmNhbnZhcyxcbiAgICBjb250ZXh0OiByZXF1aXJlKCcuL2NhbnZhcycpLFxuICAgIGltYWdlczogcmVxdWlyZSgnLi9sb2FkZXInKS5pbWFnZXMsXG4gICAgYXVkaW86IHJlcXVpcmUoJy4vbG9hZGVyJykuYXVkaW8sXG4gICAgZGF0YTogcmVxdWlyZSgnLi9sb2FkZXInKS5kYXRhLFxuICAgIGtleWJvYXJkOiByZXF1aXJlKCcuL2tleWJvYXJkJyksXG4gICAgbW91c2U6IHJlcXVpcmUoJy4vbW91c2UnKSxcbiAgICBzY2VuZXM6IHJlcXVpcmUoJy4vc2NlbmVzTWFuYWdlcicpLFxuICAgIGNvbXBvbmVudHM6IHJlcXVpcmUoJy4vY29tcG9uZW50c01hbmFnZXInKSxcbiAgICBzYXZlOiByZXF1aXJlKCcuL2xvY2FsU3RvcmFnZScpLFxuICAgIGxvb3A6IHJlcXVpcmUoJy4vZ2FtZUxvb3AnKSxcbiAgICBwcmVsb2FkZXI6IHJlcXVpcmUoJy4vbG9hZGVyJyksXG4gICAgc3ByaXRlOiBmdW5jdGlvbiAoc3JjLCBvcHRpb25zKSB7XG4gICAgICB2YXIgb2JqID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgIG9iai5zcmMgPSBzcmM7XG4gICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLnNwYXduKCdzcHJpdGUnLCBvYmopO1xuICAgIH0sXG4gICAgc3Bhd246IGZ1bmN0aW9uIChuYW1lLCBvcHRpb25zKSB7XG4gICAgICB0aGlzLmxpc3QgPSB0aGlzLmNvbXBvbmVudHMubGlzdDtcbiAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHMuc3Bhd24obmFtZSwgb3B0aW9ucyk7XG4gICAgfVxuICB9O1xuXG4gIG94Lmxvb3AuY2FsY3VsYXRlRGVsdGEoKTtcbiAgb3guc2NlbmVzLnNldCgnbG9hZGluZycpO1xuICBveC5sb29wLnJ1bigpO1xufTsiLCJ2YXIgZW50aXRpZXMgPSByZXF1aXJlKCcuL2NvbXBvbmVudHNNYW5hZ2VyJyksXG4gIHNjZW5lcyA9IHJlcXVpcmUoJy4vc2NlbmVzTWFuYWdlcicpLFxuICBjb250ZXh0ID0gcmVxdWlyZSgnLi9jYW52YXMnKTtcbnZhciBjYW1lcmEgPSB7XG4gIHg6IDEsXG4gIHk6IDIwXG59XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc3BlZWQ6IDEsXG4gIGR0OiAwLFxuICBzdGVwOiAxIC8gNjAsXG4gIGxhc3REZWx0YTogbmV3IERhdGUoKSxcbiAgbm93OiBuZXcgRGF0ZSgpLFxuICBjYWxjdWxhdGVEZWx0YTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMubGFzdERlbHRhID0gdGhpcy5ub3c7XG4gICAgdGhpcy5ub3cgPSBuZXcgRGF0ZSgpO1xuICAgIHRoaXMuZHQgKz0gTWF0aC5taW4oMSwgKHRoaXMubm93IC0gdGhpcy5sYXN0RGVsdGEpIC8gMTAwMCkgKiB0aGlzLnNwZWVkO1xuICB9LFxuICBydW46IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmNhbGN1bGF0ZURlbHRhKCk7XG5cbiAgICBpZiAoZW50aXRpZXMuZGlydHlaKSB7XG4gICAgICBlbnRpdGllcy5zb3J0QnlaKCk7XG4gICAgICBlbnRpdGllcy5kaXJ0eVogPSBmYWxzZTtcbiAgICB9XG5cbiAgICB3aGlsZSAodGhpcy5kdCA+IHRoaXMuc3RlcCkge1xuICAgICAgdGhpcy5kdCAtPSB0aGlzLnN0ZXA7XG4gICAgICB0aGlzLnVwZGF0ZSh0aGlzLnN0ZXApO1xuICAgIH1cbiAgICB0aGlzLmRyYXcodGhpcy5kdCk7XG5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5ydW4uYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgZHJhdzogZnVuY3Rpb24gKGR0KSB7XG4gICAgdmFyIHRpbWUgPSBuZXcgRGF0ZTtcbiAgICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBjb250ZXh0LmNhbnZhcy53aWR0aCwgY29udGV4dC5jYW52YXMuaGVpZ2h0KTtcbiAgICAvLyAgICBveC5jYW52YXMuc2F2ZSgpO1xuICAgIC8vICAgIGNhbWVyYS55ICs9IC41O1xuICAgIC8vICAgIGlmIChjYW1lcmEueSA+IDMwKSBjYW1lcmEueSA9IC0xMDtcbiAgICAvLyAgICBveC5jYW52YXMudHJhbnNsYXRlKGNhbWVyYS54LCBjYW1lcmEueSk7XG5cbiAgICBpZiAoc2NlbmVzLmN1cnJlbnQuZHJhdykgc2NlbmVzLmN1cnJlbnQuZHJhdyhkdCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGVudGl0aWVzLmN1cnJlbnQubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHZhciBlbnRpdHkgPSBlbnRpdGllcy5jdXJyZW50W2ldO1xuICAgICAgaWYgKGVudGl0eS5pc0FsaXZlICYmIGVudGl0eS5kcmF3KSBlbnRpdHkuZHJhdyhkdCk7XG4gICAgfVxuICAgIC8vICAgIG94LmNhbnZhcy5yZXN0b3JlKCk7XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcbiAgICBpZiAoc2NlbmVzLmN1cnJlbnQudXBkYXRlKSBzY2VuZXMuY3VycmVudC51cGRhdGUoZHQpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBlbnRpdGllcy5jdXJyZW50Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB2YXIgZW50aXR5ID0gZW50aXRpZXMuY3VycmVudFtpXTtcbiAgICAgIGlmIChlbnRpdHkuaXNBbGl2ZSAmJiBlbnRpdHkudXBkYXRlKSBlbnRpdHkudXBkYXRlKGR0KTtcbiAgICB9XG4gIH1cbn0iLCJ2YXIgc2NlbmUgPSByZXF1aXJlKCcuL3NjZW5lc01hbmFnZXInKTtcbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc1ByZXNzZWQ6IHt9LFxuXG4gIGtleURvd246IGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKGUua2V5Q29kZSA9PT0gMzIgfHwgKGUua2V5Q29kZSA+PSAzNyAmJiBlLmtleUNvZGUgPD0gNDApKVxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGlmIChzY2VuZS5jdXJyZW50LmtleURvd24pIHNjZW5lLmN1cnJlbnQua2V5RG93bih0aGlzLmtleXNbZS5rZXlDb2RlXSk7XG4gICAgdGhpcy5rZXlQcmVzcyhlKTtcbiAgfSxcblxuICBrZXlQcmVzczogZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAodGhpcy5pc1ByZXNzZWRbZS5rZXlDb2RlXSkgcmV0dXJuO1xuICAgIGlmIChzY2VuZS5jdXJyZW50LmtleVByZXNzKSBzY2VuZS5jdXJyZW50LmtleVByZXNzKHRoaXMua2V5c1tlLmtleUNvZGVdKTtcbiAgICB0aGlzLmlzUHJlc3NlZFtlLmtleUNvZGVdID0gdHJ1ZTtcbiAgfSxcblxuICBrZXlVcDogZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoc2NlbmUuY3VycmVudC5rZXlVcCkgc2NlbmUuY3VycmVudC5rZXlVcCh0aGlzLmtleXNbZS5rZXlDb2RlXSk7XG4gICAgdGhpcy5pc1ByZXNzZWRbZS5rZXlDb2RlXSA9IGZhbHNlO1xuICB9LFxuXG4gIGtleXM6IHtcbiAgICA4OiAnYmFja3NwYWNlJyxcbiAgICA5OiAndGFiJyxcbiAgICAxMzogJ2VudGVyJyxcbiAgICAxNjogJ3NoaWZ0JyxcbiAgICAxNzogJ2N0cmwnLFxuICAgIDE4OiAnYWx0JyxcbiAgICAxOTogJ3BhdXNlJyxcbiAgICAyMDogJ2NhcHNfbG9jaycsXG4gICAgMjc6ICdlc2MnLFxuICAgIDMyOiAnc3BhY2ViYXInLFxuICAgIDMzOiAncGFnZV91cCcsXG4gICAgMzQ6ICdwYWdlX2Rvd24nLFxuICAgIDM1OiAnZW5kJyxcbiAgICAzNjogJ2hvbWUnLFxuICAgIDM3OiAnbGVmdCcsXG4gICAgMzg6ICd1cCcsXG4gICAgMzk6ICdyaWdodCcsXG4gICAgNDA6ICdkb3duJyxcbiAgICA0NDogJ3ByaW50X3NjcmVlbicsXG4gICAgNDU6ICdpbnNlcnQnLFxuICAgIDQ2OiAnZGVsZXRlJyxcbiAgICA0ODogJzAnLFxuICAgIDQ5OiAnMScsXG4gICAgNTA6ICcyJyxcbiAgICA1MTogJzMnLFxuICAgIDUyOiAnNCcsXG4gICAgNTM6ICc1JyxcbiAgICA1NDogJzYnLFxuICAgIDU1OiAnNycsXG4gICAgNTY6ICc4JyxcbiAgICA1NzogJzknLFxuICAgIDY1OiAnYScsXG4gICAgNjY6ICdiJyxcbiAgICA2NzogJ2MnLFxuICAgIDY4OiAnZCcsXG4gICAgNjk6ICdlJyxcbiAgICA3MDogJ2YnLFxuICAgIDcxOiAnZycsXG4gICAgNzI6ICdoJyxcbiAgICA3MzogJ2knLFxuICAgIDc0OiAnaicsXG4gICAgNzU6ICdrJyxcbiAgICA3NjogJ2wnLFxuICAgIDc3OiAnbScsXG4gICAgNzg6ICduJyxcbiAgICA3OTogJ28nLFxuICAgIDgwOiAncCcsXG4gICAgODE6ICdxJyxcbiAgICA4MjogJ3InLFxuICAgIDgzOiAncycsXG4gICAgODQ6ICd0JyxcbiAgICA4NTogJ3UnLFxuICAgIDg2OiAndicsXG4gICAgODc6ICd3JyxcbiAgICA4ODogJ3gnLFxuICAgIDg5OiAneScsXG4gICAgOTA6ICd6JyxcbiAgICA5NjogJ251bV96ZXJvJyxcbiAgICA5NzogJ251bV9vbmUnLFxuICAgIDk4OiAnbnVtX3R3bycsXG4gICAgOTk6ICdudW1fdGhyZWUnLFxuICAgIDEwMDogJ251bV9mb3VyJyxcbiAgICAxMDE6ICdudW1fZml2ZScsXG4gICAgMTAyOiAnbnVtX3NpeCcsXG4gICAgMTAzOiAnbnVtX3NldmVuJyxcbiAgICAxMDQ6ICdudW1fZWlnaHQnLFxuICAgIDEwNTogJ251bV9uaW5lJyxcbiAgICAxMDY6ICdudW1fbXVsdGlwbHknLFxuICAgIDEwNzogJ251bV9wbHVzJyxcbiAgICAxMDk6ICdudW1fbWludXMnLFxuICAgIDExMDogJ251bV9wZXJpb2QnLFxuICAgIDExMTogJ251bV9kaXZpc2lvbicsXG4gICAgMTEyOiAnZjEnLFxuICAgIDExMzogJ2YyJyxcbiAgICAxMTQ6ICdmMycsXG4gICAgMTE1OiAnZjQnLFxuICAgIDExNjogJ2Y1JyxcbiAgICAxMTc6ICdmNicsXG4gICAgMTE4OiAnZjcnLFxuICAgIDExOTogJ2Y4JyxcbiAgICAxMjA6ICdmOScsXG4gICAgMTIxOiAnZjEwJyxcbiAgICAxMjI6ICdmMTEnLFxuICAgIDEyMzogJ2YxMicsXG4gICAgMTg2OiAnc2VtaWNvbG9uJyxcbiAgICAxODc6ICdwbHVzJyxcbiAgICAxODk6ICdtaW51cycsXG4gICAgMTkyOiAnZ3JhdmVfYWNjZW50JyxcbiAgICAyMjI6ICdzaW5nbGVfcXVvdGUnXG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbWFnZXM6IHt9LFxuICBkYXRhOiB7fSxcbiAgYXVkaW86IHt9LFxuICBhc3NldHNUb0xvYWQ6IDAsXG5cbiAgbG9hZEltYWdlOiBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRoaXMuaW1hZ2VzW25hbWVdID0gbmV3IEltYWdlKCk7XG4gICAgdGhpcy5pbWFnZXNbbmFtZV0ub25sb2FkID0gdGhpcy5hc3NldHNUb0xvYWQtLTtcbiAgICB0aGlzLmltYWdlc1tuYW1lXS5zcmMgPSBcImltYWdlcy9cIiArIG5hbWUgKyBcIi5wbmdcIjtcbiAgfSxcblxuICBsb2FkRGF0YTogZnVuY3Rpb24gKGZpbGUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3Q7XG4gICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCAmJiB4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgc2VsZi5kYXRhW2ZpbGVdID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgc2VsZi5hc3NldHNUb0xvYWQtLTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgeGhyLm9wZW4oXCJHRVRcIiwgXCJkYXRhL1wiICsgZmlsZSArIFwiLmpzb25cIik7XG4gICAgeGhyLnNlbmQoKTtcbiAgfSxcblxuICBsb2FkQXVkaW86IGZ1bmN0aW9uIChuYW1lKSB7fSxcblxuICBsb2FkOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgaWYgKG9iai5pbWFnZXMpIHtcbiAgICAgIHRoaXMuYXNzZXRzVG9Mb2FkICs9IG9iai5pbWFnZXMubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvYmouaW1hZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMubG9hZEltYWdlKG9iai5pbWFnZXNbaV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChvYmouZGF0YSkge1xuICAgICAgdGhpcy5hc3NldHNUb0xvYWQgKz0gb2JqLmRhdGEubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBvYmouZGF0YS5sZW5ndGg7IGorKykge1xuICAgICAgICB0aGlzLmxvYWREYXRhKG9iai5kYXRhW2pdKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAob2JqLmF1ZGlvKSB7XG4gICAgICB0aGlzLmFzc2V0c1RvTG9hZCArPSBvYmouYXVkaW8ubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBvYmouYXVkaW8ubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgdGhpcy5sb2FkQXVkaW8ob2JqLmF1ZGlvW2tdKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBzdG9yZTogZnVuY3Rpb24gKG51bSwgb2JqKSB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0obnVtLCBKU09OLnN0cmluZ2lmeShvYmopKTtcbiAgfSxcbiAgbG9hZDogZnVuY3Rpb24gKG51bSkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKG51bSkpO1xuICB9LFxuICByZW1vdmU6IGZ1bmN0aW9uIChudW0pIHtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShudW0pO1xuICB9XG59XG4iLCJ2YXIgc2NlbmUgPSByZXF1aXJlKCcuL3NjZW5lc01hbmFnZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHg6IDAsXG4gIHk6IDAsXG4gIGlzUHJlc3NlZDoge30sXG5cbiAgb25Nb3ZlOiBmdW5jdGlvbiAoZSkge1xuICAgIG94Lm1vdXNlLnggPSBlLmNsaWVudFggLSBveC5jYW52YXMub2Zmc2V0TGVmdDtcbiAgICBveC5tb3VzZS55ID0gZS5jbGllbnRZIC0gb3guY2FudmFzLm9mZnNldFRvcDtcbiAgICBpZiAoc2NlbmUuY3VycmVudC5tb3VzZU1vdmUpIHNjZW5lLmN1cnJlbnQubW91c2VNb3ZlKG94Lm1vdXNlKVxuICB9LFxuICBvblVwOiBmdW5jdGlvbiAoZSkge1xuICAgIGlmIChzY2VuZS5jdXJyZW50Lm1vdXNlVXApIHNjZW5lLmN1cnJlbnQubW91c2VVcChlKTtcbiAgfSxcbiAgb25Eb3duOiBmdW5jdGlvbiAoZSkge1xuICAgIGlmIChzY2VuZS5jdXJyZW50Lm1vdXNlRG93bikgc2NlbmUuY3VycmVudC5tb3VzZURvd24oZSk7XG4gIH1cbn1cblxuLyoqXG4gIGlzUHJlc3NlZDoge30sXG4gIGtleURvd246IGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKHNjZW5lLmN1cnJlbnQua2V5RG93bikgc2NlbmUuY3VycmVudC5rZXlEb3duKHRoaXMua2V5c1tlLmtleUNvZGVdKTtcbiAgICB0aGlzLmtleVByZXNzKGUpO1xuICB9LFxuICBrZXlQcmVzczogZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAodGhpcy5pc1ByZXNzZWRbZS5rZXlDb2RlXSkgcmV0dXJuO1xuICAgIGlmIChzY2VuZS5jdXJyZW50LmtleVByZXNzKSBzY2VuZS5jdXJyZW50LmtleVByZXNzKHRoaXMua2V5c1tlLmtleUNvZGVdKTtcbiAgICB0aGlzLmlzUHJlc3NlZFtlLmtleUNvZGVdID0gdHJ1ZTtcbiAgfSxcbiAga2V5VXA6IGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKHNjZW5lLmN1cnJlbnQua2V5VXApIHNjZW5lLmN1cnJlbnQua2V5VXAodGhpcy5rZXlzW2Uua2V5Q29kZV0pO1xuICAgIHRoaXMuaXNQcmVzc2VkW2Uua2V5Q29kZV0gPSBmYWxzZTtcbiAgfSxcbioqL1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGN1cnJlbnQ6IG51bGwsXG4gIGxpc3Q6IHtcImxvYWRpbmdcIjogcmVxdWlyZShcIi4uL3NjZW5lcy9sb2FkaW5nXCIpLCBcIm1haW5cIjogcmVxdWlyZShcIi4uL3NjZW5lcy9tYWluXCIpfSxcbiAgc2V0OiBmdW5jdGlvbiAobmFtZSkge1xuICAgIGlmICghdGhpcy5saXN0W25hbWVdKSB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSAnXCIgKyBuYW1lICsgXCInIGRvZXMgbm90IGV4aXN0IVwiKTtcbiAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLmxpc3RbbmFtZV07XG4gICAgaWYgKHRoaXMuY3VycmVudC5pbml0KSB0aGlzLmN1cnJlbnQuaW5pdCgpO1xuICB9XG59IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICBveC5wcmVsb2FkZXIubG9hZChyZXF1aXJlKCcuLi9hc3NldHMuanMnKSk7XG4gICAgdGhpcy5iYXJMZW5ndGggPSBveC5wcmVsb2FkZXIuYXNzZXRzVG9Mb2FkO1xuICB9LFxuXG4gIGRyYXc6IGZ1bmN0aW9uICgpIHtcbiAgICBveC5jb250ZXh0LmZpbGxTdHlsZSA9IFwiYmxhY2tcIlxuICAgIG94LmNvbnRleHQuZmlsbFJlY3QoMCwgMCwgb3guY2FudmFzLndpZHRoLCBveC5jYW52YXMuaGVpZ2h0KVxuICAgIG94LmNvbnRleHQuZmlsbFN0eWxlID0gXCJyZ2IoNDYsIDIzOCwgMjQ1KVwiXG4gICAgb3guY29udGV4dC5maWxsUmVjdChveC5jYW52YXMud2lkdGggLyA0LCBveC5jYW52YXMuaGVpZ2h0IC8gMiArIDMyLCBveC5jYW52YXMud2lkdGggLyAyLCAxKVxuICAgIG94LmNvbnRleHQuZmlsbFN0eWxlID0gXCJncmV5XCJcbiAgICBveC5jb250ZXh0LnNhdmUoKVxuICAgIG94LmNvbnRleHQudHJhbnNsYXRlKG94LmNhbnZhcy53aWR0aCAvIDQsIDIgKiBveC5jYW52YXMuaGVpZ2h0IC8gMylcbiAgICBveC5jb250ZXh0LnNjYWxlKC0xLCAxKVxuICAgIG94LmNvbnRleHQuZmlsbFJlY3QoLW94LmNhbnZhcy53aWR0aCAvIDIsIDAsIG94LmNhbnZhcy53aWR0aCAvIDIgKiBveC5wcmVsb2FkZXIuYXNzZXRzVG9Mb2FkIC8gdGhpcy5iYXJMZW5ndGgsIDEpXG4gICAgb3guY29udGV4dC5yZXN0b3JlKClcbiAgICBveC5jb250ZXh0LmZpbGxTdHlsZSA9IFwid2hpdGVcIlxuICAgIG94LmNvbnRleHQuZm9udCA9ICcyMDAlIHNhbnMtc2VyaWYnXG4gICAgb3guY29udGV4dC5maWxsVGV4dCgnbG9hZGluZy4uLicsIG94LmNhbnZhcy53aWR0aCAvIDIgLSA2OCwgb3guY2FudmFzLmhlaWdodCAvIDIgKyAxMCk7XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKG94LnByZWxvYWRlci5hc3NldHNUb0xvYWQgPT09IDApIG94LnNjZW5lcy5zZXQoJ21haW4nKTtcbiAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucG9uZXkgPSBveC5zcGF3bigncG9uZXknKTtcbiAgICB0aGlzLnN0YXRpY1BvbnkgPSBveC5zcHJpdGUoJ3BvbnknKTtcbiAgICB0aGlzLnNwcml0ZTIgPSBveC5zcHJpdGUoJ2NvaW4yJywge1xuICAgICAgYW5pbWF0aW9uOiAnc3BpbicsXG4gICAgICBhbmltYXRpb25zOiB7XG4gICAgICAgIHNwaW46IFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5XSxcbiAgICAgICAgaWRsZTogWzgsIDQsIDgsIDQsIDgsIDQsIDgsIDQsIDgsIDQsIDgsIDQsIDgsIDQsIDgsIDRdXG4gICAgICB9LFxuICAgICAgaGVpZ2h0OiA0MCxcbiAgICAgIGZyYW1lUmF0ZTogMzAsXG4gICAgICB3aWR0aDogNDQsXG4gICAgfSk7XG5cbiAgICB0aGlzLnNwcml0ZTIucGxheSgnc3BpbicsIHtcbiAgICAgIGxvb3A6IGZhbHNlXG4gICAgfSk7XG5cbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuICAgIHRoaXMuc3ByaXRlMi54ID0gb3gubW91c2UueDtcbiAgICB0aGlzLnNwcml0ZTIueSA9IG94Lm1vdXNlLnk7XG4gIH0sXG5cbiAga2V5RG93bjogZnVuY3Rpb24gKGtleSkge1xuICAgIGNvbnNvbGUubG9nKFwia2V5RG93bjogXCIgKyBrZXkpXG4gIH0sXG5cbiAga2V5UHJlc3M6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICBjb25zb2xlLmxvZyhcImtleVByZXNzOiBcIiArIGtleSlcbiAgfSxcblxuICBrZXlVcDogZnVuY3Rpb24gKGtleSkge1xuICAgIGNvbnNvbGUubG9nKFwia2V5VXA6IFwiICsga2V5KVxuICB9LFxuXG4gIG1vdXNlRG93bjogZnVuY3Rpb24gKGUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkNsaWNrZWQgYXQ6IFwiICsgb3gubW91c2UueCArIFwiLCBcIiArIG94Lm1vdXNlLnkpXG4gIH0sXG5cbiAgbW91c2VVcDogZnVuY3Rpb24gKGUpIHtcbiAgICBjb25zb2xlLmxvZyhcIlJlbGVhc2VkIGF0OiBcIiArIG94Lm1vdXNlLnggKyBcIiwgXCIgKyBveC5tb3VzZS55KVxuXG4gIH1cbn07Il19
