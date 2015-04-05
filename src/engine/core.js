window.onload = function () {
  this.ox = {
    canvas: require('./canvas'),
    images: require('./loader').images,
    audio: require('./loader').audio,
    data: require('./loader').data,
    input: require('./input'),
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
      return this.entities.spawn(name, options);
    }
  };
  this.onkeydown = ox.input.keyDown.bind(ox.input);
  this.onkeyup = ox.input.keyUp.bind(ox.input);

  ox.loop.calculateDelta();
  ox.scenes.set('loading');
  ox.loop.run();
};
