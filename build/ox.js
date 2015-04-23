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
var clearEntities = require('./entitiesManager').clear,
    list = require('../scenes.js');

module.exports = {
    current: null,
    set: function (name) {
        if (!list[name]) throw new Error("Scene [" + name + "] does not exist!");
        clearEntities();
        this.current = list[name];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9hc3NldHMuanMiLCJzcmMvZW5naW5lL2NhbWVyYS5qcyIsInNyYy9lbmdpbmUvY2FudmFzLmpzIiwic3JjL2VuZ2luZS9jb3JlLmpzIiwic3JjL2VuZ2luZS9lbnRpdGllc01hbmFnZXIuanMiLCJzcmMvZW5naW5lL2dhbWVMb29wLmpzIiwic3JjL2VuZ2luZS9rZXlib2FyZC5qcyIsInNyYy9lbmdpbmUvbG9hZGVyLmpzIiwic3JjL2VuZ2luZS9sb2NhbFN0b3JhZ2UuanMiLCJzcmMvZW5naW5lL21vdXNlLmpzIiwic3JjL2VuZ2luZS9zY2VuZXNNYW5hZ2VyLmpzIiwic3JjL2VudGl0aWVzLmpzIiwic3JjL2VudGl0aWVzL2NvdW50ZXIuanMiLCJzcmMvZW50aXRpZXMvY291bnRlcjIuanMiLCJzcmMvZW50aXRpZXMvcGxheWVyLmpzIiwic3JjL2VudGl0aWVzL3BvbmV5LmpzIiwic3JjL2VudGl0aWVzL3Nwcml0ZS5qcyIsInNyYy9lbnRpdGllcy9zcHJpdGUvYW5pbWF0ZWQuanMiLCJzcmMvZW50aXRpZXMvc3ByaXRlL2RyYXdTcHJpdGUuanMiLCJzcmMvZW50aXRpZXMvdGltZXIuanMiLCJzcmMvc2NlbmVzLmpzIiwic3JjL3NjZW5lcy9lbXB0eS5qcyIsInNyYy9zY2VuZXMvbG9hZGluZy5qcyIsInNyYy9zY2VuZXMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSBbXG4gICcuL2ltYWdlcy9jb2luLnBuZycsXG4gICcuL2ltYWdlcy9jb2luMi5wbmcnLFxuICAnLi9pbWFnZXMvY29pblR3aXN0ZWQucG5nJyxcbiAgJy4vaW1hZ2VzL3BvbnkucG5nJyxcbiAgJy4vZGF0YS9leGFtcGxlLmpzb24nLFxuICAnLi9hdWRpby90aGVfaGVhdnkubXAzJ1xuXTsiLCJ2YXIgY29udGV4dCA9IHJlcXVpcmUoJy4vY2FudmFzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHNldDogZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICB9LFxuXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29udGV4dC5zYXZlKCk7XG4gICAgICAgIGNvbnRleHQudHJhbnNsYXRlKHRoaXMueCwgdGhpcy55KTtcbiAgICB9XG59O1xuIiwidmFyIGtleWJvYXJkID0gcmVxdWlyZSgnLi9rZXlib2FyZCcpLFxuICAgIG1vdXNlID0gcmVxdWlyZSgnLi9tb3VzZScpLFxuICAgIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKSxcbiAgICBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbmNhbnZhcy50YWJJbmRleCA9IDEwMDA7XG5jYW52YXMuc3R5bGUub3V0bGluZSA9IFwibm9uZVwiO1xuY2FudmFzLm9ua2V5ZG93biA9IGtleWJvYXJkLmtleURvd24uYmluZChrZXlib2FyZCk7XG5jYW52YXMub25rZXl1cCA9IGtleWJvYXJkLmtleVVwLmJpbmQoa2V5Ym9hcmQpO1xuY2FudmFzLm9ubW91c2Vtb3ZlID0gbW91c2Uub25Nb3ZlLmJpbmQobW91c2UpO1xuY2FudmFzLm9ubW91c2Vkb3duID0gbW91c2Uub25Eb3duLmJpbmQobW91c2UpO1xuY2FudmFzLm9ubW91c2V1cCA9IG1vdXNlLm9uVXAuYmluZChtb3VzZSk7XG5jYW52YXMuc3R5bGUuY3Vyc29yID0gXCJub25lXCI7XG5jYW52YXMub25jb250ZXh0bWVudSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbnRleHQ7XG4iLCJ3aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMub3ggPSB7XG4gICAgICAgIGNhbnZhczogcmVxdWlyZSgnLi9jYW52YXMnKS5jYW52YXMsXG4gICAgICAgIGNvbnRleHQ6IHJlcXVpcmUoJy4vY2FudmFzJyksXG4gICAgICAgIGNhbWVyYTogcmVxdWlyZSgnLi9jYW1lcmEnKSxcbiAgICAgICAgaW1hZ2VzOiByZXF1aXJlKCcuL2xvYWRlcicpLmltYWdlcyxcbiAgICAgICAgYXVkaW86IHJlcXVpcmUoJy4vbG9hZGVyJykuYXVkaW8sXG4gICAgICAgIGRhdGE6IHJlcXVpcmUoJy4vbG9hZGVyJykuZGF0YSxcbiAgICAgICAga2V5Ym9hcmQ6IHJlcXVpcmUoJy4va2V5Ym9hcmQnKSxcbiAgICAgICAgbW91c2U6IHJlcXVpcmUoJy4vbW91c2UnKSxcbiAgICAgICAgc2NlbmVzOiByZXF1aXJlKCcuL3NjZW5lc01hbmFnZXInKSxcbiAgICAgICAgZW50aXRpZXM6IHJlcXVpcmUoJy4vZW50aXRpZXNNYW5hZ2VyJyksXG4gICAgICAgIHNhdmU6IHJlcXVpcmUoJy4vbG9jYWxTdG9yYWdlJyksXG4gICAgICAgIGxvb3A6IHJlcXVpcmUoJy4vZ2FtZUxvb3AnKSxcbiAgICAgICAgcHJlbG9hZGVyOiByZXF1aXJlKCcuL2xvYWRlcicpLFxuICAgICAgICBzcGF3bjogcmVxdWlyZSgnLi9lbnRpdGllc01hbmFnZXInKS5zcGF3blxuICAgIH07XG5cbiAgICBveC5zY2VuZXMuc2V0KCdsb2FkaW5nJyk7XG4gICAgb3gubG9vcC5pbml0KCk7XG59OyIsInZhciBsaXN0ID0gcmVxdWlyZSgnLi4vZW50aXRpZXMnKSxcbiAgICBjdXJyZW50ID0gW10sXG4gICAgdG9VcGRhdGUgPSBbXSxcbiAgICB0b0RyYXcgPSBbXSxcbiAgICBzcGF3biA9IGZ1bmN0aW9uICh0eXBlLCBvcHRpb25zKSB7XG4gICAgICAgIGlmICghbGlzdFt0eXBlXSkgdGhyb3cgbmV3IEVycm9yKFwiRW50aXR5IFtcIiArIHR5cGUgKyBcIl0gZG9lcyBub3QgZXhpc3QgYW5kIGNhbm5vdCBiZSBzcGF3bmVkLlwiKTtcbiAgICAgICAgdmFyIG9iaiA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBsaXN0W3R5cGVdKSB7XG4gICAgICAgICAgICBvYmpba2V5XSA9IGxpc3RbdHlwZV1ba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBvYmouZGlzYWJsZSA9IGRpc2FibGUuYmluZChvYmopO1xuICAgICAgICBvYmouZW5hYmxlID0gZW5hYmxlLmJpbmQob2JqKTtcbiAgICAgICAgb2JqLmlkID0gY3VycmVudC5sZW5ndGg7XG4gICAgICAgIG9iai50eXBlID0gdHlwZTtcbiAgICAgICAgY3VycmVudC5wdXNoKG9iaik7XG4gICAgICAgIGlmIChvYmouaW5pdCkgb2JqLmluaXQoKTtcbiAgICAgICAgb2JqLmVuYWJsZSgpO1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH0sXG4gICAgZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRvRHJhdy5pbmRleE9mKHRoaXMuaWQpID4gMCkgdG9EcmF3LnNwbGljZSh0b0RyYXcuaW5kZXhPZih0aGlzLmlkKSwgMSk7XG4gICAgICAgIGlmICh0b1VwZGF0ZS5pbmRleE9mKHRoaXMuaWQpID4gMCkgdG9VcGRhdGUuc3BsaWNlKHRvVXBkYXRlLmluZGV4T2YodGhpcy5pZCksIDEpO1xuICAgIH0sXG4gICAgZW5hYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy51cGRhdGUpIHRvVXBkYXRlLnB1c2godGhpcy5pZCk7XG4gICAgICAgIGlmICh0aGlzLmRyYXcpIHRvRHJhdy5wdXNoKHRoaXMuaWQpO1xuICAgIH0sXG4gICAgY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGN1cnJlbnQuc3BsaWNlKDAsIGN1cnJlbnQubGVuZ3RoKTtcbiAgICAgICAgdG9VcGRhdGUuc3BsaWNlKDAsIHRvVXBkYXRlLmxlbmd0aCk7XG4gICAgICAgIHRvRHJhdy5zcGxpY2UoMCwgdG9EcmF3Lmxlbmd0aCk7XG4gICAgfTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY3VycmVudDogY3VycmVudCxcbiAgICBsaXN0OiBsaXN0LFxuICAgIHRvRHJhdzogdG9EcmF3LFxuICAgIHRvVXBkYXRlOiB0b1VwZGF0ZSxcbiAgICBzcGF3bjogc3Bhd24sXG4gICAgY2xlYXI6IGNsZWFyXG59O1xuIiwidmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi9lbnRpdGllc01hbmFnZXInKSxcbiAgICB0b0RyYXcgPSBlbnRpdGllcy50b0RyYXcsXG4gICAgdG9VcGRhdGUgPSBlbnRpdGllcy50b1VwZGF0ZSxcbiAgICBzY2VuZXMgPSByZXF1aXJlKCcuL3NjZW5lc01hbmFnZXInKSxcbiAgICBjb250ZXh0ID0gcmVxdWlyZSgnLi9jYW52YXMnKSxcbiAgICBjYW1lcmEgPSByZXF1aXJlKCcuL2NhbWVyYScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzcGVlZDogMSxcbiAgICBkdDogMCxcbiAgICBzdGVwOiAxIC8gNjAsXG4gICAgbGFzdERlbHRhOiBuZXcgRGF0ZSgpLFxuICAgIG5vdzogbmV3IERhdGUoKSxcbiAgICBjYWxjdWxhdGVEZWx0YTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmxhc3REZWx0YSA9IHRoaXMubm93O1xuICAgICAgICB0aGlzLm5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICAgIHRoaXMuZHQgKz0gTWF0aC5taW4oMSwgKHRoaXMubm93IC0gdGhpcy5sYXN0RGVsdGEpIC8gMTAwMCkgKiB0aGlzLnNwZWVkO1xuICAgIH0sXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoc2NlbmVzLmlzQ2hhbmdpbmcpIHRoaXMuZHQgPSAwO1xuICAgICAgICB0aGlzLmNhbGN1bGF0ZURlbHRhKCk7XG4gICAgICAgIHdoaWxlICh0aGlzLmR0ID4gdGhpcy5zdGVwKSB7XG4gICAgICAgICAgICB0aGlzLmR0IC09IHRoaXMuc3RlcDtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKHRoaXMuc3RlcCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kcmF3KHRoaXMuZHQpO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5pbml0LmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICBkcmF3OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIGNvbnRleHQuY2FudmFzLndpZHRoLCBjb250ZXh0LmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICAvLyAgICBjYW1lcmEuc3RhcnQoKTtcbiAgICAgICAgaWYgKHNjZW5lcy5jdXJyZW50LmRyYXcpIHNjZW5lcy5jdXJyZW50LmRyYXcoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRvRHJhdy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgaWYgKGVudGl0aWVzLmN1cnJlbnRbdG9EcmF3W2ldXSAhPT0gdW5kZWZpbmVkICYmIGVudGl0aWVzLmN1cnJlbnRbdG9EcmF3W2ldXS5kcmF3ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBlbnRpdGllcy5jdXJyZW50W3RvRHJhd1tpXV0uZHJhdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gICAgY29udGV4dC5yZXN0b3JlKCk7XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG4gICAgICAgIGlmIChzY2VuZXMuY3VycmVudC51cGRhdGUpIHNjZW5lcy5jdXJyZW50LnVwZGF0ZShkdCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0b1VwZGF0ZS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgaWYgKGVudGl0aWVzLmN1cnJlbnRbdG9VcGRhdGVbaV1dICE9PSB1bmRlZmluZWQgJiYgZW50aXRpZXMuY3VycmVudFt0b1VwZGF0ZVtpXV0udXBkYXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBlbnRpdGllcy5jdXJyZW50W3RvVXBkYXRlW2ldXS51cGRhdGUoZHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbn07XG4iLCJ2YXIgc2NlbmUgPSByZXF1aXJlKCcuL3NjZW5lc01hbmFnZXInKTtcbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGlzUHJlc3NlZDoge30sXG5cbiAgICBrZXlEb3duOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAzMiB8fCAoZS5rZXlDb2RlID49IDM3ICYmIGUua2V5Q29kZSA8PSA0MCkpIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKHNjZW5lLmN1cnJlbnQua2V5RG93bikgc2NlbmUuY3VycmVudC5rZXlEb3duKHRoaXMua2V5c1tlLmtleUNvZGVdKTtcbiAgICAgICAgdGhpcy5rZXlQcmVzcyhlKTtcbiAgICB9LFxuXG4gICAga2V5UHJlc3M6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmICh0aGlzLmlzUHJlc3NlZFtlLmtleUNvZGVdKSByZXR1cm47XG4gICAgICAgIGlmIChzY2VuZS5jdXJyZW50LmtleVByZXNzKSBzY2VuZS5jdXJyZW50LmtleVByZXNzKHRoaXMua2V5c1tlLmtleUNvZGVdKTtcbiAgICAgICAgdGhpcy5pc1ByZXNzZWRbZS5rZXlDb2RlXSA9IHRydWU7XG4gICAgfSxcblxuICAgIGtleVVwOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoc2NlbmUuY3VycmVudC5rZXlVcCkgc2NlbmUuY3VycmVudC5rZXlVcCh0aGlzLmtleXNbZS5rZXlDb2RlXSk7XG4gICAgICAgIHRoaXMuaXNQcmVzc2VkW2Uua2V5Q29kZV0gPSBmYWxzZTtcbiAgICB9LFxuXG4gICAga2V5czoge1xuICAgICAgICA4OiAnYmFja3NwYWNlJyxcbiAgICAgICAgOTogJ3RhYicsXG4gICAgICAgIDEzOiAnZW50ZXInLFxuICAgICAgICAxNjogJ3NoaWZ0JyxcbiAgICAgICAgMTc6ICdjdHJsJyxcbiAgICAgICAgMTg6ICdhbHQnLFxuICAgICAgICAxOTogJ3BhdXNlJyxcbiAgICAgICAgMjA6ICdjYXBzX2xvY2snLFxuICAgICAgICAyNzogJ2VzYycsXG4gICAgICAgIDMyOiAnc3BhY2ViYXInLFxuICAgICAgICAzMzogJ3BhZ2VfdXAnLFxuICAgICAgICAzNDogJ3BhZ2VfZG93bicsXG4gICAgICAgIDM1OiAnZW5kJyxcbiAgICAgICAgMzY6ICdob21lJyxcbiAgICAgICAgMzc6ICdsZWZ0JyxcbiAgICAgICAgMzg6ICd1cCcsXG4gICAgICAgIDM5OiAncmlnaHQnLFxuICAgICAgICA0MDogJ2Rvd24nLFxuICAgICAgICA0NDogJ3ByaW50X3NjcmVlbicsXG4gICAgICAgIDQ1OiAnaW5zZXJ0JyxcbiAgICAgICAgNDY6ICdkZWxldGUnLFxuICAgICAgICA0ODogJzAnLFxuICAgICAgICA0OTogJzEnLFxuICAgICAgICA1MDogJzInLFxuICAgICAgICA1MTogJzMnLFxuICAgICAgICA1MjogJzQnLFxuICAgICAgICA1MzogJzUnLFxuICAgICAgICA1NDogJzYnLFxuICAgICAgICA1NTogJzcnLFxuICAgICAgICA1NjogJzgnLFxuICAgICAgICA1NzogJzknLFxuICAgICAgICA2NTogJ2EnLFxuICAgICAgICA2NjogJ2InLFxuICAgICAgICA2NzogJ2MnLFxuICAgICAgICA2ODogJ2QnLFxuICAgICAgICA2OTogJ2UnLFxuICAgICAgICA3MDogJ2YnLFxuICAgICAgICA3MTogJ2cnLFxuICAgICAgICA3MjogJ2gnLFxuICAgICAgICA3MzogJ2knLFxuICAgICAgICA3NDogJ2onLFxuICAgICAgICA3NTogJ2snLFxuICAgICAgICA3NjogJ2wnLFxuICAgICAgICA3NzogJ20nLFxuICAgICAgICA3ODogJ24nLFxuICAgICAgICA3OTogJ28nLFxuICAgICAgICA4MDogJ3AnLFxuICAgICAgICA4MTogJ3EnLFxuICAgICAgICA4MjogJ3InLFxuICAgICAgICA4MzogJ3MnLFxuICAgICAgICA4NDogJ3QnLFxuICAgICAgICA4NTogJ3UnLFxuICAgICAgICA4NjogJ3YnLFxuICAgICAgICA4NzogJ3cnLFxuICAgICAgICA4ODogJ3gnLFxuICAgICAgICA4OTogJ3knLFxuICAgICAgICA5MDogJ3onLFxuICAgICAgICA5NjogJ251bV96ZXJvJyxcbiAgICAgICAgOTc6ICdudW1fb25lJyxcbiAgICAgICAgOTg6ICdudW1fdHdvJyxcbiAgICAgICAgOTk6ICdudW1fdGhyZWUnLFxuICAgICAgICAxMDA6ICdudW1fZm91cicsXG4gICAgICAgIDEwMTogJ251bV9maXZlJyxcbiAgICAgICAgMTAyOiAnbnVtX3NpeCcsXG4gICAgICAgIDEwMzogJ251bV9zZXZlbicsXG4gICAgICAgIDEwNDogJ251bV9laWdodCcsXG4gICAgICAgIDEwNTogJ251bV9uaW5lJyxcbiAgICAgICAgMTA2OiAnbnVtX211bHRpcGx5JyxcbiAgICAgICAgMTA3OiAnbnVtX3BsdXMnLFxuICAgICAgICAxMDk6ICdudW1fbWludXMnLFxuICAgICAgICAxMTA6ICdudW1fcGVyaW9kJyxcbiAgICAgICAgMTExOiAnbnVtX2RpdmlzaW9uJyxcbiAgICAgICAgMTEyOiAnZjEnLFxuICAgICAgICAxMTM6ICdmMicsXG4gICAgICAgIDExNDogJ2YzJyxcbiAgICAgICAgMTE1OiAnZjQnLFxuICAgICAgICAxMTY6ICdmNScsXG4gICAgICAgIDExNzogJ2Y2JyxcbiAgICAgICAgMTE4OiAnZjcnLFxuICAgICAgICAxMTk6ICdmOCcsXG4gICAgICAgIDEyMDogJ2Y5JyxcbiAgICAgICAgMTIxOiAnZjEwJyxcbiAgICAgICAgMTIyOiAnZjExJyxcbiAgICAgICAgMTIzOiAnZjEyJyxcbiAgICAgICAgMTg2OiAnc2VtaWNvbG9uJyxcbiAgICAgICAgMTg3OiAncGx1cycsXG4gICAgICAgIDE4OTogJ21pbnVzJyxcbiAgICAgICAgMTkyOiAnZ3JhdmVfYWNjZW50JyxcbiAgICAgICAgMjIyOiAnc2luZ2xlX3F1b3RlJ1xuICAgIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbWFnZXM6IHt9LFxuICAgIGRhdGE6IHt9LFxuICAgIGF1ZGlvOiB7fSxcbiAgICBhc3NldHNUb0xvYWQ6IDAsXG5cbiAgICBsb2FkSW1hZ2U6IGZ1bmN0aW9uIChwYXRoKSB7XG4gICAgICAgIHZhciBuYW1lID0gcGF0aC5zbGljZSg5LCBwYXRoLmxlbmd0aCk7XG4gICAgICAgIHRoaXMuaW1hZ2VzW25hbWVdID0gbmV3IEltYWdlKCk7XG4gICAgICAgIHRoaXMuaW1hZ2VzW25hbWVdLm9ubG9hZCA9IHRoaXMuYXNzZXRzVG9Mb2FkLS07XG4gICAgICAgIHRoaXMuaW1hZ2VzW25hbWVdLnNyYyA9IHBhdGg7XG4gICAgfSxcblxuICAgIGxvYWREYXRhOiBmdW5jdGlvbiAocGF0aCkge1xuICAgICAgICB2YXIgZmlsZSA9IHBhdGguc2xpY2UoNywgcGF0aC5sZW5ndGggLSA1KSxcbiAgICAgICAgICAgIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCAmJiB4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFbZmlsZV0gPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgIHNlbGYuYXNzZXRzVG9Mb2FkLS07XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHhoci5vcGVuKFwiR0VUXCIsIHBhdGgpO1xuICAgICAgICB4aHIuc2VuZCgpO1xuICAgIH0sXG5cbiAgICBsb2FkQXVkaW86IGZ1bmN0aW9uIChwYXRoKSB7XG4gICAgICAgIHZhciBuYW1lID0gcGF0aC5zbGljZSg4LCBwYXRoLmxlbmd0aCk7XG4gICAgICAgIHRoaXMuYXVkaW9bbmFtZV0gPSBuZXcgQXVkaW8ocGF0aCk7XG4gICAgICAgIHRoaXMuYXVkaW9bbmFtZV0ub25jYW5wbGF5dGhyb3VnaCA9IHRoaXMuYXNzZXRzVG9Mb2FkLS07XG4gICAgfSxcblxuICAgIGxvYWQ6IGZ1bmN0aW9uIChsaXN0KSB7XG4gICAgICAgIHRoaXMuYXNzZXRzVG9Mb2FkICs9IGxpc3QubGVuZ3RoO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGxpc3RbaV0uaW5kZXhPZignLi9pbWFnZXMnKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkSW1hZ2UobGlzdFtpXSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxpc3RbaV0uaW5kZXhPZignLi9kYXRhJykgPiAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZERhdGEobGlzdFtpXSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxpc3RbaV0uaW5kZXhPZignLi9hdWRpbycpID4gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRBdWRpbyhsaXN0W2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzdG9yZTogZnVuY3Rpb24gKG51bSwgb2JqKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKG51bSwgSlNPTi5zdHJpbmdpZnkob2JqKSk7XG4gICAgfSxcbiAgICBsb2FkOiBmdW5jdGlvbiAobnVtKSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKG51bSkpO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiAobnVtKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKG51bSk7XG4gICAgfVxufTtcbiIsInZhciBzY2VuZSA9IHJlcXVpcmUoJy4vc2NlbmVzTWFuYWdlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB4OiAwLFxuICAgIHk6IDAsXG4gICAgaXNEb3duOiBmYWxzZSxcblxuICAgIG9uTW92ZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgb3gubW91c2UueCA9IGUuY2xpZW50WCAtIG94LmNhbnZhcy5vZmZzZXRMZWZ0O1xuICAgICAgICBveC5tb3VzZS55ID0gZS5jbGllbnRZIC0gb3guY2FudmFzLm9mZnNldFRvcDtcbiAgICB9LFxuXG4gICAgb25VcDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKHNjZW5lLmN1cnJlbnQubW91c2VVcCkgc2NlbmUuY3VycmVudC5tb3VzZVVwKHRoaXMuYnV0dG9uc1tlLmJ1dHRvbl0pO1xuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICBvbkRvd246IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChzY2VuZS5jdXJyZW50Lm1vdXNlRG93bikgc2NlbmUuY3VycmVudC5tb3VzZURvd24odGhpcy5idXR0b25zW2UuYnV0dG9uXSk7XG4gICAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcbiAgICB9LFxuXG4gICAgYnV0dG9uczoge1xuICAgICAgICAwOiBcImxlZnRcIixcbiAgICAgICAgMTogXCJtaWRkbGVcIixcbiAgICAgICAgMjogXCJyaWdodFwiXG4gICAgfVxufTtcbiIsInZhciBjbGVhckVudGl0aWVzID0gcmVxdWlyZSgnLi9lbnRpdGllc01hbmFnZXInKS5jbGVhcixcbiAgICBsaXN0ID0gcmVxdWlyZSgnLi4vc2NlbmVzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGN1cnJlbnQ6IG51bGwsXG4gICAgc2V0OiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICBpZiAoIWxpc3RbbmFtZV0pIHRocm93IG5ldyBFcnJvcihcIlNjZW5lIFtcIiArIG5hbWUgKyBcIl0gZG9lcyBub3QgZXhpc3QhXCIpO1xuICAgICAgICBjbGVhckVudGl0aWVzKCk7XG4gICAgICAgIHRoaXMuY3VycmVudCA9IGxpc3RbbmFtZV07XG4gICAgICAgIHRoaXMuY3VycmVudC5pbml0KCk7XG4gICAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgJ2NvdW50ZXInOiByZXF1aXJlKCcuL2VudGl0aWVzL2NvdW50ZXIuanMnKSxcbiAgJ2NvdW50ZXIyJzogcmVxdWlyZSgnLi9lbnRpdGllcy9jb3VudGVyMi5qcycpLFxuICAncGxheWVyJzogcmVxdWlyZSgnLi9lbnRpdGllcy9wbGF5ZXIuanMnKSxcbiAgJ3BvbmV5JzogcmVxdWlyZSgnLi9lbnRpdGllcy9wb25leS5qcycpLFxuICAnc3ByaXRlL2FuaW1hdGVkJzogcmVxdWlyZSgnLi9lbnRpdGllcy9zcHJpdGUvYW5pbWF0ZWQuanMnKSxcbiAgJ3Nwcml0ZS9kcmF3U3ByaXRlJzogcmVxdWlyZSgnLi9lbnRpdGllcy9zcHJpdGUvZHJhd1Nwcml0ZS5qcycpLFxuICAnc3ByaXRlJzogcmVxdWlyZSgnLi9lbnRpdGllcy9zcHJpdGUuanMnKSxcbiAgJ3RpbWVyJzogcmVxdWlyZSgnLi9lbnRpdGllcy90aW1lci5qcycpXG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52YWx1ZSA9IDEwMDtcbiAgfSxcbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52YWx1ZSsrO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnYgPSAxMDE7XG4gICAgdGhpcy52YWx1ZSA9IDA7XG4gICAgdGhpcy5jID0gb3guZW50aXRpZXMuc3Bhd24oJ2NvdW50ZXInKTtcbiAgfSxcbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52YWx1ZSsrO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICBveC5zcGF3bigncG9uZXknKTtcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy54ID0gMDtcbiAgfSxcblxuICBkcmF3OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy54Kys7XG4gICAgb3guY29udGV4dC5maWxsU3R5bGUgPSAnYmx1ZSdcbiAgICBveC5jb250ZXh0LmZpbGxSZWN0KDgwLCA4MCwgMTAwLCAyMDApXG4gICAgb3guY29udGV4dC5zdHJva2VTdHlsZSA9ICdncmV5J1xuICAgIG94LmNvbnRleHQuc3Ryb2tlUmVjdCg4MCwgODAsIDEwMCwgMjAwKVxuICAgIG94LmNvbnRleHQuZHJhd1Nwcml0ZSgncG9ueS5wbmcnLCB0aGlzLngsIDApO1xuICAgIG94LmNvbnRleHQuZHJhd1Nwcml0ZSgncG9ueS5wbmcnLCB0aGlzLnggKyAxMCwgMCk7XG4gIH1cbn07XG4iLCJ2YXIgZHJhd1Nwcml0ZSA9IHJlcXVpcmUoJy4vc3ByaXRlL2RyYXdTcHJpdGUnKSxcbiAgICBhbmltYXRlZCA9IHJlcXVpcmUoJy4vc3ByaXRlL2FuaW1hdGVkJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zb3VyY2VXaWR0aCA9IG94LmltYWdlc1t0aGlzLnNvdXJjZV0ud2lkdGg7XG4gICAgICAgIHRoaXMuc291cmNlSGVpZ2h0ID0gb3guaW1hZ2VzW3RoaXMuc291cmNlXS5oZWlnaHQ7XG4gICAgICAgIHRoaXMud2lkdGggPSB0aGlzLndpZHRoIHx8IHRoaXMuc291cmNlV2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5oZWlnaHQgfHwgdGhpcy5zb3VyY2VIZWlnaHQ7XG4gICAgICAgIHRoaXMueCA9IHRoaXMueCB8fCAwO1xuICAgICAgICB0aGlzLnkgPSB0aGlzLnkgfHwgMDtcblxuICAgICAgICBpZiAodGhpcy5hbmltYXRpb24pIGFuaW1hdGVkLmNhbGwodGhpcyk7XG4gICAgfSxcblxuICAgIGRyYXc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZHJhd1Nwcml0ZSh0aGlzLnNvdXJjZSwgdGhpcy54LCB0aGlzLnkpO1xuICAgIH1cbn07XG4iLCJ2YXIgZHJhd1Nwcml0ZSA9IHJlcXVpcmUoJy4vZHJhd1Nwcml0ZScpLFxuICAgIGluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuaXNQbGF5aW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pc0ZpbmlzaGVkID0gZmFsc2U7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5sb29wICE9PSAnYm9vbGVhbicpIHRoaXMubG9vcCA9IHRydWU7XG4gICAgICAgIHRoaXMuY291bnRlciA9IDA7XG4gICAgICAgIHRoaXMuZnJhbWVSYXRlID0gdGhpcy5mcmFtZVJhdGUgfHwgMzA7XG4gICAgICAgIHRoaXMucGF1c2UgPSBwYXVzZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnBsYXkgPSBwbGF5LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuZmluaXNoZWQgPSBmaW5pc2hlZC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnVwZGF0ZSA9IHVwZGF0ZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmRyYXcgPSBkcmF3LmJpbmQodGhpcyk7XG4gICAgICAgIGNhbGN1bGF0ZUZyYW1lcy5jYWxsKHRoaXMpO1xuXG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbnMpIHtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uQXJyYXkgPSB0aGlzLmFuaW1hdGlvbnNbdGhpcy5hbmltYXRpb25dO1xuICAgICAgICAgICAgdGhpcy5hcnJheUNvdW50ZXIgPSAwO1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IHRoaXMuYW5pbWF0aW9uQXJyYXlbdGhpcy5hcnJheUNvdW50ZXJdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IDA7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgY2FsY3VsYXRlRnJhbWVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgeCA9IDAsXG4gICAgICAgICAgICB5ID0gMDtcbiAgICAgICAgdGhpcy5mcmFtZXMgPSBbWzAsIDBdXTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IHRoaXMuc291cmNlSGVpZ2h0IC8gdGhpcy5oZWlnaHQgKiB0aGlzLnNvdXJjZVdpZHRoIC8gdGhpcy53aWR0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoeCA8IHRoaXMuc291cmNlV2lkdGggLyB0aGlzLndpZHRoIC0gMSkge1xuICAgICAgICAgICAgICAgIHgrKztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoeSA8IHRoaXMuc291cmNlSGVpZ2h0IC8gdGhpcy5oZWlnaHQgLSAxKSB7XG4gICAgICAgICAgICAgICAgeSsrO1xuICAgICAgICAgICAgICAgIHggPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5mcmFtZXMucHVzaChbeCwgeV0pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGRyYXcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGRyYXdTcHJpdGUodGhpcy5zb3VyY2UsIHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdGhpcy5mcmFtZXNbdGhpcy5mcmFtZV0pO1xuICAgIH0sXG5cbiAgICB1cGRhdGUgPSBmdW5jdGlvbiAoZHQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzUGxheWluZykgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5pc0ZpbmlzaGVkKSByZXR1cm4gdGhpcy5maW5pc2hlZCgpO1xuXG4gICAgICAgIHRoaXMuY291bnRlciArPSBkdCAqIDEwMDA7XG4gICAgICAgIGlmICh0aGlzLmNvdW50ZXIgPiAxMDAwIC8gdGhpcy5mcmFtZVJhdGUpIHtcbiAgICAgICAgICAgIHRoaXMuY291bnRlciA9IDA7XG4gICAgICAgICAgICBpZiAodGhpcy5hbmltYXRpb25zKSB7XG4gICAgICAgICAgICAgICAgbXVsdGlwbGVBbmltYXRpb25zLmNhbGwodGhpcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNpbmdsZUFuaW1hdGlvbi5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIG11bHRpcGxlQW5pbWF0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuYXJyYXlDb3VudGVyID09PSB0aGlzLmFuaW1hdGlvbkFycmF5Lmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5sb29wKSB0aGlzLmlzRmluaXNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IHRoaXMuYW5pbWF0aW9uQXJyYXlbMF07XG4gICAgICAgICAgICB0aGlzLmFycmF5Q291bnRlciA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFycmF5Q291bnRlcisrO1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IHRoaXMuYW5pbWF0aW9uQXJyYXlbdGhpcy5hcnJheUNvdW50ZXJdO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHNpbmdsZUFuaW1hdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuZnJhbWUgPT09ICh0aGlzLmZyYW1lcy5sZW5ndGggLSAxKSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmxvb3ApIHRoaXMuaXNGaW5pc2hlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmZyYW1lID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZnJhbWUgKz0gMTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBmaW5pc2hlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5wYXVzZSgpO1xuICAgICAgICBpZiAodGhpcy5jYWxsYmFjaykgdGhpcy5jYWxsYmFjaygpO1xuICAgIH0sXG5cbiAgICBwbGF5ID0gZnVuY3Rpb24gKGFuaW1hdGlvbiwgb3B0aW9ucykge1xuICAgICAgICBpZiAob3B0aW9ucykge1xuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICB0aGlzW2tleV0gPSBvcHRpb25zW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5hbmltYXRpb25zKSB7XG4gICAgICAgICAgICBpZiAoYW5pbWF0aW9uKSB0aGlzLmFuaW1hdGlvbiA9IGFuaW1hdGlvbjtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uQXJyYXkgPSB0aGlzLmFuaW1hdGlvbnNbdGhpcy5hbmltYXRpb25dO1xuICAgICAgICAgICAgdGhpcy5hcnJheUNvdW50ZXIgPSAwO1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IHRoaXMuYW5pbWF0aW9uQXJyYXlbdGhpcy5hcnJheUNvdW50ZXJdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaXNGaW5pc2hlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzUGxheWluZyA9IHRydWU7XG4gICAgfSxcblxuICAgIHBhdXNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmlzUGxheWluZyA9IGZhbHNlO1xuICAgIH07XG5cbm1vZHVsZS5leHBvcnRzID0gaW5pdDtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHNyYywgeCwgeSwgd2lkdGgsIGhlaWdodCwgZnJhbWUpIHtcbiAgICBpZiAodHlwZW9mIHdpZHRoID09PSAnbnVtYmVyJykge1xuICAgICAgICBveC5jb250ZXh0LmRyYXdJbWFnZShcbiAgICAgICAgICAgIG94LmltYWdlc1tzcmNdLFxuICAgICAgICAgICAgd2lkdGggKiBmcmFtZVswXSxcbiAgICAgICAgICAgIGhlaWdodCAqIGZyYW1lWzFdLFxuICAgICAgICAgICAgd2lkdGgsIGhlaWdodCwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgb3guY29udGV4dC5kcmF3SW1hZ2Uob3guaW1hZ2VzW3NyY10sIHgsIHkpO1xuICAgIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSAwO1xuICAgICAgICB0aGlzLnRhcmdldCA9IHRoaXMudGFyZ2V0IHx8IDEwMDA7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSB0aGlzLmNhbGxiYWNrIHx8IGZ1bmN0aW9uICgpIHt9O1xuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuICAgICAgICB0aGlzLnZhbHVlID0gTWF0aC5yb3VuZCh0aGlzLnZhbHVlICsgZHQgKiAxMDAwKTtcbiAgICAgICAgaWYgKHRoaXMudmFsdWUgPj0gdGhpcy50YXJnZXQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrLmNhbGwodGhpcy5jb250ZXh0LCB0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsYmFjayh0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMubG9vcCkge1xuICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc2FibGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICByZXN0YXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSAwO1xuICAgICAgICB0aGlzLmVuYWJsZSgpO1xuICAgIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgJ2VtcHR5JzogcmVxdWlyZSgnLi9zY2VuZXMvZW1wdHkuanMnKSxcbiAgJ2xvYWRpbmcnOiByZXF1aXJlKCcuL3NjZW5lcy9sb2FkaW5nLmpzJyksXG4gICdtYWluJzogcmVxdWlyZSgnLi9zY2VuZXMvbWFpbi5qcycpXG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgb3guc2NlbmVzLnNldCgnbWFpbicpO1xuICAgIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIG94LnByZWxvYWRlci5sb2FkKHJlcXVpcmUoJy4uL2Fzc2V0cycpKTtcbiAgICAgICAgdGhpcy5iYXJMZW5ndGggPSBveC5wcmVsb2FkZXIuYXNzZXRzVG9Mb2FkO1xuICAgIH0sXG5cbiAgICBkcmF3OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIG94LmNvbnRleHQuZmlsbFN0eWxlID0gXCJibGFja1wiO1xuICAgICAgICBveC5jb250ZXh0LmZpbGxSZWN0KDAsIDAsIG94LmNhbnZhcy53aWR0aCwgb3guY2FudmFzLmhlaWdodCk7XG4gICAgICAgIG94LmNvbnRleHQuZmlsbFN0eWxlID0gXCJyZ2IoNDYsIDIzOCwgMjQ1KVwiO1xuICAgICAgICBveC5jb250ZXh0LmZpbGxSZWN0KG94LmNhbnZhcy53aWR0aCAvIDQsIG94LmNhbnZhcy5oZWlnaHQgLyAyICsgMzIsIG94LmNhbnZhcy53aWR0aCAvIDIsIDEpO1xuICAgICAgICBveC5jb250ZXh0LmZpbGxTdHlsZSA9IFwiZ3JleVwiO1xuICAgICAgICBveC5jb250ZXh0LnNhdmUoKTtcbiAgICAgICAgb3guY29udGV4dC50cmFuc2xhdGUob3guY2FudmFzLndpZHRoIC8gNCwgMiAqIG94LmNhbnZhcy5oZWlnaHQgLyAzKTtcbiAgICAgICAgb3guY29udGV4dC5zY2FsZSgtMSwgMSk7XG4gICAgICAgIG94LmNvbnRleHQuZmlsbFJlY3QoLW94LmNhbnZhcy53aWR0aCAvIDIsIDAsIG94LmNhbnZhcy53aWR0aCAvIDIgKiBveC5wcmVsb2FkZXIuYXNzZXRzVG9Mb2FkIC8gdGhpcy5iYXJMZW5ndGgsIDEpO1xuICAgICAgICBveC5jb250ZXh0LnJlc3RvcmUoKTtcbiAgICAgICAgb3guY29udGV4dC5maWxsU3R5bGUgPSBcIndoaXRlXCI7XG4gICAgICAgIG94LmNvbnRleHQuZm9udCA9ICcyMDAlIHNhbnMtc2VyaWYnO1xuICAgICAgICBveC5jb250ZXh0LmZpbGxUZXh0KCdsb2FkaW5nLi4uJywgb3guY2FudmFzLndpZHRoIC8gMiAtIDY4LCBveC5jYW52YXMuaGVpZ2h0IC8gMiArIDEwKTtcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChveC5wcmVsb2FkZXIuYXNzZXRzVG9Mb2FkID09PSAwKSBveC5zY2VuZXMuc2V0KCdtYWluJyk7XG4gICAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zcHJpdGUyID0gb3guc3Bhd24oJ3Nwcml0ZScsIHtcbiAgICAgICAgICAgIHNvdXJjZTogJ2NvaW4yLnBuZycsXG4gICAgICAgICAgICBhbmltYXRpb246ICdzcGluJyxcbiAgICAgICAgICAgIGFuaW1hdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBzcGluOiBbMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOV0sXG4gICAgICAgICAgICAgICAgaWRsZTogWzgsIDQsIDgsIDQsIDgsIDQsIDgsIDQsIDgsIDQsIDgsIDQsIDgsIDQsIDgsIDRdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaGVpZ2h0OiA0MCxcbiAgICAgICAgICAgIGZyYW1lUmF0ZTogMSxcbiAgICAgICAgICAgIHdpZHRoOiA0NFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNwcml0ZTMgPSBveC5zcGF3bignc3ByaXRlJywge1xuICAgICAgICAgICAgc291cmNlOiAncG9ueS5wbmcnLFxuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDEwMFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNwcml0ZTQgPSBveC5zcGF3bignc3ByaXRlJywge1xuICAgICAgICAgICAgc291cmNlOiAncG9ueS5wbmcnLFxuICAgICAgICAgICAgeDogMTAwLFxuICAgICAgICAgICAgeTogMTAwXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc3ByaXRlNCA9IG94LnNwYXduKCdzcHJpdGUnLCB7XG4gICAgICAgICAgICBzb3VyY2U6ICdwb255LnBuZycsXG4gICAgICAgICAgICB4OiAyMDAsXG4gICAgICAgICAgICB5OiAxMDBcbiAgICAgICAgfSk7XG5cbiAgICAgICAgb3guc3Bhd24oJ3RpbWVyJywge1xuICAgICAgICAgICAgdGFyZ2V0OiAxMDAwLFxuICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZTQueSArPSAtMTA7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3ByaXRlNC55IDwgMCkgdGhpcy5zcHJpdGU0LnkgPSAyMDA7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgb3guc2NlbmVzLnNldCgnbWFpbm8nKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb250ZXh0OiB0aGlzXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuICAgICAgICAvLyAgICAgICAgdGhpcy5zcHJpdGUyLnggPSBveC5tb3VzZS54O1xuICAgICAgICAvLyAgICAgICAgdGhpcy5zcHJpdGUyLnkgPSBveC5tb3VzZS55O1xuXG4gICAgICAgIC8vICAgICAgICBveC5jYW1lcmEuc2V0KG94Lm1vdXNlLngsIG94Lm1vdXNlLnkpO1xuICAgIH0sXG5cbiAgICBrZXlEb3duOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2V5RG93bjogXCIgKyBrZXkpO1xuICAgIH0sXG5cbiAgICBrZXlQcmVzczogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImtleVByZXNzOiBcIiArIGtleSk7XG4gICAgfSxcblxuICAgIGtleVVwOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2V5VXA6IFwiICsga2V5KTtcbiAgICB9LFxuXG4gICAgbW91c2VEb3duOiBmdW5jdGlvbiAoYnV0dG9uKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQ2xpY2tlZCBhdDogXCIgKyBveC5tb3VzZS54ICsgXCIsIFwiICsgb3gubW91c2UueSArIFwiIHdpdGggdGhlIFwiICsgYnV0dG9uICsgXCIgYnV0dG9uLlwiKTtcbiAgICB9LFxuXG4gICAgbW91c2VVcDogZnVuY3Rpb24gKGJ1dHRvbikge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlJlbGVhc2VkIGF0OiBcIiArIG94Lm1vdXNlLnggKyBcIiwgXCIgKyBveC5tb3VzZS55ICsgXCIgd2l0aCB0aGUgXCIgKyBidXR0b24gKyBcIiBidXR0b24uXCIpO1xuICAgIH1cbn07XG4iXX0=
