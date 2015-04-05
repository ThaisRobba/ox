var entities = require('./entitiesManager'),
  scenes = require('./scenesManager'),
  context = require('./canvas');
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
      if (entity.isAlive) {
        if (entity.draw) entity.draw(dt);
      }
    }
    //    ox.canvas.restore();
  },

  update: function (dt) {
    if (scenes.current.update) scenes.current.update(dt);
    for (var i = 0, len = entities.current.length; i < len; i++) {
      var entity = entities.current[i];
      if (entity.isAlive) {
        if (entity.update) entity.update(dt);
      }
    }
  }
}
