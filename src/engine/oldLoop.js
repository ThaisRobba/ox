ox.gameSpeed = 1;
ox.dt = ox.step = ox.lastStep = 0;

ox.calculateDeltaTime = function() {
  this.step = new Date;
  this.dt = ((this.step - this.lastStep) / 1000) * this.gameSpeed;
  this.lastStep = this.step;
};

ox.gameLoop = function() {
  ox.calculateDeltaTime();
  ox.ctx.clearRect(0, 0, ox.canvas.width, ox.canvas.height);

  if (ox.refreshZ) {
    ox.sortEntitiesByZ();
    ox.refreshZ = false;
  }

  if (ox.currentScene.update) ox.currentScene.update(ox.dt);

  for (var i = 0, len = ox.currentEntities.length; i < len; i++){
    var entity = ox.currentEntities[i];
    ox.checkEntityZ(entity);
    if (entity.update) entity.update(ox.dt);
    if (entity.draw) entity.draw(ox.dt);
  }


  requestAnimationFrame(ox.gameLoop);
}

ox.drawLoop = function(dt) {
  for (var i = 0, len = ox.currentEntities.length; i < len; i++){
    var entity = ox.currentEntities[i];
    if (entity.draw) entity.draw();
  }
}

ox.updateLoop = function(dt) {
  for (var i = 0, len = ox.currentEntities.length; i < len; i++){
    var entity = ox.currentEntities[i];
    if (entity.update) entity.update();
  }
}
window.onload = function() {
  ox.canvas = document.getElementById('canvas');
  ox.ctx = ox.canvas.getContext('2d');
  ox.calculateDeltaTime();
  ox.setScene('main');
  ox.gameLoop();
}
