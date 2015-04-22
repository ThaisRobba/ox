(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = [
  './images/coin.png',
  './images/coin2.png',
  './images/coinTwisted.png',
  './images/pony.png',
  './data/example.json',
  './audio/the_heavy.mp3'
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
    spawn = function (type, options) {
        if (!list[type]) throw new Error("Entity [" + name + "] does not exist and cannot be spawned.");
        var obj = options || {};
        for (var key in list[type]) {
            obj[key] = list[type][key];
        }
        obj.disable = disable.bind(obj);
        obj.enable = enable.bind(obj);
        obj.id = current.length;
        obj.type = type;
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

    loadAudio: function (path) {
        var name = path.slice(8, path.length);
        this.audio[name] = new Audio(path);
        this.audio[name].oncanplaythrough = this.assetsToLoad--;
    },

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
        this.target = this.target || 1000;
        this.callback = this.callback || function () {};
    },

    update: function (dt) {
        this.value += dt * 1000;

        if (this.value >= this.target) {
            if (this.context) {
                this.callback.call(this.context, this.value);
            } else {
                this.callback(this.value);
            }

            if (this.loop) {
                this.value = 0;
            } else {
                this.disable();
            }
        }
    },

    restart: function () {
        this.value = 0;
        this.enable();
    }
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
        ox.context.fillStyle = "black";
        ox.context.fillRect(0, 0, ox.canvas.width, ox.canvas.height);
        ox.context.fillStyle = "rgb(46, 238, 245)";
        ox.context.fillRect(ox.canvas.width / 4, ox.canvas.height / 2 + 32, ox.canvas.width / 2, 1);
        ox.context.fillStyle = "grey";
        ox.context.save();
        ox.context.translate(ox.canvas.width / 4, 2 * ox.canvas.height / 3);
        ox.context.scale(-1, 1);
        ox.context.fillRect(-ox.canvas.width / 2, 0, ox.canvas.width / 2 * ox.preloader.assetsToLoad / this.barLength, 1);
        ox.context.restore();
        ox.context.fillStyle = "white";
        ox.context.font = '200% sans-serif';
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

        ox.spawn('timer', {
            target: 2000,
            callback: function (value) {
                console.log(value);
                this.sprite4.y += -10;
                if (this.sprite4.y < 0) this.sprite4.y = 200;
            },
            context: this
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9hc3NldHMuanMiLCJzcmMvZW5naW5lL2NhbWVyYS5qcyIsInNyYy9lbmdpbmUvY2FudmFzLmpzIiwic3JjL2VuZ2luZS9jb3JlLmpzIiwic3JjL2VuZ2luZS9lbnRpdGllc01hbmFnZXIuanMiLCJzcmMvZW5naW5lL2dhbWVMb29wLmpzIiwic3JjL2VuZ2luZS9rZXlib2FyZC5qcyIsInNyYy9lbmdpbmUvbG9hZGVyLmpzIiwic3JjL2VuZ2luZS9sb2NhbFN0b3JhZ2UuanMiLCJzcmMvZW5naW5lL21vdXNlLmpzIiwic3JjL2VuZ2luZS9zY2VuZXNNYW5hZ2VyLmpzIiwic3JjL2VudGl0aWVzLmpzIiwic3JjL2VudGl0aWVzL2NvdW50ZXIuanMiLCJzcmMvZW50aXRpZXMvY291bnRlcjIuanMiLCJzcmMvZW50aXRpZXMvcGxheWVyLmpzIiwic3JjL2VudGl0aWVzL3BvbmV5LmpzIiwic3JjL2VudGl0aWVzL3Nwcml0ZS5qcyIsInNyYy9lbnRpdGllcy90aW1lci5qcyIsInNyYy9zY2VuZXMuanMiLCJzcmMvc2NlbmVzL2xvYWRpbmcuanMiLCJzcmMvc2NlbmVzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSBbXG4gICcuL2ltYWdlcy9jb2luLnBuZycsXG4gICcuL2ltYWdlcy9jb2luMi5wbmcnLFxuICAnLi9pbWFnZXMvY29pblR3aXN0ZWQucG5nJyxcbiAgJy4vaW1hZ2VzL3BvbnkucG5nJyxcbiAgJy4vZGF0YS9leGFtcGxlLmpzb24nLFxuICAnLi9hdWRpby90aGVfaGVhdnkubXAzJ1xuXTsiLCJ2YXIgY29udGV4dCA9IHJlcXVpcmUoJy4vY2FudmFzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHNldDogZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICB9LFxuXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29udGV4dC5zYXZlKCk7XG4gICAgICAgIGNvbnRleHQudHJhbnNsYXRlKHRoaXMueCwgdGhpcy55KTtcbiAgICB9XG59O1xuIiwidmFyIGltYWdlcyA9IHJlcXVpcmUoJy4vbG9hZGVyJykuaW1hZ2VzLFxuICAgIGtleWJvYXJkID0gcmVxdWlyZSgnLi9rZXlib2FyZCcpLFxuICAgIG1vdXNlID0gcmVxdWlyZSgnLi9tb3VzZScpO1xuXG52YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xudmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuY29udGV4dC5kcmF3U3ByaXRlID0gZnVuY3Rpb24gKHNyYywgeCwgeSwgd2lkdGgsIGhlaWdodCwgZnJhbWUpIHtcbiAgICBpZiAodHlwZW9mIHdpZHRoID09PSAnbnVtYmVyJykge1xuICAgICAgICBjb250ZXh0LmRyYXdJbWFnZShcbiAgICAgICAgICAgIGltYWdlc1tzcmNdLFxuICAgICAgICAgICAgd2lkdGggKiBmcmFtZVswXSxcbiAgICAgICAgICAgIGhlaWdodCAqIGZyYW1lWzFdLFxuICAgICAgICAgICAgd2lkdGgsIGhlaWdodCwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UoaW1hZ2VzW3NyY10sIHgsIHkpO1xuICAgIH1cbn07XG5cbmNhbnZhcy50YWJJbmRleCA9IDEwMDA7XG5jYW52YXMuc3R5bGUub3V0bGluZSA9IFwibm9uZVwiO1xuY2FudmFzLm9ua2V5ZG93biA9IGtleWJvYXJkLmtleURvd24uYmluZChrZXlib2FyZCk7XG5jYW52YXMub25rZXl1cCA9IGtleWJvYXJkLmtleVVwLmJpbmQoa2V5Ym9hcmQpO1xuY2FudmFzLm9ubW91c2Vtb3ZlID0gbW91c2Uub25Nb3ZlLmJpbmQobW91c2UpO1xuY2FudmFzLm9ubW91c2Vkb3duID0gbW91c2Uub25Eb3duLmJpbmQobW91c2UpO1xuY2FudmFzLm9ubW91c2V1cCA9IG1vdXNlLm9uVXAuYmluZChtb3VzZSk7XG5jYW52YXMuaGVpZ2h0ID0gMjAwMDtcbmNhbnZhcy5zdHlsZS5jdXJzb3IgPSBcIm5vbmVcIjtcbmNhbnZhcy5vbmNvbnRleHRtZW51ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gY29udGV4dDtcbiIsIndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5veCA9IHtcbiAgICAgICAgY2FudmFzOiByZXF1aXJlKCcuL2NhbnZhcycpLmNhbnZhcyxcbiAgICAgICAgY29udGV4dDogcmVxdWlyZSgnLi9jYW52YXMnKSxcbiAgICAgICAgY2FtZXJhOiByZXF1aXJlKCcuL2NhbWVyYScpLFxuICAgICAgICBpbWFnZXM6IHJlcXVpcmUoJy4vbG9hZGVyJykuaW1hZ2VzLFxuICAgICAgICBhdWRpbzogcmVxdWlyZSgnLi9sb2FkZXInKS5hdWRpbyxcbiAgICAgICAgZGF0YTogcmVxdWlyZSgnLi9sb2FkZXInKS5kYXRhLFxuICAgICAgICBrZXlib2FyZDogcmVxdWlyZSgnLi9rZXlib2FyZCcpLFxuICAgICAgICBtb3VzZTogcmVxdWlyZSgnLi9tb3VzZScpLFxuICAgICAgICBzY2VuZXM6IHJlcXVpcmUoJy4vc2NlbmVzTWFuYWdlcicpLFxuICAgICAgICBlbnRpdGllczogcmVxdWlyZSgnLi9lbnRpdGllc01hbmFnZXInKSxcbiAgICAgICAgc2F2ZTogcmVxdWlyZSgnLi9sb2NhbFN0b3JhZ2UnKSxcbiAgICAgICAgbG9vcDogcmVxdWlyZSgnLi9nYW1lTG9vcCcpLFxuICAgICAgICBwcmVsb2FkZXI6IHJlcXVpcmUoJy4vbG9hZGVyJyksXG4gICAgICAgIHNwcml0ZTogZnVuY3Rpb24gKHNyYywgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIG9iaiA9IG9wdGlvbnMgfHwge307XG4gICAgICAgICAgICBvYmouc3JjID0gc3JjO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW50aXRpZXMuc3Bhd24oJ3Nwcml0ZScsIG9iaik7XG4gICAgICAgIH0sXG4gICAgICAgIHNwYXduOiByZXF1aXJlKCcuL2VudGl0aWVzTWFuYWdlcicpLnNwYXduXG4gICAgfTtcblxuICAgIG94Lmxvb3AuY2FsY3VsYXRlRGVsdGEoKTtcbiAgICBveC5zY2VuZXMuc2V0KCdsb2FkaW5nJyk7XG4gICAgb3gubG9vcC5pbml0KCk7XG59O1xuIiwidmFyIGxpc3QgPSByZXF1aXJlKCcuLi9lbnRpdGllcycpLFxuICAgIGN1cnJlbnQgPSBbXSxcbiAgICB0b1VwZGF0ZSA9IFtdLFxuICAgIHRvRHJhdyA9IFtdLFxuICAgIHNwYXduID0gZnVuY3Rpb24gKHR5cGUsIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKCFsaXN0W3R5cGVdKSB0aHJvdyBuZXcgRXJyb3IoXCJFbnRpdHkgW1wiICsgbmFtZSArIFwiXSBkb2VzIG5vdCBleGlzdCBhbmQgY2Fubm90IGJlIHNwYXduZWQuXCIpO1xuICAgICAgICB2YXIgb2JqID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIGxpc3RbdHlwZV0pIHtcbiAgICAgICAgICAgIG9ialtrZXldID0gbGlzdFt0eXBlXVtrZXldO1xuICAgICAgICB9XG4gICAgICAgIG9iai5kaXNhYmxlID0gZGlzYWJsZS5iaW5kKG9iaik7XG4gICAgICAgIG9iai5lbmFibGUgPSBlbmFibGUuYmluZChvYmopO1xuICAgICAgICBvYmouaWQgPSBjdXJyZW50Lmxlbmd0aDtcbiAgICAgICAgb2JqLnR5cGUgPSB0eXBlO1xuICAgICAgICBjdXJyZW50LnB1c2gob2JqKTtcbiAgICAgICAgaWYgKG9iai5pbml0KSBvYmouaW5pdCgpO1xuICAgICAgICBvYmouZW5hYmxlKCk7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfSxcbiAgICBkaXNhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodG9EcmF3LmluZGV4T2YodGhpcy5pZCkgPiAwKSB0b0RyYXcuc3BsaWNlKHRvRHJhdy5pbmRleE9mKHRoaXMuaWQpLCAxKTtcbiAgICAgICAgaWYgKHRvVXBkYXRlLmluZGV4T2YodGhpcy5pZCkgPiAwKSB0b1VwZGF0ZS5zcGxpY2UodG9VcGRhdGUuaW5kZXhPZih0aGlzLmlkKSwgMSk7XG4gICAgfSxcbiAgICBlbmFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnVwZGF0ZSkgdG9VcGRhdGUucHVzaCh0aGlzLmlkKTtcbiAgICAgICAgaWYgKHRoaXMuZHJhdykgdG9EcmF3LnB1c2godGhpcy5pZCk7XG4gICAgfTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY3VycmVudDogY3VycmVudCxcbiAgICBsaXN0OiBsaXN0LFxuICAgIHRvRHJhdzogdG9EcmF3LFxuICAgIHRvVXBkYXRlOiB0b1VwZGF0ZSxcbiAgICBzcGF3bjogc3Bhd25cbn07XG4iLCJ2YXIgZW50aXRpZXMgPSByZXF1aXJlKCcuL2VudGl0aWVzTWFuYWdlcicpLFxuICAgIHNjZW5lcyA9IHJlcXVpcmUoJy4vc2NlbmVzTWFuYWdlcicpLFxuICAgIGNvbnRleHQgPSByZXF1aXJlKCcuL2NhbnZhcycpLFxuICAgIGNhbWVyYSA9IHJlcXVpcmUoJy4vY2FtZXJhJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHNwZWVkOiAxLFxuICAgIGR0OiAwLFxuICAgIHN0ZXA6IDEgLyA2MCxcbiAgICBsYXN0RGVsdGE6IG5ldyBEYXRlKCksXG4gICAgbm93OiBuZXcgRGF0ZSgpLFxuICAgIGNhbGN1bGF0ZURlbHRhOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubGFzdERlbHRhID0gdGhpcy5ub3c7XG4gICAgICAgIHRoaXMubm93ID0gbmV3IERhdGUoKTtcbiAgICAgICAgdGhpcy5kdCArPSBNYXRoLm1pbigxLCAodGhpcy5ub3cgLSB0aGlzLmxhc3REZWx0YSkgLyAxMDAwKSAqIHRoaXMuc3BlZWQ7XG4gICAgfSxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY2FsY3VsYXRlRGVsdGEoKTtcblxuICAgICAgICB3aGlsZSAodGhpcy5kdCA+IHRoaXMuc3RlcCkge1xuICAgICAgICAgICAgdGhpcy5kdCAtPSB0aGlzLnN0ZXA7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSh0aGlzLnN0ZXApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZHJhdyh0aGlzLmR0KTtcblxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5pbml0LmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICBkcmF3OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIGNvbnRleHQuY2FudmFzLndpZHRoLCBjb250ZXh0LmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICAvLyAgICBjYW1lcmEuc3RhcnQoKTtcbiAgICAgICAgaWYgKHNjZW5lcy5jdXJyZW50LmRyYXcpIHNjZW5lcy5jdXJyZW50LmRyYXcoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGVudGl0aWVzLnRvRHJhdy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgZW50aXRpZXMuY3VycmVudFtlbnRpdGllcy50b0RyYXdbaV1dLmRyYXcoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyAgICBjb250ZXh0LnJlc3RvcmUoKTtcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcbiAgICAgICAgaWYgKHNjZW5lcy5jdXJyZW50LnVwZGF0ZSkgc2NlbmVzLmN1cnJlbnQudXBkYXRlKGR0KTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGVudGl0aWVzLnRvVXBkYXRlLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBlbnRpdGllcy5jdXJyZW50W2VudGl0aWVzLnRvVXBkYXRlW2ldXS51cGRhdGUoZHQpO1xuICAgICAgICB9XG4gICAgfVxufTtcbiIsInZhciBzY2VuZSA9IHJlcXVpcmUoJy4vc2NlbmVzTWFuYWdlcicpO1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaXNQcmVzc2VkOiB7fSxcblxuICAgIGtleURvd246IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChlLmtleUNvZGUgPT09IDMyIHx8IChlLmtleUNvZGUgPj0gMzcgJiYgZS5rZXlDb2RlIDw9IDQwKSkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAoc2NlbmUuY3VycmVudC5rZXlEb3duKSBzY2VuZS5jdXJyZW50LmtleURvd24odGhpcy5rZXlzW2Uua2V5Q29kZV0pO1xuICAgICAgICB0aGlzLmtleVByZXNzKGUpO1xuICAgIH0sXG5cbiAgICBrZXlQcmVzczogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNQcmVzc2VkW2Uua2V5Q29kZV0pIHJldHVybjtcbiAgICAgICAgaWYgKHNjZW5lLmN1cnJlbnQua2V5UHJlc3MpIHNjZW5lLmN1cnJlbnQua2V5UHJlc3ModGhpcy5rZXlzW2Uua2V5Q29kZV0pO1xuICAgICAgICB0aGlzLmlzUHJlc3NlZFtlLmtleUNvZGVdID0gdHJ1ZTtcbiAgICB9LFxuXG4gICAga2V5VXA6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChzY2VuZS5jdXJyZW50LmtleVVwKSBzY2VuZS5jdXJyZW50LmtleVVwKHRoaXMua2V5c1tlLmtleUNvZGVdKTtcbiAgICAgICAgdGhpcy5pc1ByZXNzZWRbZS5rZXlDb2RlXSA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICBrZXlzOiB7XG4gICAgICAgIDg6ICdiYWNrc3BhY2UnLFxuICAgICAgICA5OiAndGFiJyxcbiAgICAgICAgMTM6ICdlbnRlcicsXG4gICAgICAgIDE2OiAnc2hpZnQnLFxuICAgICAgICAxNzogJ2N0cmwnLFxuICAgICAgICAxODogJ2FsdCcsXG4gICAgICAgIDE5OiAncGF1c2UnLFxuICAgICAgICAyMDogJ2NhcHNfbG9jaycsXG4gICAgICAgIDI3OiAnZXNjJyxcbiAgICAgICAgMzI6ICdzcGFjZWJhcicsXG4gICAgICAgIDMzOiAncGFnZV91cCcsXG4gICAgICAgIDM0OiAncGFnZV9kb3duJyxcbiAgICAgICAgMzU6ICdlbmQnLFxuICAgICAgICAzNjogJ2hvbWUnLFxuICAgICAgICAzNzogJ2xlZnQnLFxuICAgICAgICAzODogJ3VwJyxcbiAgICAgICAgMzk6ICdyaWdodCcsXG4gICAgICAgIDQwOiAnZG93bicsXG4gICAgICAgIDQ0OiAncHJpbnRfc2NyZWVuJyxcbiAgICAgICAgNDU6ICdpbnNlcnQnLFxuICAgICAgICA0NjogJ2RlbGV0ZScsXG4gICAgICAgIDQ4OiAnMCcsXG4gICAgICAgIDQ5OiAnMScsXG4gICAgICAgIDUwOiAnMicsXG4gICAgICAgIDUxOiAnMycsXG4gICAgICAgIDUyOiAnNCcsXG4gICAgICAgIDUzOiAnNScsXG4gICAgICAgIDU0OiAnNicsXG4gICAgICAgIDU1OiAnNycsXG4gICAgICAgIDU2OiAnOCcsXG4gICAgICAgIDU3OiAnOScsXG4gICAgICAgIDY1OiAnYScsXG4gICAgICAgIDY2OiAnYicsXG4gICAgICAgIDY3OiAnYycsXG4gICAgICAgIDY4OiAnZCcsXG4gICAgICAgIDY5OiAnZScsXG4gICAgICAgIDcwOiAnZicsXG4gICAgICAgIDcxOiAnZycsXG4gICAgICAgIDcyOiAnaCcsXG4gICAgICAgIDczOiAnaScsXG4gICAgICAgIDc0OiAnaicsXG4gICAgICAgIDc1OiAnaycsXG4gICAgICAgIDc2OiAnbCcsXG4gICAgICAgIDc3OiAnbScsXG4gICAgICAgIDc4OiAnbicsXG4gICAgICAgIDc5OiAnbycsXG4gICAgICAgIDgwOiAncCcsXG4gICAgICAgIDgxOiAncScsXG4gICAgICAgIDgyOiAncicsXG4gICAgICAgIDgzOiAncycsXG4gICAgICAgIDg0OiAndCcsXG4gICAgICAgIDg1OiAndScsXG4gICAgICAgIDg2OiAndicsXG4gICAgICAgIDg3OiAndycsXG4gICAgICAgIDg4OiAneCcsXG4gICAgICAgIDg5OiAneScsXG4gICAgICAgIDkwOiAneicsXG4gICAgICAgIDk2OiAnbnVtX3plcm8nLFxuICAgICAgICA5NzogJ251bV9vbmUnLFxuICAgICAgICA5ODogJ251bV90d28nLFxuICAgICAgICA5OTogJ251bV90aHJlZScsXG4gICAgICAgIDEwMDogJ251bV9mb3VyJyxcbiAgICAgICAgMTAxOiAnbnVtX2ZpdmUnLFxuICAgICAgICAxMDI6ICdudW1fc2l4JyxcbiAgICAgICAgMTAzOiAnbnVtX3NldmVuJyxcbiAgICAgICAgMTA0OiAnbnVtX2VpZ2h0JyxcbiAgICAgICAgMTA1OiAnbnVtX25pbmUnLFxuICAgICAgICAxMDY6ICdudW1fbXVsdGlwbHknLFxuICAgICAgICAxMDc6ICdudW1fcGx1cycsXG4gICAgICAgIDEwOTogJ251bV9taW51cycsXG4gICAgICAgIDExMDogJ251bV9wZXJpb2QnLFxuICAgICAgICAxMTE6ICdudW1fZGl2aXNpb24nLFxuICAgICAgICAxMTI6ICdmMScsXG4gICAgICAgIDExMzogJ2YyJyxcbiAgICAgICAgMTE0OiAnZjMnLFxuICAgICAgICAxMTU6ICdmNCcsXG4gICAgICAgIDExNjogJ2Y1JyxcbiAgICAgICAgMTE3OiAnZjYnLFxuICAgICAgICAxMTg6ICdmNycsXG4gICAgICAgIDExOTogJ2Y4JyxcbiAgICAgICAgMTIwOiAnZjknLFxuICAgICAgICAxMjE6ICdmMTAnLFxuICAgICAgICAxMjI6ICdmMTEnLFxuICAgICAgICAxMjM6ICdmMTInLFxuICAgICAgICAxODY6ICdzZW1pY29sb24nLFxuICAgICAgICAxODc6ICdwbHVzJyxcbiAgICAgICAgMTg5OiAnbWludXMnLFxuICAgICAgICAxOTI6ICdncmF2ZV9hY2NlbnQnLFxuICAgICAgICAyMjI6ICdzaW5nbGVfcXVvdGUnXG4gICAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGltYWdlczoge30sXG4gICAgZGF0YToge30sXG4gICAgYXVkaW86IHt9LFxuICAgIGFzc2V0c1RvTG9hZDogMCxcblxuICAgIGxvYWRJbWFnZTogZnVuY3Rpb24gKHBhdGgpIHtcbiAgICAgICAgdmFyIG5hbWUgPSBwYXRoLnNsaWNlKDksIHBhdGgubGVuZ3RoKTtcbiAgICAgICAgdGhpcy5pbWFnZXNbbmFtZV0gPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgdGhpcy5pbWFnZXNbbmFtZV0ub25sb2FkID0gdGhpcy5hc3NldHNUb0xvYWQtLTtcbiAgICAgICAgdGhpcy5pbWFnZXNbbmFtZV0uc3JjID0gcGF0aDtcbiAgICB9LFxuXG4gICAgbG9hZERhdGE6IGZ1bmN0aW9uIChwYXRoKSB7XG4gICAgICAgIHZhciBmaWxlID0gcGF0aC5zbGljZSg3LCBwYXRoLmxlbmd0aCAtIDUpLFxuICAgICAgICAgICAgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0ICYmIHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgIHNlbGYuZGF0YVtmaWxlXSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgc2VsZi5hc3NldHNUb0xvYWQtLTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgeGhyLm9wZW4oXCJHRVRcIiwgcGF0aCk7XG4gICAgICAgIHhoci5zZW5kKCk7XG4gICAgfSxcblxuICAgIGxvYWRBdWRpbzogZnVuY3Rpb24gKHBhdGgpIHtcbiAgICAgICAgdmFyIG5hbWUgPSBwYXRoLnNsaWNlKDgsIHBhdGgubGVuZ3RoKTtcbiAgICAgICAgdGhpcy5hdWRpb1tuYW1lXSA9IG5ldyBBdWRpbyhwYXRoKTtcbiAgICAgICAgdGhpcy5hdWRpb1tuYW1lXS5vbmNhbnBsYXl0aHJvdWdoID0gdGhpcy5hc3NldHNUb0xvYWQtLTtcbiAgICB9LFxuXG4gICAgbG9hZDogZnVuY3Rpb24gKGxpc3QpIHtcbiAgICAgICAgdGhpcy5hc3NldHNUb0xvYWQgKz0gbGlzdC5sZW5ndGg7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAobGlzdFtpXS5pbmRleE9mKCcuL2ltYWdlcycpID4gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRJbWFnZShsaXN0W2ldKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGlzdFtpXS5pbmRleE9mKCcuL2RhdGEnKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkRGF0YShsaXN0W2ldKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGlzdFtpXS5pbmRleE9mKCcuL2F1ZGlvJykgPiAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZEF1ZGlvKGxpc3RbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzdG9yZTogZnVuY3Rpb24gKG51bSwgb2JqKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKG51bSwgSlNPTi5zdHJpbmdpZnkob2JqKSk7XG4gICAgfSxcbiAgICBsb2FkOiBmdW5jdGlvbiAobnVtKSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKG51bSkpO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiAobnVtKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKG51bSk7XG4gICAgfVxufTtcbiIsInZhciBzY2VuZSA9IHJlcXVpcmUoJy4vc2NlbmVzTWFuYWdlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB4OiAwLFxuICAgIHk6IDAsXG4gICAgaXNEb3duOiBmYWxzZSxcblxuICAgIG9uTW92ZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgb3gubW91c2UueCA9IGUuY2xpZW50WCAtIG94LmNhbnZhcy5vZmZzZXRMZWZ0O1xuICAgICAgICBveC5tb3VzZS55ID0gZS5jbGllbnRZIC0gb3guY2FudmFzLm9mZnNldFRvcDtcbiAgICB9LFxuXG4gICAgb25VcDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKHNjZW5lLmN1cnJlbnQubW91c2VVcCkgc2NlbmUuY3VycmVudC5tb3VzZVVwKHRoaXMuYnV0dG9uc1tlLmJ1dHRvbl0pO1xuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICBvbkRvd246IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChzY2VuZS5jdXJyZW50Lm1vdXNlRG93bikgc2NlbmUuY3VycmVudC5tb3VzZURvd24odGhpcy5idXR0b25zW2UuYnV0dG9uXSk7XG4gICAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcbiAgICB9LFxuXG4gICAgYnV0dG9uczoge1xuICAgICAgICAwOiBcImxlZnRcIixcbiAgICAgICAgMTogXCJtaWRkbGVcIixcbiAgICAgICAgMjogXCJyaWdodFwiXG4gICAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGN1cnJlbnQ6IG51bGwsXG4gICAgbGlzdDogcmVxdWlyZSgnLi4vc2NlbmVzLmpzJyksXG4gICAgc2V0OiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICBpZiAoIXRoaXMubGlzdFtuYW1lXSkgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgW1wiICsgbmFtZSArIFwiXSBkb2VzIG5vdCBleGlzdCFcIik7XG4gICAgICAgIHRoaXMuY3VycmVudCA9IHRoaXMubGlzdFtuYW1lXTtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudC5pbml0KSB0aGlzLmN1cnJlbnQuaW5pdCgpO1xuICAgIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY291bnRlcjogcmVxdWlyZSgnLi9lbnRpdGllcy9jb3VudGVyLmpzJyksXG4gIGNvdW50ZXIyOiByZXF1aXJlKCcuL2VudGl0aWVzL2NvdW50ZXIyLmpzJyksXG4gIHBsYXllcjogcmVxdWlyZSgnLi9lbnRpdGllcy9wbGF5ZXIuanMnKSxcbiAgcG9uZXk6IHJlcXVpcmUoJy4vZW50aXRpZXMvcG9uZXkuanMnKSxcbiAgc3ByaXRlOiByZXF1aXJlKCcuL2VudGl0aWVzL3Nwcml0ZS5qcycpLFxuICB0aW1lcjogcmVxdWlyZSgnLi9lbnRpdGllcy90aW1lci5qcycpXG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52YWx1ZSA9IDEwMDtcbiAgfSxcbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52YWx1ZSsrO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnYgPSAxMDE7XG4gICAgdGhpcy52YWx1ZSA9IDA7XG4gICAgdGhpcy5jID0gb3guZW50aXRpZXMuc3Bhd24oJ2NvdW50ZXInKTtcbiAgfSxcbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52YWx1ZSsrO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICBveC5zcGF3bigncG9uZXknKTtcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy54ID0gMDtcbiAgfSxcblxuICBkcmF3OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy54Kys7XG4gICAgb3guY29udGV4dC5maWxsU3R5bGUgPSAnYmx1ZSdcbiAgICBveC5jb250ZXh0LmZpbGxSZWN0KDgwLCA4MCwgMTAwLCAyMDApXG4gICAgb3guY29udGV4dC5zdHJva2VTdHlsZSA9ICdncmV5J1xuICAgIG94LmNvbnRleHQuc3Ryb2tlUmVjdCg4MCwgODAsIDEwMCwgMjAwKVxuICAgIG94LmNvbnRleHQuZHJhd1Nwcml0ZSgncG9ueS5wbmcnLCB0aGlzLngsIDApO1xuICAgIG94LmNvbnRleHQuZHJhd1Nwcml0ZSgncG9ueS5wbmcnLCB0aGlzLnggKyAxMCwgMCk7XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuaXNWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zcmNXaWR0aCA9IG94LmltYWdlc1t0aGlzLnNyY10ud2lkdGg7XG4gICAgICAgIHRoaXMud2lkdGggPSB0aGlzLndpZHRoIHx8IHRoaXMuc3JjV2lkdGg7XG4gICAgICAgIHRoaXMuc3JjSGVpZ2h0ID0gb3guaW1hZ2VzW3RoaXMuc3JjXS5oZWlnaHQ7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5oZWlnaHQgfHwgdGhpcy5zcmNIZWlnaHQ7XG4gICAgICAgIHRoaXMueCA9IHRoaXMueCB8fCAwO1xuICAgICAgICB0aGlzLnkgPSB0aGlzLnkgfHwgMDtcblxuICAgICAgICBpZiAodGhpcy5hbmltYXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdEFuaW1hdGlvbigpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGUgPSB0aGlzLnVwZGF0ZUFuaW1hdGlvbjtcbiAgICAgICAgICAgIHRoaXMuZHJhdyA9IHRoaXMuZHJhd0FuaW1hdGlvbjtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBpbml0QW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuaXNQbGF5aW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pc0ZpbmlzaGVkID0gZmFsc2U7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5sb29wICE9PSAnYm9vbGVhbicpIHRoaXMubG9vcCA9IHRydWU7XG4gICAgICAgIHRoaXMuY291bnRlciA9IDA7XG4gICAgICAgIHRoaXMuZnJhbWVSYXRlID0gNjAgLyB0aGlzLmZyYW1lUmF0ZSB8fCAxO1xuICAgICAgICB0aGlzLmNhbGN1bGF0ZUZyYW1lcygpO1xuXG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbnMpIHtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uQXJyYXkgPSB0aGlzLmFuaW1hdGlvbnNbdGhpcy5hbmltYXRpb25dO1xuICAgICAgICAgICAgdGhpcy5hcnJheUNvdW50ZXIgPSAwO1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IHRoaXMuYW5pbWF0aW9uQXJyYXlbdGhpcy5hcnJheUNvdW50ZXJdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IDA7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZHJhdzogZnVuY3Rpb24gKCkge1xuICAgICAgICBveC5jb250ZXh0LmRyYXdTcHJpdGUodGhpcy5zcmMsIHRoaXMueCwgdGhpcy55KTtcbiAgICB9LFxuXG4gICAgZHJhd0FuaW1hdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICBveC5jb250ZXh0LmRyYXdTcHJpdGUodGhpcy5zcmMsIHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdGhpcy5mcmFtZXNbdGhpcy5mcmFtZV0pO1xuICAgIH0sXG5cbiAgICBjYWxjdWxhdGVGcmFtZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHggPSAwLFxuICAgICAgICAgICAgeSA9IDA7XG4gICAgICAgIHRoaXMuZnJhbWVzID0gW1swLCAwXV07XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCB0aGlzLnNyY0hlaWdodCAvIHRoaXMuaGVpZ2h0ICogdGhpcy5zcmNXaWR0aCAvIHRoaXMud2lkdGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHggPCB0aGlzLnNyY1dpZHRoIC8gdGhpcy53aWR0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICB4Kys7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHkgPCB0aGlzLnNyY0hlaWdodCAvIHRoaXMuaGVpZ2h0IC0gMSkge1xuICAgICAgICAgICAgICAgIHkrKztcbiAgICAgICAgICAgICAgICB4ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZnJhbWVzLnB1c2goW3gsIHldKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICB1cGRhdGVBbmltYXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzUGxheWluZykgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5pc0ZpbmlzaGVkKSByZXR1cm4gdGhpcy5maW5pc2hlZCgpO1xuXG4gICAgICAgIHRoaXMuY291bnRlciArPSAxO1xuICAgICAgICBpZiAodGhpcy5jb3VudGVyID4gdGhpcy5mcmFtZVJhdGUpIHtcbiAgICAgICAgICAgIHRoaXMuY291bnRlciA9IDA7XG4gICAgICAgICAgICBpZiAodGhpcy5hbmltYXRpb25zKSB0aGlzLm11bHRpcGxlQW5pbWF0aW9ucygpO1xuICAgICAgICAgICAgZWxzZSB0aGlzLnNpbmdsZUFuaW1hdGlvbigpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIG11bHRpcGxlQW5pbWF0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5hcnJheUNvdW50ZXIgPT09IHRoaXMuYW5pbWF0aW9uQXJyYXkubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmxvb3ApIHRoaXMuaXNGaW5pc2hlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmZyYW1lID0gdGhpcy5hbmltYXRpb25BcnJheVswXTtcbiAgICAgICAgICAgIHRoaXMuYXJyYXlDb3VudGVyID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYXJyYXlDb3VudGVyKys7XG4gICAgICAgICAgICB0aGlzLmZyYW1lID0gdGhpcy5hbmltYXRpb25BcnJheVt0aGlzLmFycmF5Q291bnRlcl07XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgc2luZ2xlQW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLmZyYW1lID09PSAodGhpcy5mcmFtZXMubGVuZ3RoIC0gMSkpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5sb29wKSB0aGlzLmlzRmluaXNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmZyYW1lICs9IDE7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZmluaXNoZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zdG9wKCk7XG4gICAgICAgIGlmICh0aGlzLm9uRmluaXNoKSB0aGlzLm9uRmluaXNoKCk7XG4gICAgfSxcblxuICAgIHBsYXk6IGZ1bmN0aW9uIChhbmltYXRpb24sIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgdGhpc1trZXldID0gb3B0aW9uc1trZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuYW5pbWF0aW9ucykge1xuICAgICAgICAgICAgaWYgKGFuaW1hdGlvbikgdGhpcy5hbmltYXRpb24gPSBhbmltYXRpb247XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbkFycmF5ID0gdGhpcy5hbmltYXRpb25zW3RoaXMuYW5pbWF0aW9uXTtcbiAgICAgICAgICAgIHRoaXMuYXJyYXlDb3VudGVyID0gMDtcbiAgICAgICAgICAgIHRoaXMuZnJhbWUgPSB0aGlzLmFuaW1hdGlvbkFycmF5W3RoaXMuYXJyYXlDb3VudGVyXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmlzRmluaXNoZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc1BsYXlpbmcgPSB0cnVlO1xuICAgIH0sXG5cbiAgICBzdG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuaXNQbGF5aW5nID0gZmFsc2U7XG4gICAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSAwO1xuICAgICAgICB0aGlzLnRhcmdldCA9IHRoaXMudGFyZ2V0IHx8IDEwMDA7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSB0aGlzLmNhbGxiYWNrIHx8IGZ1bmN0aW9uICgpIHt9O1xuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuICAgICAgICB0aGlzLnZhbHVlICs9IGR0ICogMTAwMDtcblxuICAgICAgICBpZiAodGhpcy52YWx1ZSA+PSB0aGlzLnRhcmdldCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY29udGV4dCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsbGJhY2suY2FsbCh0aGlzLmNvbnRleHQsIHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrKHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5sb29wKSB7XG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzYWJsZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIHJlc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IDA7XG4gICAgICAgIHRoaXMuZW5hYmxlKCk7XG4gICAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgbG9hZGluZzogcmVxdWlyZSgnLi9zY2VuZXMvbG9hZGluZy5qcycpLFxuICBtYWluOiByZXF1aXJlKCcuL3NjZW5lcy9tYWluLmpzJylcbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICBveC5wcmVsb2FkZXIubG9hZChyZXF1aXJlKCcuLi9hc3NldHMuanMnKSk7XG4gICAgICAgIHRoaXMuYmFyTGVuZ3RoID0gb3gucHJlbG9hZGVyLmFzc2V0c1RvTG9hZDtcbiAgICB9LFxuXG4gICAgZHJhdzogZnVuY3Rpb24gKCkge1xuICAgICAgICBveC5jb250ZXh0LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcbiAgICAgICAgb3guY29udGV4dC5maWxsUmVjdCgwLCAwLCBveC5jYW52YXMud2lkdGgsIG94LmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICBveC5jb250ZXh0LmZpbGxTdHlsZSA9IFwicmdiKDQ2LCAyMzgsIDI0NSlcIjtcbiAgICAgICAgb3guY29udGV4dC5maWxsUmVjdChveC5jYW52YXMud2lkdGggLyA0LCBveC5jYW52YXMuaGVpZ2h0IC8gMiArIDMyLCBveC5jYW52YXMud2lkdGggLyAyLCAxKTtcbiAgICAgICAgb3guY29udGV4dC5maWxsU3R5bGUgPSBcImdyZXlcIjtcbiAgICAgICAgb3guY29udGV4dC5zYXZlKCk7XG4gICAgICAgIG94LmNvbnRleHQudHJhbnNsYXRlKG94LmNhbnZhcy53aWR0aCAvIDQsIDIgKiBveC5jYW52YXMuaGVpZ2h0IC8gMyk7XG4gICAgICAgIG94LmNvbnRleHQuc2NhbGUoLTEsIDEpO1xuICAgICAgICBveC5jb250ZXh0LmZpbGxSZWN0KC1veC5jYW52YXMud2lkdGggLyAyLCAwLCBveC5jYW52YXMud2lkdGggLyAyICogb3gucHJlbG9hZGVyLmFzc2V0c1RvTG9hZCAvIHRoaXMuYmFyTGVuZ3RoLCAxKTtcbiAgICAgICAgb3guY29udGV4dC5yZXN0b3JlKCk7XG4gICAgICAgIG94LmNvbnRleHQuZmlsbFN0eWxlID0gXCJ3aGl0ZVwiO1xuICAgICAgICBveC5jb250ZXh0LmZvbnQgPSAnMjAwJSBzYW5zLXNlcmlmJztcbiAgICAgICAgb3guY29udGV4dC5maWxsVGV4dCgnbG9hZGluZy4uLicsIG94LmNhbnZhcy53aWR0aCAvIDIgLSA2OCwgb3guY2FudmFzLmhlaWdodCAvIDIgKyAxMCk7XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAob3gucHJlbG9hZGVyLmFzc2V0c1RvTG9hZCA9PT0gMCkgb3guc2NlbmVzLnNldCgnbWFpbicpO1xuICAgIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHRoaXMuc3ByaXRlMiA9IG94LnNwcml0ZSgnY29pbjIucG5nJywge1xuICAgICAgICAgICAgYW5pbWF0aW9uOiAnc3BpbicsXG4gICAgICAgICAgICBhbmltYXRpb25zOiB7XG4gICAgICAgICAgICAgICAgc3BpbjogWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDldLFxuICAgICAgICAgICAgICAgIGlkbGU6IFs4LCA0LCA4LCA0LCA4LCA0LCA4LCA0LCA4LCA0LCA4LCA0LCA4LCA0LCA4LCA0XVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGhlaWdodDogNDAsXG4gICAgICAgICAgICBmcmFtZVJhdGU6IDMwLFxuICAgICAgICAgICAgd2lkdGg6IDQ0LFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNwcml0ZTMgPSBveC5zcHJpdGUoJ3BvbnkucG5nJywge1xuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDEwMFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNwcml0ZTQgPSBveC5zcHJpdGUoJ3BvbnkucG5nJywge1xuICAgICAgICAgICAgeDogMTAwLFxuICAgICAgICAgICAgeTogMTAwXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc3ByaXRlNCA9IG94LnNwcml0ZSgncG9ueS5wbmcnLCB7XG4gICAgICAgICAgICB4OiAyMDAsXG4gICAgICAgICAgICB5OiAxMDBcbiAgICAgICAgfSk7XG5cbiAgICAgICAgb3guc3Bhd24oJ3RpbWVyJywge1xuICAgICAgICAgICAgdGFyZ2V0OiAyMDAwLFxuICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZTQueSArPSAtMTA7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3ByaXRlNC55IDwgMCkgdGhpcy5zcHJpdGU0LnkgPSAyMDA7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29udGV4dDogdGhpc1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcbiAgICAgICAgLy8gICAgICAgIHRoaXMuc3ByaXRlMi54ID0gb3gubW91c2UueDtcbiAgICAgICAgLy8gICAgICAgIHRoaXMuc3ByaXRlMi55ID0gb3gubW91c2UueTtcblxuICAgICAgICAvLyAgICAgICAgb3guY2FtZXJhLnNldChveC5tb3VzZS54LCBveC5tb3VzZS55KTtcbiAgICB9LFxuXG4gICAga2V5RG93bjogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImtleURvd246IFwiICsga2V5KTtcbiAgICB9LFxuXG4gICAga2V5UHJlc3M6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJrZXlQcmVzczogXCIgKyBrZXkpO1xuICAgIH0sXG5cbiAgICBrZXlVcDogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImtleVVwOiBcIiArIGtleSk7XG4gICAgfSxcblxuICAgIG1vdXNlRG93bjogZnVuY3Rpb24gKGJ1dHRvbikge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkNsaWNrZWQgYXQ6IFwiICsgb3gubW91c2UueCArIFwiLCBcIiArIG94Lm1vdXNlLnkgKyBcIiB3aXRoIHRoZSBcIiArIGJ1dHRvbiArIFwiIGJ1dHRvbi5cIik7XG4gICAgfSxcblxuICAgIG1vdXNlVXA6IGZ1bmN0aW9uIChidXR0b24pIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJSZWxlYXNlZCBhdDogXCIgKyBveC5tb3VzZS54ICsgXCIsIFwiICsgb3gubW91c2UueSArIFwiIHdpdGggdGhlIFwiICsgYnV0dG9uICsgXCIgYnV0dG9uLlwiKTtcbiAgICB9XG59OyJdfQ==
