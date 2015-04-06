window.onload = function () {
  this.ox = {
    canvas: require('./canvas').canvas,
    context: require('./canvas'),
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

  this.onkeydown = ox.keyboard.keyDown.bind(ox.keyboard);
  this.onkeyup = ox.keyboard.keyUp.bind(ox.keyboard);
  ox.canvas.onmousemove = ox.mouse.onMove.bind(ox.mouse);
  ox.canvas.onmousedown = ox.mouse.onDown.bind(ox.mouse);
  ox.canvas.onmouseup = ox.mouse.onUp.bind(ox.mouse);

  ox.loop.calculateDelta();
  ox.scenes.set('loading');
  ox.loop.run();
};
