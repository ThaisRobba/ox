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
    components: require('./entitiesManager'),
    save: require('./localStorage'),
    loop: require('./gameLoop'),
    preloader: require('./loader'),
    sprite: function (src, options) {
      var obj = options || {};
      obj.src = src;
      return this.components.spawn('sprite', obj);
    },
    spawn: function (name, options) {
      this.list = this.components.list;
      return this.components.spawn(name, options);
    }
  };

  ox.loop.calculateDelta();
  ox.scenes.set('loading');
  ox.loop.init();
};
