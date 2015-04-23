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
var keyboard = require('./keyboard'),
    mouse = require('./mouse'),
    canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d');

canvas.tabIndex = 1000;
canvas.style.outline = "none";
canvas.onkeydown = keyboard.keyDown.bind(keyboard);
canvas.onkeyup = keyboard.keyUp.bind(keyboard);
canvas.onmousemove = mouse.onMove.bind(mouse);
canvas.onmousedown = mouse.onDown.bind(mouse);
canvas.onmouseup = mouse.onUp.bind(mouse);
canvas.style.cursor = "none";
canvas.oncontextmenu = function () {
    return false;
};

module.exports = context;

},{"./keyboard":7,"./mouse":10}],4:[function(require,module,exports){
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
        spawn: require('./entitiesManager').spawn
    };

    ox.scenes.set('loading');
    ox.loop.init();
};

},{"./camera":2,"./canvas":3,"./entitiesManager":5,"./gameLoop":6,"./keyboard":7,"./loader":8,"./localStorage":9,"./mouse":10,"./scenesManager":11}],5:[function(require,module,exports){
var list = require('../entities'),
    current = [],
    toUpdate = [],
    toDraw = [],
    spawn = function (type, options) {
        if (!list[type]) throw new Error("Entity [" + type + "] does not exist and cannot be spawned.");
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
    },
    clear = function () {
        current.splice(0, current.length);
        toUpdate.splice(0, toUpdate.length);
        toDraw.splice(0, toDraw.length);
    };

module.exports = {
    current: current,
    list: list,
    toDraw: toDraw,
    toUpdate: toUpdate,
    spawn: spawn,
    clear: clear
};

},{"../entities":12}],6:[function(require,module,exports){
var entities = require('./entitiesManager'),
    toDraw = entities.toDraw,
    toUpdate = entities.toUpdate,
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
        if (scenes.isChanging) this.dt = 0;
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
        for (var i = 0, len = toDraw.length; i < len; i++) {
            if (entities.current[toDraw[i]] !== undefined && entities.current[toDraw[i]].draw !== undefined) {
                entities.current[toDraw[i]].draw();
            }
        }

        //    context.restore();
    },

    update: function (dt) {
        if (scenes.current.update) scenes.current.update(dt);
        for (var i = 0, len = toUpdate.length; i < len; i++) {
            if (entities.current[toUpdate[i]] !== undefined && entities.current[toUpdate[i]].update !== undefined) {
                entities.current[toUpdate[i]].update(dt);
            }
        }
    },
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
var clearEntities = require('./entitiesManager').clear;

module.exports = {
    current: null,
    list: require('../scenes.js'),
    set: function (name) {
        if (!this.list[name]) throw new Error("Scene [" + name + "] does not exist!");
        clearEntities();
        this.current = this.list[name];
        this.current.init();
    }
};
},{"../scenes.js":21,"./entitiesManager":5}],12:[function(require,module,exports){
module.exports = {
  'counter': require('./entities/counter.js'),
  'counter2': require('./entities/counter2.js'),
  'player': require('./entities/player.js'),
  'poney': require('./entities/poney.js'),
  'sprite/animated': require('./entities/sprite/animated.js'),
  'sprite/drawSprite': require('./entities/sprite/drawSprite.js'),
  'sprite': require('./entities/sprite.js'),
  'timer': require('./entities/timer.js')
};
},{"./entities/counter.js":13,"./entities/counter2.js":14,"./entities/player.js":15,"./entities/poney.js":16,"./entities/sprite.js":17,"./entities/sprite/animated.js":18,"./entities/sprite/drawSprite.js":19,"./entities/timer.js":20}],13:[function(require,module,exports){
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
var drawSprite = require('./sprite/drawSprite'),
    animated = require('./sprite/animated');

module.exports = {
    init: function () {
        this.sourceWidth = ox.images[this.source].width;
        this.sourceHeight = ox.images[this.source].height;
        this.width = this.width || this.sourceWidth;
        this.height = this.height || this.sourceHeight;
        this.x = this.x || 0;
        this.y = this.y || 0;

        if (this.animation) animated.call(this);
    },

    draw: function () {
        drawSprite(this.source, this.x, this.y);
    }
};
},{"./sprite/animated":18,"./sprite/drawSprite":19}],18:[function(require,module,exports){
var drawSprite = require('./drawSprite'),
    init = function () {
        this.isPlaying = true;
        this.isFinished = false;
        if (typeof this.loop !== 'boolean') this.loop = true;
        this.counter = 0;
        this.frameRate = this.frameRate || 30;
        this.pause = pause.bind(this);
        this.play = play.bind(this);
        this.finished = finished.bind(this);
        this.update = update.bind(this);
        this.draw = draw.bind(this);
        calculateFrames.call(this);

        if (this.animations) {
            this.animationArray = this.animations[this.animation];
            this.arrayCounter = 0;
            this.frame = this.animationArray[this.arrayCounter];
        } else {
            this.frame = 0;
        }
    },

    calculateFrames = function () {
        var x = 0,
            y = 0;
        this.frames = [[0, 0]];

        for (var i = 1; i < this.sourceHeight / this.height * this.sourceWidth / this.width; i++) {
            if (x < this.sourceWidth / this.width - 1) {
                x++;
            } else if (y < this.sourceHeight / this.height - 1) {
                y++;
                x = 0;
            }
            this.frames.push([x, y]);
        }
    },

    draw = function () {
        drawSprite(this.source, this.x, this.y, this.width, this.height, this.frames[this.frame]);
    },

    update = function (dt) {
        if (!this.isPlaying) return;
        if (this.isFinished) return this.finished();

        this.counter += dt * 1000;
        if (this.counter > 1000 / this.frameRate) {
            this.counter = 0;
            if (this.animations) {
                multipleAnimations.call(this);
            } else {
                singleAnimation.call(this);
            }
        }
    },

    multipleAnimations = function () {
        if (this.arrayCounter === this.animationArray.length - 1) {
            if (!this.loop) this.isFinished = true;
            this.frame = this.animationArray[0];
            this.arrayCounter = 0;
        } else {
            this.arrayCounter++;
            this.frame = this.animationArray[this.arrayCounter];
        }
    },

    singleAnimation = function () {
        if (this.frame === (this.frames.length - 1)) {
            if (!this.loop) this.isFinished = true;
            this.frame = 0;
        } else {
            this.frame += 1;
        }
    },

    finished = function () {
        this.pause();
        if (this.callback) this.callback();
    },

    play = function (animation, options) {
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

    pause = function () {
        this.isPlaying = false;
    };

module.exports = init;
},{"./drawSprite":19}],19:[function(require,module,exports){
module.exports = function (src, x, y, width, height, frame) {
    if (typeof width === 'number') {
        ox.context.drawImage(
            ox.images[src],
            width * frame[0],
            height * frame[1],
            width, height, x, y, width, height);
    } else {
        ox.context.drawImage(ox.images[src], x, y);
    }
};

},{}],20:[function(require,module,exports){
module.exports = {
    init: function () {
        this.value = 0;
        this.target = this.target || 1000;
        this.callback = this.callback || function () {};
    },

    update: function (dt) {
        this.value = Math.round(this.value + dt * 1000);
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

},{}],21:[function(require,module,exports){
module.exports = {
  'empty': require('./scenes/empty.js'),
  'loading': require('./scenes/loading.js'),
  'main': require('./scenes/main.js')
};
},{"./scenes/empty.js":22,"./scenes/loading.js":23,"./scenes/main.js":24}],22:[function(require,module,exports){
module.exports = {
    init: function () {
        ox.scenes.set('main');
    }
};
},{}],23:[function(require,module,exports){
module.exports = {
    init: function () {
        ox.preloader.load(require('../assets'));
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

},{"../assets":1}],24:[function(require,module,exports){
module.exports = {
    init: function () {
        this.sprite2 = ox.spawn('sprite', {
            source: 'coin2.png',
            animation: 'spin',
            animations: {
                spin: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                idle: [8, 4, 8, 4, 8, 4, 8, 4, 8, 4, 8, 4, 8, 4, 8, 4]
            },
            height: 40,
            frameRate: 1,
            width: 44
        });

        this.sprite3 = ox.spawn('sprite', {
            source: 'pony.png',
            x: 0,
            y: 100
        });

        this.sprite4 = ox.spawn('sprite', {
            source: 'pony.png',
            x: 100,
            y: 100
        });

        this.sprite4 = ox.spawn('sprite', {
            source: 'pony.png',
            x: 200,
            y: 100
        });

        ox.spawn('timer', {
            target: 1000,
            callback: function (value) {
                console.log(value);
                this.sprite4.y += -10;
                if (this.sprite4.y < 0) this.sprite4.y = 200;
                //                ox.scenes.set('maino');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9hc3NldHMuanMiLCJzcmMvZW5naW5lL2NhbWVyYS5qcyIsInNyYy9lbmdpbmUvY2FudmFzLmpzIiwic3JjL2VuZ2luZS9jb3JlLmpzIiwic3JjL2VuZ2luZS9lbnRpdGllc01hbmFnZXIuanMiLCJzcmMvZW5naW5lL2dhbWVMb29wLmpzIiwic3JjL2VuZ2luZS9rZXlib2FyZC5qcyIsInNyYy9lbmdpbmUvbG9hZGVyLmpzIiwic3JjL2VuZ2luZS9sb2NhbFN0b3JhZ2UuanMiLCJzcmMvZW5naW5lL21vdXNlLmpzIiwic3JjL2VuZ2luZS9zY2VuZXNNYW5hZ2VyLmpzIiwic3JjL2VudGl0aWVzLmpzIiwic3JjL2VudGl0aWVzL2NvdW50ZXIuanMiLCJzcmMvZW50aXRpZXMvY291bnRlcjIuanMiLCJzcmMvZW50aXRpZXMvcGxheWVyLmpzIiwic3JjL2VudGl0aWVzL3BvbmV5LmpzIiwic3JjL2VudGl0aWVzL3Nwcml0ZS5qcyIsInNyYy9lbnRpdGllcy9zcHJpdGUvYW5pbWF0ZWQuanMiLCJzcmMvZW50aXRpZXMvc3ByaXRlL2RyYXdTcHJpdGUuanMiLCJzcmMvZW50aXRpZXMvdGltZXIuanMiLCJzcmMvc2NlbmVzLmpzIiwic3JjL3NjZW5lcy9lbXB0eS5qcyIsInNyYy9zY2VuZXMvbG9hZGluZy5qcyIsInNyYy9zY2VuZXMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gW1xuICAnLi9pbWFnZXMvY29pbi5wbmcnLFxuICAnLi9pbWFnZXMvY29pbjIucG5nJyxcbiAgJy4vaW1hZ2VzL2NvaW5Ud2lzdGVkLnBuZycsXG4gICcuL2ltYWdlcy9wb255LnBuZycsXG4gICcuL2RhdGEvZXhhbXBsZS5qc29uJyxcbiAgJy4vYXVkaW8vdGhlX2hlYXZ5Lm1wMydcbl07XG4iLCJ2YXIgY29udGV4dCA9IHJlcXVpcmUoJy4vY2FudmFzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHNldDogZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICB9LFxuXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29udGV4dC5zYXZlKCk7XG4gICAgICAgIGNvbnRleHQudHJhbnNsYXRlKHRoaXMueCwgdGhpcy55KTtcbiAgICB9XG59O1xuIiwidmFyIGtleWJvYXJkID0gcmVxdWlyZSgnLi9rZXlib2FyZCcpLFxuICAgIG1vdXNlID0gcmVxdWlyZSgnLi9tb3VzZScpLFxuICAgIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKSxcbiAgICBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbmNhbnZhcy50YWJJbmRleCA9IDEwMDA7XG5jYW52YXMuc3R5bGUub3V0bGluZSA9IFwibm9uZVwiO1xuY2FudmFzLm9ua2V5ZG93biA9IGtleWJvYXJkLmtleURvd24uYmluZChrZXlib2FyZCk7XG5jYW52YXMub25rZXl1cCA9IGtleWJvYXJkLmtleVVwLmJpbmQoa2V5Ym9hcmQpO1xuY2FudmFzLm9ubW91c2Vtb3ZlID0gbW91c2Uub25Nb3ZlLmJpbmQobW91c2UpO1xuY2FudmFzLm9ubW91c2Vkb3duID0gbW91c2Uub25Eb3duLmJpbmQobW91c2UpO1xuY2FudmFzLm9ubW91c2V1cCA9IG1vdXNlLm9uVXAuYmluZChtb3VzZSk7XG5jYW52YXMuc3R5bGUuY3Vyc29yID0gXCJub25lXCI7XG5jYW52YXMub25jb250ZXh0bWVudSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbnRleHQ7XG4iLCJ3aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMub3ggPSB7XG4gICAgICAgIGNhbnZhczogcmVxdWlyZSgnLi9jYW52YXMnKS5jYW52YXMsXG4gICAgICAgIGNvbnRleHQ6IHJlcXVpcmUoJy4vY2FudmFzJyksXG4gICAgICAgIGNhbWVyYTogcmVxdWlyZSgnLi9jYW1lcmEnKSxcbiAgICAgICAgaW1hZ2VzOiByZXF1aXJlKCcuL2xvYWRlcicpLmltYWdlcyxcbiAgICAgICAgYXVkaW86IHJlcXVpcmUoJy4vbG9hZGVyJykuYXVkaW8sXG4gICAgICAgIGRhdGE6IHJlcXVpcmUoJy4vbG9hZGVyJykuZGF0YSxcbiAgICAgICAga2V5Ym9hcmQ6IHJlcXVpcmUoJy4va2V5Ym9hcmQnKSxcbiAgICAgICAgbW91c2U6IHJlcXVpcmUoJy4vbW91c2UnKSxcbiAgICAgICAgc2NlbmVzOiByZXF1aXJlKCcuL3NjZW5lc01hbmFnZXInKSxcbiAgICAgICAgZW50aXRpZXM6IHJlcXVpcmUoJy4vZW50aXRpZXNNYW5hZ2VyJyksXG4gICAgICAgIHNhdmU6IHJlcXVpcmUoJy4vbG9jYWxTdG9yYWdlJyksXG4gICAgICAgIGxvb3A6IHJlcXVpcmUoJy4vZ2FtZUxvb3AnKSxcbiAgICAgICAgcHJlbG9hZGVyOiByZXF1aXJlKCcuL2xvYWRlcicpLFxuICAgICAgICBzcGF3bjogcmVxdWlyZSgnLi9lbnRpdGllc01hbmFnZXInKS5zcGF3blxuICAgIH07XG5cbiAgICBveC5zY2VuZXMuc2V0KCdsb2FkaW5nJyk7XG4gICAgb3gubG9vcC5pbml0KCk7XG59O1xuIiwidmFyIGxpc3QgPSByZXF1aXJlKCcuLi9lbnRpdGllcycpLFxuICAgIGN1cnJlbnQgPSBbXSxcbiAgICB0b1VwZGF0ZSA9IFtdLFxuICAgIHRvRHJhdyA9IFtdLFxuICAgIHNwYXduID0gZnVuY3Rpb24gKHR5cGUsIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKCFsaXN0W3R5cGVdKSB0aHJvdyBuZXcgRXJyb3IoXCJFbnRpdHkgW1wiICsgdHlwZSArIFwiXSBkb2VzIG5vdCBleGlzdCBhbmQgY2Fubm90IGJlIHNwYXduZWQuXCIpO1xuICAgICAgICB2YXIgb2JqID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIGxpc3RbdHlwZV0pIHtcbiAgICAgICAgICAgIG9ialtrZXldID0gbGlzdFt0eXBlXVtrZXldO1xuICAgICAgICB9XG4gICAgICAgIG9iai5kaXNhYmxlID0gZGlzYWJsZS5iaW5kKG9iaik7XG4gICAgICAgIG9iai5lbmFibGUgPSBlbmFibGUuYmluZChvYmopO1xuICAgICAgICBvYmouaWQgPSBjdXJyZW50Lmxlbmd0aDtcbiAgICAgICAgb2JqLnR5cGUgPSB0eXBlO1xuICAgICAgICBjdXJyZW50LnB1c2gob2JqKTtcbiAgICAgICAgaWYgKG9iai5pbml0KSBvYmouaW5pdCgpO1xuICAgICAgICBvYmouZW5hYmxlKCk7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfSxcbiAgICBkaXNhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodG9EcmF3LmluZGV4T2YodGhpcy5pZCkgPiAwKSB0b0RyYXcuc3BsaWNlKHRvRHJhdy5pbmRleE9mKHRoaXMuaWQpLCAxKTtcbiAgICAgICAgaWYgKHRvVXBkYXRlLmluZGV4T2YodGhpcy5pZCkgPiAwKSB0b1VwZGF0ZS5zcGxpY2UodG9VcGRhdGUuaW5kZXhPZih0aGlzLmlkKSwgMSk7XG4gICAgfSxcbiAgICBlbmFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnVwZGF0ZSkgdG9VcGRhdGUucHVzaCh0aGlzLmlkKTtcbiAgICAgICAgaWYgKHRoaXMuZHJhdykgdG9EcmF3LnB1c2godGhpcy5pZCk7XG4gICAgfSxcbiAgICBjbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY3VycmVudC5zcGxpY2UoMCwgY3VycmVudC5sZW5ndGgpO1xuICAgICAgICB0b1VwZGF0ZS5zcGxpY2UoMCwgdG9VcGRhdGUubGVuZ3RoKTtcbiAgICAgICAgdG9EcmF3LnNwbGljZSgwLCB0b0RyYXcubGVuZ3RoKTtcbiAgICB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjdXJyZW50OiBjdXJyZW50LFxuICAgIGxpc3Q6IGxpc3QsXG4gICAgdG9EcmF3OiB0b0RyYXcsXG4gICAgdG9VcGRhdGU6IHRvVXBkYXRlLFxuICAgIHNwYXduOiBzcGF3bixcbiAgICBjbGVhcjogY2xlYXJcbn07XG4iLCJ2YXIgZW50aXRpZXMgPSByZXF1aXJlKCcuL2VudGl0aWVzTWFuYWdlcicpLFxuICAgIHRvRHJhdyA9IGVudGl0aWVzLnRvRHJhdyxcbiAgICB0b1VwZGF0ZSA9IGVudGl0aWVzLnRvVXBkYXRlLFxuICAgIHNjZW5lcyA9IHJlcXVpcmUoJy4vc2NlbmVzTWFuYWdlcicpLFxuICAgIGNvbnRleHQgPSByZXF1aXJlKCcuL2NhbnZhcycpLFxuICAgIGNhbWVyYSA9IHJlcXVpcmUoJy4vY2FtZXJhJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHNwZWVkOiAxLFxuICAgIGR0OiAwLFxuICAgIHN0ZXA6IDEgLyA2MCxcbiAgICBsYXN0RGVsdGE6IG5ldyBEYXRlKCksXG4gICAgbm93OiBuZXcgRGF0ZSgpLFxuICAgIGNhbGN1bGF0ZURlbHRhOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubGFzdERlbHRhID0gdGhpcy5ub3c7XG4gICAgICAgIHRoaXMubm93ID0gbmV3IERhdGUoKTtcbiAgICAgICAgdGhpcy5kdCArPSBNYXRoLm1pbigxLCAodGhpcy5ub3cgLSB0aGlzLmxhc3REZWx0YSkgLyAxMDAwKSAqIHRoaXMuc3BlZWQ7XG4gICAgfSxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChzY2VuZXMuaXNDaGFuZ2luZykgdGhpcy5kdCA9IDA7XG4gICAgICAgIHRoaXMuY2FsY3VsYXRlRGVsdGEoKTtcbiAgICAgICAgd2hpbGUgKHRoaXMuZHQgPiB0aGlzLnN0ZXApIHtcbiAgICAgICAgICAgIHRoaXMuZHQgLT0gdGhpcy5zdGVwO1xuICAgICAgICAgICAgdGhpcy51cGRhdGUodGhpcy5zdGVwKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRyYXcodGhpcy5kdCk7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmluaXQuYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIGRyYXc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgY29udGV4dC5jYW52YXMud2lkdGgsIGNvbnRleHQuY2FudmFzLmhlaWdodCk7XG4gICAgICAgIC8vICAgIGNhbWVyYS5zdGFydCgpO1xuICAgICAgICBpZiAoc2NlbmVzLmN1cnJlbnQuZHJhdykgc2NlbmVzLmN1cnJlbnQuZHJhdygpO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdG9EcmF3Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZW50aXRpZXMuY3VycmVudFt0b0RyYXdbaV1dICE9PSB1bmRlZmluZWQgJiYgZW50aXRpZXMuY3VycmVudFt0b0RyYXdbaV1dLmRyYXcgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGVudGl0aWVzLmN1cnJlbnRbdG9EcmF3W2ldXS5kcmF3KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyAgICBjb250ZXh0LnJlc3RvcmUoKTtcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcbiAgICAgICAgaWYgKHNjZW5lcy5jdXJyZW50LnVwZGF0ZSkgc2NlbmVzLmN1cnJlbnQudXBkYXRlKGR0KTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRvVXBkYXRlLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZW50aXRpZXMuY3VycmVudFt0b1VwZGF0ZVtpXV0gIT09IHVuZGVmaW5lZCAmJiBlbnRpdGllcy5jdXJyZW50W3RvVXBkYXRlW2ldXS51cGRhdGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGVudGl0aWVzLmN1cnJlbnRbdG9VcGRhdGVbaV1dLnVwZGF0ZShkdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxufTtcbiIsInZhciBzY2VuZSA9IHJlcXVpcmUoJy4vc2NlbmVzTWFuYWdlcicpO1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaXNQcmVzc2VkOiB7fSxcblxuICAgIGtleURvd246IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChlLmtleUNvZGUgPT09IDMyIHx8IChlLmtleUNvZGUgPj0gMzcgJiYgZS5rZXlDb2RlIDw9IDQwKSkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAoc2NlbmUuY3VycmVudC5rZXlEb3duKSBzY2VuZS5jdXJyZW50LmtleURvd24odGhpcy5rZXlzW2Uua2V5Q29kZV0pO1xuICAgICAgICB0aGlzLmtleVByZXNzKGUpO1xuICAgIH0sXG5cbiAgICBrZXlQcmVzczogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNQcmVzc2VkW2Uua2V5Q29kZV0pIHJldHVybjtcbiAgICAgICAgaWYgKHNjZW5lLmN1cnJlbnQua2V5UHJlc3MpIHNjZW5lLmN1cnJlbnQua2V5UHJlc3ModGhpcy5rZXlzW2Uua2V5Q29kZV0pO1xuICAgICAgICB0aGlzLmlzUHJlc3NlZFtlLmtleUNvZGVdID0gdHJ1ZTtcbiAgICB9LFxuXG4gICAga2V5VXA6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChzY2VuZS5jdXJyZW50LmtleVVwKSBzY2VuZS5jdXJyZW50LmtleVVwKHRoaXMua2V5c1tlLmtleUNvZGVdKTtcbiAgICAgICAgdGhpcy5pc1ByZXNzZWRbZS5rZXlDb2RlXSA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICBrZXlzOiB7XG4gICAgICAgIDg6ICdiYWNrc3BhY2UnLFxuICAgICAgICA5OiAndGFiJyxcbiAgICAgICAgMTM6ICdlbnRlcicsXG4gICAgICAgIDE2OiAnc2hpZnQnLFxuICAgICAgICAxNzogJ2N0cmwnLFxuICAgICAgICAxODogJ2FsdCcsXG4gICAgICAgIDE5OiAncGF1c2UnLFxuICAgICAgICAyMDogJ2NhcHNfbG9jaycsXG4gICAgICAgIDI3OiAnZXNjJyxcbiAgICAgICAgMzI6ICdzcGFjZWJhcicsXG4gICAgICAgIDMzOiAncGFnZV91cCcsXG4gICAgICAgIDM0OiAncGFnZV9kb3duJyxcbiAgICAgICAgMzU6ICdlbmQnLFxuICAgICAgICAzNjogJ2hvbWUnLFxuICAgICAgICAzNzogJ2xlZnQnLFxuICAgICAgICAzODogJ3VwJyxcbiAgICAgICAgMzk6ICdyaWdodCcsXG4gICAgICAgIDQwOiAnZG93bicsXG4gICAgICAgIDQ0OiAncHJpbnRfc2NyZWVuJyxcbiAgICAgICAgNDU6ICdpbnNlcnQnLFxuICAgICAgICA0NjogJ2RlbGV0ZScsXG4gICAgICAgIDQ4OiAnMCcsXG4gICAgICAgIDQ5OiAnMScsXG4gICAgICAgIDUwOiAnMicsXG4gICAgICAgIDUxOiAnMycsXG4gICAgICAgIDUyOiAnNCcsXG4gICAgICAgIDUzOiAnNScsXG4gICAgICAgIDU0OiAnNicsXG4gICAgICAgIDU1OiAnNycsXG4gICAgICAgIDU2OiAnOCcsXG4gICAgICAgIDU3OiAnOScsXG4gICAgICAgIDY1OiAnYScsXG4gICAgICAgIDY2OiAnYicsXG4gICAgICAgIDY3OiAnYycsXG4gICAgICAgIDY4OiAnZCcsXG4gICAgICAgIDY5OiAnZScsXG4gICAgICAgIDcwOiAnZicsXG4gICAgICAgIDcxOiAnZycsXG4gICAgICAgIDcyOiAnaCcsXG4gICAgICAgIDczOiAnaScsXG4gICAgICAgIDc0OiAnaicsXG4gICAgICAgIDc1OiAnaycsXG4gICAgICAgIDc2OiAnbCcsXG4gICAgICAgIDc3OiAnbScsXG4gICAgICAgIDc4OiAnbicsXG4gICAgICAgIDc5OiAnbycsXG4gICAgICAgIDgwOiAncCcsXG4gICAgICAgIDgxOiAncScsXG4gICAgICAgIDgyOiAncicsXG4gICAgICAgIDgzOiAncycsXG4gICAgICAgIDg0OiAndCcsXG4gICAgICAgIDg1OiAndScsXG4gICAgICAgIDg2OiAndicsXG4gICAgICAgIDg3OiAndycsXG4gICAgICAgIDg4OiAneCcsXG4gICAgICAgIDg5OiAneScsXG4gICAgICAgIDkwOiAneicsXG4gICAgICAgIDk2OiAnbnVtX3plcm8nLFxuICAgICAgICA5NzogJ251bV9vbmUnLFxuICAgICAgICA5ODogJ251bV90d28nLFxuICAgICAgICA5OTogJ251bV90aHJlZScsXG4gICAgICAgIDEwMDogJ251bV9mb3VyJyxcbiAgICAgICAgMTAxOiAnbnVtX2ZpdmUnLFxuICAgICAgICAxMDI6ICdudW1fc2l4JyxcbiAgICAgICAgMTAzOiAnbnVtX3NldmVuJyxcbiAgICAgICAgMTA0OiAnbnVtX2VpZ2h0JyxcbiAgICAgICAgMTA1OiAnbnVtX25pbmUnLFxuICAgICAgICAxMDY6ICdudW1fbXVsdGlwbHknLFxuICAgICAgICAxMDc6ICdudW1fcGx1cycsXG4gICAgICAgIDEwOTogJ251bV9taW51cycsXG4gICAgICAgIDExMDogJ251bV9wZXJpb2QnLFxuICAgICAgICAxMTE6ICdudW1fZGl2aXNpb24nLFxuICAgICAgICAxMTI6ICdmMScsXG4gICAgICAgIDExMzogJ2YyJyxcbiAgICAgICAgMTE0OiAnZjMnLFxuICAgICAgICAxMTU6ICdmNCcsXG4gICAgICAgIDExNjogJ2Y1JyxcbiAgICAgICAgMTE3OiAnZjYnLFxuICAgICAgICAxMTg6ICdmNycsXG4gICAgICAgIDExOTogJ2Y4JyxcbiAgICAgICAgMTIwOiAnZjknLFxuICAgICAgICAxMjE6ICdmMTAnLFxuICAgICAgICAxMjI6ICdmMTEnLFxuICAgICAgICAxMjM6ICdmMTInLFxuICAgICAgICAxODY6ICdzZW1pY29sb24nLFxuICAgICAgICAxODc6ICdwbHVzJyxcbiAgICAgICAgMTg5OiAnbWludXMnLFxuICAgICAgICAxOTI6ICdncmF2ZV9hY2NlbnQnLFxuICAgICAgICAyMjI6ICdzaW5nbGVfcXVvdGUnXG4gICAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGltYWdlczoge30sXG4gICAgZGF0YToge30sXG4gICAgYXVkaW86IHt9LFxuICAgIGFzc2V0c1RvTG9hZDogMCxcblxuICAgIGxvYWRJbWFnZTogZnVuY3Rpb24gKHBhdGgpIHtcbiAgICAgICAgdmFyIG5hbWUgPSBwYXRoLnNsaWNlKDksIHBhdGgubGVuZ3RoKTtcbiAgICAgICAgdGhpcy5pbWFnZXNbbmFtZV0gPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgdGhpcy5pbWFnZXNbbmFtZV0ub25sb2FkID0gdGhpcy5hc3NldHNUb0xvYWQtLTtcbiAgICAgICAgdGhpcy5pbWFnZXNbbmFtZV0uc3JjID0gcGF0aDtcbiAgICB9LFxuXG4gICAgbG9hZERhdGE6IGZ1bmN0aW9uIChwYXRoKSB7XG4gICAgICAgIHZhciBmaWxlID0gcGF0aC5zbGljZSg3LCBwYXRoLmxlbmd0aCAtIDUpLFxuICAgICAgICAgICAgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0ICYmIHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgIHNlbGYuZGF0YVtmaWxlXSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgc2VsZi5hc3NldHNUb0xvYWQtLTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgeGhyLm9wZW4oXCJHRVRcIiwgcGF0aCk7XG4gICAgICAgIHhoci5zZW5kKCk7XG4gICAgfSxcblxuICAgIGxvYWRBdWRpbzogZnVuY3Rpb24gKHBhdGgpIHtcbiAgICAgICAgdmFyIG5hbWUgPSBwYXRoLnNsaWNlKDgsIHBhdGgubGVuZ3RoKTtcbiAgICAgICAgdGhpcy5hdWRpb1tuYW1lXSA9IG5ldyBBdWRpbyhwYXRoKTtcbiAgICAgICAgdGhpcy5hdWRpb1tuYW1lXS5vbmNhbnBsYXl0aHJvdWdoID0gdGhpcy5hc3NldHNUb0xvYWQtLTtcbiAgICB9LFxuXG4gICAgbG9hZDogZnVuY3Rpb24gKGxpc3QpIHtcbiAgICAgICAgdGhpcy5hc3NldHNUb0xvYWQgKz0gbGlzdC5sZW5ndGg7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAobGlzdFtpXS5pbmRleE9mKCcuL2ltYWdlcycpID4gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRJbWFnZShsaXN0W2ldKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGlzdFtpXS5pbmRleE9mKCcuL2RhdGEnKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkRGF0YShsaXN0W2ldKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGlzdFtpXS5pbmRleE9mKCcuL2F1ZGlvJykgPiAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZEF1ZGlvKGxpc3RbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHN0b3JlOiBmdW5jdGlvbiAobnVtLCBvYmopIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0obnVtLCBKU09OLnN0cmluZ2lmeShvYmopKTtcbiAgICB9LFxuICAgIGxvYWQ6IGZ1bmN0aW9uIChudW0pIHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0obnVtKSk7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uIChudW0pIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0obnVtKTtcbiAgICB9XG59O1xuIiwidmFyIHNjZW5lID0gcmVxdWlyZSgnLi9zY2VuZXNNYW5hZ2VyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHg6IDAsXG4gICAgeTogMCxcbiAgICBpc0Rvd246IGZhbHNlLFxuXG4gICAgb25Nb3ZlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBveC5tb3VzZS54ID0gZS5jbGllbnRYIC0gb3guY2FudmFzLm9mZnNldExlZnQ7XG4gICAgICAgIG94Lm1vdXNlLnkgPSBlLmNsaWVudFkgLSBveC5jYW52YXMub2Zmc2V0VG9wO1xuICAgIH0sXG5cbiAgICBvblVwOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoc2NlbmUuY3VycmVudC5tb3VzZVVwKSBzY2VuZS5jdXJyZW50Lm1vdXNlVXAodGhpcy5idXR0b25zW2UuYnV0dG9uXSk7XG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XG4gICAgfSxcblxuICAgIG9uRG93bjogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKHNjZW5lLmN1cnJlbnQubW91c2VEb3duKSBzY2VuZS5jdXJyZW50Lm1vdXNlRG93bih0aGlzLmJ1dHRvbnNbZS5idXR0b25dKTtcbiAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xuICAgIH0sXG5cbiAgICBidXR0b25zOiB7XG4gICAgICAgIDA6IFwibGVmdFwiLFxuICAgICAgICAxOiBcIm1pZGRsZVwiLFxuICAgICAgICAyOiBcInJpZ2h0XCJcbiAgICB9XG59O1xuIiwidmFyIGNsZWFyRW50aXRpZXMgPSByZXF1aXJlKCcuL2VudGl0aWVzTWFuYWdlcicpLmNsZWFyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjdXJyZW50OiBudWxsLFxuICAgIGxpc3Q6IHJlcXVpcmUoJy4uL3NjZW5lcy5qcycpLFxuICAgIHNldDogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgaWYgKCF0aGlzLmxpc3RbbmFtZV0pIHRocm93IG5ldyBFcnJvcihcIlNjZW5lIFtcIiArIG5hbWUgKyBcIl0gZG9lcyBub3QgZXhpc3QhXCIpO1xuICAgICAgICBjbGVhckVudGl0aWVzKCk7XG4gICAgICAgIHRoaXMuY3VycmVudCA9IHRoaXMubGlzdFtuYW1lXTtcbiAgICAgICAgdGhpcy5jdXJyZW50LmluaXQoKTtcbiAgICB9XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAnY291bnRlcic6IHJlcXVpcmUoJy4vZW50aXRpZXMvY291bnRlci5qcycpLFxuICAnY291bnRlcjInOiByZXF1aXJlKCcuL2VudGl0aWVzL2NvdW50ZXIyLmpzJyksXG4gICdwbGF5ZXInOiByZXF1aXJlKCcuL2VudGl0aWVzL3BsYXllci5qcycpLFxuICAncG9uZXknOiByZXF1aXJlKCcuL2VudGl0aWVzL3BvbmV5LmpzJyksXG4gICdzcHJpdGUvYW5pbWF0ZWQnOiByZXF1aXJlKCcuL2VudGl0aWVzL3Nwcml0ZS9hbmltYXRlZC5qcycpLFxuICAnc3ByaXRlL2RyYXdTcHJpdGUnOiByZXF1aXJlKCcuL2VudGl0aWVzL3Nwcml0ZS9kcmF3U3ByaXRlLmpzJyksXG4gICdzcHJpdGUnOiByZXF1aXJlKCcuL2VudGl0aWVzL3Nwcml0ZS5qcycpLFxuICAndGltZXInOiByZXF1aXJlKCcuL2VudGl0aWVzL3RpbWVyLmpzJylcbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnZhbHVlID0gMTAwO1xuICB9LFxuICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnZhbHVlKys7XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudiA9IDEwMTtcbiAgICB0aGlzLnZhbHVlID0gMDtcbiAgICB0aGlzLmMgPSBveC5lbnRpdGllcy5zcGF3bignY291bnRlcicpO1xuICB9LFxuICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnZhbHVlKys7XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIG94LnNwYXduKCdwb25leScpO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnggPSAwO1xuICB9LFxuXG4gIGRyYXc6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLngrKztcbiAgICBveC5jb250ZXh0LmZpbGxTdHlsZSA9ICdibHVlJ1xuICAgIG94LmNvbnRleHQuZmlsbFJlY3QoODAsIDgwLCAxMDAsIDIwMClcbiAgICBveC5jb250ZXh0LnN0cm9rZVN0eWxlID0gJ2dyZXknXG4gICAgb3guY29udGV4dC5zdHJva2VSZWN0KDgwLCA4MCwgMTAwLCAyMDApXG4gICAgb3guY29udGV4dC5kcmF3U3ByaXRlKCdwb255LnBuZycsIHRoaXMueCwgMCk7XG4gICAgb3guY29udGV4dC5kcmF3U3ByaXRlKCdwb255LnBuZycsIHRoaXMueCArIDEwLCAwKTtcbiAgfVxufTtcbiIsInZhciBkcmF3U3ByaXRlID0gcmVxdWlyZSgnLi9zcHJpdGUvZHJhd1Nwcml0ZScpLFxuICAgIGFuaW1hdGVkID0gcmVxdWlyZSgnLi9zcHJpdGUvYW5pbWF0ZWQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNvdXJjZVdpZHRoID0gb3guaW1hZ2VzW3RoaXMuc291cmNlXS53aWR0aDtcbiAgICAgICAgdGhpcy5zb3VyY2VIZWlnaHQgPSBveC5pbWFnZXNbdGhpcy5zb3VyY2VdLmhlaWdodDtcbiAgICAgICAgdGhpcy53aWR0aCA9IHRoaXMud2lkdGggfHwgdGhpcy5zb3VyY2VXaWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLmhlaWdodCB8fCB0aGlzLnNvdXJjZUhlaWdodDtcbiAgICAgICAgdGhpcy54ID0gdGhpcy54IHx8IDA7XG4gICAgICAgIHRoaXMueSA9IHRoaXMueSB8fCAwO1xuXG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbikgYW5pbWF0ZWQuY2FsbCh0aGlzKTtcbiAgICB9LFxuXG4gICAgZHJhdzogZnVuY3Rpb24gKCkge1xuICAgICAgICBkcmF3U3ByaXRlKHRoaXMuc291cmNlLCB0aGlzLngsIHRoaXMueSk7XG4gICAgfVxufTsiLCJ2YXIgZHJhd1Nwcml0ZSA9IHJlcXVpcmUoJy4vZHJhd1Nwcml0ZScpLFxuICAgIGluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuaXNQbGF5aW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pc0ZpbmlzaGVkID0gZmFsc2U7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5sb29wICE9PSAnYm9vbGVhbicpIHRoaXMubG9vcCA9IHRydWU7XG4gICAgICAgIHRoaXMuY291bnRlciA9IDA7XG4gICAgICAgIHRoaXMuZnJhbWVSYXRlID0gdGhpcy5mcmFtZVJhdGUgfHwgMzA7XG4gICAgICAgIHRoaXMucGF1c2UgPSBwYXVzZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnBsYXkgPSBwbGF5LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuZmluaXNoZWQgPSBmaW5pc2hlZC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnVwZGF0ZSA9IHVwZGF0ZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmRyYXcgPSBkcmF3LmJpbmQodGhpcyk7XG4gICAgICAgIGNhbGN1bGF0ZUZyYW1lcy5jYWxsKHRoaXMpO1xuXG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbnMpIHtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uQXJyYXkgPSB0aGlzLmFuaW1hdGlvbnNbdGhpcy5hbmltYXRpb25dO1xuICAgICAgICAgICAgdGhpcy5hcnJheUNvdW50ZXIgPSAwO1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IHRoaXMuYW5pbWF0aW9uQXJyYXlbdGhpcy5hcnJheUNvdW50ZXJdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IDA7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgY2FsY3VsYXRlRnJhbWVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgeCA9IDAsXG4gICAgICAgICAgICB5ID0gMDtcbiAgICAgICAgdGhpcy5mcmFtZXMgPSBbWzAsIDBdXTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IHRoaXMuc291cmNlSGVpZ2h0IC8gdGhpcy5oZWlnaHQgKiB0aGlzLnNvdXJjZVdpZHRoIC8gdGhpcy53aWR0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoeCA8IHRoaXMuc291cmNlV2lkdGggLyB0aGlzLndpZHRoIC0gMSkge1xuICAgICAgICAgICAgICAgIHgrKztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoeSA8IHRoaXMuc291cmNlSGVpZ2h0IC8gdGhpcy5oZWlnaHQgLSAxKSB7XG4gICAgICAgICAgICAgICAgeSsrO1xuICAgICAgICAgICAgICAgIHggPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5mcmFtZXMucHVzaChbeCwgeV0pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGRyYXcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGRyYXdTcHJpdGUodGhpcy5zb3VyY2UsIHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdGhpcy5mcmFtZXNbdGhpcy5mcmFtZV0pO1xuICAgIH0sXG5cbiAgICB1cGRhdGUgPSBmdW5jdGlvbiAoZHQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzUGxheWluZykgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5pc0ZpbmlzaGVkKSByZXR1cm4gdGhpcy5maW5pc2hlZCgpO1xuXG4gICAgICAgIHRoaXMuY291bnRlciArPSBkdCAqIDEwMDA7XG4gICAgICAgIGlmICh0aGlzLmNvdW50ZXIgPiAxMDAwIC8gdGhpcy5mcmFtZVJhdGUpIHtcbiAgICAgICAgICAgIHRoaXMuY291bnRlciA9IDA7XG4gICAgICAgICAgICBpZiAodGhpcy5hbmltYXRpb25zKSB7XG4gICAgICAgICAgICAgICAgbXVsdGlwbGVBbmltYXRpb25zLmNhbGwodGhpcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNpbmdsZUFuaW1hdGlvbi5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIG11bHRpcGxlQW5pbWF0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuYXJyYXlDb3VudGVyID09PSB0aGlzLmFuaW1hdGlvbkFycmF5Lmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5sb29wKSB0aGlzLmlzRmluaXNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IHRoaXMuYW5pbWF0aW9uQXJyYXlbMF07XG4gICAgICAgICAgICB0aGlzLmFycmF5Q291bnRlciA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFycmF5Q291bnRlcisrO1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IHRoaXMuYW5pbWF0aW9uQXJyYXlbdGhpcy5hcnJheUNvdW50ZXJdO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHNpbmdsZUFuaW1hdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuZnJhbWUgPT09ICh0aGlzLmZyYW1lcy5sZW5ndGggLSAxKSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmxvb3ApIHRoaXMuaXNGaW5pc2hlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmZyYW1lID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZnJhbWUgKz0gMTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBmaW5pc2hlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5wYXVzZSgpO1xuICAgICAgICBpZiAodGhpcy5jYWxsYmFjaykgdGhpcy5jYWxsYmFjaygpO1xuICAgIH0sXG5cbiAgICBwbGF5ID0gZnVuY3Rpb24gKGFuaW1hdGlvbiwgb3B0aW9ucykge1xuICAgICAgICBpZiAob3B0aW9ucykge1xuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICB0aGlzW2tleV0gPSBvcHRpb25zW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5hbmltYXRpb25zKSB7XG4gICAgICAgICAgICBpZiAoYW5pbWF0aW9uKSB0aGlzLmFuaW1hdGlvbiA9IGFuaW1hdGlvbjtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uQXJyYXkgPSB0aGlzLmFuaW1hdGlvbnNbdGhpcy5hbmltYXRpb25dO1xuICAgICAgICAgICAgdGhpcy5hcnJheUNvdW50ZXIgPSAwO1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IHRoaXMuYW5pbWF0aW9uQXJyYXlbdGhpcy5hcnJheUNvdW50ZXJdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaXNGaW5pc2hlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzUGxheWluZyA9IHRydWU7XG4gICAgfSxcblxuICAgIHBhdXNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmlzUGxheWluZyA9IGZhbHNlO1xuICAgIH07XG5cbm1vZHVsZS5leHBvcnRzID0gaW5pdDsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChzcmMsIHgsIHksIHdpZHRoLCBoZWlnaHQsIGZyYW1lKSB7XG4gICAgaWYgKHR5cGVvZiB3aWR0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgb3guY29udGV4dC5kcmF3SW1hZ2UoXG4gICAgICAgICAgICBveC5pbWFnZXNbc3JjXSxcbiAgICAgICAgICAgIHdpZHRoICogZnJhbWVbMF0sXG4gICAgICAgICAgICBoZWlnaHQgKiBmcmFtZVsxXSxcbiAgICAgICAgICAgIHdpZHRoLCBoZWlnaHQsIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG94LmNvbnRleHQuZHJhd0ltYWdlKG94LmltYWdlc1tzcmNdLCB4LCB5KTtcbiAgICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnZhbHVlID0gMDtcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0aGlzLnRhcmdldCB8fCAxMDAwO1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gdGhpcy5jYWxsYmFjayB8fCBmdW5jdGlvbiAoKSB7fTtcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IE1hdGgucm91bmQodGhpcy52YWx1ZSArIGR0ICogMTAwMCk7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlID49IHRoaXMudGFyZ2V0KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsYmFjay5jYWxsKHRoaXMuY29udGV4dCwgdGhpcy52YWx1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsbGJhY2sodGhpcy52YWx1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmxvb3ApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNhYmxlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVzdGFydDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnZhbHVlID0gMDtcbiAgICAgICAgdGhpcy5lbmFibGUoKTtcbiAgICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICdlbXB0eSc6IHJlcXVpcmUoJy4vc2NlbmVzL2VtcHR5LmpzJyksXG4gICdsb2FkaW5nJzogcmVxdWlyZSgnLi9zY2VuZXMvbG9hZGluZy5qcycpLFxuICAnbWFpbic6IHJlcXVpcmUoJy4vc2NlbmVzL21haW4uanMnKVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIG94LnNjZW5lcy5zZXQoJ21haW4nKTtcbiAgICB9XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgb3gucHJlbG9hZGVyLmxvYWQocmVxdWlyZSgnLi4vYXNzZXRzJykpO1xuICAgICAgICB0aGlzLmJhckxlbmd0aCA9IG94LnByZWxvYWRlci5hc3NldHNUb0xvYWQ7XG4gICAgfSxcblxuICAgIGRyYXc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgb3guY29udGV4dC5maWxsU3R5bGUgPSBcImJsYWNrXCI7XG4gICAgICAgIG94LmNvbnRleHQuZmlsbFJlY3QoMCwgMCwgb3guY2FudmFzLndpZHRoLCBveC5jYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgb3guY29udGV4dC5maWxsU3R5bGUgPSBcInJnYig0NiwgMjM4LCAyNDUpXCI7XG4gICAgICAgIG94LmNvbnRleHQuZmlsbFJlY3Qob3guY2FudmFzLndpZHRoIC8gNCwgb3guY2FudmFzLmhlaWdodCAvIDIgKyAzMiwgb3guY2FudmFzLndpZHRoIC8gMiwgMSk7XG4gICAgICAgIG94LmNvbnRleHQuZmlsbFN0eWxlID0gXCJncmV5XCI7XG4gICAgICAgIG94LmNvbnRleHQuc2F2ZSgpO1xuICAgICAgICBveC5jb250ZXh0LnRyYW5zbGF0ZShveC5jYW52YXMud2lkdGggLyA0LCAyICogb3guY2FudmFzLmhlaWdodCAvIDMpO1xuICAgICAgICBveC5jb250ZXh0LnNjYWxlKC0xLCAxKTtcbiAgICAgICAgb3guY29udGV4dC5maWxsUmVjdCgtb3guY2FudmFzLndpZHRoIC8gMiwgMCwgb3guY2FudmFzLndpZHRoIC8gMiAqIG94LnByZWxvYWRlci5hc3NldHNUb0xvYWQgLyB0aGlzLmJhckxlbmd0aCwgMSk7XG4gICAgICAgIG94LmNvbnRleHQucmVzdG9yZSgpO1xuICAgICAgICBveC5jb250ZXh0LmZpbGxTdHlsZSA9IFwid2hpdGVcIjtcbiAgICAgICAgb3guY29udGV4dC5mb250ID0gJzIwMCUgc2Fucy1zZXJpZic7XG4gICAgICAgIG94LmNvbnRleHQuZmlsbFRleHQoJ2xvYWRpbmcuLi4nLCBveC5jYW52YXMud2lkdGggLyAyIC0gNjgsIG94LmNhbnZhcy5oZWlnaHQgLyAyICsgMTApO1xuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKG94LnByZWxvYWRlci5hc3NldHNUb0xvYWQgPT09IDApIG94LnNjZW5lcy5zZXQoJ21haW4nKTtcbiAgICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNwcml0ZTIgPSBveC5zcGF3bignc3ByaXRlJywge1xuICAgICAgICAgICAgc291cmNlOiAnY29pbjIucG5nJyxcbiAgICAgICAgICAgIGFuaW1hdGlvbjogJ3NwaW4nLFxuICAgICAgICAgICAgYW5pbWF0aW9uczoge1xuICAgICAgICAgICAgICAgIHNwaW46IFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5XSxcbiAgICAgICAgICAgICAgICBpZGxlOiBbOCwgNCwgOCwgNCwgOCwgNCwgOCwgNCwgOCwgNCwgOCwgNCwgOCwgNCwgOCwgNF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBoZWlnaHQ6IDQwLFxuICAgICAgICAgICAgZnJhbWVSYXRlOiAxLFxuICAgICAgICAgICAgd2lkdGg6IDQ0XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc3ByaXRlMyA9IG94LnNwYXduKCdzcHJpdGUnLCB7XG4gICAgICAgICAgICBzb3VyY2U6ICdwb255LnBuZycsXG4gICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgeTogMTAwXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc3ByaXRlNCA9IG94LnNwYXduKCdzcHJpdGUnLCB7XG4gICAgICAgICAgICBzb3VyY2U6ICdwb255LnBuZycsXG4gICAgICAgICAgICB4OiAxMDAsXG4gICAgICAgICAgICB5OiAxMDBcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zcHJpdGU0ID0gb3guc3Bhd24oJ3Nwcml0ZScsIHtcbiAgICAgICAgICAgIHNvdXJjZTogJ3BvbnkucG5nJyxcbiAgICAgICAgICAgIHg6IDIwMCxcbiAgICAgICAgICAgIHk6IDEwMFxuICAgICAgICB9KTtcblxuICAgICAgICBveC5zcGF3bigndGltZXInLCB7XG4gICAgICAgICAgICB0YXJnZXQ6IDEwMDAsXG4gICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codmFsdWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlNC55ICs9IC0xMDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zcHJpdGU0LnkgPCAwKSB0aGlzLnNwcml0ZTQueSA9IDIwMDtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICBveC5zY2VuZXMuc2V0KCdtYWlubycpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnRleHQ6IHRoaXNcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG4gICAgICAgIC8vICAgICAgICB0aGlzLnNwcml0ZTIueCA9IG94Lm1vdXNlLng7XG4gICAgICAgIC8vICAgICAgICB0aGlzLnNwcml0ZTIueSA9IG94Lm1vdXNlLnk7XG5cbiAgICAgICAgLy8gICAgICAgIG94LmNhbWVyYS5zZXQob3gubW91c2UueCwgb3gubW91c2UueSk7XG4gICAgfSxcblxuICAgIGtleURvd246IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJrZXlEb3duOiBcIiArIGtleSk7XG4gICAgfSxcblxuICAgIGtleVByZXNzOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2V5UHJlc3M6IFwiICsga2V5KTtcbiAgICB9LFxuXG4gICAga2V5VXA6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJrZXlVcDogXCIgKyBrZXkpO1xuICAgIH0sXG5cbiAgICBtb3VzZURvd246IGZ1bmN0aW9uIChidXR0b24pIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJDbGlja2VkIGF0OiBcIiArIG94Lm1vdXNlLnggKyBcIiwgXCIgKyBveC5tb3VzZS55ICsgXCIgd2l0aCB0aGUgXCIgKyBidXR0b24gKyBcIiBidXR0b24uXCIpO1xuICAgIH0sXG5cbiAgICBtb3VzZVVwOiBmdW5jdGlvbiAoYnV0dG9uKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiUmVsZWFzZWQgYXQ6IFwiICsgb3gubW91c2UueCArIFwiLCBcIiArIG94Lm1vdXNlLnkgKyBcIiB3aXRoIHRoZSBcIiArIGJ1dHRvbiArIFwiIGJ1dHRvbi5cIik7XG4gICAgfVxufTtcbiJdfQ==
