window.ox = {
  canvas: null,
  ctx: null,
  images: require('./loader.js').images,
  audio: require('./loader.js').audio,
  data: require('./loader.js').data,
  mouse: {
    x: 0,
    y: 0
  },
  //  test: require('../../data/teste.json'),
  scenes: require('./scenesManager.js'),
  entities: require('./entitiesManager.js'),
  save: require('./localStorage.js'),
  loop: require('./gameLoop.js'),
  preloader: require('./loader.js')
};

ox.entities.create('counter', {
  init: function () {
    this.value = 100;
  },
  update: function () {
    this.value++;
  }
})
ox.scenes.create('main', {
  init: function () {
    var test = ox.entities.spawn('counter');
    this.x = 0;
  },
  draw: function () {
    ox.ctx.fillRect(this.x, 0, 100, 100);
    ox.ctx.drawImage(ox.images.pony, 0, 0)
  },
  update: function (dt) {
    this.x += 40 * dt;
    if (this.x > 300) this.x -= 400;
  }
});

var main = require('../main.js');

window.onload = function () {
  ox.canvas = document.getElementById('canvas');
  ox.ctx = ox.canvas.getContext('2d');
  ox.loop.calculateDelta();
  ox.scenes.set('loading');
  ox.loop.run();
};
