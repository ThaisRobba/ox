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
