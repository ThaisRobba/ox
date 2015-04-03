(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  images: ['pony', 'pony2', 'pony3', 'pony4', 'pony5', 'coin', 'coinTwisted', 'coin2'],
  data: ['teste']
}

},{}],2:[function(require,module,exports){
var images = require('./loader.js').images

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

},{"./loader.js":6}],3:[function(require,module,exports){
window.onload = function () {
  this.ox = {
    canvas: require('./canvas.js'),
    images: require('./loader.js').images,
    audio: require('./loader.js').audio,
    data: require('./loader.js').data,
    mouse: require('./mouse.js'),
    scenes: require('./scenesManager.js'),
    entities: require('./entitiesManager.js'),
    save: require('./localStorage.js'),
    loop: require('./gameLoop.js'),
    preloader: require('./loader.js')
  };
  ox.loop.calculateDelta();
  ox.scenes.set('loading');
  ox.loop.run();
};

},{"./canvas.js":2,"./entitiesManager.js":4,"./gameLoop.js":5,"./loader.js":6,"./localStorage.js":7,"./mouse.js":8,"./scenesManager.js":9}],4:[function(require,module,exports){
module.exports = {
  current: [],
  list: require('../entities.js'),
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

},{"../entities.js":10}],5:[function(require,module,exports){
var entities = require('./entitiesManager.js'),
  scenes = require('./scenesManager.js'),
  context = require('./canvas.js').context;

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
    if (scenes.current.draw) scenes.current.draw(dt);
    for (var i = 0, len = entities.current.length; i < len; i++) {
      var entity = entities.current[i];
      if (entity.draw) entity.draw(dt);
    }
  },

  update: function (dt) {
    if (scenes.current.update) scenes.current.update(dt);
    for (var i = 0, len = entities.current.length; i < len; i++) {
      var entity = entities.current[i];
      if (entity.update) entity.update(dt);
    }
  }
}

},{"./canvas.js":2,"./entitiesManager.js":4,"./scenesManager.js":9}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
module.exports = {
  x: 0,
  y: 0
}

},{}],9:[function(require,module,exports){
module.exports = {
  current: null,
  list: require('../scenes.js'),
  set: function (name) {
    if (!this.list[name]) throw new Error("Scene '" + name + "' does not exist!");
    this.current = this.list[name];
    if (this.current.init) this.current.init();
  }
}

},{"../scenes.js":15}],10:[function(require,module,exports){
module.exports = {
  sprite: require('./entities/sprite.js'),
  counter: require('./entities/counter.js'),
  counter2: require('./entities/counter2.js'),
  poney: require('./entities/poney.js')
};

},{"./entities/counter.js":11,"./entities/counter2.js":12,"./entities/poney.js":13,"./entities/sprite.js":14}],11:[function(require,module,exports){
module.exports = {
  init: function () {
    this.value = 100;
  },
  update: function () {
    this.value++;
  }
};

},{}],12:[function(require,module,exports){
module.exports = {
  init: function () {
    this.v = 101;
    this.c = ox.entities.spawn('counter');
  },
  update: function () {
    //    this.value++;
  }
};

},{}],13:[function(require,module,exports){
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
    })
  }
};

},{}],14:[function(require,module,exports){
module.exports = {
  init: function () {
    this.srcWidth = ox.images[this.src].width;
    this.width = this.width || this.srcWidth;
    this.srcHeight = ox.images[this.src].height;
    this.height = this.height || this.srcHeight;

    if (this.animation) {
      this.update = this.updateAnimation;
      this.draw = this.drawAnimation;
      this.counter = 0;
      this.frame = 0;
      this.frameRate = this.frameRate || 5;
      this.frames = [[0, 0]];

      var x = y = 0;
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
  },

  draw: function () {
    ox.canvas.drawImage(this.src, this.x, this.y);
  },

  drawAnimation: function () {
    ox.canvas.drawImage(this.src, this.x, this.y, this.width, this.height, this.frames[this.frame]);
  },

  updateAnimation: function () {
    this.counter += 1;
    if (this.counter > this.frameRate) {
      if (this.frame === (this.frames.length - 1)) {
        this.frame = 0;
      } else {
        this.frame += 1;
      }
      this.counter = 0;
    }
  }
}

},{}],15:[function(require,module,exports){
module.exports = {
  loading: require('./scenes/loading.js'),
  main: require('./scenes/main.js')
};

},{"./scenes/loading.js":16,"./scenes/main.js":17}],16:[function(require,module,exports){
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

},{"../assets.js":1}],17:[function(require,module,exports){
module.exports = {
  init: function () {
    var test = ox.entities.spawn('counter2');
    this.x = 0;
    this.poney = ox.entities.spawn('poney');
    //    this.sprite = ox.entities.spawn('sprite', {
    //      src: 'coin',
    //      x: 0,
    //      y: 1,
    //      animation: 'spin',
    //      frameRate: 3,
    //      width: 44
    //    });
    //
    //    this.sprite2 = ox.entities.spawn('sprite', {
    //      src: 'coinTwisted',
    //      x: 20,
    //      y: 1,
    //      frameRate: 3,
    //      height: 44
    //    });
    this.sprite3 = ox.entities.spawn('sprite', {
      src: 'coin2',
      x: 20,
      y: 1,
      animation: 'spin',
      frameRate: 3,
      height: 40,
      width: 44
    });
  },
  draw: function () {},
  update: function (dt) {
    this.x += 1;
    if (this.x > 300) this.x -= 400;
  }
};

},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXNzZXRzLmpzIiwic3JjL2VuZ2luZS9jYW52YXMuanMiLCJzcmMvZW5naW5lL2NvcmUuanMiLCJzcmMvZW5naW5lL2VudGl0aWVzTWFuYWdlci5qcyIsInNyYy9lbmdpbmUvZ2FtZUxvb3AuanMiLCJzcmMvZW5naW5lL2xvYWRlci5qcyIsInNyYy9lbmdpbmUvbG9jYWxTdG9yYWdlLmpzIiwic3JjL2VuZ2luZS9tb3VzZS5qcyIsInNyYy9lbmdpbmUvc2NlbmVzTWFuYWdlci5qcyIsInNyYy9lbnRpdGllcy5qcyIsInNyYy9lbnRpdGllcy9jb3VudGVyLmpzIiwic3JjL2VudGl0aWVzL2NvdW50ZXIyLmpzIiwic3JjL2VudGl0aWVzL3BvbmV5LmpzIiwic3JjL2VudGl0aWVzL3Nwcml0ZS5qcyIsInNyYy9zY2VuZXMuanMiLCJzcmMvc2NlbmVzL2xvYWRpbmcuanMiLCJzcmMvc2NlbmVzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGltYWdlczogWydwb255JywgJ3BvbnkyJywgJ3BvbnkzJywgJ3Bvbnk0JywgJ3Bvbnk1JywgJ2NvaW4nLCAnY29pblR3aXN0ZWQnLCAnY29pbjInXSxcbiAgZGF0YTogWyd0ZXN0ZSddXG59XG4iLCJ2YXIgaW1hZ2VzID0gcmVxdWlyZSgnLi9sb2FkZXIuanMnKS5pbWFnZXNcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNvbnRleHQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKS5nZXRDb250ZXh0KCcyZCcpLFxuXG4gIGZpbGxTdHlsZTogZnVuY3Rpb24gKGNvbG9yKSB7XG4gICAgdGhpcy5jb250ZXh0LmZpbGxTdHlsZSA9IGNvbG9yO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIGZpbGxSZWN0OiBmdW5jdGlvbiAoeCwgeSwgdywgaCkge1xuICAgIHRoaXMuY29udGV4dC5maWxsUmVjdCh4LCB5LCB3LCBoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBzdHJva2VTdHlsZTogZnVuY3Rpb24gKGNvbG9yKSB7XG4gICAgdGhpcy5jb250ZXh0LnN0cm9rZVN0eWxlID0gY29sb3I7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgc3Ryb2tlUmVjdDogZnVuY3Rpb24gKHgsIHksIHcsIGgpIHtcbiAgICB0aGlzLmNvbnRleHQuc3Ryb2tlUmVjdCh4LCB5LCB3LCBoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBjbGVhclJlY3Q6IGZ1bmN0aW9uICh4LCB5LCB3LCBoKSB7XG4gICAgdGhpcy5jb250ZXh0LmNsZWFyUmVjdCh4LCB5LCB3LCBoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBsaW5lV2lkdGg6IGZ1bmN0aW9uIChzaXplKSB7XG4gICAgdGhpcy5jb250ZXh0LmxpbmVXaWR0aCA9IHNpemU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgZHJhd0ltYWdlOiBmdW5jdGlvbiAoc3JjLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBmcmFtZSkge1xuICAgIGlmICh0eXBlb2Ygd2lkdGggPT09ICdudW1iZXInKSB7XG4gICAgICB0aGlzLmNvbnRleHQuZHJhd0ltYWdlKFxuICAgICAgICBpbWFnZXNbc3JjXSxcbiAgICAgICAgd2lkdGggKiBmcmFtZVswXSxcbiAgICAgICAgaGVpZ2h0ICogZnJhbWVbMV0sXG4gICAgICAgIHdpZHRoLCBoZWlnaHQsIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNvbnRleHQuZHJhd0ltYWdlKGltYWdlc1tzcmNdLCB4LCB5KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBzYXZlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jb250ZXh0LnNhdmUoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBzY2FsZTogZnVuY3Rpb24gKHgsIHkpIHtcbiAgICB0aGlzLmNvbnRleHQuc2NhbGUoeCwgeSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgdHJhbnNsYXRlOiBmdW5jdGlvbiAoeCwgeSkge1xuICAgIHRoaXMuY29udGV4dC50cmFuc2xhdGUoeCwgeSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgcmVzdG9yZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY29udGV4dC5yZXN0b3JlKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgZm9udDogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICB0aGlzLmNvbnRleHQuZm9udCA9IG9wdGlvbnM7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgZmlsbFRleHQ6IGZ1bmN0aW9uICh0ZXh0LCB4LCB5KSB7XG4gICAgdGhpcy5jb250ZXh0LmZpbGxUZXh0KHRleHQsIHgsIHkpO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIHNoYXBlOiBmdW5jdGlvbiAodHlwZSwgb3B0aW9ucykge1xuICAgIGlmICh0eXBlID09PSBcInJlY3RhbmdsZVwiKSB7XG4gICAgICBpZiAob3B0aW9ucy5maWxsKSB7XG4gICAgICAgIHRoaXMuY29udGV4dC5maWxsU3R5bGUgPSBvcHRpb25zLmZpbGw7XG4gICAgICAgIHRoaXMuY29udGV4dC5maWxsUmVjdChcbiAgICAgICAgICBvcHRpb25zLnggfHwgMCxcbiAgICAgICAgICBvcHRpb25zLnkgfHwgMCxcbiAgICAgICAgICBvcHRpb25zLncgfHwgMTAsXG4gICAgICAgICAgb3B0aW9ucy5oIHx8IDEwKVxuICAgICAgfVxuICAgICAgaWYgKG9wdGlvbnMuc3Ryb2tlKSB7XG4gICAgICAgIGlmIChvcHRpb25zLmxpbmVXaWR0aCkgdGhpcy5jb250ZXh0LmxpbmVXaWR0aCA9IG9wdGlvbnMubGluZVdpZHRoXG4gICAgICAgIHRoaXMuY29udGV4dC5zdHJva2VTdHlsZSA9IG9wdGlvbnMuc3Ryb2tlO1xuICAgICAgICB0aGlzLmNvbnRleHQuc3Ryb2tlUmVjdChcbiAgICAgICAgICBvcHRpb25zLnggfHwgMCxcbiAgICAgICAgICBvcHRpb25zLnkgfHwgMCxcbiAgICAgICAgICBvcHRpb25zLncgfHwgMTAsXG4gICAgICAgICAgb3B0aW9ucy5oIHx8IDEwKVxuICAgICAgfVxuXG4gICAgfVxuICB9XG59XG4iLCJ3aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLm94ID0ge1xuICAgIGNhbnZhczogcmVxdWlyZSgnLi9jYW52YXMuanMnKSxcbiAgICBpbWFnZXM6IHJlcXVpcmUoJy4vbG9hZGVyLmpzJykuaW1hZ2VzLFxuICAgIGF1ZGlvOiByZXF1aXJlKCcuL2xvYWRlci5qcycpLmF1ZGlvLFxuICAgIGRhdGE6IHJlcXVpcmUoJy4vbG9hZGVyLmpzJykuZGF0YSxcbiAgICBtb3VzZTogcmVxdWlyZSgnLi9tb3VzZS5qcycpLFxuICAgIHNjZW5lczogcmVxdWlyZSgnLi9zY2VuZXNNYW5hZ2VyLmpzJyksXG4gICAgZW50aXRpZXM6IHJlcXVpcmUoJy4vZW50aXRpZXNNYW5hZ2VyLmpzJyksXG4gICAgc2F2ZTogcmVxdWlyZSgnLi9sb2NhbFN0b3JhZ2UuanMnKSxcbiAgICBsb29wOiByZXF1aXJlKCcuL2dhbWVMb29wLmpzJyksXG4gICAgcHJlbG9hZGVyOiByZXF1aXJlKCcuL2xvYWRlci5qcycpXG4gIH07XG4gIG94Lmxvb3AuY2FsY3VsYXRlRGVsdGEoKTtcbiAgb3guc2NlbmVzLnNldCgnbG9hZGluZycpO1xuICBveC5sb29wLnJ1bigpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBjdXJyZW50OiBbXSxcbiAgbGlzdDogcmVxdWlyZSgnLi4vZW50aXRpZXMuanMnKSxcbiAgZGlydHlaOiBmYWxzZSxcbiAgc3Bhd246IGZ1bmN0aW9uIChuYW1lLCBvcHRpb25zKSB7XG4gICAgaWYgKCF0aGlzLmxpc3RbbmFtZV0pIHRocm93IG5ldyBFcnJvcihcIkVudGl0eSAnXCIgKyBuYW1lICsgXCInIGRvZXMgbm90IGV4aXN0IGFuZCBjYW5ub3QgYmUgc3Bhd25lZC5cIik7XG4gICAgdmFyIG9iaiA9IG9wdGlvbnMgfHwge307XG4gICAgZm9yICh2YXIga2V5IGluIHRoaXMubGlzdFtuYW1lXSkge1xuICAgICAgb2JqW2tleV0gPSB0aGlzLmxpc3RbbmFtZV1ba2V5XTtcbiAgICB9XG4gICAgdGhpcy5jdXJyZW50LnB1c2gob2JqKTtcbiAgICBpZiAob2JqLmluaXQpIG9iai5pbml0KCk7XG4gICAgcmV0dXJuIG9iajtcbiAgfSxcbiAgY2hlY2taOiBmdW5jdGlvbiAoZW50aXR5KSB7XG4gICAgaWYgKHR5cGVvZiBlbnRpdHkueiA9PT0gJ3VuZGVmaW5lZCcpIGVudGl0eS56ID0gMDtcbiAgICBpZiAoZW50aXR5LnogIT09IGVudGl0eS5sYXN0Wikge1xuICAgICAgZW50aXR5Lmxhc3RaID0gZW50aXR5Lno7XG4gICAgICB0aGlzLmRpcnR5WiA9IHRydWU7XG4gICAgfVxuICB9LFxuICBzb3J0QnlaOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jdXJyZW50LnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIHJldHVybiBhLnogLSBiLno7XG4gICAgfSk7XG4gIH1cbn07XG4iLCJ2YXIgZW50aXRpZXMgPSByZXF1aXJlKCcuL2VudGl0aWVzTWFuYWdlci5qcycpLFxuICBzY2VuZXMgPSByZXF1aXJlKCcuL3NjZW5lc01hbmFnZXIuanMnKSxcbiAgY29udGV4dCA9IHJlcXVpcmUoJy4vY2FudmFzLmpzJykuY29udGV4dDtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNwZWVkOiAxLFxuICBkdDogMCxcbiAgc3RlcDogMSAvIDYwLFxuICBsYXN0RGVsdGE6IG5ldyBEYXRlKCksXG4gIG5vdzogbmV3IERhdGUoKSxcbiAgY2FsY3VsYXRlRGVsdGE6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmxhc3REZWx0YSA9IHRoaXMubm93O1xuICAgIHRoaXMubm93ID0gbmV3IERhdGUoKTtcbiAgICB0aGlzLmR0ICs9IE1hdGgubWluKDEsICh0aGlzLm5vdyAtIHRoaXMubGFzdERlbHRhKSAvIDEwMDApICogdGhpcy5zcGVlZDtcbiAgfSxcbiAgcnVuOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jYWxjdWxhdGVEZWx0YSgpO1xuXG4gICAgaWYgKGVudGl0aWVzLmRpcnR5Wikge1xuICAgICAgZW50aXRpZXMuc29ydEJ5WigpO1xuICAgICAgZW50aXRpZXMuZGlydHlaID0gZmFsc2U7XG4gICAgfVxuXG4gICAgd2hpbGUgKHRoaXMuZHQgPiB0aGlzLnN0ZXApIHtcbiAgICAgIHRoaXMuZHQgLT0gdGhpcy5zdGVwO1xuICAgICAgdGhpcy51cGRhdGUodGhpcy5zdGVwKTtcbiAgICB9XG4gICAgdGhpcy5kcmF3KHRoaXMuZHQpO1xuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMucnVuLmJpbmQodGhpcykpO1xuICB9LFxuXG4gIGRyYXc6IGZ1bmN0aW9uIChkdCkge1xuICAgIHZhciB0aW1lID0gbmV3IERhdGU7XG4gICAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgY29udGV4dC5jYW52YXMud2lkdGgsIGNvbnRleHQuY2FudmFzLmhlaWdodCk7XG4gICAgaWYgKHNjZW5lcy5jdXJyZW50LmRyYXcpIHNjZW5lcy5jdXJyZW50LmRyYXcoZHQpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBlbnRpdGllcy5jdXJyZW50Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB2YXIgZW50aXR5ID0gZW50aXRpZXMuY3VycmVudFtpXTtcbiAgICAgIGlmIChlbnRpdHkuZHJhdykgZW50aXR5LmRyYXcoZHQpO1xuICAgIH1cbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuICAgIGlmIChzY2VuZXMuY3VycmVudC51cGRhdGUpIHNjZW5lcy5jdXJyZW50LnVwZGF0ZShkdCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGVudGl0aWVzLmN1cnJlbnQubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHZhciBlbnRpdHkgPSBlbnRpdGllcy5jdXJyZW50W2ldO1xuICAgICAgaWYgKGVudGl0eS51cGRhdGUpIGVudGl0eS51cGRhdGUoZHQpO1xuICAgIH1cbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGltYWdlczoge30sXG4gIGRhdGE6IHt9LFxuICBhdWRpbzoge30sXG4gIGFzc2V0c1RvTG9hZDogMCxcblxuICBsb2FkSW1hZ2U6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhpcy5pbWFnZXNbbmFtZV0gPSBuZXcgSW1hZ2UoKTtcbiAgICB0aGlzLmltYWdlc1tuYW1lXS5vbmxvYWQgPSB0aGlzLmFzc2V0c1RvTG9hZC0tO1xuICAgIHRoaXMuaW1hZ2VzW25hbWVdLnNyYyA9IFwiaW1hZ2VzL1wiICsgbmFtZSArIFwiLnBuZ1wiO1xuICB9LFxuXG4gIGxvYWREYXRhOiBmdW5jdGlvbiAoZmlsZSkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdDtcbiAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0ICYmIHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICBzZWxmLmRhdGFbZmlsZV0gPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICBzZWxmLmFzc2V0c1RvTG9hZC0tO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB4aHIub3BlbihcIkdFVFwiLCBcImRhdGEvXCIgKyBmaWxlICsgXCIuanNvblwiKTtcbiAgICB4aHIuc2VuZCgpO1xuICB9LFxuXG4gIGxvYWRBdWRpbzogZnVuY3Rpb24gKG5hbWUpIHt9LFxuXG4gIGxvYWQ6IGZ1bmN0aW9uIChvYmopIHtcbiAgICBpZiAob2JqLmltYWdlcykge1xuICAgICAgdGhpcy5hc3NldHNUb0xvYWQgKz0gb2JqLmltYWdlcy5sZW5ndGg7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9iai5pbWFnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5sb2FkSW1hZ2Uob2JqLmltYWdlc1tpXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG9iai5kYXRhKSB7XG4gICAgICB0aGlzLmFzc2V0c1RvTG9hZCArPSBvYmouZGF0YS5sZW5ndGg7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG9iai5kYXRhLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHRoaXMubG9hZERhdGEob2JqLmRhdGFbal0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChvYmouYXVkaW8pIHtcbiAgICAgIHRoaXMuYXNzZXRzVG9Mb2FkICs9IG9iai5hdWRpby5sZW5ndGg7XG4gICAgICBmb3IgKHZhciBrID0gMDsgayA8IG9iai5hdWRpby5sZW5ndGg7IGsrKykge1xuICAgICAgICB0aGlzLmxvYWRBdWRpbyhvYmouYXVkaW9ba10pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIHN0b3JlOiBmdW5jdGlvbiAobnVtLCBvYmopIHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShudW0sIEpTT04uc3RyaW5naWZ5KG9iaikpO1xuICB9LFxuICBsb2FkOiBmdW5jdGlvbiAobnVtKSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0obnVtKSk7XG4gIH0sXG4gIHJlbW92ZTogZnVuY3Rpb24gKG51bSkge1xuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKG51bSk7XG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICB4OiAwLFxuICB5OiAwXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3VycmVudDogbnVsbCxcbiAgbGlzdDogcmVxdWlyZSgnLi4vc2NlbmVzLmpzJyksXG4gIHNldDogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBpZiAoIXRoaXMubGlzdFtuYW1lXSkgdGhyb3cgbmV3IEVycm9yKFwiU2NlbmUgJ1wiICsgbmFtZSArIFwiJyBkb2VzIG5vdCBleGlzdCFcIik7XG4gICAgdGhpcy5jdXJyZW50ID0gdGhpcy5saXN0W25hbWVdO1xuICAgIGlmICh0aGlzLmN1cnJlbnQuaW5pdCkgdGhpcy5jdXJyZW50LmluaXQoKTtcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNwcml0ZTogcmVxdWlyZSgnLi9lbnRpdGllcy9zcHJpdGUuanMnKSxcbiAgY291bnRlcjogcmVxdWlyZSgnLi9lbnRpdGllcy9jb3VudGVyLmpzJyksXG4gIGNvdW50ZXIyOiByZXF1aXJlKCcuL2VudGl0aWVzL2NvdW50ZXIyLmpzJyksXG4gIHBvbmV5OiByZXF1aXJlKCcuL2VudGl0aWVzL3BvbmV5LmpzJylcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudmFsdWUgPSAxMDA7XG4gIH0sXG4gIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudmFsdWUrKztcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy52ID0gMTAxO1xuICAgIHRoaXMuYyA9IG94LmVudGl0aWVzLnNwYXduKCdjb3VudGVyJyk7XG4gIH0sXG4gIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgIC8vICAgIHRoaXMudmFsdWUrKztcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy54ID0gMDtcbiAgfSxcblxuICBkcmF3OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy54Kys7XG5cbiAgICBveC5jYW52YXNcbiAgICAgIC5maWxsU3R5bGUoJ2JsdWUnKVxuICAgICAgLmZpbGxSZWN0KDgwLCA4MCwgMTAwLCAyMDApXG4gICAgICAuc3Ryb2tlU3R5bGUoJ2dyZXknKVxuICAgICAgLnN0cm9rZVJlY3QoODAsIDgwLCAxMDAsIDIwMClcbiAgICAgIC5kcmF3SW1hZ2UoJ3BvbnknLCB0aGlzLngsIDApO1xuXG4gICAgb3guY2FudmFzLnNoYXBlKCdyZWN0YW5nbGUnLCB7XG4gICAgICB4OiA4MCxcbiAgICAgIHk6IDQwLFxuICAgICAgaDogMTAwLFxuICAgICAgdzogNDAsXG4gICAgICBmaWxsOiBcInllbGxvd1wiLFxuICAgICAgc3Ryb2tlOiBcImJsYWNrXCIsXG4gICAgICBsaW5lV2lkdGg6IDIsXG4gICAgfSlcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zcmNXaWR0aCA9IG94LmltYWdlc1t0aGlzLnNyY10ud2lkdGg7XG4gICAgdGhpcy53aWR0aCA9IHRoaXMud2lkdGggfHwgdGhpcy5zcmNXaWR0aDtcbiAgICB0aGlzLnNyY0hlaWdodCA9IG94LmltYWdlc1t0aGlzLnNyY10uaGVpZ2h0O1xuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5oZWlnaHQgfHwgdGhpcy5zcmNIZWlnaHQ7XG5cbiAgICBpZiAodGhpcy5hbmltYXRpb24pIHtcbiAgICAgIHRoaXMudXBkYXRlID0gdGhpcy51cGRhdGVBbmltYXRpb247XG4gICAgICB0aGlzLmRyYXcgPSB0aGlzLmRyYXdBbmltYXRpb247XG4gICAgICB0aGlzLmNvdW50ZXIgPSAwO1xuICAgICAgdGhpcy5mcmFtZSA9IDA7XG4gICAgICB0aGlzLmZyYW1lUmF0ZSA9IHRoaXMuZnJhbWVSYXRlIHx8IDU7XG4gICAgICB0aGlzLmZyYW1lcyA9IFtbMCwgMF1dO1xuXG4gICAgICB2YXIgeCA9IHkgPSAwO1xuICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCB0aGlzLnNyY0hlaWdodCAvIHRoaXMuaGVpZ2h0ICogdGhpcy5zcmNXaWR0aCAvIHRoaXMud2lkdGg7IGkrKykge1xuICAgICAgICBpZiAoeCA8IHRoaXMuc3JjV2lkdGggLyB0aGlzLndpZHRoIC0gMSkge1xuICAgICAgICAgIHgrKztcbiAgICAgICAgfSBlbHNlIGlmICh5IDwgdGhpcy5zcmNIZWlnaHQgLyB0aGlzLmhlaWdodCAtIDEpIHtcbiAgICAgICAgICB5Kys7XG4gICAgICAgICAgeCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5mcmFtZXMucHVzaChbeCwgeV0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBkcmF3OiBmdW5jdGlvbiAoKSB7XG4gICAgb3guY2FudmFzLmRyYXdJbWFnZSh0aGlzLnNyYywgdGhpcy54LCB0aGlzLnkpO1xuICB9LFxuXG4gIGRyYXdBbmltYXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICBveC5jYW52YXMuZHJhd0ltYWdlKHRoaXMuc3JjLCB0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIHRoaXMuZnJhbWVzW3RoaXMuZnJhbWVdKTtcbiAgfSxcblxuICB1cGRhdGVBbmltYXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmNvdW50ZXIgKz0gMTtcbiAgICBpZiAodGhpcy5jb3VudGVyID4gdGhpcy5mcmFtZVJhdGUpIHtcbiAgICAgIGlmICh0aGlzLmZyYW1lID09PSAodGhpcy5mcmFtZXMubGVuZ3RoIC0gMSkpIHtcbiAgICAgICAgdGhpcy5mcmFtZSA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmZyYW1lICs9IDE7XG4gICAgICB9XG4gICAgICB0aGlzLmNvdW50ZXIgPSAwO1xuICAgIH1cbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGxvYWRpbmc6IHJlcXVpcmUoJy4vc2NlbmVzL2xvYWRpbmcuanMnKSxcbiAgbWFpbjogcmVxdWlyZSgnLi9zY2VuZXMvbWFpbi5qcycpXG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICBveC5wcmVsb2FkZXIubG9hZChyZXF1aXJlKCcuLi9hc3NldHMuanMnKSk7XG4gICAgdGhpcy5iYXJMZW5ndGggPSBveC5wcmVsb2FkZXIuYXNzZXRzVG9Mb2FkO1xuICB9LFxuXG4gIGRyYXc6IGZ1bmN0aW9uICgpIHtcbiAgICBveC5jYW52YXMuZmlsbFN0eWxlKFwiYmxhY2tcIilcbiAgICAgIC5maWxsUmVjdCgwLCAwLCBveC5jYW52YXMud2lkdGgsIG94LmNhbnZhcy5oZWlnaHQpXG4gICAgICAuZmlsbFN0eWxlKFwicmdiKDQ2LCAyMzgsIDI0NSlcIilcbiAgICAgIC5maWxsUmVjdChveC5jYW52YXMud2lkdGggLyA0LCAyICogb3guY2FudmFzLmhlaWdodCAvIDMsIG94LmNhbnZhcy53aWR0aCAvIDIsIDEpXG4gICAgICAuZmlsbFN0eWxlKFwiZ3JleVwiKVxuICAgICAgLnNhdmUoKVxuICAgICAgLnRyYW5zbGF0ZShveC5jYW52YXMud2lkdGggLyA0LCAyICogb3guY2FudmFzLmhlaWdodCAvIDMpXG4gICAgICAuc2NhbGUoLTEsIDEpXG4gICAgICAuZmlsbFJlY3QoLW94LmNhbnZhcy53aWR0aCAvIDIsIDAsIG94LmNhbnZhcy53aWR0aCAvIDIgKiBveC5wcmVsb2FkZXIuYXNzZXRzVG9Mb2FkIC8gdGhpcy5iYXJMZW5ndGgsIDEpXG4gICAgICAucmVzdG9yZSgpXG4gICAgICAuZmlsbFN0eWxlKFwid2hpdGVcIilcbiAgICAgIC5mb250KCcyMDAlIHNhbnMtc2VyaWYnKVxuICAgICAgLmZpbGxUZXh0KCdsb2FkaW5nLi4uJywgb3guY2FudmFzLndpZHRoIC8gMiAtIDY4LCBveC5jYW52YXMuaGVpZ2h0IC8gMiArIDEwKTtcbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAob3gucHJlbG9hZGVyLmFzc2V0c1RvTG9hZCA9PT0gMCkgb3guc2NlbmVzLnNldCgnbWFpbicpO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGVzdCA9IG94LmVudGl0aWVzLnNwYXduKCdjb3VudGVyMicpO1xuICAgIHRoaXMueCA9IDA7XG4gICAgdGhpcy5wb25leSA9IG94LmVudGl0aWVzLnNwYXduKCdwb25leScpO1xuICAgIC8vICAgIHRoaXMuc3ByaXRlID0gb3guZW50aXRpZXMuc3Bhd24oJ3Nwcml0ZScsIHtcbiAgICAvLyAgICAgIHNyYzogJ2NvaW4nLFxuICAgIC8vICAgICAgeDogMCxcbiAgICAvLyAgICAgIHk6IDEsXG4gICAgLy8gICAgICBhbmltYXRpb246ICdzcGluJyxcbiAgICAvLyAgICAgIGZyYW1lUmF0ZTogMyxcbiAgICAvLyAgICAgIHdpZHRoOiA0NFxuICAgIC8vICAgIH0pO1xuICAgIC8vXG4gICAgLy8gICAgdGhpcy5zcHJpdGUyID0gb3guZW50aXRpZXMuc3Bhd24oJ3Nwcml0ZScsIHtcbiAgICAvLyAgICAgIHNyYzogJ2NvaW5Ud2lzdGVkJyxcbiAgICAvLyAgICAgIHg6IDIwLFxuICAgIC8vICAgICAgeTogMSxcbiAgICAvLyAgICAgIGZyYW1lUmF0ZTogMyxcbiAgICAvLyAgICAgIGhlaWdodDogNDRcbiAgICAvLyAgICB9KTtcbiAgICB0aGlzLnNwcml0ZTMgPSBveC5lbnRpdGllcy5zcGF3bignc3ByaXRlJywge1xuICAgICAgc3JjOiAnY29pbjInLFxuICAgICAgeDogMjAsXG4gICAgICB5OiAxLFxuICAgICAgYW5pbWF0aW9uOiAnc3BpbicsXG4gICAgICBmcmFtZVJhdGU6IDMsXG4gICAgICBoZWlnaHQ6IDQwLFxuICAgICAgd2lkdGg6IDQ0XG4gICAgfSk7XG4gIH0sXG4gIGRyYXc6IGZ1bmN0aW9uICgpIHt9LFxuICB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuICAgIHRoaXMueCArPSAxO1xuICAgIGlmICh0aGlzLnggPiAzMDApIHRoaXMueCAtPSA0MDA7XG4gIH1cbn07XG4iXX0=
