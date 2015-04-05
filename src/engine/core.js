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
      return this.entities.spawn('sprite', obj);
    },
    spawn: function (name, options) {
      this.list = this.entities.list;
      this.entities.spawn(name, options);
    }
  };
  ox.loop.calculateDelta();
  ox.scenes.set('loading');
  ox.loop.run();
};
