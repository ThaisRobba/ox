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

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

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
canvas.oncontextmenu = function () {
    return false;
};

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
        spawn: require('./entitiesManager').spawn
    };

    ox.loop.calculateDelta();
    ox.scenes.set('loading');
    ox.loop.init();
};

},{"./camera":2,"./canvas":3,"./entitiesManager":5,"./gameLoop":6,"./keyboard":7,"./loader":8,"./localStorage":9,"./mouse":10,"./scenesManager":11}],5:[function(require,module,exports){
var list = require('../entities'),
    current = [],
    toUpdate = [],
    toDraw = [],
    spawn = function (name, options) {
        if (!list[name]) throw new Error("Entity [" + name + "] does not exist and cannot be spawned.");
        var obj = options || {};
        for (var key in list[name]) {
            obj[key] = list[name][key];
        }
        obj.disable = disable.bind(obj);
        obj.enable = enable.bind(obj);
        obj.id = current.length;
        current.push(obj);
        if (obj.init) obj.init();
        obj.enable();
        return obj;
    },
    disable = function () {
        if (toDraw.indexOf(this.id) > 0) toDraw.splice(toDraw.indexOf(this.id), 1);
        if (toUpdate.indexOf(this.id) > 0) toUpdate.splice(toUpdate.indexOf(this.id), 1);
    },
    enable = function () {
        if (this.update) toUpdate.push(this.id);
        if (this.draw) toDraw.push(this.id);
    };

module.exports = {
    current: current,
    list: list,
    toDraw: toDraw,
    toUpdate: toUpdate,
    spawn: spawn
};

},{"../entities":12}],6:[function(require,module,exports){
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
        for (var i = 0, len = entities.toDraw.length; i < len; i++) {
            entities.current[entities.toDraw[i]].draw();
        }
        //    context.restore();
    },

    update: function (dt) {
        if (scenes.current.update) scenes.current.update(dt);
        for (var i = 0, len = entities.toUpdate.length; i < len; i++) {
            entities.current[entities.toUpdate[i]].update(dt);
        }
    }
};

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
            xhr = new XMLHttpRequest();

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
};

},{}],10:[function(require,module,exports){
var scene = require('./scenesManager');

module.exports = {
    x: 0,
    y: 0,
    isDown: false,

    onMove: function (e) {
        ox.mouse.x = e.clientX - ox.canvas.offsetLeft;
        ox.mouse.y = e.clientY - ox.canvas.offsetTop;
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
        if (!this.list[name]) throw new Error("Scene [" + name + "] does not exist!");
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
            this.animationArray = this.animations[this.animation];
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
        var x = 0,
            y = 0;
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
            this.frame = this.animationArray[0];
            this.arrayCounter = 0;
        } else {
            this.arrayCounter++;
            this.frame = this.animationArray[this.arrayCounter];
        }
    },

    singleAnimation: function () {
        if (this.frame === (this.frames.length - 1)) {
            if (!this.loop) this.isFinished = true;
            this.frame = 0;
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
                this[key] = options[key];
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

        this.sprite3 = ox.sprite('pony.png', {
            x: 0,
            y: 100
        });

        this.sprite4 = ox.sprite('pony.png', {
            x: 100,
            y: 100
        });

        this.sprite4 = ox.sprite('pony.png', {
            x: 200,
            y: 100
        });

        //        ox.spawn('player');

    },

    update: function (dt) {
        //        this.sprite2.x = ox.mouse.x;
        //        this.sprite2.y = ox.mouse.y;

        //        ox.camera.set(ox.mouse.x, ox.mouse.y);
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

    mouseDown: function (button) {
        console.log("Clicked at: " + ox.mouse.x + ", " + ox.mouse.y + " with the " + button + " button.");
    },

    mouseUp: function (button) {
        console.log("Released at: " + ox.mouse.x + ", " + ox.mouse.y + " with the " + button + " button.");
    }
};
},{}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9hc3NldHMuanMiLCJzcmMvZW5naW5lL2NhbWVyYS5qcyIsInNyYy9lbmdpbmUvY2FudmFzLmpzIiwic3JjL2VuZ2luZS9jb3JlLmpzIiwic3JjL2VuZ2luZS9lbnRpdGllc01hbmFnZXIuanMiLCJzcmMvZW5naW5lL2dhbWVMb29wLmpzIiwic3JjL2VuZ2luZS9rZXlib2FyZC5qcyIsInNyYy9lbmdpbmUvbG9hZGVyLmpzIiwic3JjL2VuZ2luZS9sb2NhbFN0b3JhZ2UuanMiLCJzcmMvZW5naW5lL21vdXNlLmpzIiwic3JjL2VuZ2luZS9zY2VuZXNNYW5hZ2VyLmpzIiwic3JjL2VudGl0aWVzLmpzIiwic3JjL2VudGl0aWVzL2NvdW50ZXIuanMiLCJzcmMvZW50aXRpZXMvY291bnRlcjIuanMiLCJzcmMvZW50aXRpZXMvcGxheWVyLmpzIiwic3JjL2VudGl0aWVzL3BvbmV5LmpzIiwic3JjL2VudGl0aWVzL3Nwcml0ZS5qcyIsInNyYy9lbnRpdGllcy90aW1lci5qcyIsInNyYy9zY2VuZXMuanMiLCJzcmMvc2NlbmVzL2xvYWRpbmcuanMiLCJzcmMvc2NlbmVzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IFtcbiAgJy4vaW1hZ2VzL2NvaW4ucG5nJyxcbiAgJy4vaW1hZ2VzL2NvaW4yLnBuZycsXG4gICcuL2ltYWdlcy9jb2luVHdpc3RlZC5wbmcnLFxuICAnLi9pbWFnZXMvcG9ueS5wbmcnLFxuICAnLi9pbWFnZXMvdGVzdGUucG5nJyxcbiAgJy4vZGF0YS9leGFtcGxlLmpzb24nXG5dOyIsInZhciBjb250ZXh0ID0gcmVxdWlyZSgnLi9jYW52YXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc2V0OiBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgIH0sXG5cbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xuICAgICAgICBjb250ZXh0LnNhdmUoKTtcbiAgICAgICAgY29udGV4dC50cmFuc2xhdGUodGhpcy54LCB0aGlzLnkpO1xuICAgIH1cbn07XG4iLCJ2YXIgaW1hZ2VzID0gcmVxdWlyZSgnLi9sb2FkZXInKS5pbWFnZXMsXG4gICAga2V5Ym9hcmQgPSByZXF1aXJlKCcuL2tleWJvYXJkJyksXG4gICAgbW91c2UgPSByZXF1aXJlKCcuL21vdXNlJyk7XG5cbnZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyk7XG52YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5jb250ZXh0LmRyYXdTcHJpdGUgPSBmdW5jdGlvbiAoc3JjLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBmcmFtZSkge1xuICAgIGlmICh0eXBlb2Ygd2lkdGggPT09ICdudW1iZXInKSB7XG4gICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKFxuICAgICAgICAgICAgaW1hZ2VzW3NyY10sXG4gICAgICAgICAgICB3aWR0aCAqIGZyYW1lWzBdLFxuICAgICAgICAgICAgaGVpZ2h0ICogZnJhbWVbMV0sXG4gICAgICAgICAgICB3aWR0aCwgaGVpZ2h0LCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb250ZXh0LmRyYXdJbWFnZShpbWFnZXNbc3JjXSwgeCwgeSk7XG4gICAgfVxufTtcblxuY2FudmFzLnRhYkluZGV4ID0gMTAwMDtcbmNhbnZhcy5zdHlsZS5vdXRsaW5lID0gXCJub25lXCI7XG5jYW52YXMub25rZXlkb3duID0ga2V5Ym9hcmQua2V5RG93bi5iaW5kKGtleWJvYXJkKTtcbmNhbnZhcy5vbmtleXVwID0ga2V5Ym9hcmQua2V5VXAuYmluZChrZXlib2FyZCk7XG5jYW52YXMub25tb3VzZW1vdmUgPSBtb3VzZS5vbk1vdmUuYmluZChtb3VzZSk7XG5jYW52YXMub25tb3VzZWRvd24gPSBtb3VzZS5vbkRvd24uYmluZChtb3VzZSk7XG5jYW52YXMub25tb3VzZXVwID0gbW91c2Uub25VcC5iaW5kKG1vdXNlKTtcbmNhbnZhcy5oZWlnaHQgPSAyMDAwO1xuY2FudmFzLnN0eWxlLmN1cnNvciA9IFwibm9uZVwiO1xuY2FudmFzLm9uY29udGV4dG1lbnUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb250ZXh0O1xuIiwid2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm94ID0ge1xuICAgICAgICBjYW52YXM6IHJlcXVpcmUoJy4vY2FudmFzJykuY2FudmFzLFxuICAgICAgICBjb250ZXh0OiByZXF1aXJlKCcuL2NhbnZhcycpLFxuICAgICAgICBjYW1lcmE6IHJlcXVpcmUoJy4vY2FtZXJhJyksXG4gICAgICAgIGltYWdlczogcmVxdWlyZSgnLi9sb2FkZXInKS5pbWFnZXMsXG4gICAgICAgIGF1ZGlvOiByZXF1aXJlKCcuL2xvYWRlcicpLmF1ZGlvLFxuICAgICAgICBkYXRhOiByZXF1aXJlKCcuL2xvYWRlcicpLmRhdGEsXG4gICAgICAgIGtleWJvYXJkOiByZXF1aXJlKCcuL2tleWJvYXJkJyksXG4gICAgICAgIG1vdXNlOiByZXF1aXJlKCcuL21vdXNlJyksXG4gICAgICAgIHNjZW5lczogcmVxdWlyZSgnLi9zY2VuZXNNYW5hZ2VyJyksXG4gICAgICAgIGVudGl0aWVzOiByZXF1aXJlKCcuL2VudGl0aWVzTWFuYWdlcicpLFxuICAgICAgICBzYXZlOiByZXF1aXJlKCcuL2xvY2FsU3RvcmFnZScpLFxuICAgICAgICBsb29wOiByZXF1aXJlKCcuL2dhbWVMb29wJyksXG4gICAgICAgIHByZWxvYWRlcjogcmVxdWlyZSgnLi9sb2FkZXInKSxcbiAgICAgICAgc3ByaXRlOiBmdW5jdGlvbiAoc3JjLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgICAgIG9iai5zcmMgPSBzcmM7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lbnRpdGllcy5zcGF3bignc3ByaXRlJywgb2JqKTtcbiAgICAgICAgfSxcbiAgICAgICAgc3Bhd246IHJlcXVpcmUoJy4vZW50aXRpZXNNYW5hZ2VyJykuc3Bhd25cbiAgICB9O1xuXG4gICAgb3gubG9vcC5jYWxjdWxhdGVEZWx0YSgpO1xuICAgIG94LnNjZW5lcy5zZXQoJ2xvYWRpbmcnKTtcbiAgICBveC5sb29wLmluaXQoKTtcbn07XG4iLCJ2YXIgbGlzdCA9IHJlcXVpcmUoJy4uL2VudGl0aWVzJyksXG4gICAgY3VycmVudCA9IFtdLFxuICAgIHRvVXBkYXRlID0gW10sXG4gICAgdG9EcmF3ID0gW10sXG4gICAgc3Bhd24gPSBmdW5jdGlvbiAobmFtZSwgb3B0aW9ucykge1xuICAgICAgICBpZiAoIWxpc3RbbmFtZV0pIHRocm93IG5ldyBFcnJvcihcIkVudGl0eSBbXCIgKyBuYW1lICsgXCJdIGRvZXMgbm90IGV4aXN0IGFuZCBjYW5ub3QgYmUgc3Bhd25lZC5cIik7XG4gICAgICAgIHZhciBvYmogPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gbGlzdFtuYW1lXSkge1xuICAgICAgICAgICAgb2JqW2tleV0gPSBsaXN0W25hbWVdW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgb2JqLmRpc2FibGUgPSBkaXNhYmxlLmJpbmQob2JqKTtcbiAgICAgICAgb2JqLmVuYWJsZSA9IGVuYWJsZS5iaW5kKG9iaik7XG4gICAgICAgIG9iai5pZCA9IGN1cnJlbnQubGVuZ3RoO1xuICAgICAgICBjdXJyZW50LnB1c2gob2JqKTtcbiAgICAgICAgaWYgKG9iai5pbml0KSBvYmouaW5pdCgpO1xuICAgICAgICBvYmouZW5hYmxlKCk7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfSxcbiAgICBkaXNhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodG9EcmF3LmluZGV4T2YodGhpcy5pZCkgPiAwKSB0b0RyYXcuc3BsaWNlKHRvRHJhdy5pbmRleE9mKHRoaXMuaWQpLCAxKTtcbiAgICAgICAgaWYgKHRvVXBkYXRlLmluZGV4T2YodGhpcy5pZCkgPiAwKSB0b1VwZGF0ZS5zcGxpY2UodG9VcGRhdGUuaW5kZXhPZih0aGlzLmlkKSwgMSk7XG4gICAgfSxcbiAgICBlbmFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnVwZGF0ZSkgdG9VcGRhdGUucHVzaCh0aGlzLmlkKTtcbiAgICAgICAgaWYgKHRoaXMuZHJhdykgdG9EcmF3LnB1c2godGhpcy5pZCk7XG4gICAgfTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY3VycmVudDogY3VycmVudCxcbiAgICBsaXN0OiBsaXN0LFxuICAgIHRvRHJhdzogdG9EcmF3LFxuICAgIHRvVXBkYXRlOiB0b1VwZGF0ZSxcbiAgICBzcGF3bjogc3Bhd25cbn07XG4iLCJ2YXIgZW50aXRpZXMgPSByZXF1aXJlKCcuL2VudGl0aWVzTWFuYWdlcicpLFxuICAgIHNjZW5lcyA9IHJlcXVpcmUoJy4vc2NlbmVzTWFuYWdlcicpLFxuICAgIGNvbnRleHQgPSByZXF1aXJlKCcuL2NhbnZhcycpLFxuICAgIGNhbWVyYSA9IHJlcXVpcmUoJy4vY2FtZXJhJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHNwZWVkOiAxLFxuICAgIGR0OiAwLFxuICAgIHN0ZXA6IDEgLyA2MCxcbiAgICBsYXN0RGVsdGE6IG5ldyBEYXRlKCksXG4gICAgbm93OiBuZXcgRGF0ZSgpLFxuICAgIGNhbGN1bGF0ZURlbHRhOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubGFzdERlbHRhID0gdGhpcy5ub3c7XG4gICAgICAgIHRoaXMubm93ID0gbmV3IERhdGUoKTtcbiAgICAgICAgdGhpcy5kdCArPSBNYXRoLm1pbigxLCAodGhpcy5ub3cgLSB0aGlzLmxhc3REZWx0YSkgLyAxMDAwKSAqIHRoaXMuc3BlZWQ7XG4gICAgfSxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY2FsY3VsYXRlRGVsdGEoKTtcblxuICAgICAgICB3aGlsZSAodGhpcy5kdCA+IHRoaXMuc3RlcCkge1xuICAgICAgICAgICAgdGhpcy5kdCAtPSB0aGlzLnN0ZXA7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSh0aGlzLnN0ZXApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZHJhdyh0aGlzLmR0KTtcblxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5pbml0LmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICBkcmF3OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIGNvbnRleHQuY2FudmFzLndpZHRoLCBjb250ZXh0LmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICAvLyAgICBjYW1lcmEuc3RhcnQoKTtcbiAgICAgICAgaWYgKHNjZW5lcy5jdXJyZW50LmRyYXcpIHNjZW5lcy5jdXJyZW50LmRyYXcoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGVudGl0aWVzLnRvRHJhdy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgZW50aXRpZXMuY3VycmVudFtlbnRpdGllcy50b0RyYXdbaV1dLmRyYXcoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyAgICBjb250ZXh0LnJlc3RvcmUoKTtcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcbiAgICAgICAgaWYgKHNjZW5lcy5jdXJyZW50LnVwZGF0ZSkgc2NlbmVzLmN1cnJlbnQudXBkYXRlKGR0KTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGVudGl0aWVzLnRvVXBkYXRlLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBlbnRpdGllcy5jdXJyZW50W2VudGl0aWVzLnRvVXBkYXRlW2ldXS51cGRhdGUoZHQpO1xuICAgICAgICB9XG4gICAgfVxufTtcbiIsInZhciBzY2VuZSA9IHJlcXVpcmUoJy4vc2NlbmVzTWFuYWdlcicpO1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaXNQcmVzc2VkOiB7fSxcblxuICAgIGtleURvd246IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChlLmtleUNvZGUgPT09IDMyIHx8IChlLmtleUNvZGUgPj0gMzcgJiYgZS5rZXlDb2RlIDw9IDQwKSkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAoc2NlbmUuY3VycmVudC5rZXlEb3duKSBzY2VuZS5jdXJyZW50LmtleURvd24odGhpcy5rZXlzW2Uua2V5Q29kZV0pO1xuICAgICAgICB0aGlzLmtleVByZXNzKGUpO1xuICAgIH0sXG5cbiAgICBrZXlQcmVzczogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNQcmVzc2VkW2Uua2V5Q29kZV0pIHJldHVybjtcbiAgICAgICAgaWYgKHNjZW5lLmN1cnJlbnQua2V5UHJlc3MpIHNjZW5lLmN1cnJlbnQua2V5UHJlc3ModGhpcy5rZXlzW2Uua2V5Q29kZV0pO1xuICAgICAgICB0aGlzLmlzUHJlc3NlZFtlLmtleUNvZGVdID0gdHJ1ZTtcbiAgICB9LFxuXG4gICAga2V5VXA6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChzY2VuZS5jdXJyZW50LmtleVVwKSBzY2VuZS5jdXJyZW50LmtleVVwKHRoaXMua2V5c1tlLmtleUNvZGVdKTtcbiAgICAgICAgdGhpcy5pc1ByZXNzZWRbZS5rZXlDb2RlXSA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICBrZXlzOiB7XG4gICAgICAgIDg6ICdiYWNrc3BhY2UnLFxuICAgICAgICA5OiAndGFiJyxcbiAgICAgICAgMTM6ICdlbnRlcicsXG4gICAgICAgIDE2OiAnc2hpZnQnLFxuICAgICAgICAxNzogJ2N0cmwnLFxuICAgICAgICAxODogJ2FsdCcsXG4gICAgICAgIDE5OiAncGF1c2UnLFxuICAgICAgICAyMDogJ2NhcHNfbG9jaycsXG4gICAgICAgIDI3OiAnZXNjJyxcbiAgICAgICAgMzI6ICdzcGFjZWJhcicsXG4gICAgICAgIDMzOiAncGFnZV91cCcsXG4gICAgICAgIDM0OiAncGFnZV9kb3duJyxcbiAgICAgICAgMzU6ICdlbmQnLFxuICAgICAgICAzNjogJ2hvbWUnLFxuICAgICAgICAzNzogJ2xlZnQnLFxuICAgICAgICAzODogJ3VwJyxcbiAgICAgICAgMzk6ICdyaWdodCcsXG4gICAgICAgIDQwOiAnZG93bicsXG4gICAgICAgIDQ0OiAncHJpbnRfc2NyZWVuJyxcbiAgICAgICAgNDU6ICdpbnNlcnQnLFxuICAgICAgICA0NjogJ2RlbGV0ZScsXG4gICAgICAgIDQ4OiAnMCcsXG4gICAgICAgIDQ5OiAnMScsXG4gICAgICAgIDUwOiAnMicsXG4gICAgICAgIDUxOiAnMycsXG4gICAgICAgIDUyOiAnNCcsXG4gICAgICAgIDUzOiAnNScsXG4gICAgICAgIDU0OiAnNicsXG4gICAgICAgIDU1OiAnNycsXG4gICAgICAgIDU2OiAnOCcsXG4gICAgICAgIDU3OiAnOScsXG4gICAgICAgIDY1OiAnYScsXG4gICAgICAgIDY2OiAnYicsXG4gICAgICAgIDY3OiAnYycsXG4gICAgICAgIDY4OiAnZCcsXG4gICAgICAgIDY5OiAnZScsXG4gICAgICAgIDcwOiAnZicsXG4gICAgICAgIDcxOiAnZycsXG4gICAgICAgIDcyOiAnaCcsXG4gICAgICAgIDczOiAnaScsXG4gICAgICAgIDc0OiAnaicsXG4gICAgICAgIDc1OiAnaycsXG4gICAgICAgIDc2OiAnbCcsXG4gICAgICAgIDc3OiAnbScsXG4gICAgICAgIDc4OiAnbicsXG4gICAgICAgIDc5OiAnbycsXG4gICAgICAgIDgwOiAncCcsXG4gICAgICAgIDgxOiAncScsXG4gICAgICAgIDgyOiAncicsXG4gICAgICAgIDgzOiAncycsXG4gICAgICAgIDg0OiAndCcsXG4gICAgICAgIDg1OiAndScsXG4gICAgICAgIDg2OiAndicsXG4gICAgICAgIDg3OiAndycsXG4gICAgICAgIDg4OiAneCcsXG4gICAgICAgIDg5OiAneScsXG4gICAgICAgIDkwOiAneicsXG4gICAgICAgIDk2OiAnbnVtX3plcm8nLFxuICAgICAgICA5NzogJ251bV9vbmUnLFxuICAgICAgICA5ODogJ251bV90d28nLFxuICAgICAgICA5OTogJ251bV90aHJlZScsXG4gICAgICAgIDEwMDogJ251bV9mb3VyJyxcbiAgICAgICAgMTAxOiAnbnVtX2ZpdmUnLFxuICAgICAgICAxMDI6ICdudW1fc2l4JyxcbiAgICAgICAgMTAzOiAnbnVtX3NldmVuJyxcbiAgICAgICAgMTA0OiAnbnVtX2VpZ2h0JyxcbiAgICAgICAgMTA1OiAnbnVtX25pbmUnLFxuICAgICAgICAxMDY6ICdudW1fbXVsdGlwbHknLFxuICAgICAgICAxMDc6ICdudW1fcGx1cycsXG4gICAgICAgIDEwOTogJ251bV9taW51cycsXG4gICAgICAgIDExMDogJ251bV9wZXJpb2QnLFxuICAgICAgICAxMTE6ICdudW1fZGl2aXNpb24nLFxuICAgICAgICAxMTI6ICdmMScsXG4gICAgICAgIDExMzogJ2YyJyxcbiAgICAgICAgMTE0OiAnZjMnLFxuICAgICAgICAxMTU6ICdmNCcsXG4gICAgICAgIDExNjogJ2Y1JyxcbiAgICAgICAgMTE3OiAnZjYnLFxuICAgICAgICAxMTg6ICdmNycsXG4gICAgICAgIDExOTogJ2Y4JyxcbiAgICAgICAgMTIwOiAnZjknLFxuICAgICAgICAxMjE6ICdmMTAnLFxuICAgICAgICAxMjI6ICdmMTEnLFxuICAgICAgICAxMjM6ICdmMTInLFxuICAgICAgICAxODY6ICdzZW1pY29sb24nLFxuICAgICAgICAxODc6ICdwbHVzJyxcbiAgICAgICAgMTg5OiAnbWludXMnLFxuICAgICAgICAxOTI6ICdncmF2ZV9hY2NlbnQnLFxuICAgICAgICAyMjI6ICdzaW5nbGVfcXVvdGUnXG4gICAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGltYWdlczoge30sXG4gICAgZGF0YToge30sXG4gICAgYXVkaW86IHt9LFxuICAgIGFzc2V0c1RvTG9hZDogMCxcblxuICAgIGxvYWRJbWFnZTogZnVuY3Rpb24gKHBhdGgpIHtcbiAgICAgICAgdmFyIG5hbWUgPSBwYXRoLnNsaWNlKDksIHBhdGgubGVuZ3RoKTtcbiAgICAgICAgdGhpcy5pbWFnZXNbbmFtZV0gPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgdGhpcy5pbWFnZXNbbmFtZV0ub25sb2FkID0gdGhpcy5hc3NldHNUb0xvYWQtLTtcbiAgICAgICAgdGhpcy5pbWFnZXNbbmFtZV0uc3JjID0gcGF0aDtcbiAgICB9LFxuXG4gICAgbG9hZERhdGE6IGZ1bmN0aW9uIChwYXRoKSB7XG4gICAgICAgIHZhciBmaWxlID0gcGF0aC5zbGljZSg3LCBwYXRoLmxlbmd0aCAtIDUpLFxuICAgICAgICAgICAgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0ICYmIHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgIHNlbGYuZGF0YVtmaWxlXSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgc2VsZi5hc3NldHNUb0xvYWQtLTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB4aHIub3BlbihcIkdFVFwiLCBwYXRoKTtcbiAgICAgICAgeGhyLnNlbmQoKTtcbiAgICB9LFxuXG4gICAgbG9hZEF1ZGlvOiBmdW5jdGlvbiAobmFtZSkge30sXG5cbiAgICBsb2FkOiBmdW5jdGlvbiAobGlzdCkge1xuICAgICAgICB0aGlzLmFzc2V0c1RvTG9hZCArPSBsaXN0Lmxlbmd0aDtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChsaXN0W2ldLmluZGV4T2YoJy4vaW1hZ2VzJykgPiAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZEltYWdlKGxpc3RbaV0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChsaXN0W2ldLmluZGV4T2YoJy4vZGF0YScpID4gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWREYXRhKGxpc3RbaV0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChsaXN0W2ldLmluZGV4T2YoJy4vYXVkaW8nKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkQXVkaW8obGlzdFtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc3RvcmU6IGZ1bmN0aW9uIChudW0sIG9iaikge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShudW0sIEpTT04uc3RyaW5naWZ5KG9iaikpO1xuICAgIH0sXG4gICAgbG9hZDogZnVuY3Rpb24gKG51bSkge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShudW0pKTtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24gKG51bSkge1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShudW0pO1xuICAgIH1cbn07XG4iLCJ2YXIgc2NlbmUgPSByZXF1aXJlKCcuL3NjZW5lc01hbmFnZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgeDogMCxcbiAgICB5OiAwLFxuICAgIGlzRG93bjogZmFsc2UsXG5cbiAgICBvbk1vdmU6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIG94Lm1vdXNlLnggPSBlLmNsaWVudFggLSBveC5jYW52YXMub2Zmc2V0TGVmdDtcbiAgICAgICAgb3gubW91c2UueSA9IGUuY2xpZW50WSAtIG94LmNhbnZhcy5vZmZzZXRUb3A7XG4gICAgfSxcblxuICAgIG9uVXA6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChzY2VuZS5jdXJyZW50Lm1vdXNlVXApIHNjZW5lLmN1cnJlbnQubW91c2VVcCh0aGlzLmJ1dHRvbnNbZS5idXR0b25dKTtcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgb25Eb3duOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoc2NlbmUuY3VycmVudC5tb3VzZURvd24pIHNjZW5lLmN1cnJlbnQubW91c2VEb3duKHRoaXMuYnV0dG9uc1tlLmJ1dHRvbl0pO1xuICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XG4gICAgfSxcblxuICAgIGJ1dHRvbnM6IHtcbiAgICAgICAgMDogXCJsZWZ0XCIsXG4gICAgICAgIDE6IFwibWlkZGxlXCIsXG4gICAgICAgIDI6IFwicmlnaHRcIlxuICAgIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY3VycmVudDogbnVsbCxcbiAgICBsaXN0OiByZXF1aXJlKCcuLi9zY2VuZXMuanMnKSxcbiAgICBzZXQ6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIGlmICghdGhpcy5saXN0W25hbWVdKSB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSBbXCIgKyBuYW1lICsgXCJdIGRvZXMgbm90IGV4aXN0IVwiKTtcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gdGhpcy5saXN0W25hbWVdO1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50LmluaXQpIHRoaXMuY3VycmVudC5pbml0KCk7XG4gICAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBjb3VudGVyOiByZXF1aXJlKCcuL2VudGl0aWVzL2NvdW50ZXIuanMnKSxcbiAgY291bnRlcjI6IHJlcXVpcmUoJy4vZW50aXRpZXMvY291bnRlcjIuanMnKSxcbiAgcGxheWVyOiByZXF1aXJlKCcuL2VudGl0aWVzL3BsYXllci5qcycpLFxuICBwb25leTogcmVxdWlyZSgnLi9lbnRpdGllcy9wb25leS5qcycpLFxuICBzcHJpdGU6IHJlcXVpcmUoJy4vZW50aXRpZXMvc3ByaXRlLmpzJyksXG4gIHRpbWVyOiByZXF1aXJlKCcuL2VudGl0aWVzL3RpbWVyLmpzJylcbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnZhbHVlID0gMTAwO1xuICB9LFxuICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnZhbHVlKys7XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudiA9IDEwMTtcbiAgICB0aGlzLnZhbHVlID0gMDtcbiAgICB0aGlzLmMgPSBveC5lbnRpdGllcy5zcGF3bignY291bnRlcicpO1xuICB9LFxuICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnZhbHVlKys7XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIG94LnNwYXduKCdwb25leScpO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnggPSAwO1xuICB9LFxuXG4gIGRyYXc6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLngrKztcbiAgICBveC5jb250ZXh0LmZpbGxTdHlsZSA9ICdibHVlJ1xuICAgIG94LmNvbnRleHQuZmlsbFJlY3QoODAsIDgwLCAxMDAsIDIwMClcbiAgICBveC5jb250ZXh0LnN0cm9rZVN0eWxlID0gJ2dyZXknXG4gICAgb3guY29udGV4dC5zdHJva2VSZWN0KDgwLCA4MCwgMTAwLCAyMDApXG4gICAgb3guY29udGV4dC5kcmF3U3ByaXRlKCdwb255LnBuZycsIHRoaXMueCwgMCk7XG4gICAgb3guY29udGV4dC5kcmF3U3ByaXRlKCdwb255LnBuZycsIHRoaXMueCArIDEwLCAwKTtcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5pc1Zpc2libGUgPSB0cnVlO1xuICAgICAgICB0aGlzLnNyY1dpZHRoID0gb3guaW1hZ2VzW3RoaXMuc3JjXS53aWR0aDtcbiAgICAgICAgdGhpcy53aWR0aCA9IHRoaXMud2lkdGggfHwgdGhpcy5zcmNXaWR0aDtcbiAgICAgICAgdGhpcy5zcmNIZWlnaHQgPSBveC5pbWFnZXNbdGhpcy5zcmNdLmhlaWdodDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLmhlaWdodCB8fCB0aGlzLnNyY0hlaWdodDtcbiAgICAgICAgdGhpcy54ID0gdGhpcy54IHx8IDA7XG4gICAgICAgIHRoaXMueSA9IHRoaXMueSB8fCAwO1xuICAgICAgICBpZiAodGhpcy5hbmltYXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdEFuaW1hdGlvbigpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGUgPSB0aGlzLnVwZGF0ZUFuaW1hdGlvbjtcbiAgICAgICAgICAgIHRoaXMuZHJhdyA9IHRoaXMuZHJhd0FuaW1hdGlvbjtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBpbml0QW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuaXNQbGF5aW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pc0ZpbmlzaGVkID0gZmFsc2U7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5sb29wICE9PSAnYm9vbGVhbicpIHRoaXMubG9vcCA9IHRydWU7XG4gICAgICAgIHRoaXMuY291bnRlciA9IDA7XG4gICAgICAgIHRoaXMuZnJhbWVSYXRlID0gNjAgLyB0aGlzLmZyYW1lUmF0ZSB8fCAxO1xuICAgICAgICB0aGlzLmNhbGN1bGF0ZUZyYW1lcygpO1xuXG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbnMpIHtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uQXJyYXkgPSB0aGlzLmFuaW1hdGlvbnNbdGhpcy5hbmltYXRpb25dO1xuICAgICAgICAgICAgdGhpcy5hcnJheUNvdW50ZXIgPSAwO1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IHRoaXMuYW5pbWF0aW9uQXJyYXlbdGhpcy5hcnJheUNvdW50ZXJdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IDA7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZHJhdzogZnVuY3Rpb24gKCkge1xuICAgICAgICBveC5jb250ZXh0LmRyYXdTcHJpdGUodGhpcy5zcmMsIHRoaXMueCwgdGhpcy55KTtcbiAgICB9LFxuXG4gICAgZHJhd0FuaW1hdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICBveC5jb250ZXh0LmRyYXdTcHJpdGUodGhpcy5zcmMsIHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdGhpcy5mcmFtZXNbdGhpcy5mcmFtZV0pO1xuICAgIH0sXG5cbiAgICBjYWxjdWxhdGVGcmFtZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHggPSAwLFxuICAgICAgICAgICAgeSA9IDA7XG4gICAgICAgIHRoaXMuZnJhbWVzID0gW1swLCAwXV07XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCB0aGlzLnNyY0hlaWdodCAvIHRoaXMuaGVpZ2h0ICogdGhpcy5zcmNXaWR0aCAvIHRoaXMud2lkdGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHggPCB0aGlzLnNyY1dpZHRoIC8gdGhpcy53aWR0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICB4Kys7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHkgPCB0aGlzLnNyY0hlaWdodCAvIHRoaXMuaGVpZ2h0IC0gMSkge1xuICAgICAgICAgICAgICAgIHkrKztcbiAgICAgICAgICAgICAgICB4ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZnJhbWVzLnB1c2goW3gsIHldKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICB1cGRhdGVBbmltYXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzUGxheWluZykgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5pc0ZpbmlzaGVkKSByZXR1cm4gdGhpcy5maW5pc2hlZCgpO1xuXG4gICAgICAgIHRoaXMuY291bnRlciArPSAxO1xuICAgICAgICBpZiAodGhpcy5jb3VudGVyID4gdGhpcy5mcmFtZVJhdGUpIHtcbiAgICAgICAgICAgIHRoaXMuY291bnRlciA9IDA7XG4gICAgICAgICAgICBpZiAodGhpcy5hbmltYXRpb25zKSB0aGlzLm11bHRpcGxlQW5pbWF0aW9ucygpO1xuICAgICAgICAgICAgZWxzZSB0aGlzLnNpbmdsZUFuaW1hdGlvbigpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIG11bHRpcGxlQW5pbWF0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5hcnJheUNvdW50ZXIgPT09IHRoaXMuYW5pbWF0aW9uQXJyYXkubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmxvb3ApIHRoaXMuaXNGaW5pc2hlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmZyYW1lID0gdGhpcy5hbmltYXRpb25BcnJheVswXTtcbiAgICAgICAgICAgIHRoaXMuYXJyYXlDb3VudGVyID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYXJyYXlDb3VudGVyKys7XG4gICAgICAgICAgICB0aGlzLmZyYW1lID0gdGhpcy5hbmltYXRpb25BcnJheVt0aGlzLmFycmF5Q291bnRlcl07XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgc2luZ2xlQW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLmZyYW1lID09PSAodGhpcy5mcmFtZXMubGVuZ3RoIC0gMSkpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5sb29wKSB0aGlzLmlzRmluaXNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmZyYW1lICs9IDE7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZmluaXNoZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zdG9wKCk7XG4gICAgICAgIGlmICh0aGlzLm9uRmluaXNoKSB0aGlzLm9uRmluaXNoKCk7XG4gICAgfSxcblxuICAgIHBsYXk6IGZ1bmN0aW9uIChhbmltYXRpb24sIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgdGhpc1trZXldID0gb3B0aW9uc1trZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuYW5pbWF0aW9ucykge1xuICAgICAgICAgICAgaWYgKGFuaW1hdGlvbikgdGhpcy5hbmltYXRpb24gPSBhbmltYXRpb247XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbkFycmF5ID0gdGhpcy5hbmltYXRpb25zW3RoaXMuYW5pbWF0aW9uXTtcbiAgICAgICAgICAgIHRoaXMuYXJyYXlDb3VudGVyID0gMDtcbiAgICAgICAgICAgIHRoaXMuZnJhbWUgPSB0aGlzLmFuaW1hdGlvbkFycmF5W3RoaXMuYXJyYXlDb3VudGVyXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmlzRmluaXNoZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc1BsYXlpbmcgPSB0cnVlO1xuICAgIH0sXG5cbiAgICBzdG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuaXNQbGF5aW5nID0gZmFsc2U7XG4gICAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52YWx1ZSA9IDA7XG4gICAgdGhpcy5pc0ZpbmlzaGVkID0gZmFsc2U7XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcbiAgICBpZiAoIXRoaXMuaXNGaW5pc2hlZCAmJiAhdGhpcy5pc1BhdXNlZCkge1xuICAgICAgdGhpcy52YWx1ZSArPSBkdDtcbiAgICAgIGlmICh0aGlzLnZhbHVlID49IHRoaXMuZ29hbCkge1xuICAgICAgICB0aGlzLmlzRmluaXNoZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmZ1bmMoKTtcbiAgICAgICAgaWYgKHRoaXMubG9vcCkgdGhpcy5yZXN0YXJ0KCk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHJlc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnZhbHVlID0gMDtcbiAgICB0aGlzLmlzRmluaXNoZWQgPSBmYWxzZTtcbiAgfSxcblxuICBwYXVzZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaXNQYXVzZWQgPSB0cnVlO1xuICB9LFxuXG4gIHJlc3VtZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcbiAgfSxcblxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBsb2FkaW5nOiByZXF1aXJlKCcuL3NjZW5lcy9sb2FkaW5nLmpzJyksXG4gIG1haW46IHJlcXVpcmUoJy4vc2NlbmVzL21haW4uanMnKVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIG94LnByZWxvYWRlci5sb2FkKHJlcXVpcmUoJy4uL2Fzc2V0cy5qcycpKTtcbiAgICB0aGlzLmJhckxlbmd0aCA9IG94LnByZWxvYWRlci5hc3NldHNUb0xvYWQ7XG4gIH0sXG5cbiAgZHJhdzogZnVuY3Rpb24gKCkge1xuICAgIG94LmNvbnRleHQuZmlsbFN0eWxlID0gXCJibGFja1wiXG4gICAgb3guY29udGV4dC5maWxsUmVjdCgwLCAwLCBveC5jYW52YXMud2lkdGgsIG94LmNhbnZhcy5oZWlnaHQpXG4gICAgb3guY29udGV4dC5maWxsU3R5bGUgPSBcInJnYig0NiwgMjM4LCAyNDUpXCJcbiAgICBveC5jb250ZXh0LmZpbGxSZWN0KG94LmNhbnZhcy53aWR0aCAvIDQsIG94LmNhbnZhcy5oZWlnaHQgLyAyICsgMzIsIG94LmNhbnZhcy53aWR0aCAvIDIsIDEpXG4gICAgb3guY29udGV4dC5maWxsU3R5bGUgPSBcImdyZXlcIlxuICAgIG94LmNvbnRleHQuc2F2ZSgpXG4gICAgb3guY29udGV4dC50cmFuc2xhdGUob3guY2FudmFzLndpZHRoIC8gNCwgMiAqIG94LmNhbnZhcy5oZWlnaHQgLyAzKVxuICAgIG94LmNvbnRleHQuc2NhbGUoLTEsIDEpXG4gICAgb3guY29udGV4dC5maWxsUmVjdCgtb3guY2FudmFzLndpZHRoIC8gMiwgMCwgb3guY2FudmFzLndpZHRoIC8gMiAqIG94LnByZWxvYWRlci5hc3NldHNUb0xvYWQgLyB0aGlzLmJhckxlbmd0aCwgMSlcbiAgICBveC5jb250ZXh0LnJlc3RvcmUoKVxuICAgIG94LmNvbnRleHQuZmlsbFN0eWxlID0gXCJ3aGl0ZVwiXG4gICAgb3guY29udGV4dC5mb250ID0gJzIwMCUgc2Fucy1zZXJpZidcbiAgICBveC5jb250ZXh0LmZpbGxUZXh0KCdsb2FkaW5nLi4uJywgb3guY2FudmFzLndpZHRoIC8gMiAtIDY4LCBveC5jYW52YXMuaGVpZ2h0IC8gMiArIDEwKTtcbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAob3gucHJlbG9hZGVyLmFzc2V0c1RvTG9hZCA9PT0gMCkgb3guc2NlbmVzLnNldCgnbWFpbicpO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHRoaXMuc3ByaXRlMiA9IG94LnNwcml0ZSgnY29pbjIucG5nJywge1xuICAgICAgICAgICAgYW5pbWF0aW9uOiAnc3BpbicsXG4gICAgICAgICAgICBhbmltYXRpb25zOiB7XG4gICAgICAgICAgICAgICAgc3BpbjogWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDldLFxuICAgICAgICAgICAgICAgIGlkbGU6IFs4LCA0LCA4LCA0LCA4LCA0LCA4LCA0LCA4LCA0LCA4LCA0LCA4LCA0LCA4LCA0XVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGhlaWdodDogNDAsXG4gICAgICAgICAgICBmcmFtZVJhdGU6IDMwLFxuICAgICAgICAgICAgd2lkdGg6IDQ0LFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNwcml0ZTMgPSBveC5zcHJpdGUoJ3BvbnkucG5nJywge1xuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDEwMFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNwcml0ZTQgPSBveC5zcHJpdGUoJ3BvbnkucG5nJywge1xuICAgICAgICAgICAgeDogMTAwLFxuICAgICAgICAgICAgeTogMTAwXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc3ByaXRlNCA9IG94LnNwcml0ZSgncG9ueS5wbmcnLCB7XG4gICAgICAgICAgICB4OiAyMDAsXG4gICAgICAgICAgICB5OiAxMDBcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gICAgICAgIG94LnNwYXduKCdwbGF5ZXInKTtcblxuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuICAgICAgICAvLyAgICAgICAgdGhpcy5zcHJpdGUyLnggPSBveC5tb3VzZS54O1xuICAgICAgICAvLyAgICAgICAgdGhpcy5zcHJpdGUyLnkgPSBveC5tb3VzZS55O1xuXG4gICAgICAgIC8vICAgICAgICBveC5jYW1lcmEuc2V0KG94Lm1vdXNlLngsIG94Lm1vdXNlLnkpO1xuICAgIH0sXG5cbiAgICBrZXlEb3duOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2V5RG93bjogXCIgKyBrZXkpO1xuICAgIH0sXG5cbiAgICBrZXlQcmVzczogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImtleVByZXNzOiBcIiArIGtleSk7XG4gICAgfSxcblxuICAgIGtleVVwOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2V5VXA6IFwiICsga2V5KTtcbiAgICB9LFxuXG4gICAgbW91c2VEb3duOiBmdW5jdGlvbiAoYnV0dG9uKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQ2xpY2tlZCBhdDogXCIgKyBveC5tb3VzZS54ICsgXCIsIFwiICsgb3gubW91c2UueSArIFwiIHdpdGggdGhlIFwiICsgYnV0dG9uICsgXCIgYnV0dG9uLlwiKTtcbiAgICB9LFxuXG4gICAgbW91c2VVcDogZnVuY3Rpb24gKGJ1dHRvbikge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlJlbGVhc2VkIGF0OiBcIiArIG94Lm1vdXNlLnggKyBcIiwgXCIgKyBveC5tb3VzZS55ICsgXCIgd2l0aCB0aGUgXCIgKyBidXR0b24gKyBcIiBidXR0b24uXCIpO1xuICAgIH1cbn07Il19
