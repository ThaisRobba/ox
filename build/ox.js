(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/otto/Dropbox/GameDev/JavaScript/ox/src/assets.js":[function(require,module,exports){
module.exports = {
  images: ['pony', 'pony2', 'pony3', 'pony4', 'pony5', 'coin', 'coinTwisted', 'coin2'],
  data: ['teste']
}

},{}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/canvas.js":[function(require,module,exports){
var images = require('./loader').images

module.exports = {
  context: document.getElementById('canvas').getContext('2d'),

  fillStyle: function (color) {
    this.context.fillStyle = color;
    return this;
  },

  fillRect: function (x, y, w, h) {
    this.context.fillRect(x, y, w, h);
    return this;
  },

  strokeStyle: function (color) {
    this.context.strokeStyle = color;
    return this;
  },

  strokeRect: function (x, y, w, h) {
    this.context.strokeRect(x, y, w, h);
    return this;
  },

  clearRect: function (x, y, w, h) {
    this.context.clearRect(x, y, w, h);
    return this;
  },

  lineWidth: function (size) {
    this.context.lineWidth = size;
    return this;
  },

  drawImage: function (src, x, y, width, height, frame) {
    if (typeof width === 'number') {
      this.context.drawImage(
        images[src],
        width * frame[0],
        height * frame[1],
        width, height, x, y, width, height);
    } else {
      this.context.drawImage(images[src], x, y);
    }

    return this;
  },

  save: function () {
    this.context.save();
    return this;
  },

  scale: function (x, y) {
    this.context.scale(x, y);
    return this;
  },

  translate: function (x, y) {
    this.context.translate(x, y);
    return this;
  },

  restore: function () {
    this.context.restore();
    return this;
  },

  font: function (options) {
    this.context.font = options;
    return this;
  },

  fillText: function (text, x, y) {
    this.context.fillText(text, x, y);
    return this;
  },

  shape: function (type, options) {
    if (type === "rectangle") {
      if (options.fill) {
        this.context.fillStyle = options.fill;
        this.context.fillRect(
          options.x || 0,
          options.y || 0,
          options.w || 10,
          options.h || 10)
      }
      if (options.stroke) {
        if (options.lineWidth) this.context.lineWidth = options.lineWidth
        this.context.strokeStyle = options.stroke;
        this.context.strokeRect(
          options.x || 0,
          options.y || 0,
          options.w || 10,
          options.h || 10)
      }

    }
  }
}

},{"./loader":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/loader.js"}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/core.js":[function(require,module,exports){
window.onload = function () {
  this.ox = {
    canvas: require('./canvas'),
    images: require('./loader').images,
    audio: require('./loader').audio,
    data: require('./loader').data,
    mouse: require('./mouse'),
    scenes: require('./scenesManager'),
    entities: require('./entitiesManager'),
    save: require('./localStorage'),
    loop: require('./gameLoop'),
    preloader: require('./loader'),
    sprite: function (src, options) {
      var obj = options || {};
      obj.src = src;
      return require('./entitiesManager').spawn('sprite', obj);
    },
  };
  ox.loop.calculateDelta();
  ox.scenes.set('loading');
  ox.loop.run();
};

},{"./canvas":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/canvas.js","./entitiesManager":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/entitiesManager.js","./gameLoop":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/gameLoop.js","./loader":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/loader.js","./localStorage":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/localStorage.js","./mouse":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/mouse.js","./scenesManager":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/scenesManager.js"}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/entitiesManager.js":[function(require,module,exports){
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
    this.current.push(obj);
    if (obj.init) obj.init();
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
  }
};

},{"../entities":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/entities.js"}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/gameLoop.js":[function(require,module,exports){
var entities = require('./entitiesManager'),
  scenes = require('./scenesManager'),
  context = require('./canvas').context;
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
      if (entity.draw) entity.draw(dt);
    }
    //    ox.canvas.restore();
  },

  update: function (dt) {
    if (scenes.current.update) scenes.current.update(dt);
    for (var i = 0, len = entities.current.length; i < len; i++) {
      var entity = entities.current[i];
      if (entity.update) entity.update(dt);
    }
  }
}

},{"./canvas":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/canvas.js","./entitiesManager":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/entitiesManager.js","./scenesManager":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/scenesManager.js"}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/loader.js":[function(require,module,exports){
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
module.exports = {
  x: 0,
  y: 0
}

},{}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/scenesManager.js":[function(require,module,exports){
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
    this.c = ox.entities.spawn('counter');
  },
  update: function () {
    //    this.value++;
  }
};

},{}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/entities/poney.js":[function(require,module,exports){
module.exports = {
  init: function () {
    this.x = 0;
  },

  draw: function () {
    this.x++;

    ox.canvas
      .fillStyle('blue')
      .fillRect(80, 80, 100, 200)
      .strokeStyle('grey')
      .strokeRect(80, 80, 100, 200)
      .drawImage('pony', this.x, 0);

    ox.canvas.shape('rectangle', {
      x: 80,
      y: 40,
      h: 100,
      w: 40,
      fill: "yellow",
      stroke: "black",
      lineWidth: 2,
    });
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

  draw: function () {
    ox.canvas.drawImage(this.src, this.x, this.y);
  },

  initAnimation: function () {
    this.isPlaying = true;
    this.isFinished = false;
    if (typeof this.loop !== 'boolean') this.loop = true;
    this.counter = 0;
    this.frameRate = this.frameRate || 2;
    this.calculateFrames();

    if (this.animations) {
      this.animationArray = this.animations[this.animation]
      this.arrayCounter = 0;
      this.frame = this.animationArray[this.arrayCounter];
    } else {
      this.frame = 0;
    }

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

  drawAnimation: function () {
    ox.canvas.drawImage(this.src, this.x, this.y, this.width, this.height, this.frames[this.frame]);
  },

  updateAnimation: function () {
    this.counter += 1;
    if (this.counter > this.frameRate) {
      this.counter = 0;
      if (this.animations) this.multipleAnimations();
      else this.singleAnimation()
    }
  },

  multipleAnimations: function () {
    if (!this.isPlaying) return;
    if (this.isFinished && !this.loop) return this.finished();

    if (this.arrayCounter === this.animationArray.length - 1) {
      this.isFinished = true;
      this.frame = this.animationArray[0]
      this.arrayCounter = 0;
    } else {
      this.arrayCounter++;
      this.frame = this.animationArray[this.arrayCounter]
    }
  },

  singleAnimation: function () {
    if (!this.isPlaying) return;
    if (this.isFinished && !this.loop) return this.finished();

    if (this.frame === (this.frames.length - 1)) {
      this.isFinished = true;
      this.frame = 0
    } else {
      this.frame += 1;
    }
  },

  play: function (animation, options) {
    if (!options) var options = {};
    if (options.onStart) options.onStart();
    if (options.onFinish) this.onFinish = options.onFinish;

    if (!this.update) this.update = this.updateAnimation;

    this.isFinished = false;
    this.isPlaying = true;
    if (typeof options.loop === 'boolean') this.loop = options.loop;

    if (this.animations) {
      if (animation) this.animation = animation;
      this.animationArray = this.animations[this.animation];
      this.arrayCounter = 0;
      this.frame = this.animationArray[this.arrayCounter];

    }
  },

  finished: function () {
    this.stop();
    if (this.onFinish) this.onFinish();
    this.update = null;
  },

  stop: function () {
    this.isPlaying = false;
  },
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
    ox.canvas.fillStyle("black")
      .fillRect(0, 0, ox.canvas.width, ox.canvas.height)
      .fillStyle("rgb(46, 238, 245)")
      .fillRect(ox.canvas.width / 4, 2 * ox.canvas.height / 3, ox.canvas.width / 2, 1)
      .fillStyle("grey")
      .save()
      .translate(ox.canvas.width / 4, 2 * ox.canvas.height / 3)
      .scale(-1, 1)
      .fillRect(-ox.canvas.width / 2, 0, ox.canvas.width / 2 * ox.preloader.assetsToLoad / this.barLength, 1)
      .restore()
      .fillStyle("white")
      .font('200% sans-serif')
      .fillText('loading...', ox.canvas.width / 2 - 68, ox.canvas.height / 2 + 10);
  },

  update: function () {
    if (ox.preloader.assetsToLoad === 0) ox.scenes.set('main');
  }
};

},{"../assets.js":"/home/otto/Dropbox/GameDev/JavaScript/ox/src/assets.js"}],"/home/otto/Dropbox/GameDev/JavaScript/ox/src/scenes/main.js":[function(require,module,exports){
module.exports = {
  init: function () {
    var test = ox.entities.spawn('counter2');
    this.x = 0;
    this.poney = ox.entities.spawn('poney');

    this.sprite3 = ox.sprite('coin2', {
      x: 20,
      animation: 'spin',
      height: 40,
      width: 44
    });

    this.sprite = ox.sprite('coin2', {
      animation: 'spin2',
      loop: false,
      height: 40,
      width: 44
    });
    this.sprite2 = ox.sprite('coin2', {
      x: 80,
      y: 1,
      animation: 'spin',
      animations: {
        spin: [0, 1, 2, 3, 4, 4, 4, 4, 5, 6, 7, 8],
        idle: [4]
      },
      height: 40,
      width: 44
    });
    this.sprite2.play('spin', {
      loop: false,
      onFinish: function () {
        console.log("animation finished!");
      },
      onStart: function () {
        console.log("animation started!");
      }
    });

  },
  update: function (dt) {

    this.x += 10
    if (this.x > 300) this.x -= 400;
    if (this.x < 399 && !this.isPlaying) {
      this.sprite2.play('spin', true);
      this.isPlaying = true;
    }
  }
};

},{}]},{},["/home/otto/Dropbox/GameDev/JavaScript/ox/src/engine/core.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXNzZXRzLmpzIiwic3JjL2VuZ2luZS9jYW52YXMuanMiLCJzcmMvZW5naW5lL2NvcmUuanMiLCJzcmMvZW5naW5lL2VudGl0aWVzTWFuYWdlci5qcyIsInNyYy9lbmdpbmUvZ2FtZUxvb3AuanMiLCJzcmMvZW5naW5lL2xvYWRlci5qcyIsInNyYy9lbmdpbmUvbG9jYWxTdG9yYWdlLmpzIiwic3JjL2VuZ2luZS9tb3VzZS5qcyIsInNyYy9lbmdpbmUvc2NlbmVzTWFuYWdlci5qcyIsInNyYy9lbnRpdGllcy5qcyIsInNyYy9lbnRpdGllcy9jb3VudGVyLmpzIiwic3JjL2VudGl0aWVzL2NvdW50ZXIyLmpzIiwic3JjL2VudGl0aWVzL3BvbmV5LmpzIiwic3JjL2VudGl0aWVzL3Nwcml0ZS5qcyIsInNyYy9zY2VuZXMuanMiLCJzcmMvc2NlbmVzL2xvYWRpbmcuanMiLCJzcmMvc2NlbmVzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW1hZ2VzOiBbJ3BvbnknLCAncG9ueTInLCAncG9ueTMnLCAncG9ueTQnLCAncG9ueTUnLCAnY29pbicsICdjb2luVHdpc3RlZCcsICdjb2luMiddLFxuICBkYXRhOiBbJ3Rlc3RlJ11cbn1cbiIsInZhciBpbWFnZXMgPSByZXF1aXJlKCcuL2xvYWRlcicpLmltYWdlc1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29udGV4dDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpLmdldENvbnRleHQoJzJkJyksXG5cbiAgZmlsbFN0eWxlOiBmdW5jdGlvbiAoY29sb3IpIHtcbiAgICB0aGlzLmNvbnRleHQuZmlsbFN0eWxlID0gY29sb3I7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgZmlsbFJlY3Q6IGZ1bmN0aW9uICh4LCB5LCB3LCBoKSB7XG4gICAgdGhpcy5jb250ZXh0LmZpbGxSZWN0KHgsIHksIHcsIGgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIHN0cm9rZVN0eWxlOiBmdW5jdGlvbiAoY29sb3IpIHtcbiAgICB0aGlzLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBjb2xvcjtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBzdHJva2VSZWN0OiBmdW5jdGlvbiAoeCwgeSwgdywgaCkge1xuICAgIHRoaXMuY29udGV4dC5zdHJva2VSZWN0KHgsIHksIHcsIGgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIGNsZWFyUmVjdDogZnVuY3Rpb24gKHgsIHksIHcsIGgpIHtcbiAgICB0aGlzLmNvbnRleHQuY2xlYXJSZWN0KHgsIHksIHcsIGgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIGxpbmVXaWR0aDogZnVuY3Rpb24gKHNpemUpIHtcbiAgICB0aGlzLmNvbnRleHQubGluZVdpZHRoID0gc2l6ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBkcmF3SW1hZ2U6IGZ1bmN0aW9uIChzcmMsIHgsIHksIHdpZHRoLCBoZWlnaHQsIGZyYW1lKSB7XG4gICAgaWYgKHR5cGVvZiB3aWR0aCA9PT0gJ251bWJlcicpIHtcbiAgICAgIHRoaXMuY29udGV4dC5kcmF3SW1hZ2UoXG4gICAgICAgIGltYWdlc1tzcmNdLFxuICAgICAgICB3aWR0aCAqIGZyYW1lWzBdLFxuICAgICAgICBoZWlnaHQgKiBmcmFtZVsxXSxcbiAgICAgICAgd2lkdGgsIGhlaWdodCwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29udGV4dC5kcmF3SW1hZ2UoaW1hZ2VzW3NyY10sIHgsIHkpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIHNhdmU6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmNvbnRleHQuc2F2ZSgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIHNjYWxlOiBmdW5jdGlvbiAoeCwgeSkge1xuICAgIHRoaXMuY29udGV4dC5zY2FsZSh4LCB5KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICB0cmFuc2xhdGU6IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgdGhpcy5jb250ZXh0LnRyYW5zbGF0ZSh4LCB5KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICByZXN0b3JlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jb250ZXh0LnJlc3RvcmUoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBmb250OiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIHRoaXMuY29udGV4dC5mb250ID0gb3B0aW9ucztcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBmaWxsVGV4dDogZnVuY3Rpb24gKHRleHQsIHgsIHkpIHtcbiAgICB0aGlzLmNvbnRleHQuZmlsbFRleHQodGV4dCwgeCwgeSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgc2hhcGU6IGZ1bmN0aW9uICh0eXBlLCBvcHRpb25zKSB7XG4gICAgaWYgKHR5cGUgPT09IFwicmVjdGFuZ2xlXCIpIHtcbiAgICAgIGlmIChvcHRpb25zLmZpbGwpIHtcbiAgICAgICAgdGhpcy5jb250ZXh0LmZpbGxTdHlsZSA9IG9wdGlvbnMuZmlsbDtcbiAgICAgICAgdGhpcy5jb250ZXh0LmZpbGxSZWN0KFxuICAgICAgICAgIG9wdGlvbnMueCB8fCAwLFxuICAgICAgICAgIG9wdGlvbnMueSB8fCAwLFxuICAgICAgICAgIG9wdGlvbnMudyB8fCAxMCxcbiAgICAgICAgICBvcHRpb25zLmggfHwgMTApXG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucy5zdHJva2UpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMubGluZVdpZHRoKSB0aGlzLmNvbnRleHQubGluZVdpZHRoID0gb3B0aW9ucy5saW5lV2lkdGhcbiAgICAgICAgdGhpcy5jb250ZXh0LnN0cm9rZVN0eWxlID0gb3B0aW9ucy5zdHJva2U7XG4gICAgICAgIHRoaXMuY29udGV4dC5zdHJva2VSZWN0KFxuICAgICAgICAgIG9wdGlvbnMueCB8fCAwLFxuICAgICAgICAgIG9wdGlvbnMueSB8fCAwLFxuICAgICAgICAgIG9wdGlvbnMudyB8fCAxMCxcbiAgICAgICAgICBvcHRpb25zLmggfHwgMTApXG4gICAgICB9XG5cbiAgICB9XG4gIH1cbn1cbiIsIndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMub3ggPSB7XG4gICAgY2FudmFzOiByZXF1aXJlKCcuL2NhbnZhcycpLFxuICAgIGltYWdlczogcmVxdWlyZSgnLi9sb2FkZXInKS5pbWFnZXMsXG4gICAgYXVkaW86IHJlcXVpcmUoJy4vbG9hZGVyJykuYXVkaW8sXG4gICAgZGF0YTogcmVxdWlyZSgnLi9sb2FkZXInKS5kYXRhLFxuICAgIG1vdXNlOiByZXF1aXJlKCcuL21vdXNlJyksXG4gICAgc2NlbmVzOiByZXF1aXJlKCcuL3NjZW5lc01hbmFnZXInKSxcbiAgICBlbnRpdGllczogcmVxdWlyZSgnLi9lbnRpdGllc01hbmFnZXInKSxcbiAgICBzYXZlOiByZXF1aXJlKCcuL2xvY2FsU3RvcmFnZScpLFxuICAgIGxvb3A6IHJlcXVpcmUoJy4vZ2FtZUxvb3AnKSxcbiAgICBwcmVsb2FkZXI6IHJlcXVpcmUoJy4vbG9hZGVyJyksXG4gICAgc3ByaXRlOiBmdW5jdGlvbiAoc3JjLCBvcHRpb25zKSB7XG4gICAgICB2YXIgb2JqID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgIG9iai5zcmMgPSBzcmM7XG4gICAgICByZXR1cm4gcmVxdWlyZSgnLi9lbnRpdGllc01hbmFnZXInKS5zcGF3bignc3ByaXRlJywgb2JqKTtcbiAgICB9LFxuICB9O1xuICBveC5sb29wLmNhbGN1bGF0ZURlbHRhKCk7XG4gIG94LnNjZW5lcy5zZXQoJ2xvYWRpbmcnKTtcbiAgb3gubG9vcC5ydW4oKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3VycmVudDogW10sXG4gIGxpc3Q6IHJlcXVpcmUoJy4uL2VudGl0aWVzJyksXG4gIGRpcnR5WjogZmFsc2UsXG4gIHNwYXduOiBmdW5jdGlvbiAobmFtZSwgb3B0aW9ucykge1xuICAgIGlmICghdGhpcy5saXN0W25hbWVdKSB0aHJvdyBuZXcgRXJyb3IoXCJFbnRpdHkgJ1wiICsgbmFtZSArIFwiJyBkb2VzIG5vdCBleGlzdCBhbmQgY2Fubm90IGJlIHNwYXduZWQuXCIpO1xuICAgIHZhciBvYmogPSBvcHRpb25zIHx8IHt9O1xuICAgIGZvciAodmFyIGtleSBpbiB0aGlzLmxpc3RbbmFtZV0pIHtcbiAgICAgIG9ialtrZXldID0gdGhpcy5saXN0W25hbWVdW2tleV07XG4gICAgfVxuICAgIHRoaXMuY3VycmVudC5wdXNoKG9iaik7XG4gICAgaWYgKG9iai5pbml0KSBvYmouaW5pdCgpO1xuICAgIHJldHVybiBvYmo7XG4gIH0sXG4gIGNoZWNrWjogZnVuY3Rpb24gKGVudGl0eSkge1xuICAgIGlmICh0eXBlb2YgZW50aXR5LnogPT09ICd1bmRlZmluZWQnKSBlbnRpdHkueiA9IDA7XG4gICAgaWYgKGVudGl0eS56ICE9PSBlbnRpdHkubGFzdFopIHtcbiAgICAgIGVudGl0eS5sYXN0WiA9IGVudGl0eS56O1xuICAgICAgdGhpcy5kaXJ0eVogPSB0cnVlO1xuICAgIH1cbiAgfSxcbiAgc29ydEJ5WjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY3VycmVudC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICByZXR1cm4gYS56IC0gYi56O1xuICAgIH0pO1xuICB9XG59O1xuIiwidmFyIGVudGl0aWVzID0gcmVxdWlyZSgnLi9lbnRpdGllc01hbmFnZXInKSxcbiAgc2NlbmVzID0gcmVxdWlyZSgnLi9zY2VuZXNNYW5hZ2VyJyksXG4gIGNvbnRleHQgPSByZXF1aXJlKCcuL2NhbnZhcycpLmNvbnRleHQ7XG52YXIgY2FtZXJhID0ge1xuICB4OiAxLFxuICB5OiAyMFxufVxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNwZWVkOiAxLFxuICBkdDogMCxcbiAgc3RlcDogMSAvIDYwLFxuICBsYXN0RGVsdGE6IG5ldyBEYXRlKCksXG4gIG5vdzogbmV3IERhdGUoKSxcbiAgY2FsY3VsYXRlRGVsdGE6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmxhc3REZWx0YSA9IHRoaXMubm93O1xuICAgIHRoaXMubm93ID0gbmV3IERhdGUoKTtcbiAgICB0aGlzLmR0ICs9IE1hdGgubWluKDEsICh0aGlzLm5vdyAtIHRoaXMubGFzdERlbHRhKSAvIDEwMDApICogdGhpcy5zcGVlZDtcbiAgfSxcbiAgcnVuOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jYWxjdWxhdGVEZWx0YSgpO1xuXG4gICAgaWYgKGVudGl0aWVzLmRpcnR5Wikge1xuICAgICAgZW50aXRpZXMuc29ydEJ5WigpO1xuICAgICAgZW50aXRpZXMuZGlydHlaID0gZmFsc2U7XG4gICAgfVxuXG4gICAgd2hpbGUgKHRoaXMuZHQgPiB0aGlzLnN0ZXApIHtcbiAgICAgIHRoaXMuZHQgLT0gdGhpcy5zdGVwO1xuICAgICAgdGhpcy51cGRhdGUodGhpcy5zdGVwKTtcbiAgICB9XG4gICAgdGhpcy5kcmF3KHRoaXMuZHQpO1xuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMucnVuLmJpbmQodGhpcykpO1xuICB9LFxuXG4gIGRyYXc6IGZ1bmN0aW9uIChkdCkge1xuICAgIHZhciB0aW1lID0gbmV3IERhdGU7XG4gICAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgY29udGV4dC5jYW52YXMud2lkdGgsIGNvbnRleHQuY2FudmFzLmhlaWdodCk7XG4gICAgLy8gICAgb3guY2FudmFzLnNhdmUoKTtcbiAgICAvLyAgICBjYW1lcmEueSArPSAuNTtcbiAgICAvLyAgICBpZiAoY2FtZXJhLnkgPiAzMCkgY2FtZXJhLnkgPSAtMTA7XG4gICAgLy8gICAgb3guY2FudmFzLnRyYW5zbGF0ZShjYW1lcmEueCwgY2FtZXJhLnkpO1xuXG4gICAgaWYgKHNjZW5lcy5jdXJyZW50LmRyYXcpIHNjZW5lcy5jdXJyZW50LmRyYXcoZHQpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBlbnRpdGllcy5jdXJyZW50Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB2YXIgZW50aXR5ID0gZW50aXRpZXMuY3VycmVudFtpXTtcbiAgICAgIGlmIChlbnRpdHkuZHJhdykgZW50aXR5LmRyYXcoZHQpO1xuICAgIH1cbiAgICAvLyAgICBveC5jYW52YXMucmVzdG9yZSgpO1xuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG4gICAgaWYgKHNjZW5lcy5jdXJyZW50LnVwZGF0ZSkgc2NlbmVzLmN1cnJlbnQudXBkYXRlKGR0KTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZW50aXRpZXMuY3VycmVudC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgdmFyIGVudGl0eSA9IGVudGl0aWVzLmN1cnJlbnRbaV07XG4gICAgICBpZiAoZW50aXR5LnVwZGF0ZSkgZW50aXR5LnVwZGF0ZShkdCk7XG4gICAgfVxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW1hZ2VzOiB7fSxcbiAgZGF0YToge30sXG4gIGF1ZGlvOiB7fSxcbiAgYXNzZXRzVG9Mb2FkOiAwLFxuXG4gIGxvYWRJbWFnZTogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aGlzLmltYWdlc1tuYW1lXSA9IG5ldyBJbWFnZSgpO1xuICAgIHRoaXMuaW1hZ2VzW25hbWVdLm9ubG9hZCA9IHRoaXMuYXNzZXRzVG9Mb2FkLS07XG4gICAgdGhpcy5pbWFnZXNbbmFtZV0uc3JjID0gXCJpbWFnZXMvXCIgKyBuYW1lICsgXCIucG5nXCI7XG4gIH0sXG5cbiAgbG9hZERhdGE6IGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0O1xuICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQgJiYgeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgIHNlbGYuZGF0YVtmaWxlXSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIHNlbGYuYXNzZXRzVG9Mb2FkLS07XG4gICAgICB9XG4gICAgfTtcblxuICAgIHhoci5vcGVuKFwiR0VUXCIsIFwiZGF0YS9cIiArIGZpbGUgKyBcIi5qc29uXCIpO1xuICAgIHhoci5zZW5kKCk7XG4gIH0sXG5cbiAgbG9hZEF1ZGlvOiBmdW5jdGlvbiAobmFtZSkge30sXG5cbiAgbG9hZDogZnVuY3Rpb24gKG9iaikge1xuICAgIGlmIChvYmouaW1hZ2VzKSB7XG4gICAgICB0aGlzLmFzc2V0c1RvTG9hZCArPSBvYmouaW1hZ2VzLmxlbmd0aDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb2JqLmltYWdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLmxvYWRJbWFnZShvYmouaW1hZ2VzW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAob2JqLmRhdGEpIHtcbiAgICAgIHRoaXMuYXNzZXRzVG9Mb2FkICs9IG9iai5kYXRhLmxlbmd0aDtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgb2JqLmRhdGEubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdGhpcy5sb2FkRGF0YShvYmouZGF0YVtqXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG9iai5hdWRpbykge1xuICAgICAgdGhpcy5hc3NldHNUb0xvYWQgKz0gb2JqLmF1ZGlvLmxlbmd0aDtcbiAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgb2JqLmF1ZGlvLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIHRoaXMubG9hZEF1ZGlvKG9iai5hdWRpb1trXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgc3RvcmU6IGZ1bmN0aW9uIChudW0sIG9iaikge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKG51bSwgSlNPTi5zdHJpbmdpZnkob2JqKSk7XG4gIH0sXG4gIGxvYWQ6IGZ1bmN0aW9uIChudW0pIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShudW0pKTtcbiAgfSxcbiAgcmVtb3ZlOiBmdW5jdGlvbiAobnVtKSB7XG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0obnVtKTtcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIHg6IDAsXG4gIHk6IDBcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBjdXJyZW50OiBudWxsLFxuICBsaXN0OiByZXF1aXJlKCcuLi9zY2VuZXMnKSxcbiAgc2V0OiBmdW5jdGlvbiAobmFtZSkge1xuICAgIGlmICghdGhpcy5saXN0W25hbWVdKSB0aHJvdyBuZXcgRXJyb3IoXCJTY2VuZSAnXCIgKyBuYW1lICsgXCInIGRvZXMgbm90IGV4aXN0IVwiKTtcbiAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLmxpc3RbbmFtZV07XG4gICAgaWYgKHRoaXMuY3VycmVudC5pbml0KSB0aGlzLmN1cnJlbnQuaW5pdCgpO1xuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgc3ByaXRlOiByZXF1aXJlKCcuL2VudGl0aWVzL3Nwcml0ZS5qcycpLFxuICBjb3VudGVyOiByZXF1aXJlKCcuL2VudGl0aWVzL2NvdW50ZXIuanMnKSxcbiAgY291bnRlcjI6IHJlcXVpcmUoJy4vZW50aXRpZXMvY291bnRlcjIuanMnKSxcbiAgcG9uZXk6IHJlcXVpcmUoJy4vZW50aXRpZXMvcG9uZXkuanMnKVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52YWx1ZSA9IDEwMDtcbiAgfSxcbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52YWx1ZSsrO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnYgPSAxMDE7XG4gICAgdGhpcy5jID0gb3guZW50aXRpZXMuc3Bhd24oJ2NvdW50ZXInKTtcbiAgfSxcbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gICAgdGhpcy52YWx1ZSsrO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnggPSAwO1xuICB9LFxuXG4gIGRyYXc6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLngrKztcblxuICAgIG94LmNhbnZhc1xuICAgICAgLmZpbGxTdHlsZSgnYmx1ZScpXG4gICAgICAuZmlsbFJlY3QoODAsIDgwLCAxMDAsIDIwMClcbiAgICAgIC5zdHJva2VTdHlsZSgnZ3JleScpXG4gICAgICAuc3Ryb2tlUmVjdCg4MCwgODAsIDEwMCwgMjAwKVxuICAgICAgLmRyYXdJbWFnZSgncG9ueScsIHRoaXMueCwgMCk7XG5cbiAgICBveC5jYW52YXMuc2hhcGUoJ3JlY3RhbmdsZScsIHtcbiAgICAgIHg6IDgwLFxuICAgICAgeTogNDAsXG4gICAgICBoOiAxMDAsXG4gICAgICB3OiA0MCxcbiAgICAgIGZpbGw6IFwieWVsbG93XCIsXG4gICAgICBzdHJva2U6IFwiYmxhY2tcIixcbiAgICAgIGxpbmVXaWR0aDogMixcbiAgICB9KTtcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zcmNXaWR0aCA9IG94LmltYWdlc1t0aGlzLnNyY10ud2lkdGg7XG4gICAgdGhpcy53aWR0aCA9IHRoaXMud2lkdGggfHwgdGhpcy5zcmNXaWR0aDtcbiAgICB0aGlzLnNyY0hlaWdodCA9IG94LmltYWdlc1t0aGlzLnNyY10uaGVpZ2h0O1xuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5oZWlnaHQgfHwgdGhpcy5zcmNIZWlnaHQ7XG4gICAgdGhpcy54ID0gdGhpcy54IHx8IDA7XG4gICAgdGhpcy55ID0gdGhpcy55IHx8IDA7XG5cbiAgICBpZiAodGhpcy5hbmltYXRpb24pIHtcbiAgICAgIHRoaXMuaW5pdEFuaW1hdGlvbigpO1xuICAgICAgdGhpcy51cGRhdGUgPSB0aGlzLnVwZGF0ZUFuaW1hdGlvbjtcbiAgICAgIHRoaXMuZHJhdyA9IHRoaXMuZHJhd0FuaW1hdGlvbjtcbiAgICB9XG4gIH0sXG5cbiAgZHJhdzogZnVuY3Rpb24gKCkge1xuICAgIG94LmNhbnZhcy5kcmF3SW1hZ2UodGhpcy5zcmMsIHRoaXMueCwgdGhpcy55KTtcbiAgfSxcblxuICBpbml0QW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pc1BsYXlpbmcgPSB0cnVlO1xuICAgIHRoaXMuaXNGaW5pc2hlZCA9IGZhbHNlO1xuICAgIGlmICh0eXBlb2YgdGhpcy5sb29wICE9PSAnYm9vbGVhbicpIHRoaXMubG9vcCA9IHRydWU7XG4gICAgdGhpcy5jb3VudGVyID0gMDtcbiAgICB0aGlzLmZyYW1lUmF0ZSA9IHRoaXMuZnJhbWVSYXRlIHx8IDI7XG4gICAgdGhpcy5jYWxjdWxhdGVGcmFtZXMoKTtcblxuICAgIGlmICh0aGlzLmFuaW1hdGlvbnMpIHtcbiAgICAgIHRoaXMuYW5pbWF0aW9uQXJyYXkgPSB0aGlzLmFuaW1hdGlvbnNbdGhpcy5hbmltYXRpb25dXG4gICAgICB0aGlzLmFycmF5Q291bnRlciA9IDA7XG4gICAgICB0aGlzLmZyYW1lID0gdGhpcy5hbmltYXRpb25BcnJheVt0aGlzLmFycmF5Q291bnRlcl07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZnJhbWUgPSAwO1xuICAgIH1cblxuICB9LFxuXG4gIGNhbGN1bGF0ZUZyYW1lczogZnVuY3Rpb24gKCkge1xuICAgIHZhciB4ID0gMCxcbiAgICAgIHkgPSAwO1xuXG4gICAgdGhpcy5mcmFtZXMgPSBbWzAsIDBdXTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IHRoaXMuc3JjSGVpZ2h0IC8gdGhpcy5oZWlnaHQgKiB0aGlzLnNyY1dpZHRoIC8gdGhpcy53aWR0aDsgaSsrKSB7XG4gICAgICBpZiAoeCA8IHRoaXMuc3JjV2lkdGggLyB0aGlzLndpZHRoIC0gMSkge1xuICAgICAgICB4Kys7XG4gICAgICB9IGVsc2UgaWYgKHkgPCB0aGlzLnNyY0hlaWdodCAvIHRoaXMuaGVpZ2h0IC0gMSkge1xuICAgICAgICB5Kys7XG4gICAgICAgIHggPSAwO1xuICAgICAgfVxuICAgICAgdGhpcy5mcmFtZXMucHVzaChbeCwgeV0pO1xuICAgIH1cbiAgfSxcblxuICBkcmF3QW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgb3guY2FudmFzLmRyYXdJbWFnZSh0aGlzLnNyYywgdGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB0aGlzLmZyYW1lc1t0aGlzLmZyYW1lXSk7XG4gIH0sXG5cbiAgdXBkYXRlQW5pbWF0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jb3VudGVyICs9IDE7XG4gICAgaWYgKHRoaXMuY291bnRlciA+IHRoaXMuZnJhbWVSYXRlKSB7XG4gICAgICB0aGlzLmNvdW50ZXIgPSAwO1xuICAgICAgaWYgKHRoaXMuYW5pbWF0aW9ucykgdGhpcy5tdWx0aXBsZUFuaW1hdGlvbnMoKTtcbiAgICAgIGVsc2UgdGhpcy5zaW5nbGVBbmltYXRpb24oKVxuICAgIH1cbiAgfSxcblxuICBtdWx0aXBsZUFuaW1hdGlvbnM6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuaXNQbGF5aW5nKSByZXR1cm47XG4gICAgaWYgKHRoaXMuaXNGaW5pc2hlZCAmJiAhdGhpcy5sb29wKSByZXR1cm4gdGhpcy5maW5pc2hlZCgpO1xuXG4gICAgaWYgKHRoaXMuYXJyYXlDb3VudGVyID09PSB0aGlzLmFuaW1hdGlvbkFycmF5Lmxlbmd0aCAtIDEpIHtcbiAgICAgIHRoaXMuaXNGaW5pc2hlZCA9IHRydWU7XG4gICAgICB0aGlzLmZyYW1lID0gdGhpcy5hbmltYXRpb25BcnJheVswXVxuICAgICAgdGhpcy5hcnJheUNvdW50ZXIgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFycmF5Q291bnRlcisrO1xuICAgICAgdGhpcy5mcmFtZSA9IHRoaXMuYW5pbWF0aW9uQXJyYXlbdGhpcy5hcnJheUNvdW50ZXJdXG4gICAgfVxuICB9LFxuXG4gIHNpbmdsZUFuaW1hdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5pc1BsYXlpbmcpIHJldHVybjtcbiAgICBpZiAodGhpcy5pc0ZpbmlzaGVkICYmICF0aGlzLmxvb3ApIHJldHVybiB0aGlzLmZpbmlzaGVkKCk7XG5cbiAgICBpZiAodGhpcy5mcmFtZSA9PT0gKHRoaXMuZnJhbWVzLmxlbmd0aCAtIDEpKSB7XG4gICAgICB0aGlzLmlzRmluaXNoZWQgPSB0cnVlO1xuICAgICAgdGhpcy5mcmFtZSA9IDBcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5mcmFtZSArPSAxO1xuICAgIH1cbiAgfSxcblxuICBwbGF5OiBmdW5jdGlvbiAoYW5pbWF0aW9uLCBvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB2YXIgb3B0aW9ucyA9IHt9O1xuICAgIGlmIChvcHRpb25zLm9uU3RhcnQpIG9wdGlvbnMub25TdGFydCgpO1xuICAgIGlmIChvcHRpb25zLm9uRmluaXNoKSB0aGlzLm9uRmluaXNoID0gb3B0aW9ucy5vbkZpbmlzaDtcblxuICAgIGlmICghdGhpcy51cGRhdGUpIHRoaXMudXBkYXRlID0gdGhpcy51cGRhdGVBbmltYXRpb247XG5cbiAgICB0aGlzLmlzRmluaXNoZWQgPSBmYWxzZTtcbiAgICB0aGlzLmlzUGxheWluZyA9IHRydWU7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLmxvb3AgPT09ICdib29sZWFuJykgdGhpcy5sb29wID0gb3B0aW9ucy5sb29wO1xuXG4gICAgaWYgKHRoaXMuYW5pbWF0aW9ucykge1xuICAgICAgaWYgKGFuaW1hdGlvbikgdGhpcy5hbmltYXRpb24gPSBhbmltYXRpb247XG4gICAgICB0aGlzLmFuaW1hdGlvbkFycmF5ID0gdGhpcy5hbmltYXRpb25zW3RoaXMuYW5pbWF0aW9uXTtcbiAgICAgIHRoaXMuYXJyYXlDb3VudGVyID0gMDtcbiAgICAgIHRoaXMuZnJhbWUgPSB0aGlzLmFuaW1hdGlvbkFycmF5W3RoaXMuYXJyYXlDb3VudGVyXTtcblxuICAgIH1cbiAgfSxcblxuICBmaW5pc2hlZDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc3RvcCgpO1xuICAgIGlmICh0aGlzLm9uRmluaXNoKSB0aGlzLm9uRmluaXNoKCk7XG4gICAgdGhpcy51cGRhdGUgPSBudWxsO1xuICB9LFxuXG4gIHN0b3A6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlzUGxheWluZyA9IGZhbHNlO1xuICB9LFxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBsb2FkaW5nOiByZXF1aXJlKCcuL3NjZW5lcy9sb2FkaW5nLmpzJyksXG4gIG1haW46IHJlcXVpcmUoJy4vc2NlbmVzL21haW4uanMnKVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgb3gucHJlbG9hZGVyLmxvYWQocmVxdWlyZSgnLi4vYXNzZXRzLmpzJykpO1xuICAgIHRoaXMuYmFyTGVuZ3RoID0gb3gucHJlbG9hZGVyLmFzc2V0c1RvTG9hZDtcbiAgfSxcblxuICBkcmF3OiBmdW5jdGlvbiAoKSB7XG4gICAgb3guY2FudmFzLmZpbGxTdHlsZShcImJsYWNrXCIpXG4gICAgICAuZmlsbFJlY3QoMCwgMCwgb3guY2FudmFzLndpZHRoLCBveC5jYW52YXMuaGVpZ2h0KVxuICAgICAgLmZpbGxTdHlsZShcInJnYig0NiwgMjM4LCAyNDUpXCIpXG4gICAgICAuZmlsbFJlY3Qob3guY2FudmFzLndpZHRoIC8gNCwgMiAqIG94LmNhbnZhcy5oZWlnaHQgLyAzLCBveC5jYW52YXMud2lkdGggLyAyLCAxKVxuICAgICAgLmZpbGxTdHlsZShcImdyZXlcIilcbiAgICAgIC5zYXZlKClcbiAgICAgIC50cmFuc2xhdGUob3guY2FudmFzLndpZHRoIC8gNCwgMiAqIG94LmNhbnZhcy5oZWlnaHQgLyAzKVxuICAgICAgLnNjYWxlKC0xLCAxKVxuICAgICAgLmZpbGxSZWN0KC1veC5jYW52YXMud2lkdGggLyAyLCAwLCBveC5jYW52YXMud2lkdGggLyAyICogb3gucHJlbG9hZGVyLmFzc2V0c1RvTG9hZCAvIHRoaXMuYmFyTGVuZ3RoLCAxKVxuICAgICAgLnJlc3RvcmUoKVxuICAgICAgLmZpbGxTdHlsZShcIndoaXRlXCIpXG4gICAgICAuZm9udCgnMjAwJSBzYW5zLXNlcmlmJylcbiAgICAgIC5maWxsVGV4dCgnbG9hZGluZy4uLicsIG94LmNhbnZhcy53aWR0aCAvIDIgLSA2OCwgb3guY2FudmFzLmhlaWdodCAvIDIgKyAxMCk7XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKG94LnByZWxvYWRlci5hc3NldHNUb0xvYWQgPT09IDApIG94LnNjZW5lcy5zZXQoJ21haW4nKTtcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRlc3QgPSBveC5lbnRpdGllcy5zcGF3bignY291bnRlcjInKTtcbiAgICB0aGlzLnggPSAwO1xuICAgIHRoaXMucG9uZXkgPSBveC5lbnRpdGllcy5zcGF3bigncG9uZXknKTtcblxuICAgIHRoaXMuc3ByaXRlMyA9IG94LnNwcml0ZSgnY29pbjInLCB7XG4gICAgICB4OiAyMCxcbiAgICAgIGFuaW1hdGlvbjogJ3NwaW4nLFxuICAgICAgaGVpZ2h0OiA0MCxcbiAgICAgIHdpZHRoOiA0NFxuICAgIH0pO1xuXG4gICAgdGhpcy5zcHJpdGUgPSBveC5zcHJpdGUoJ2NvaW4yJywge1xuICAgICAgYW5pbWF0aW9uOiAnc3BpbjInLFxuICAgICAgbG9vcDogZmFsc2UsXG4gICAgICBoZWlnaHQ6IDQwLFxuICAgICAgd2lkdGg6IDQ0XG4gICAgfSk7XG4gICAgdGhpcy5zcHJpdGUyID0gb3guc3ByaXRlKCdjb2luMicsIHtcbiAgICAgIHg6IDgwLFxuICAgICAgeTogMSxcbiAgICAgIGFuaW1hdGlvbjogJ3NwaW4nLFxuICAgICAgYW5pbWF0aW9uczoge1xuICAgICAgICBzcGluOiBbMCwgMSwgMiwgMywgNCwgNCwgNCwgNCwgNSwgNiwgNywgOF0sXG4gICAgICAgIGlkbGU6IFs0XVxuICAgICAgfSxcbiAgICAgIGhlaWdodDogNDAsXG4gICAgICB3aWR0aDogNDRcbiAgICB9KTtcbiAgICB0aGlzLnNwcml0ZTIucGxheSgnc3BpbicsIHtcbiAgICAgIGxvb3A6IGZhbHNlLFxuICAgICAgb25GaW5pc2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJhbmltYXRpb24gZmluaXNoZWQhXCIpO1xuICAgICAgfSxcbiAgICAgIG9uU3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJhbmltYXRpb24gc3RhcnRlZCFcIik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgfSxcbiAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcblxuICAgIHRoaXMueCArPSAxMFxuICAgIGlmICh0aGlzLnggPiAzMDApIHRoaXMueCAtPSA0MDA7XG4gICAgaWYgKHRoaXMueCA8IDM5OSAmJiAhdGhpcy5pc1BsYXlpbmcpIHtcbiAgICAgIHRoaXMuc3ByaXRlMi5wbGF5KCdzcGluJywgdHJ1ZSk7XG4gICAgICB0aGlzLmlzUGxheWluZyA9IHRydWU7XG4gICAgfVxuICB9XG59O1xuIl19
