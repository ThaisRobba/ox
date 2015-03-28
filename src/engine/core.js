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

window.onload = function () {
  ox.canvas = document.getElementById('canvas');
  ox.ctx = ox.canvas.getContext('2d');
  ox.loop.calculateDelta();
  ox.scenes.set('loading');
  ox.loop.run();
};
