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
    isChanging: false,
    current: null,
    list: require('../scenes.js'),
    set: function (name) {
        if (!this.list[name]) throw new Error("Scene [" + name + "] does not exist!");
        clearEntities();
        //        this.isChanging = true;
        console.log(require('./entitiesManager').current, name);
        this.current = null;
        this.current = this.list[name];
        this.current.init();
        //        this.isChanging = false;
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
        this.srcWidth = ox.images[this.source].width;
        this.srcHeight = ox.images[this.source].height;
        this.width = this.width || this.srcWidth;
        this.height = this.height || this.srcHeight;
        this.x = this.x || 0;
        this.y = this.y || 0;

        if (this.animation) animated.call(this);
    },

    draw: function () {
        drawSprite(this.source, this.x, this.y);
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
    }
};
},{"./sprite/animated":18,"./sprite/drawSprite":19}],18:[function(require,module,exports){
var drawSprite = require('./drawSprite'),
    init = function () {
        this.isPlaying = true;
        this.isFinished = false;
        this.pause = pause.bind(this);
        this.play = play.bind(this);
        this.finished = finished.bind(this);
        this.update = update.bind(this);
        this.draw = draw.bind(this);
        if (typeof this.loop !== 'boolean') this.loop = true;
        this.counter = 0;
        this.frameRate = this.frameRate || 30;
        this.calculateFrames();

        if (this.animations) {
            this.animationArray = this.animations[this.animation];
            this.arrayCounter = 0;
            this.frame = this.animationArray[this.arrayCounter];
        } else {
            this.frame = 0;
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
        //        ox.scenes.set('main');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9hc3NldHMuanMiLCJzcmMvZW5naW5lL2NhbWVyYS5qcyIsInNyYy9lbmdpbmUvY2FudmFzLmpzIiwic3JjL2VuZ2luZS9jb3JlLmpzIiwic3JjL2VuZ2luZS9lbnRpdGllc01hbmFnZXIuanMiLCJzcmMvZW5naW5lL2dhbWVMb29wLmpzIiwic3JjL2VuZ2luZS9rZXlib2FyZC5qcyIsInNyYy9lbmdpbmUvbG9hZGVyLmpzIiwic3JjL2VuZ2luZS9sb2NhbFN0b3JhZ2UuanMiLCJzcmMvZW5naW5lL21vdXNlLmpzIiwic3JjL2VuZ2luZS9zY2VuZXNNYW5hZ2VyLmpzIiwic3JjL2VudGl0aWVzLmpzIiwic3JjL2VudGl0aWVzL2NvdW50ZXIuanMiLCJzcmMvZW50aXRpZXMvY291bnRlcjIuanMiLCJzcmMvZW50aXRpZXMvcGxheWVyLmpzIiwic3JjL2VudGl0aWVzL3BvbmV5LmpzIiwic3JjL2VudGl0aWVzL3Nwcml0ZS5qcyIsInNyYy9lbnRpdGllcy9zcHJpdGUvYW5pbWF0ZWQuanMiLCJzcmMvZW50aXRpZXMvc3ByaXRlL2RyYXdTcHJpdGUuanMiLCJzcmMvZW50aXRpZXMvdGltZXIuanMiLCJzcmMvc2NlbmVzLmpzIiwic3JjL3NjZW5lcy9lbXB0eS5qcyIsInNyYy9zY2VuZXMvbG9hZGluZy5qcyIsInNyYy9zY2VuZXMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gW1xuICAnLi9pbWFnZXMvY29pbi5wbmcnLFxuICAnLi9pbWFnZXMvY29pbjIucG5nJyxcbiAgJy4vaW1hZ2VzL2NvaW5Ud2lzdGVkLnBuZycsXG4gICcuL2ltYWdlcy9wb255LnBuZycsXG4gICcuL2RhdGEvZXhhbXBsZS5qc29uJyxcbiAgJy4vYXVkaW8vdGhlX2hlYXZ5Lm1wMydcbl07IiwidmFyIGNvbnRleHQgPSByZXF1aXJlKCcuL2NhbnZhcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzZXQ6IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgfSxcblxuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnRleHQuc2F2ZSgpO1xuICAgICAgICBjb250ZXh0LnRyYW5zbGF0ZSh0aGlzLngsIHRoaXMueSk7XG4gICAgfVxufTtcbiIsInZhciBrZXlib2FyZCA9IHJlcXVpcmUoJy4va2V5Ym9hcmQnKSxcbiAgICBtb3VzZSA9IHJlcXVpcmUoJy4vbW91c2UnKSxcbiAgICBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyksXG4gICAgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5jYW52YXMudGFiSW5kZXggPSAxMDAwO1xuY2FudmFzLnN0eWxlLm91dGxpbmUgPSBcIm5vbmVcIjtcbmNhbnZhcy5vbmtleWRvd24gPSBrZXlib2FyZC5rZXlEb3duLmJpbmQoa2V5Ym9hcmQpO1xuY2FudmFzLm9ua2V5dXAgPSBrZXlib2FyZC5rZXlVcC5iaW5kKGtleWJvYXJkKTtcbmNhbnZhcy5vbm1vdXNlbW92ZSA9IG1vdXNlLm9uTW92ZS5iaW5kKG1vdXNlKTtcbmNhbnZhcy5vbm1vdXNlZG93biA9IG1vdXNlLm9uRG93bi5iaW5kKG1vdXNlKTtcbmNhbnZhcy5vbm1vdXNldXAgPSBtb3VzZS5vblVwLmJpbmQobW91c2UpO1xuY2FudmFzLnN0eWxlLmN1cnNvciA9IFwibm9uZVwiO1xuY2FudmFzLm9uY29udGV4dG1lbnUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb250ZXh0OyIsIndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5veCA9IHtcbiAgICAgICAgY2FudmFzOiByZXF1aXJlKCcuL2NhbnZhcycpLmNhbnZhcyxcbiAgICAgICAgY29udGV4dDogcmVxdWlyZSgnLi9jYW52YXMnKSxcbiAgICAgICAgY2FtZXJhOiByZXF1aXJlKCcuL2NhbWVyYScpLFxuICAgICAgICBpbWFnZXM6IHJlcXVpcmUoJy4vbG9hZGVyJykuaW1hZ2VzLFxuICAgICAgICBhdWRpbzogcmVxdWlyZSgnLi9sb2FkZXInKS5hdWRpbyxcbiAgICAgICAgZGF0YTogcmVxdWlyZSgnLi9sb2FkZXInKS5kYXRhLFxuICAgICAgICBrZXlib2FyZDogcmVxdWlyZSgnLi9rZXlib2FyZCcpLFxuICAgICAgICBtb3VzZTogcmVxdWlyZSgnLi9tb3VzZScpLFxuICAgICAgICBzY2VuZXM6IHJlcXVpcmUoJy4vc2NlbmVzTWFuYWdlcicpLFxuICAgICAgICBlbnRpdGllczogcmVxdWlyZSgnLi9lbnRpdGllc01hbmFnZXInKSxcbiAgICAgICAgc2F2ZTogcmVxdWlyZSgnLi9sb2NhbFN0b3JhZ2UnKSxcbiAgICAgICAgbG9vcDogcmVxdWlyZSgnLi9nYW1lTG9vcCcpLFxuICAgICAgICBwcmVsb2FkZXI6IHJlcXVpcmUoJy4vbG9hZGVyJyksXG4gICAgICAgIHNwYXduOiByZXF1aXJlKCcuL2VudGl0aWVzTWFuYWdlcicpLnNwYXduXG4gICAgfTtcblxuICAgIG94LnNjZW5lcy5zZXQoJ2xvYWRpbmcnKTtcbiAgICBveC5sb29wLmluaXQoKTtcbn07IiwidmFyIGxpc3QgPSByZXF1aXJlKCcuLi9lbnRpdGllcycpLFxuICAgIGN1cnJlbnQgPSBbXSxcbiAgICB0b1VwZGF0ZSA9IFtdLFxuICAgIHRvRHJhdyA9IFtdLFxuICAgIHNwYXduID0gZnVuY3Rpb24gKHR5cGUsIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKCFsaXN0W3R5cGVdKSB0aHJvdyBuZXcgRXJyb3IoXCJFbnRpdHkgW1wiICsgdHlwZSArIFwiXSBkb2VzIG5vdCBleGlzdCBhbmQgY2Fubm90IGJlIHNwYXduZWQuXCIpO1xuICAgICAgICB2YXIgb2JqID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIGxpc3RbdHlwZV0pIHtcbiAgICAgICAgICAgIG9ialtrZXldID0gbGlzdFt0eXBlXVtrZXldO1xuICAgICAgICB9XG4gICAgICAgIG9iai5kaXNhYmxlID0gZGlzYWJsZS5iaW5kKG9iaik7XG4gICAgICAgIG9iai5lbmFibGUgPSBlbmFibGUuYmluZChvYmopO1xuICAgICAgICBvYmouaWQgPSBjdXJyZW50Lmxlbmd0aDtcbiAgICAgICAgb2JqLnR5cGUgPSB0eXBlO1xuICAgICAgICBjdXJyZW50LnB1c2gob2JqKTtcbiAgICAgICAgaWYgKG9iai5pbml0KSBvYmouaW5pdCgpO1xuICAgICAgICBvYmouZW5hYmxlKCk7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfSxcbiAgICBkaXNhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodG9EcmF3LmluZGV4T2YodGhpcy5pZCkgPiAwKSB0b0RyYXcuc3BsaWNlKHRvRHJhdy5pbmRleE9mKHRoaXMuaWQpLCAxKTtcbiAgICAgICAgaWYgKHRvVXBkYXRlLmluZGV4T2YodGhpcy5pZCkgPiAwKSB0b1VwZGF0ZS5zcGxpY2UodG9VcGRhdGUuaW5kZXhPZih0aGlzLmlkKSwgMSk7XG4gICAgfSxcbiAgICBlbmFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnVwZGF0ZSkgdG9VcGRhdGUucHVzaCh0aGlzLmlkKTtcbiAgICAgICAgaWYgKHRoaXMuZHJhdykgdG9EcmF3LnB1c2godGhpcy5pZCk7XG4gICAgfSxcbiAgICBjbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY3VycmVudC5zcGxpY2UoMCwgY3VycmVudC5sZW5ndGgpO1xuICAgICAgICB0b1VwZGF0ZS5zcGxpY2UoMCwgdG9VcGRhdGUubGVuZ3RoKTtcbiAgICAgICAgdG9EcmF3LnNwbGljZSgwLCB0b0RyYXcubGVuZ3RoKTtcbiAgICB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjdXJyZW50OiBjdXJyZW50LFxuICAgIGxpc3Q6IGxpc3QsXG4gICAgdG9EcmF3OiB0b0RyYXcsXG4gICAgdG9VcGRhdGU6IHRvVXBkYXRlLFxuICAgIHNwYXduOiBzcGF3bixcbiAgICBjbGVhcjogY2xlYXJcbn07IiwidmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi9lbnRpdGllc01hbmFnZXInKSxcbiAgICB0b0RyYXcgPSBlbnRpdGllcy50b0RyYXcsXG4gICAgdG9VcGRhdGUgPSBlbnRpdGllcy50b1VwZGF0ZSxcbiAgICBzY2VuZXMgPSByZXF1aXJlKCcuL3NjZW5lc01hbmFnZXInKSxcbiAgICBjb250ZXh0ID0gcmVxdWlyZSgnLi9jYW52YXMnKSxcbiAgICBjYW1lcmEgPSByZXF1aXJlKCcuL2NhbWVyYScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzcGVlZDogMSxcbiAgICBkdDogMCxcbiAgICBzdGVwOiAxIC8gNjAsXG4gICAgbGFzdERlbHRhOiBuZXcgRGF0ZSgpLFxuICAgIG5vdzogbmV3IERhdGUoKSxcbiAgICBjYWxjdWxhdGVEZWx0YTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmxhc3REZWx0YSA9IHRoaXMubm93O1xuICAgICAgICB0aGlzLm5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICAgIHRoaXMuZHQgKz0gTWF0aC5taW4oMSwgKHRoaXMubm93IC0gdGhpcy5sYXN0RGVsdGEpIC8gMTAwMCkgKiB0aGlzLnNwZWVkO1xuICAgIH0sXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoc2NlbmVzLmlzQ2hhbmdpbmcpIHRoaXMuZHQgPSAwO1xuICAgICAgICB0aGlzLmNhbGN1bGF0ZURlbHRhKCk7XG4gICAgICAgIHdoaWxlICh0aGlzLmR0ID4gdGhpcy5zdGVwKSB7XG4gICAgICAgICAgICB0aGlzLmR0IC09IHRoaXMuc3RlcDtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKHRoaXMuc3RlcCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kcmF3KHRoaXMuZHQpO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5pbml0LmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICBkcmF3OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIGNvbnRleHQuY2FudmFzLndpZHRoLCBjb250ZXh0LmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICAvLyAgICBjYW1lcmEuc3RhcnQoKTtcbiAgICAgICAgaWYgKHNjZW5lcy5jdXJyZW50LmRyYXcpIHNjZW5lcy5jdXJyZW50LmRyYXcoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRvRHJhdy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgaWYgKGVudGl0aWVzLmN1cnJlbnRbdG9EcmF3W2ldXSAhPT0gdW5kZWZpbmVkICYmIGVudGl0aWVzLmN1cnJlbnRbdG9EcmF3W2ldXS5kcmF3ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBlbnRpdGllcy5jdXJyZW50W3RvRHJhd1tpXV0uZHJhdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gICAgY29udGV4dC5yZXN0b3JlKCk7XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG4gICAgICAgIGlmIChzY2VuZXMuY3VycmVudC51cGRhdGUpIHNjZW5lcy5jdXJyZW50LnVwZGF0ZShkdCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0b1VwZGF0ZS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgaWYgKGVudGl0aWVzLmN1cnJlbnRbdG9VcGRhdGVbaV1dICE9PSB1bmRlZmluZWQgJiYgZW50aXRpZXMuY3VycmVudFt0b1VwZGF0ZVtpXV0udXBkYXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBlbnRpdGllcy5jdXJyZW50W3RvVXBkYXRlW2ldXS51cGRhdGUoZHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbn07IiwidmFyIHNjZW5lID0gcmVxdWlyZSgnLi9zY2VuZXNNYW5hZ2VyJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpc1ByZXNzZWQ6IHt9LFxuXG4gICAga2V5RG93bjogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMzIgfHwgKGUua2V5Q29kZSA+PSAzNyAmJiBlLmtleUNvZGUgPD0gNDApKSBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmIChzY2VuZS5jdXJyZW50LmtleURvd24pIHNjZW5lLmN1cnJlbnQua2V5RG93bih0aGlzLmtleXNbZS5rZXlDb2RlXSk7XG4gICAgICAgIHRoaXMua2V5UHJlc3MoZSk7XG4gICAgfSxcblxuICAgIGtleVByZXNzOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAodGhpcy5pc1ByZXNzZWRbZS5rZXlDb2RlXSkgcmV0dXJuO1xuICAgICAgICBpZiAoc2NlbmUuY3VycmVudC5rZXlQcmVzcykgc2NlbmUuY3VycmVudC5rZXlQcmVzcyh0aGlzLmtleXNbZS5rZXlDb2RlXSk7XG4gICAgICAgIHRoaXMuaXNQcmVzc2VkW2Uua2V5Q29kZV0gPSB0cnVlO1xuICAgIH0sXG5cbiAgICBrZXlVcDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKHNjZW5lLmN1cnJlbnQua2V5VXApIHNjZW5lLmN1cnJlbnQua2V5VXAodGhpcy5rZXlzW2Uua2V5Q29kZV0pO1xuICAgICAgICB0aGlzLmlzUHJlc3NlZFtlLmtleUNvZGVdID0gZmFsc2U7XG4gICAgfSxcblxuICAgIGtleXM6IHtcbiAgICAgICAgODogJ2JhY2tzcGFjZScsXG4gICAgICAgIDk6ICd0YWInLFxuICAgICAgICAxMzogJ2VudGVyJyxcbiAgICAgICAgMTY6ICdzaGlmdCcsXG4gICAgICAgIDE3OiAnY3RybCcsXG4gICAgICAgIDE4OiAnYWx0JyxcbiAgICAgICAgMTk6ICdwYXVzZScsXG4gICAgICAgIDIwOiAnY2Fwc19sb2NrJyxcbiAgICAgICAgMjc6ICdlc2MnLFxuICAgICAgICAzMjogJ3NwYWNlYmFyJyxcbiAgICAgICAgMzM6ICdwYWdlX3VwJyxcbiAgICAgICAgMzQ6ICdwYWdlX2Rvd24nLFxuICAgICAgICAzNTogJ2VuZCcsXG4gICAgICAgIDM2OiAnaG9tZScsXG4gICAgICAgIDM3OiAnbGVmdCcsXG4gICAgICAgIDM4OiAndXAnLFxuICAgICAgICAzOTogJ3JpZ2h0JyxcbiAgICAgICAgNDA6ICdkb3duJyxcbiAgICAgICAgNDQ6ICdwcmludF9zY3JlZW4nLFxuICAgICAgICA0NTogJ2luc2VydCcsXG4gICAgICAgIDQ2OiAnZGVsZXRlJyxcbiAgICAgICAgNDg6ICcwJyxcbiAgICAgICAgNDk6ICcxJyxcbiAgICAgICAgNTA6ICcyJyxcbiAgICAgICAgNTE6ICczJyxcbiAgICAgICAgNTI6ICc0JyxcbiAgICAgICAgNTM6ICc1JyxcbiAgICAgICAgNTQ6ICc2JyxcbiAgICAgICAgNTU6ICc3JyxcbiAgICAgICAgNTY6ICc4JyxcbiAgICAgICAgNTc6ICc5JyxcbiAgICAgICAgNjU6ICdhJyxcbiAgICAgICAgNjY6ICdiJyxcbiAgICAgICAgNjc6ICdjJyxcbiAgICAgICAgNjg6ICdkJyxcbiAgICAgICAgNjk6ICdlJyxcbiAgICAgICAgNzA6ICdmJyxcbiAgICAgICAgNzE6ICdnJyxcbiAgICAgICAgNzI6ICdoJyxcbiAgICAgICAgNzM6ICdpJyxcbiAgICAgICAgNzQ6ICdqJyxcbiAgICAgICAgNzU6ICdrJyxcbiAgICAgICAgNzY6ICdsJyxcbiAgICAgICAgNzc6ICdtJyxcbiAgICAgICAgNzg6ICduJyxcbiAgICAgICAgNzk6ICdvJyxcbiAgICAgICAgODA6ICdwJyxcbiAgICAgICAgODE6ICdxJyxcbiAgICAgICAgODI6ICdyJyxcbiAgICAgICAgODM6ICdzJyxcbiAgICAgICAgODQ6ICd0JyxcbiAgICAgICAgODU6ICd1JyxcbiAgICAgICAgODY6ICd2JyxcbiAgICAgICAgODc6ICd3JyxcbiAgICAgICAgODg6ICd4JyxcbiAgICAgICAgODk6ICd5JyxcbiAgICAgICAgOTA6ICd6JyxcbiAgICAgICAgOTY6ICdudW1femVybycsXG4gICAgICAgIDk3OiAnbnVtX29uZScsXG4gICAgICAgIDk4OiAnbnVtX3R3bycsXG4gICAgICAgIDk5OiAnbnVtX3RocmVlJyxcbiAgICAgICAgMTAwOiAnbnVtX2ZvdXInLFxuICAgICAgICAxMDE6ICdudW1fZml2ZScsXG4gICAgICAgIDEwMjogJ251bV9zaXgnLFxuICAgICAgICAxMDM6ICdudW1fc2V2ZW4nLFxuICAgICAgICAxMDQ6ICdudW1fZWlnaHQnLFxuICAgICAgICAxMDU6ICdudW1fbmluZScsXG4gICAgICAgIDEwNjogJ251bV9tdWx0aXBseScsXG4gICAgICAgIDEwNzogJ251bV9wbHVzJyxcbiAgICAgICAgMTA5OiAnbnVtX21pbnVzJyxcbiAgICAgICAgMTEwOiAnbnVtX3BlcmlvZCcsXG4gICAgICAgIDExMTogJ251bV9kaXZpc2lvbicsXG4gICAgICAgIDExMjogJ2YxJyxcbiAgICAgICAgMTEzOiAnZjInLFxuICAgICAgICAxMTQ6ICdmMycsXG4gICAgICAgIDExNTogJ2Y0JyxcbiAgICAgICAgMTE2OiAnZjUnLFxuICAgICAgICAxMTc6ICdmNicsXG4gICAgICAgIDExODogJ2Y3JyxcbiAgICAgICAgMTE5OiAnZjgnLFxuICAgICAgICAxMjA6ICdmOScsXG4gICAgICAgIDEyMTogJ2YxMCcsXG4gICAgICAgIDEyMjogJ2YxMScsXG4gICAgICAgIDEyMzogJ2YxMicsXG4gICAgICAgIDE4NjogJ3NlbWljb2xvbicsXG4gICAgICAgIDE4NzogJ3BsdXMnLFxuICAgICAgICAxODk6ICdtaW51cycsXG4gICAgICAgIDE5MjogJ2dyYXZlX2FjY2VudCcsXG4gICAgICAgIDIyMjogJ3NpbmdsZV9xdW90ZSdcbiAgICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW1hZ2VzOiB7fSxcbiAgICBkYXRhOiB7fSxcbiAgICBhdWRpbzoge30sXG4gICAgYXNzZXRzVG9Mb2FkOiAwLFxuXG4gICAgbG9hZEltYWdlOiBmdW5jdGlvbiAocGF0aCkge1xuICAgICAgICB2YXIgbmFtZSA9IHBhdGguc2xpY2UoOSwgcGF0aC5sZW5ndGgpO1xuICAgICAgICB0aGlzLmltYWdlc1tuYW1lXSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICB0aGlzLmltYWdlc1tuYW1lXS5vbmxvYWQgPSB0aGlzLmFzc2V0c1RvTG9hZC0tO1xuICAgICAgICB0aGlzLmltYWdlc1tuYW1lXS5zcmMgPSBwYXRoO1xuICAgIH0sXG5cbiAgICBsb2FkRGF0YTogZnVuY3Rpb24gKHBhdGgpIHtcbiAgICAgICAgdmFyIGZpbGUgPSBwYXRoLnNsaWNlKDcsIHBhdGgubGVuZ3RoIC0gNSksXG4gICAgICAgICAgICBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQgJiYgeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5kYXRhW2ZpbGVdID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICBzZWxmLmFzc2V0c1RvTG9hZC0tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB4aHIub3BlbihcIkdFVFwiLCBwYXRoKTtcbiAgICAgICAgeGhyLnNlbmQoKTtcbiAgICB9LFxuXG4gICAgbG9hZEF1ZGlvOiBmdW5jdGlvbiAocGF0aCkge1xuICAgICAgICB2YXIgbmFtZSA9IHBhdGguc2xpY2UoOCwgcGF0aC5sZW5ndGgpO1xuICAgICAgICB0aGlzLmF1ZGlvW25hbWVdID0gbmV3IEF1ZGlvKHBhdGgpO1xuICAgICAgICB0aGlzLmF1ZGlvW25hbWVdLm9uY2FucGxheXRocm91Z2ggPSB0aGlzLmFzc2V0c1RvTG9hZC0tO1xuICAgIH0sXG5cbiAgICBsb2FkOiBmdW5jdGlvbiAobGlzdCkge1xuICAgICAgICB0aGlzLmFzc2V0c1RvTG9hZCArPSBsaXN0Lmxlbmd0aDtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChsaXN0W2ldLmluZGV4T2YoJy4vaW1hZ2VzJykgPiAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZEltYWdlKGxpc3RbaV0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChsaXN0W2ldLmluZGV4T2YoJy4vZGF0YScpID4gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWREYXRhKGxpc3RbaV0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChsaXN0W2ldLmluZGV4T2YoJy4vYXVkaW8nKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkQXVkaW8obGlzdFtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc3RvcmU6IGZ1bmN0aW9uIChudW0sIG9iaikge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShudW0sIEpTT04uc3RyaW5naWZ5KG9iaikpO1xuICAgIH0sXG4gICAgbG9hZDogZnVuY3Rpb24gKG51bSkge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShudW0pKTtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24gKG51bSkge1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShudW0pO1xuICAgIH1cbn07XG4iLCJ2YXIgc2NlbmUgPSByZXF1aXJlKCcuL3NjZW5lc01hbmFnZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgeDogMCxcbiAgICB5OiAwLFxuICAgIGlzRG93bjogZmFsc2UsXG5cbiAgICBvbk1vdmU6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIG94Lm1vdXNlLnggPSBlLmNsaWVudFggLSBveC5jYW52YXMub2Zmc2V0TGVmdDtcbiAgICAgICAgb3gubW91c2UueSA9IGUuY2xpZW50WSAtIG94LmNhbnZhcy5vZmZzZXRUb3A7XG4gICAgfSxcblxuICAgIG9uVXA6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChzY2VuZS5jdXJyZW50Lm1vdXNlVXApIHNjZW5lLmN1cnJlbnQubW91c2VVcCh0aGlzLmJ1dHRvbnNbZS5idXR0b25dKTtcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgb25Eb3duOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoc2NlbmUuY3VycmVudC5tb3VzZURvd24pIHNjZW5lLmN1cnJlbnQubW91c2VEb3duKHRoaXMuYnV0dG9uc1tlLmJ1dHRvbl0pO1xuICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XG4gICAgfSxcblxuICAgIGJ1dHRvbnM6IHtcbiAgICAgICAgMDogXCJsZWZ0XCIsXG4gICAgICAgIDE6IFwibWlkZGxlXCIsXG4gICAgICAgIDI6IFwicmlnaHRcIlxuICAgIH1cbn07XG4iLCJ2YXIgY2xlYXJFbnRpdGllcyA9IHJlcXVpcmUoJy4vZW50aXRpZXNNYW5hZ2VyJykuY2xlYXI7XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaXNDaGFuZ2luZzogZmFsc2UsXG4gICAgY3VycmVudDogbnVsbCxcbiAgICBsaXN0OiByZXF1aXJlKCcuLi9zY2VuZXMuanMnKSxcbiAgICBzZXQ6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIGlmICghdGhpcy5saXN0W25hbWVdKSB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSBbXCIgKyBuYW1lICsgXCJdIGRvZXMgbm90IGV4aXN0IVwiKTtcbiAgICAgICAgY2xlYXJFbnRpdGllcygpO1xuICAgICAgICAvLyAgICAgICAgdGhpcy5pc0NoYW5naW5nID0gdHJ1ZTtcbiAgICAgICAgY29uc29sZS5sb2cocmVxdWlyZSgnLi9lbnRpdGllc01hbmFnZXInKS5jdXJyZW50LCBuYW1lKTtcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gdGhpcy5saXN0W25hbWVdO1xuICAgICAgICB0aGlzLmN1cnJlbnQuaW5pdCgpO1xuICAgICAgICAvLyAgICAgICAgdGhpcy5pc0NoYW5naW5nID0gZmFsc2U7XG4gICAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgJ2NvdW50ZXInOiByZXF1aXJlKCcuL2VudGl0aWVzL2NvdW50ZXIuanMnKSxcbiAgJ2NvdW50ZXIyJzogcmVxdWlyZSgnLi9lbnRpdGllcy9jb3VudGVyMi5qcycpLFxuICAncGxheWVyJzogcmVxdWlyZSgnLi9lbnRpdGllcy9wbGF5ZXIuanMnKSxcbiAgJ3BvbmV5JzogcmVxdWlyZSgnLi9lbnRpdGllcy9wb25leS5qcycpLFxuICAnc3ByaXRlL2FuaW1hdGVkJzogcmVxdWlyZSgnLi9lbnRpdGllcy9zcHJpdGUvYW5pbWF0ZWQuanMnKSxcbiAgJ3Nwcml0ZS9kcmF3U3ByaXRlJzogcmVxdWlyZSgnLi9lbnRpdGllcy9zcHJpdGUvZHJhd1Nwcml0ZS5qcycpLFxuICAnc3ByaXRlJzogcmVxdWlyZSgnLi9lbnRpdGllcy9zcHJpdGUuanMnKSxcbiAgJ3RpbWVyJzogcmVxdWlyZSgnLi9lbnRpdGllcy90aW1lci5qcycpXG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52YWx1ZSA9IDEwMDtcbiAgfSxcbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52YWx1ZSsrO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnYgPSAxMDE7XG4gICAgdGhpcy52YWx1ZSA9IDA7XG4gICAgdGhpcy5jID0gb3guZW50aXRpZXMuc3Bhd24oJ2NvdW50ZXInKTtcbiAgfSxcbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52YWx1ZSsrO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICBveC5zcGF3bigncG9uZXknKTtcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy54ID0gMDtcbiAgfSxcblxuICBkcmF3OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy54Kys7XG4gICAgb3guY29udGV4dC5maWxsU3R5bGUgPSAnYmx1ZSdcbiAgICBveC5jb250ZXh0LmZpbGxSZWN0KDgwLCA4MCwgMTAwLCAyMDApXG4gICAgb3guY29udGV4dC5zdHJva2VTdHlsZSA9ICdncmV5J1xuICAgIG94LmNvbnRleHQuc3Ryb2tlUmVjdCg4MCwgODAsIDEwMCwgMjAwKVxuICAgIG94LmNvbnRleHQuZHJhd1Nwcml0ZSgncG9ueS5wbmcnLCB0aGlzLngsIDApO1xuICAgIG94LmNvbnRleHQuZHJhd1Nwcml0ZSgncG9ueS5wbmcnLCB0aGlzLnggKyAxMCwgMCk7XG4gIH1cbn07XG4iLCJ2YXIgZHJhd1Nwcml0ZSA9IHJlcXVpcmUoJy4vc3ByaXRlL2RyYXdTcHJpdGUnKSxcbiAgICBhbmltYXRlZCA9IHJlcXVpcmUoJy4vc3ByaXRlL2FuaW1hdGVkJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zcmNXaWR0aCA9IG94LmltYWdlc1t0aGlzLnNvdXJjZV0ud2lkdGg7XG4gICAgICAgIHRoaXMuc3JjSGVpZ2h0ID0gb3guaW1hZ2VzW3RoaXMuc291cmNlXS5oZWlnaHQ7XG4gICAgICAgIHRoaXMud2lkdGggPSB0aGlzLndpZHRoIHx8IHRoaXMuc3JjV2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5oZWlnaHQgfHwgdGhpcy5zcmNIZWlnaHQ7XG4gICAgICAgIHRoaXMueCA9IHRoaXMueCB8fCAwO1xuICAgICAgICB0aGlzLnkgPSB0aGlzLnkgfHwgMDtcblxuICAgICAgICBpZiAodGhpcy5hbmltYXRpb24pIGFuaW1hdGVkLmNhbGwodGhpcyk7XG4gICAgfSxcblxuICAgIGRyYXc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZHJhd1Nwcml0ZSh0aGlzLnNvdXJjZSwgdGhpcy54LCB0aGlzLnkpO1xuICAgIH0sXG5cbiAgICBjYWxjdWxhdGVGcmFtZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHggPSAwLFxuICAgICAgICAgICAgeSA9IDA7XG4gICAgICAgIHRoaXMuZnJhbWVzID0gW1swLCAwXV07XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCB0aGlzLnNyY0hlaWdodCAvIHRoaXMuaGVpZ2h0ICogdGhpcy5zcmNXaWR0aCAvIHRoaXMud2lkdGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHggPCB0aGlzLnNyY1dpZHRoIC8gdGhpcy53aWR0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICB4Kys7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHkgPCB0aGlzLnNyY0hlaWdodCAvIHRoaXMuaGVpZ2h0IC0gMSkge1xuICAgICAgICAgICAgICAgIHkrKztcbiAgICAgICAgICAgICAgICB4ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZnJhbWVzLnB1c2goW3gsIHldKTtcbiAgICAgICAgfVxuICAgIH1cbn07IiwidmFyIGRyYXdTcHJpdGUgPSByZXF1aXJlKCcuL2RyYXdTcHJpdGUnKSxcbiAgICBpbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmlzUGxheWluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuaXNGaW5pc2hlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnBhdXNlID0gcGF1c2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5wbGF5ID0gcGxheS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmZpbmlzaGVkID0gZmluaXNoZWQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy51cGRhdGUgPSB1cGRhdGUuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5kcmF3ID0gZHJhdy5iaW5kKHRoaXMpO1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMubG9vcCAhPT0gJ2Jvb2xlYW4nKSB0aGlzLmxvb3AgPSB0cnVlO1xuICAgICAgICB0aGlzLmNvdW50ZXIgPSAwO1xuICAgICAgICB0aGlzLmZyYW1lUmF0ZSA9IHRoaXMuZnJhbWVSYXRlIHx8IDMwO1xuICAgICAgICB0aGlzLmNhbGN1bGF0ZUZyYW1lcygpO1xuXG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbnMpIHtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uQXJyYXkgPSB0aGlzLmFuaW1hdGlvbnNbdGhpcy5hbmltYXRpb25dO1xuICAgICAgICAgICAgdGhpcy5hcnJheUNvdW50ZXIgPSAwO1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IHRoaXMuYW5pbWF0aW9uQXJyYXlbdGhpcy5hcnJheUNvdW50ZXJdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IDA7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGRyYXcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGRyYXdTcHJpdGUodGhpcy5zb3VyY2UsIHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdGhpcy5mcmFtZXNbdGhpcy5mcmFtZV0pO1xuICAgIH0sXG4gICAgdXBkYXRlID0gZnVuY3Rpb24gKGR0KSB7XG4gICAgICAgIGlmICghdGhpcy5pc1BsYXlpbmcpIHJldHVybjtcbiAgICAgICAgaWYgKHRoaXMuaXNGaW5pc2hlZCkgcmV0dXJuIHRoaXMuZmluaXNoZWQoKTtcblxuICAgICAgICB0aGlzLmNvdW50ZXIgKz0gZHQgKiAxMDAwO1xuICAgICAgICBpZiAodGhpcy5jb3VudGVyID4gMTAwMCAvIHRoaXMuZnJhbWVSYXRlKSB7XG4gICAgICAgICAgICB0aGlzLmNvdW50ZXIgPSAwO1xuICAgICAgICAgICAgaWYgKHRoaXMuYW5pbWF0aW9ucykge1xuICAgICAgICAgICAgICAgIG11bHRpcGxlQW5pbWF0aW9ucy5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzaW5nbGVBbmltYXRpb24uY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgbXVsdGlwbGVBbmltYXRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5hcnJheUNvdW50ZXIgPT09IHRoaXMuYW5pbWF0aW9uQXJyYXkubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmxvb3ApIHRoaXMuaXNGaW5pc2hlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmZyYW1lID0gdGhpcy5hbmltYXRpb25BcnJheVswXTtcbiAgICAgICAgICAgIHRoaXMuYXJyYXlDb3VudGVyID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYXJyYXlDb3VudGVyKys7XG4gICAgICAgICAgICB0aGlzLmZyYW1lID0gdGhpcy5hbmltYXRpb25BcnJheVt0aGlzLmFycmF5Q291bnRlcl07XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgc2luZ2xlQW5pbWF0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5mcmFtZSA9PT0gKHRoaXMuZnJhbWVzLmxlbmd0aCAtIDEpKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMubG9vcCkgdGhpcy5pc0ZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuZnJhbWUgPSAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5mcmFtZSArPSAxO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBmaW5pc2hlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5wYXVzZSgpO1xuICAgICAgICBpZiAodGhpcy5jYWxsYmFjaykgdGhpcy5jYWxsYmFjaygpO1xuICAgIH0sXG5cbiAgICBwbGF5ID0gZnVuY3Rpb24gKGFuaW1hdGlvbiwgb3B0aW9ucykge1xuICAgICAgICBpZiAob3B0aW9ucykge1xuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICB0aGlzW2tleV0gPSBvcHRpb25zW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5hbmltYXRpb25zKSB7XG4gICAgICAgICAgICBpZiAoYW5pbWF0aW9uKSB0aGlzLmFuaW1hdGlvbiA9IGFuaW1hdGlvbjtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uQXJyYXkgPSB0aGlzLmFuaW1hdGlvbnNbdGhpcy5hbmltYXRpb25dO1xuICAgICAgICAgICAgdGhpcy5hcnJheUNvdW50ZXIgPSAwO1xuICAgICAgICAgICAgdGhpcy5mcmFtZSA9IHRoaXMuYW5pbWF0aW9uQXJyYXlbdGhpcy5hcnJheUNvdW50ZXJdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaXNGaW5pc2hlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzUGxheWluZyA9IHRydWU7XG4gICAgfSxcblxuICAgIHBhdXNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmlzUGxheWluZyA9IGZhbHNlO1xuICAgIH07XG5cbm1vZHVsZS5leHBvcnRzID0gaW5pdDsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChzcmMsIHgsIHksIHdpZHRoLCBoZWlnaHQsIGZyYW1lKSB7XG4gICAgaWYgKHR5cGVvZiB3aWR0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgb3guY29udGV4dC5kcmF3SW1hZ2UoXG4gICAgICAgICAgICBveC5pbWFnZXNbc3JjXSxcbiAgICAgICAgICAgIHdpZHRoICogZnJhbWVbMF0sXG4gICAgICAgICAgICBoZWlnaHQgKiBmcmFtZVsxXSxcbiAgICAgICAgICAgIHdpZHRoLCBoZWlnaHQsIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG94LmNvbnRleHQuZHJhd0ltYWdlKG94LmltYWdlc1tzcmNdLCB4LCB5KTtcbiAgICB9XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IDA7XG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy50YXJnZXQgfHwgMTAwMDtcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IHRoaXMuY2FsbGJhY2sgfHwgZnVuY3Rpb24gKCkge307XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSBNYXRoLnJvdW5kKHRoaXMudmFsdWUgKyBkdCAqIDEwMDApO1xuICAgICAgICBpZiAodGhpcy52YWx1ZSA+PSB0aGlzLnRhcmdldCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY29udGV4dCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsbGJhY2suY2FsbCh0aGlzLmNvbnRleHQsIHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrKHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5sb29wKSB7XG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzYWJsZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIHJlc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IDA7XG4gICAgICAgIHRoaXMuZW5hYmxlKCk7XG4gICAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAnZW1wdHknOiByZXF1aXJlKCcuL3NjZW5lcy9lbXB0eS5qcycpLFxuICAnbG9hZGluZyc6IHJlcXVpcmUoJy4vc2NlbmVzL2xvYWRpbmcuanMnKSxcbiAgJ21haW4nOiByZXF1aXJlKCcuL3NjZW5lcy9tYWluLmpzJylcbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyAgICAgICAgb3guc2NlbmVzLnNldCgnbWFpbicpO1xuICAgIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICBveC5wcmVsb2FkZXIubG9hZChyZXF1aXJlKCcuLi9hc3NldHMnKSk7XG4gICAgICAgIHRoaXMuYmFyTGVuZ3RoID0gb3gucHJlbG9hZGVyLmFzc2V0c1RvTG9hZDtcbiAgICB9LFxuXG4gICAgZHJhdzogZnVuY3Rpb24gKCkge1xuICAgICAgICBveC5jb250ZXh0LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcbiAgICAgICAgb3guY29udGV4dC5maWxsUmVjdCgwLCAwLCBveC5jYW52YXMud2lkdGgsIG94LmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICBveC5jb250ZXh0LmZpbGxTdHlsZSA9IFwicmdiKDQ2LCAyMzgsIDI0NSlcIjtcbiAgICAgICAgb3guY29udGV4dC5maWxsUmVjdChveC5jYW52YXMud2lkdGggLyA0LCBveC5jYW52YXMuaGVpZ2h0IC8gMiArIDMyLCBveC5jYW52YXMud2lkdGggLyAyLCAxKTtcbiAgICAgICAgb3guY29udGV4dC5maWxsU3R5bGUgPSBcImdyZXlcIjtcbiAgICAgICAgb3guY29udGV4dC5zYXZlKCk7XG4gICAgICAgIG94LmNvbnRleHQudHJhbnNsYXRlKG94LmNhbnZhcy53aWR0aCAvIDQsIDIgKiBveC5jYW52YXMuaGVpZ2h0IC8gMyk7XG4gICAgICAgIG94LmNvbnRleHQuc2NhbGUoLTEsIDEpO1xuICAgICAgICBveC5jb250ZXh0LmZpbGxSZWN0KC1veC5jYW52YXMud2lkdGggLyAyLCAwLCBveC5jYW52YXMud2lkdGggLyAyICogb3gucHJlbG9hZGVyLmFzc2V0c1RvTG9hZCAvIHRoaXMuYmFyTGVuZ3RoLCAxKTtcbiAgICAgICAgb3guY29udGV4dC5yZXN0b3JlKCk7XG4gICAgICAgIG94LmNvbnRleHQuZmlsbFN0eWxlID0gXCJ3aGl0ZVwiO1xuICAgICAgICBveC5jb250ZXh0LmZvbnQgPSAnMjAwJSBzYW5zLXNlcmlmJztcbiAgICAgICAgb3guY29udGV4dC5maWxsVGV4dCgnbG9hZGluZy4uLicsIG94LmNhbnZhcy53aWR0aCAvIDIgLSA2OCwgb3guY2FudmFzLmhlaWdodCAvIDIgKyAxMCk7XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAob3gucHJlbG9hZGVyLmFzc2V0c1RvTG9hZCA9PT0gMCkgb3guc2NlbmVzLnNldCgnbWFpbicpO1xuICAgIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc3ByaXRlMiA9IG94LnNwYXduKCdzcHJpdGUnLCB7XG4gICAgICAgICAgICBzb3VyY2U6ICdjb2luMi5wbmcnLFxuICAgICAgICAgICAgYW5pbWF0aW9uOiAnc3BpbicsXG4gICAgICAgICAgICBhbmltYXRpb25zOiB7XG4gICAgICAgICAgICAgICAgc3BpbjogWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDldLFxuICAgICAgICAgICAgICAgIGlkbGU6IFs4LCA0LCA4LCA0LCA4LCA0LCA4LCA0LCA4LCA0LCA4LCA0LCA4LCA0LCA4LCA0XVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGhlaWdodDogNDAsXG4gICAgICAgICAgICBmcmFtZVJhdGU6IDEsXG4gICAgICAgICAgICB3aWR0aDogNDRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zcHJpdGUzID0gb3guc3Bhd24oJ3Nwcml0ZScsIHtcbiAgICAgICAgICAgIHNvdXJjZTogJ3BvbnkucG5nJyxcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAxMDBcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zcHJpdGU0ID0gb3guc3Bhd24oJ3Nwcml0ZScsIHtcbiAgICAgICAgICAgIHNvdXJjZTogJ3BvbnkucG5nJyxcbiAgICAgICAgICAgIHg6IDEwMCxcbiAgICAgICAgICAgIHk6IDEwMFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNwcml0ZTQgPSBveC5zcGF3bignc3ByaXRlJywge1xuICAgICAgICAgICAgc291cmNlOiAncG9ueS5wbmcnLFxuICAgICAgICAgICAgeDogMjAwLFxuICAgICAgICAgICAgeTogMTAwXG4gICAgICAgIH0pO1xuXG4gICAgICAgIG94LnNwYXduKCd0aW1lcicsIHtcbiAgICAgICAgICAgIHRhcmdldDogMTAwMCxcbiAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGU0LnkgKz0gLTEwO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNwcml0ZTQueSA8IDApIHRoaXMuc3ByaXRlNC55ID0gMjAwO1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgIG94LnNjZW5lcy5zZXQoJ21haW5vJyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29udGV4dDogdGhpc1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcbiAgICAgICAgLy8gICAgICAgIHRoaXMuc3ByaXRlMi54ID0gb3gubW91c2UueDtcbiAgICAgICAgLy8gICAgICAgIHRoaXMuc3ByaXRlMi55ID0gb3gubW91c2UueTtcblxuICAgICAgICAvLyAgICAgICAgb3guY2FtZXJhLnNldChveC5tb3VzZS54LCBveC5tb3VzZS55KTtcbiAgICB9LFxuXG4gICAga2V5RG93bjogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImtleURvd246IFwiICsga2V5KTtcbiAgICB9LFxuXG4gICAga2V5UHJlc3M6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJrZXlQcmVzczogXCIgKyBrZXkpO1xuICAgIH0sXG5cbiAgICBrZXlVcDogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImtleVVwOiBcIiArIGtleSk7XG4gICAgfSxcblxuICAgIG1vdXNlRG93bjogZnVuY3Rpb24gKGJ1dHRvbikge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkNsaWNrZWQgYXQ6IFwiICsgb3gubW91c2UueCArIFwiLCBcIiArIG94Lm1vdXNlLnkgKyBcIiB3aXRoIHRoZSBcIiArIGJ1dHRvbiArIFwiIGJ1dHRvbi5cIik7XG4gICAgfSxcblxuICAgIG1vdXNlVXA6IGZ1bmN0aW9uIChidXR0b24pIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJSZWxlYXNlZCBhdDogXCIgKyBveC5tb3VzZS54ICsgXCIsIFwiICsgb3gubW91c2UueSArIFwiIHdpdGggdGhlIFwiICsgYnV0dG9uICsgXCIgYnV0dG9uLlwiKTtcbiAgICB9XG59OyJdfQ==
