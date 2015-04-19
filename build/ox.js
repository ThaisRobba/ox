(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = [
  './images/coin.png',
  './images/coin2.png',
  './images/coinTwisted.png',
  './images/pony.png',
  './images/teste.png',
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
            this.library = this.entities.library;
            return this.entities.spawn(name, options);
        }
    };

    ox.loop.calculateDelta();
    ox.scenes.set('loading');
    ox.loop.init();
};
},{"./camera":2,"./canvas":3,"./entitiesManager":5,"./gameLoop":6,"./keyboard":7,"./loader":8,"./localStorage":9,"./mouse":10,"./scenesManager":11}],5:[function(require,module,exports){
var current = [];

module.exports = {
    current: current,
    library: require('../entities.js'),
    spawn: function (name, options) {
        if (!this.library[name]) throw new Error("Entity '" + name + "' does not exist and cannot be spawned.");
        var obj = options || {};
        for (var key in this.library[name]) {
            obj[key] = this.library[name][key];
        }
        obj.remove = this.remove.bind(obj);
        obj.id = this.current.length;
        this.current.push(obj);
        if (obj.init) obj.init();
        //        if (obj.update) PUSH TO UPDATE LIST AND SAVE TIME :D
        obj.isReady = true;
        return obj;
    },

    remove: function () {
        var id = this.id;
        current.splice(this.id, 1);
        for (var i = 0; i < current.length; i++) {
            if (current[i].id > id) current[i].id--;
        }
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

        while (this.dt > this.step) {
            this.dt -= this.step;
            this.update(this.step);
        }
        this.draw(this.dt);

        requestAnimationFrame(this.init.bind(this));
    },

    draw: function () {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        //    camera.start();
        if (scenes.current.draw) scenes.current.draw();
        for (var i = 0, len = entities.current.length; i < len; i++) {
            var entity = entities.current[i];
            if (entity.draw) entity.draw();
        }
        //    context.restore();
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
        if (e.keyCode === 32 || (e.keyCode >= 37 && e.keyCode <= 40)) e.preventDefault();
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
};
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
        if (scene.current.mouseUp) scene.current.mouseUp(this.buttons[e.button]);
        this.isDown = false;
    },
    onDown: function (e) {
        if (scene.current.mouseDown) scene.current.mouseDown(this.buttons[e.button]);
        this.isDown = true;
    },

    buttons: {
        0: "left",
        1: "middle",
        2: "right"
    }
};
},{"./scenesManager":11}],11:[function(require,module,exports){
module.exports = {
  current: null,
  list: require('../scenes.js'),
  set: function (name) {
    if (!this.list[name]) throw new Error("Scene '" + name + "' does not exist!");
    this.current = this.list[name];
    if (this.current.init) this.current.init();
  }
};
},{"../scenes.js":19}],12:[function(require,module,exports){
module.exports = {
  counter: require('./entities/counter.js'),
  counter2: require('./entities/counter2.js'),
  player: require('./entities/player.js'),
  poney: require('./entities/poney.js'),
  sprite: require('./entities/sprite.js'),
  timer: require('./entities/timer.js')
};
},{"./entities/counter.js":13,"./entities/counter2.js":14,"./entities/player.js":15,"./entities/poney.js":16,"./entities/sprite.js":17,"./entities/timer.js":18}],13:[function(require,module,exports){
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
    ox.spawn('poney');
  }
};
},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
module.exports = {
  init: function () {
    this.value = 0;
    this.isFinished = false;
  },

  update: function (dt) {
    if (!this.isFinished && !this.isPaused) {
      this.value += dt;
      if (this.value >= this.goal) {
        this.isFinished = true;
        this.func();
        if (this.loop) this.restart();
      }
    }
  },

  restart: function () {
    this.value = 0;
    this.isFinished = false;
  },

  pause: function () {
    this.isPaused = true;
  },

  resume: function () {
    this.isPaused = false;
  },

};
},{}],19:[function(require,module,exports){
module.exports = {
  loading: require('./scenes/loading.js'),
  main: require('./scenes/main.js')
};
},{"./scenes/loading.js":20,"./scenes/main.js":21}],20:[function(require,module,exports){
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

},{"../assets.js":1}],21:[function(require,module,exports){
module.exports = {
    init: function () {

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
        this.coin = ox.sprite('coin.png', {
            animation: 'spin',
            animations: {
                spin: [0, 1, 2, 3, 4, 5],
                idle: [4]
            },
            frameRate: 10,
            width: 44,
            height: 40
        });

        ox.spawn('player');

    },

    update: function (dt) {
        this.sprite2.x = ox.mouse.x;
        this.sprite2.y = ox.mouse.y;

        ox.camera.set(ox.mouse.x, ox.mouse.y);
    },

    keyDown: function (key) {
        console.log("keyDown: " + key);
    },

    keyPress: function (key) {
        console.log("keyPress: " + key);
    },

    keyUp: function (key) {
        console.log("keyUp: " + key);
    },

    mouseDown: function (e) {
        console.log("Clicked at: " + ox.mouse.x + ", " + ox.mouse.y, e);
    },

    mouseUp: function (e) {
        console.log("Released at: " + ox.mouse.x + ", " + ox.mouse.y);
    }
};
},{}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9hc3NldHMuanMiLCJzcmMvZW5naW5lL2NhbWVyYS5qcyIsInNyYy9lbmdpbmUvY2FudmFzLmpzIiwic3JjL2VuZ2luZS9jb3JlLmpzIiwic3JjL2VuZ2luZS9lbnRpdGllc01hbmFnZXIuanMiLCJzcmMvZW5naW5lL2dhbWVMb29wLmpzIiwic3JjL2VuZ2luZS9rZXlib2FyZC5qcyIsInNyYy9lbmdpbmUvbG9hZGVyLmpzIiwic3JjL2VuZ2luZS9sb2NhbFN0b3JhZ2UuanMiLCJzcmMvZW5naW5lL21vdXNlLmpzIiwic3JjL2VuZ2luZS9zY2VuZXNNYW5hZ2VyLmpzIiwic3JjL2VudGl0aWVzLmpzIiwic3JjL2VudGl0aWVzL2NvdW50ZXIuanMiLCJzcmMvZW50aXRpZXMvY291bnRlcjIuanMiLCJzcmMvZW50aXRpZXMvcGxheWVyLmpzIiwic3JjL2VudGl0aWVzL3BvbmV5LmpzIiwic3JjL2VudGl0aWVzL3Nwcml0ZS5qcyIsInNyYy9lbnRpdGllcy90aW1lci5qcyIsInNyYy9zY2VuZXMuanMiLCJzcmMvc2NlbmVzL2xvYWRpbmcuanMiLCJzcmMvc2NlbmVzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IFtcbiAgJy4vaW1hZ2VzL2NvaW4ucG5nJyxcbiAgJy4vaW1hZ2VzL2NvaW4yLnBuZycsXG4gICcuL2ltYWdlcy9jb2luVHdpc3RlZC5wbmcnLFxuICAnLi9pbWFnZXMvcG9ueS5wbmcnLFxuICAnLi9pbWFnZXMvdGVzdGUucG5nJyxcbiAgJy4vZGF0YS9leGFtcGxlLmpzb24nXG5dOyIsInZhciBjb250ZXh0ID0gcmVxdWlyZSgnLi9jYW52YXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNldDogZnVuY3Rpb24gKHgsIHkpIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gIH0sXG5cbiAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICBjb250ZXh0LnNhdmUoKTtcbiAgICBjb250ZXh0LnRyYW5zbGF0ZSh0aGlzLngsIHRoaXMueSk7XG4gIH1cbn07XG4iLCJ2YXIgaW1hZ2VzID0gcmVxdWlyZSgnLi9sb2FkZXInKS5pbWFnZXMsXG4gIGtleWJvYXJkID0gcmVxdWlyZSgnLi9rZXlib2FyZCcpLFxuICBtb3VzZSA9IHJlcXVpcmUoJy4vbW91c2UnKTtcblxudmFyIGNvbnRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJykuZ2V0Q29udGV4dCgnMmQnKTtcblxuY29udGV4dC5kcmF3U3ByaXRlID0gZnVuY3Rpb24gKHNyYywgeCwgeSwgd2lkdGgsIGhlaWdodCwgZnJhbWUpIHtcbiAgaWYgKHR5cGVvZiB3aWR0aCA9PT0gJ251bWJlcicpIHtcbiAgICBjb250ZXh0LmRyYXdJbWFnZShcbiAgICAgIGltYWdlc1tzcmNdLFxuICAgICAgd2lkdGggKiBmcmFtZVswXSxcbiAgICAgIGhlaWdodCAqIGZyYW1lWzFdLFxuICAgICAgd2lkdGgsIGhlaWdodCwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gIH0gZWxzZSB7XG4gICAgY29udGV4dC5kcmF3SW1hZ2UoaW1hZ2VzW3NyY10sIHgsIHkpO1xuICB9XG59O1xuXG5jYW52YXMudGFiSW5kZXggPSAxMDAwO1xuY2FudmFzLnN0eWxlLm91dGxpbmUgPSBcIm5vbmVcIjtcbmNhbnZhcy5vbmtleWRvd24gPSBrZXlib2FyZC5rZXlEb3duLmJpbmQoa2V5Ym9hcmQpO1xuY2FudmFzLm9ua2V5dXAgPSBrZXlib2FyZC5rZXlVcC5iaW5kKGtleWJvYXJkKTtcbmNhbnZhcy5vbm1vdXNlbW92ZSA9IG1vdXNlLm9uTW92ZS5iaW5kKG1vdXNlKTtcbmNhbnZhcy5vbm1vdXNlZG93biA9IG1vdXNlLm9uRG93bi5iaW5kKG1vdXNlKTtcbmNhbnZhcy5vbm1vdXNldXAgPSBtb3VzZS5vblVwLmJpbmQobW91c2UpO1xuY2FudmFzLmhlaWdodCA9IDIwMDA7XG5jYW52YXMuc3R5bGUuY3Vyc29yID0gXCJub25lXCI7XG5cbm1vZHVsZS5leHBvcnRzID0gY29udGV4dDtcbiIsIndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5veCA9IHtcbiAgICAgICAgY2FudmFzOiByZXF1aXJlKCcuL2NhbnZhcycpLmNhbnZhcyxcbiAgICAgICAgY29udGV4dDogcmVxdWlyZSgnLi9jYW52YXMnKSxcbiAgICAgICAgY2FtZXJhOiByZXF1aXJlKCcuL2NhbWVyYScpLFxuICAgICAgICBpbWFnZXM6IHJlcXVpcmUoJy4vbG9hZGVyJykuaW1hZ2VzLFxuICAgICAgICBhdWRpbzogcmVxdWlyZSgnLi9sb2FkZXInKS5hdWRpbyxcbiAgICAgICAgZGF0YTogcmVxdWlyZSgnLi9sb2FkZXInKS5kYXRhLFxuICAgICAgICBrZXlib2FyZDogcmVxdWlyZSgnLi9rZXlib2FyZCcpLFxuICAgICAgICBtb3VzZTogcmVxdWlyZSgnLi9tb3VzZScpLFxuICAgICAgICBzY2VuZXM6IHJlcXVpcmUoJy4vc2NlbmVzTWFuYWdlcicpLFxuICAgICAgICBlbnRpdGllczogcmVxdWlyZSgnLi9lbnRpdGllc01hbmFnZXInKSxcbiAgICAgICAgc2F2ZTogcmVxdWlyZSgnLi9sb2NhbFN0b3JhZ2UnKSxcbiAgICAgICAgbG9vcDogcmVxdWlyZSgnLi9nYW1lTG9vcCcpLFxuICAgICAgICBwcmVsb2FkZXI6IHJlcXVpcmUoJy4vbG9hZGVyJyksXG4gICAgICAgIHNwcml0ZTogZnVuY3Rpb24gKHNyYywgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG9wdGlvbnMgfHwge307XG4gICAgICAgICAgICBvYmouc3JjID0gc3JjO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW50aXRpZXMuc3Bhd24oJ3Nwcml0ZScsIG9iaik7XG4gICAgICAgIH0sXG4gICAgICAgIHNwYXduOiBmdW5jdGlvbiAobmFtZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgdGhpcy5saWJyYXJ5ID0gdGhpcy5lbnRpdGllcy5saWJyYXJ5O1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW50aXRpZXMuc3Bhd24obmFtZSwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgb3gubG9vcC5jYWxjdWxhdGVEZWx0YSgpO1xuICAgIG94LnNjZW5lcy5zZXQoJ2xvYWRpbmcnKTtcbiAgICBveC5sb29wLmluaXQoKTtcbn07IiwidmFyIGN1cnJlbnQgPSBbXTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY3VycmVudDogY3VycmVudCxcbiAgICBsaWJyYXJ5OiByZXF1aXJlKCcuLi9lbnRpdGllcy5qcycpLFxuICAgIHNwYXduOiBmdW5jdGlvbiAobmFtZSwgb3B0aW9ucykge1xuICAgICAgICBpZiAoIXRoaXMubGlicmFyeVtuYW1lXSkgdGhyb3cgbmV3IEVycm9yKFwiRW50aXR5ICdcIiArIG5hbWUgKyBcIicgZG9lcyBub3QgZXhpc3QgYW5kIGNhbm5vdCBiZSBzcGF3bmVkLlwiKTtcbiAgICAgICAgdmFyIG9iaiA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLmxpYnJhcnlbbmFtZV0pIHtcbiAgICAgICAgICAgIG9ialtrZXldID0gdGhpcy5saWJyYXJ5W25hbWVdW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgb2JqLnJlbW92ZSA9IHRoaXMucmVtb3ZlLmJpbmQob2JqKTtcbiAgICAgICAgb2JqLmlkID0gdGhpcy5jdXJyZW50Lmxlbmd0aDtcbiAgICAgICAgdGhpcy5jdXJyZW50LnB1c2gob2JqKTtcbiAgICAgICAgaWYgKG9iai5pbml0KSBvYmouaW5pdCgpO1xuICAgICAgICAvLyAgICAgICAgaWYgKG9iai51cGRhdGUpIFBVU0ggVE8gVVBEQVRFIExJU1QgQU5EIFNBVkUgVElNRSA6RFxuICAgICAgICBvYmouaXNSZWFkeSA9IHRydWU7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfSxcblxuICAgIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaWQgPSB0aGlzLmlkO1xuICAgICAgICBjdXJyZW50LnNwbGljZSh0aGlzLmlkLCAxKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjdXJyZW50Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFtpXS5pZCA+IGlkKSBjdXJyZW50W2ldLmlkLS07XG4gICAgICAgIH1cbiAgICB9XG59OyIsInZhciBlbnRpdGllcyA9IHJlcXVpcmUoJy4vZW50aXRpZXNNYW5hZ2VyJyksXG4gICAgc2NlbmVzID0gcmVxdWlyZSgnLi9zY2VuZXNNYW5hZ2VyJyksXG4gICAgY29udGV4dCA9IHJlcXVpcmUoJy4vY2FudmFzJyksXG4gICAgY2FtZXJhID0gcmVxdWlyZSgnLi9jYW1lcmEnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc3BlZWQ6IDEsXG4gICAgZHQ6IDAsXG4gICAgc3RlcDogMSAvIDYwLFxuICAgIGxhc3REZWx0YTogbmV3IERhdGUoKSxcbiAgICBub3c6IG5ldyBEYXRlKCksXG4gICAgY2FsY3VsYXRlRGVsdGE6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5sYXN0RGVsdGEgPSB0aGlzLm5vdztcbiAgICAgICAgdGhpcy5ub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgICB0aGlzLmR0ICs9IE1hdGgubWluKDEsICh0aGlzLm5vdyAtIHRoaXMubGFzdERlbHRhKSAvIDEwMDApICogdGhpcy5zcGVlZDtcbiAgICB9LFxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVEZWx0YSgpO1xuXG4gICAgICAgIHdoaWxlICh0aGlzLmR0ID4gdGhpcy5zdGVwKSB7XG4gICAgICAgICAgICB0aGlzLmR0IC09IHRoaXMuc3RlcDtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKHRoaXMuc3RlcCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kcmF3KHRoaXMuZHQpO1xuXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmluaXQuYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIGRyYXc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgY29udGV4dC5jYW52YXMud2lkdGgsIGNvbnRleHQuY2FudmFzLmhlaWdodCk7XG4gICAgICAgIC8vICAgIGNhbWVyYS5zdGFydCgpO1xuICAgICAgICBpZiAoc2NlbmVzLmN1cnJlbnQuZHJhdykgc2NlbmVzLmN1cnJlbnQuZHJhdygpO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZW50aXRpZXMuY3VycmVudC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgdmFyIGVudGl0eSA9IGVudGl0aWVzLmN1cnJlbnRbaV07XG4gICAgICAgICAgICBpZiAoZW50aXR5LmRyYXcpIGVudGl0eS5kcmF3KCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gICAgY29udGV4dC5yZXN0b3JlKCk7XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG4gICAgICAgIGlmIChzY2VuZXMuY3VycmVudC51cGRhdGUpIHNjZW5lcy5jdXJyZW50LnVwZGF0ZShkdCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBlbnRpdGllcy5jdXJyZW50Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgZW50aXR5ID0gZW50aXRpZXMuY3VycmVudFtpXTtcbiAgICAgICAgICAgIGlmIChlbnRpdHkudXBkYXRlKSBlbnRpdHkudXBkYXRlKGR0KTtcbiAgICAgICAgfVxuICAgIH1cbn0iLCJ2YXIgc2NlbmUgPSByZXF1aXJlKCcuL3NjZW5lc01hbmFnZXInKTtcbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGlzUHJlc3NlZDoge30sXG5cbiAgICBrZXlEb3duOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAzMiB8fCAoZS5rZXlDb2RlID49IDM3ICYmIGUua2V5Q29kZSA8PSA0MCkpIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKHNjZW5lLmN1cnJlbnQua2V5RG93bikgc2NlbmUuY3VycmVudC5rZXlEb3duKHRoaXMua2V5c1tlLmtleUNvZGVdKTtcbiAgICAgICAgdGhpcy5rZXlQcmVzcyhlKTtcbiAgICB9LFxuXG4gICAga2V5UHJlc3M6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmICh0aGlzLmlzUHJlc3NlZFtlLmtleUNvZGVdKSByZXR1cm47XG4gICAgICAgIGlmIChzY2VuZS5jdXJyZW50LmtleVByZXNzKSBzY2VuZS5jdXJyZW50LmtleVByZXNzKHRoaXMua2V5c1tlLmtleUNvZGVdKTtcbiAgICAgICAgdGhpcy5pc1ByZXNzZWRbZS5rZXlDb2RlXSA9IHRydWU7XG4gICAgfSxcblxuICAgIGtleVVwOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoc2NlbmUuY3VycmVudC5rZXlVcCkgc2NlbmUuY3VycmVudC5rZXlVcCh0aGlzLmtleXNbZS5rZXlDb2RlXSk7XG4gICAgICAgIHRoaXMuaXNQcmVzc2VkW2Uua2V5Q29kZV0gPSBmYWxzZTtcbiAgICB9LFxuXG4gICAga2V5czoge1xuICAgICAgICA4OiAnYmFja3NwYWNlJyxcbiAgICAgICAgOTogJ3RhYicsXG4gICAgICAgIDEzOiAnZW50ZXInLFxuICAgICAgICAxNjogJ3NoaWZ0JyxcbiAgICAgICAgMTc6ICdjdHJsJyxcbiAgICAgICAgMTg6ICdhbHQnLFxuICAgICAgICAxOTogJ3BhdXNlJyxcbiAgICAgICAgMjA6ICdjYXBzX2xvY2snLFxuICAgICAgICAyNzogJ2VzYycsXG4gICAgICAgIDMyOiAnc3BhY2ViYXInLFxuICAgICAgICAzMzogJ3BhZ2VfdXAnLFxuICAgICAgICAzNDogJ3BhZ2VfZG93bicsXG4gICAgICAgIDM1OiAnZW5kJyxcbiAgICAgICAgMzY6ICdob21lJyxcbiAgICAgICAgMzc6ICdsZWZ0JyxcbiAgICAgICAgMzg6ICd1cCcsXG4gICAgICAgIDM5OiAncmlnaHQnLFxuICAgICAgICA0MDogJ2Rvd24nLFxuICAgICAgICA0NDogJ3ByaW50X3NjcmVlbicsXG4gICAgICAgIDQ1OiAnaW5zZXJ0JyxcbiAgICAgICAgNDY6ICdkZWxldGUnLFxuICAgICAgICA0ODogJzAnLFxuICAgICAgICA0OTogJzEnLFxuICAgICAgICA1MDogJzInLFxuICAgICAgICA1MTogJzMnLFxuICAgICAgICA1MjogJzQnLFxuICAgICAgICA1MzogJzUnLFxuICAgICAgICA1NDogJzYnLFxuICAgICAgICA1NTogJzcnLFxuICAgICAgICA1NjogJzgnLFxuICAgICAgICA1NzogJzknLFxuICAgICAgICA2NTogJ2EnLFxuICAgICAgICA2NjogJ2InLFxuICAgICAgICA2NzogJ2MnLFxuICAgICAgICA2ODogJ2QnLFxuICAgICAgICA2OTogJ2UnLFxuICAgICAgICA3MDogJ2YnLFxuICAgICAgICA3MTogJ2cnLFxuICAgICAgICA3MjogJ2gnLFxuICAgICAgICA3MzogJ2knLFxuICAgICAgICA3NDogJ2onLFxuICAgICAgICA3NTogJ2snLFxuICAgICAgICA3NjogJ2wnLFxuICAgICAgICA3NzogJ20nLFxuICAgICAgICA3ODogJ24nLFxuICAgICAgICA3OTogJ28nLFxuICAgICAgICA4MDogJ3AnLFxuICAgICAgICA4MTogJ3EnLFxuICAgICAgICA4MjogJ3InLFxuICAgICAgICA4MzogJ3MnLFxuICAgICAgICA4NDogJ3QnLFxuICAgICAgICA4NTogJ3UnLFxuICAgICAgICA4NjogJ3YnLFxuICAgICAgICA4NzogJ3cnLFxuICAgICAgICA4ODogJ3gnLFxuICAgICAgICA4OTogJ3knLFxuICAgICAgICA5MDogJ3onLFxuICAgICAgICA5NjogJ251bV96ZXJvJyxcbiAgICAgICAgOTc6ICdudW1fb25lJyxcbiAgICAgICAgOTg6ICdudW1fdHdvJyxcbiAgICAgICAgOTk6ICdudW1fdGhyZWUnLFxuICAgICAgICAxMDA6ICdudW1fZm91cicsXG4gICAgICAgIDEwMTogJ251bV9maXZlJyxcbiAgICAgICAgMTAyOiAnbnVtX3NpeCcsXG4gICAgICAgIDEwMzogJ251bV9zZXZlbicsXG4gICAgICAgIDEwNDogJ251bV9laWdodCcsXG4gICAgICAgIDEwNTogJ251bV9uaW5lJyxcbiAgICAgICAgMTA2OiAnbnVtX211bHRpcGx5JyxcbiAgICAgICAgMTA3OiAnbnVtX3BsdXMnLFxuICAgICAgICAxMDk6ICdudW1fbWludXMnLFxuICAgICAgICAxMTA6ICdudW1fcGVyaW9kJyxcbiAgICAgICAgMTExOiAnbnVtX2RpdmlzaW9uJyxcbiAgICAgICAgMTEyOiAnZjEnLFxuICAgICAgICAxMTM6ICdmMicsXG4gICAgICAgIDExNDogJ2YzJyxcbiAgICAgICAgMTE1OiAnZjQnLFxuICAgICAgICAxMTY6ICdmNScsXG4gICAgICAgIDExNzogJ2Y2JyxcbiAgICAgICAgMTE4OiAnZjcnLFxuICAgICAgICAxMTk6ICdmOCcsXG4gICAgICAgIDEyMDogJ2Y5JyxcbiAgICAgICAgMTIxOiAnZjEwJyxcbiAgICAgICAgMTIyOiAnZjExJyxcbiAgICAgICAgMTIzOiAnZjEyJyxcbiAgICAgICAgMTg2OiAnc2VtaWNvbG9uJyxcbiAgICAgICAgMTg3OiAncGx1cycsXG4gICAgICAgIDE4OTogJ21pbnVzJyxcbiAgICAgICAgMTkyOiAnZ3JhdmVfYWNjZW50JyxcbiAgICAgICAgMjIyOiAnc2luZ2xlX3F1b3RlJ1xuICAgIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGltYWdlczoge30sXG4gIGRhdGE6IHt9LFxuICBhdWRpbzoge30sXG4gIGFzc2V0c1RvTG9hZDogMCxcblxuICBsb2FkSW1hZ2U6IGZ1bmN0aW9uIChwYXRoKSB7XG4gICAgdmFyIG5hbWUgPSBwYXRoLnNsaWNlKDksIHBhdGgubGVuZ3RoKTtcbiAgICB0aGlzLmltYWdlc1tuYW1lXSA9IG5ldyBJbWFnZSgpO1xuICAgIHRoaXMuaW1hZ2VzW25hbWVdLm9ubG9hZCA9IHRoaXMuYXNzZXRzVG9Mb2FkLS07XG4gICAgdGhpcy5pbWFnZXNbbmFtZV0uc3JjID0gcGF0aDtcbiAgfSxcblxuICBsb2FkRGF0YTogZnVuY3Rpb24gKHBhdGgpIHtcbiAgICB2YXIgZmlsZSA9IHBhdGguc2xpY2UoNywgcGF0aC5sZW5ndGggLSA1KSxcbiAgICAgIHNlbGYgPSB0aGlzLFxuICAgICAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0O1xuXG4gICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCAmJiB4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgc2VsZi5kYXRhW2ZpbGVdID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgc2VsZi5hc3NldHNUb0xvYWQtLTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgeGhyLm9wZW4oXCJHRVRcIiwgcGF0aCk7XG4gICAgeGhyLnNlbmQoKTtcbiAgfSxcblxuICBsb2FkQXVkaW86IGZ1bmN0aW9uIChuYW1lKSB7fSxcblxuICBsb2FkOiBmdW5jdGlvbiAobGlzdCkge1xuICAgIHRoaXMuYXNzZXRzVG9Mb2FkICs9IGxpc3QubGVuZ3RoO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAobGlzdFtpXS5pbmRleE9mKCcuL2ltYWdlcycpID4gLTEpIHtcbiAgICAgICAgdGhpcy5sb2FkSW1hZ2UobGlzdFtpXSk7XG4gICAgICB9IGVsc2UgaWYgKGxpc3RbaV0uaW5kZXhPZignLi9kYXRhJykgPiAtMSkge1xuICAgICAgICB0aGlzLmxvYWREYXRhKGxpc3RbaV0pO1xuICAgICAgfSBlbHNlIGlmIChsaXN0W2ldLmluZGV4T2YoJy4vYXVkaW8nKSA+IC0xKSB7XG4gICAgICAgIHRoaXMubG9hZEF1ZGlvKGxpc3RbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgc3RvcmU6IGZ1bmN0aW9uIChudW0sIG9iaikge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKG51bSwgSlNPTi5zdHJpbmdpZnkob2JqKSk7XG4gIH0sXG4gIGxvYWQ6IGZ1bmN0aW9uIChudW0pIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShudW0pKTtcbiAgfSxcbiAgcmVtb3ZlOiBmdW5jdGlvbiAobnVtKSB7XG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0obnVtKTtcbiAgfVxufVxuIiwidmFyIHNjZW5lID0gcmVxdWlyZSgnLi9zY2VuZXNNYW5hZ2VyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHg6IDAsXG4gICAgeTogMCxcbiAgICBpc0Rvd246IGZhbHNlLFxuXG4gICAgb25Nb3ZlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBveC5tb3VzZS54ID0gZS5jbGllbnRYIC0gb3guY2FudmFzLm9mZnNldExlZnQ7XG4gICAgICAgIG94Lm1vdXNlLnkgPSBlLmNsaWVudFkgLSBveC5jYW52YXMub2Zmc2V0VG9wO1xuICAgICAgICBpZiAoc2NlbmUuY3VycmVudC5tb3VzZU1vdmUpIHNjZW5lLmN1cnJlbnQubW91c2VNb3ZlKG94Lm1vdXNlKVxuICAgIH0sXG4gICAgb25VcDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKHNjZW5lLmN1cnJlbnQubW91c2VVcCkgc2NlbmUuY3VycmVudC5tb3VzZVVwKHRoaXMuYnV0dG9uc1tlLmJ1dHRvbl0pO1xuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xuICAgIH0sXG4gICAgb25Eb3duOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoc2NlbmUuY3VycmVudC5tb3VzZURvd24pIHNjZW5lLmN1cnJlbnQubW91c2VEb3duKHRoaXMuYnV0dG9uc1tlLmJ1dHRvbl0pO1xuICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XG4gICAgfSxcblxuICAgIGJ1dHRvbnM6IHtcbiAgICAgICAgMDogXCJsZWZ0XCIsXG4gICAgICAgIDE6IFwibWlkZGxlXCIsXG4gICAgICAgIDI6IFwicmlnaHRcIlxuICAgIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGN1cnJlbnQ6IG51bGwsXG4gIGxpc3Q6IHJlcXVpcmUoJy4uL3NjZW5lcy5qcycpLFxuICBzZXQ6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgaWYgKCF0aGlzLmxpc3RbbmFtZV0pIHRocm93IG5ldyBFcnJvcihcIlNjZW5lICdcIiArIG5hbWUgKyBcIicgZG9lcyBub3QgZXhpc3QhXCIpO1xuICAgIHRoaXMuY3VycmVudCA9IHRoaXMubGlzdFtuYW1lXTtcbiAgICBpZiAodGhpcy5jdXJyZW50LmluaXQpIHRoaXMuY3VycmVudC5pbml0KCk7XG4gIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNvdW50ZXI6IHJlcXVpcmUoJy4vZW50aXRpZXMvY291bnRlci5qcycpLFxuICBjb3VudGVyMjogcmVxdWlyZSgnLi9lbnRpdGllcy9jb3VudGVyMi5qcycpLFxuICBwbGF5ZXI6IHJlcXVpcmUoJy4vZW50aXRpZXMvcGxheWVyLmpzJyksXG4gIHBvbmV5OiByZXF1aXJlKCcuL2VudGl0aWVzL3BvbmV5LmpzJyksXG4gIHNwcml0ZTogcmVxdWlyZSgnLi9lbnRpdGllcy9zcHJpdGUuanMnKSxcbiAgdGltZXI6IHJlcXVpcmUoJy4vZW50aXRpZXMvdGltZXIuanMnKVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudmFsdWUgPSAxMDA7XG4gIH0sXG4gIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudmFsdWUrKztcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52ID0gMTAxO1xuICAgIHRoaXMudmFsdWUgPSAwO1xuICAgIHRoaXMuYyA9IG94LmVudGl0aWVzLnNwYXduKCdjb3VudGVyJyk7XG4gIH0sXG4gIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudmFsdWUrKztcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgb3guc3Bhd24oJ3BvbmV5Jyk7XG4gIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnggPSAwO1xuICB9LFxuXG4gIGRyYXc6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLngrKztcbiAgICBveC5jb250ZXh0LmZpbGxTdHlsZSA9ICdibHVlJ1xuICAgIG94LmNvbnRleHQuZmlsbFJlY3QoODAsIDgwLCAxMDAsIDIwMClcbiAgICBveC5jb250ZXh0LnN0cm9rZVN0eWxlID0gJ2dyZXknXG4gICAgb3guY29udGV4dC5zdHJva2VSZWN0KDgwLCA4MCwgMTAwLCAyMDApXG4gICAgb3guY29udGV4dC5kcmF3U3ByaXRlKCdwb255LnBuZycsIHRoaXMueCwgMCk7XG4gICAgb3guY29udGV4dC5kcmF3U3ByaXRlKCdwb255LnBuZycsIHRoaXMueCArIDEwLCAwKTtcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pc1Zpc2libGUgPSB0cnVlO1xuICAgIHRoaXMuc3JjV2lkdGggPSBveC5pbWFnZXNbdGhpcy5zcmNdLndpZHRoO1xuICAgIHRoaXMud2lkdGggPSB0aGlzLndpZHRoIHx8IHRoaXMuc3JjV2lkdGg7XG4gICAgdGhpcy5zcmNIZWlnaHQgPSBveC5pbWFnZXNbdGhpcy5zcmNdLmhlaWdodDtcbiAgICB0aGlzLmhlaWdodCA9IHRoaXMuaGVpZ2h0IHx8IHRoaXMuc3JjSGVpZ2h0O1xuICAgIHRoaXMueCA9IHRoaXMueCB8fCAwO1xuICAgIHRoaXMueSA9IHRoaXMueSB8fCAwO1xuICAgIGlmICh0aGlzLmFuaW1hdGlvbikge1xuICAgICAgdGhpcy5pbml0QW5pbWF0aW9uKCk7XG4gICAgICB0aGlzLnVwZGF0ZSA9IHRoaXMudXBkYXRlQW5pbWF0aW9uO1xuICAgICAgdGhpcy5kcmF3ID0gdGhpcy5kcmF3QW5pbWF0aW9uO1xuICAgIH1cbiAgfSxcblxuICBpbml0QW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pc1BsYXlpbmcgPSB0cnVlO1xuICAgIHRoaXMuaXNGaW5pc2hlZCA9IGZhbHNlO1xuICAgIGlmICh0eXBlb2YgdGhpcy5sb29wICE9PSAnYm9vbGVhbicpIHRoaXMubG9vcCA9IHRydWU7XG4gICAgdGhpcy5jb3VudGVyID0gMDtcbiAgICB0aGlzLmZyYW1lUmF0ZSA9IDYwIC8gdGhpcy5mcmFtZVJhdGUgfHwgMTtcbiAgICB0aGlzLmNhbGN1bGF0ZUZyYW1lcygpO1xuXG4gICAgaWYgKHRoaXMuYW5pbWF0aW9ucykge1xuICAgICAgdGhpcy5hbmltYXRpb25BcnJheSA9IHRoaXMuYW5pbWF0aW9uc1t0aGlzLmFuaW1hdGlvbl1cbiAgICAgIHRoaXMuYXJyYXlDb3VudGVyID0gMDtcbiAgICAgIHRoaXMuZnJhbWUgPSB0aGlzLmFuaW1hdGlvbkFycmF5W3RoaXMuYXJyYXlDb3VudGVyXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5mcmFtZSA9IDA7XG4gICAgfVxuICB9LFxuXG4gIGRyYXc6IGZ1bmN0aW9uICgpIHtcbiAgICBveC5jb250ZXh0LmRyYXdTcHJpdGUodGhpcy5zcmMsIHRoaXMueCwgdGhpcy55KTtcbiAgfSxcblxuICBkcmF3QW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgb3guY29udGV4dC5kcmF3U3ByaXRlKHRoaXMuc3JjLCB0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIHRoaXMuZnJhbWVzW3RoaXMuZnJhbWVdKTtcbiAgfSxcblxuICBjYWxjdWxhdGVGcmFtZXM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgeCA9IHkgPSAwO1xuICAgIHRoaXMuZnJhbWVzID0gW1swLCAwXV07XG5cbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IHRoaXMuc3JjSGVpZ2h0IC8gdGhpcy5oZWlnaHQgKiB0aGlzLnNyY1dpZHRoIC8gdGhpcy53aWR0aDsgaSsrKSB7XG4gICAgICBpZiAoeCA8IHRoaXMuc3JjV2lkdGggLyB0aGlzLndpZHRoIC0gMSkge1xuICAgICAgICB4Kys7XG4gICAgICB9IGVsc2UgaWYgKHkgPCB0aGlzLnNyY0hlaWdodCAvIHRoaXMuaGVpZ2h0IC0gMSkge1xuICAgICAgICB5Kys7XG4gICAgICAgIHggPSAwO1xuICAgICAgfVxuICAgICAgdGhpcy5mcmFtZXMucHVzaChbeCwgeV0pO1xuICAgIH1cbiAgfSxcblxuICB1cGRhdGVBbmltYXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuaXNQbGF5aW5nKSByZXR1cm47XG4gICAgaWYgKHRoaXMuaXNGaW5pc2hlZCkgcmV0dXJuIHRoaXMuZmluaXNoZWQoKTtcblxuICAgIHRoaXMuY291bnRlciArPSAxO1xuICAgIGlmICh0aGlzLmNvdW50ZXIgPiB0aGlzLmZyYW1lUmF0ZSkge1xuICAgICAgdGhpcy5jb3VudGVyID0gMDtcbiAgICAgIGlmICh0aGlzLmFuaW1hdGlvbnMpIHRoaXMubXVsdGlwbGVBbmltYXRpb25zKCk7XG4gICAgICBlbHNlIHRoaXMuc2luZ2xlQW5pbWF0aW9uKCk7XG4gICAgfVxuICB9LFxuXG4gIG11bHRpcGxlQW5pbWF0aW9uczogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmFycmF5Q291bnRlciA9PT0gdGhpcy5hbmltYXRpb25BcnJheS5sZW5ndGggLSAxKSB7XG4gICAgICBpZiAoIXRoaXMubG9vcCkgdGhpcy5pc0ZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuZnJhbWUgPSB0aGlzLmFuaW1hdGlvbkFycmF5WzBdXG4gICAgICB0aGlzLmFycmF5Q291bnRlciA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYXJyYXlDb3VudGVyKys7XG4gICAgICB0aGlzLmZyYW1lID0gdGhpcy5hbmltYXRpb25BcnJheVt0aGlzLmFycmF5Q291bnRlcl1cbiAgICB9XG4gIH0sXG5cbiAgc2luZ2xlQW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuZnJhbWUgPT09ICh0aGlzLmZyYW1lcy5sZW5ndGggLSAxKSkge1xuICAgICAgaWYgKCF0aGlzLmxvb3ApIHRoaXMuaXNGaW5pc2hlZCA9IHRydWU7XG4gICAgICB0aGlzLmZyYW1lID0gMFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZyYW1lICs9IDE7XG4gICAgfVxuICB9LFxuXG4gIGZpbmlzaGVkOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zdG9wKCk7XG4gICAgaWYgKHRoaXMub25GaW5pc2gpIHRoaXMub25GaW5pc2goKTtcbiAgfSxcblxuICBwbGF5OiBmdW5jdGlvbiAoYW5pbWF0aW9uLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBvcHRpb25zKSB7XG4gICAgICAgIHRoaXNba2V5XSA9IG9wdGlvbnNba2V5XVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmFuaW1hdGlvbnMpIHtcbiAgICAgIGlmIChhbmltYXRpb24pIHRoaXMuYW5pbWF0aW9uID0gYW5pbWF0aW9uO1xuICAgICAgdGhpcy5hbmltYXRpb25BcnJheSA9IHRoaXMuYW5pbWF0aW9uc1t0aGlzLmFuaW1hdGlvbl07XG4gICAgICB0aGlzLmFycmF5Q291bnRlciA9IDA7XG4gICAgICB0aGlzLmZyYW1lID0gdGhpcy5hbmltYXRpb25BcnJheVt0aGlzLmFycmF5Q291bnRlcl07XG4gICAgfVxuICAgIHRoaXMuaXNGaW5pc2hlZCA9IGZhbHNlO1xuICAgIHRoaXMuaXNQbGF5aW5nID0gdHJ1ZTtcbiAgfSxcblxuICBzdG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pc1BsYXlpbmcgPSBmYWxzZTtcbiAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudmFsdWUgPSAwO1xuICAgIHRoaXMuaXNGaW5pc2hlZCA9IGZhbHNlO1xuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG4gICAgaWYgKCF0aGlzLmlzRmluaXNoZWQgJiYgIXRoaXMuaXNQYXVzZWQpIHtcbiAgICAgIHRoaXMudmFsdWUgKz0gZHQ7XG4gICAgICBpZiAodGhpcy52YWx1ZSA+PSB0aGlzLmdvYWwpIHtcbiAgICAgICAgdGhpcy5pc0ZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5mdW5jKCk7XG4gICAgICAgIGlmICh0aGlzLmxvb3ApIHRoaXMucmVzdGFydCgpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICByZXN0YXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52YWx1ZSA9IDA7XG4gICAgdGhpcy5pc0ZpbmlzaGVkID0gZmFsc2U7XG4gIH0sXG5cbiAgcGF1c2U6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlzUGF1c2VkID0gdHJ1ZTtcbiAgfSxcblxuICByZXN1bWU6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlzUGF1c2VkID0gZmFsc2U7XG4gIH0sXG5cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGxvYWRpbmc6IHJlcXVpcmUoJy4vc2NlbmVzL2xvYWRpbmcuanMnKSxcbiAgbWFpbjogcmVxdWlyZSgnLi9zY2VuZXMvbWFpbi5qcycpXG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgb3gucHJlbG9hZGVyLmxvYWQocmVxdWlyZSgnLi4vYXNzZXRzLmpzJykpO1xuICAgIHRoaXMuYmFyTGVuZ3RoID0gb3gucHJlbG9hZGVyLmFzc2V0c1RvTG9hZDtcbiAgfSxcblxuICBkcmF3OiBmdW5jdGlvbiAoKSB7XG4gICAgb3guY29udGV4dC5maWxsU3R5bGUgPSBcImJsYWNrXCJcbiAgICBveC5jb250ZXh0LmZpbGxSZWN0KDAsIDAsIG94LmNhbnZhcy53aWR0aCwgb3guY2FudmFzLmhlaWdodClcbiAgICBveC5jb250ZXh0LmZpbGxTdHlsZSA9IFwicmdiKDQ2LCAyMzgsIDI0NSlcIlxuICAgIG94LmNvbnRleHQuZmlsbFJlY3Qob3guY2FudmFzLndpZHRoIC8gNCwgb3guY2FudmFzLmhlaWdodCAvIDIgKyAzMiwgb3guY2FudmFzLndpZHRoIC8gMiwgMSlcbiAgICBveC5jb250ZXh0LmZpbGxTdHlsZSA9IFwiZ3JleVwiXG4gICAgb3guY29udGV4dC5zYXZlKClcbiAgICBveC5jb250ZXh0LnRyYW5zbGF0ZShveC5jYW52YXMud2lkdGggLyA0LCAyICogb3guY2FudmFzLmhlaWdodCAvIDMpXG4gICAgb3guY29udGV4dC5zY2FsZSgtMSwgMSlcbiAgICBveC5jb250ZXh0LmZpbGxSZWN0KC1veC5jYW52YXMud2lkdGggLyAyLCAwLCBveC5jYW52YXMud2lkdGggLyAyICogb3gucHJlbG9hZGVyLmFzc2V0c1RvTG9hZCAvIHRoaXMuYmFyTGVuZ3RoLCAxKVxuICAgIG94LmNvbnRleHQucmVzdG9yZSgpXG4gICAgb3guY29udGV4dC5maWxsU3R5bGUgPSBcIndoaXRlXCJcbiAgICBveC5jb250ZXh0LmZvbnQgPSAnMjAwJSBzYW5zLXNlcmlmJ1xuICAgIG94LmNvbnRleHQuZmlsbFRleHQoJ2xvYWRpbmcuLi4nLCBveC5jYW52YXMud2lkdGggLyAyIC0gNjgsIG94LmNhbnZhcy5oZWlnaHQgLyAyICsgMTApO1xuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIGlmIChveC5wcmVsb2FkZXIuYXNzZXRzVG9Mb2FkID09PSAwKSBveC5zY2VuZXMuc2V0KCdtYWluJyk7XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdGhpcy5zcHJpdGUyID0gb3guc3ByaXRlKCdjb2luMi5wbmcnLCB7XG4gICAgICAgICAgICBhbmltYXRpb246ICdzcGluJyxcbiAgICAgICAgICAgIGFuaW1hdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBzcGluOiBbMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOV0sXG4gICAgICAgICAgICAgICAgaWRsZTogWzgsIDQsIDgsIDQsIDgsIDQsIDgsIDQsIDgsIDQsIDgsIDQsIDgsIDQsIDgsIDRdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaGVpZ2h0OiA0MCxcbiAgICAgICAgICAgIGZyYW1lUmF0ZTogMzAsXG4gICAgICAgICAgICB3aWR0aDogNDQsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc3ByaXRlMi5wbGF5KCdzcGluJywge1xuICAgICAgICAgICAgbG9vcDogdHJ1ZVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNwcml0ZTMgPSBveC5zcHJpdGUoJ3BvbnkucG5nJywge1xuICAgICAgICAgICAgeDogMTAwLFxuICAgICAgICAgICAgeTogMTAwXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNvaW4gPSBveC5zcHJpdGUoJ2NvaW4ucG5nJywge1xuICAgICAgICAgICAgYW5pbWF0aW9uOiAnc3BpbicsXG4gICAgICAgICAgICBhbmltYXRpb25zOiB7XG4gICAgICAgICAgICAgICAgc3BpbjogWzAsIDEsIDIsIDMsIDQsIDVdLFxuICAgICAgICAgICAgICAgIGlkbGU6IFs0XVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZyYW1lUmF0ZTogMTAsXG4gICAgICAgICAgICB3aWR0aDogNDQsXG4gICAgICAgICAgICBoZWlnaHQ6IDQwXG4gICAgICAgIH0pO1xuXG4gICAgICAgIG94LnNwYXduKCdwbGF5ZXInKTtcblxuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuICAgICAgICB0aGlzLnNwcml0ZTIueCA9IG94Lm1vdXNlLng7XG4gICAgICAgIHRoaXMuc3ByaXRlMi55ID0gb3gubW91c2UueTtcblxuICAgICAgICBveC5jYW1lcmEuc2V0KG94Lm1vdXNlLngsIG94Lm1vdXNlLnkpO1xuICAgIH0sXG5cbiAgICBrZXlEb3duOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2V5RG93bjogXCIgKyBrZXkpO1xuICAgIH0sXG5cbiAgICBrZXlQcmVzczogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImtleVByZXNzOiBcIiArIGtleSk7XG4gICAgfSxcblxuICAgIGtleVVwOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2V5VXA6IFwiICsga2V5KTtcbiAgICB9LFxuXG4gICAgbW91c2VEb3duOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkNsaWNrZWQgYXQ6IFwiICsgb3gubW91c2UueCArIFwiLCBcIiArIG94Lm1vdXNlLnksIGUpO1xuICAgIH0sXG5cbiAgICBtb3VzZVVwOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlJlbGVhc2VkIGF0OiBcIiArIG94Lm1vdXNlLnggKyBcIiwgXCIgKyBveC5tb3VzZS55KTtcbiAgICB9XG59OyJdfQ==
