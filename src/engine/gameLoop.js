ox.gameSpeed = 1;
ox.dt = 0;
ox.step = 1/60;
ox.lastDelta = ox.now = new Date;

ox.calculateDeltaTime = function() {
  ox.lastDelta = ox.now;
  ox.now = new Date;
  ox.dt += Math.min(1, (ox.now - ox.lastDelta) / 1000) * ox.gameSpeed;
};

ox.gameLoop = function() {
  ox.calculateDeltaTime();

  if (ox.refreshZ) {
    ox.sortEntitiesByZ();
    ox.refreshZ = false;
  }

  while (ox.dt > ox.step) {
    ox.dt -= ox.step;
    ox.updateLoop(ox.step);
  }
  ox.drawLoop(ox.dt);

  requestAnimationFrame(ox.gameLoop);
}

ox.drawLoop = function(dt) {
  var time = new Date;
  ox.ctx.clearRect(0, 0, ox.canvas.width, ox.canvas.height);
  if (ox.currentScene.draw) ox.currentScene.draw(dt);
  for (var i = 0, len = ox.currentEntities.length; i < len; i++){
    var entity = ox.currentEntities[i];
    if (entity.draw) entity.draw(dt);
  }
}

ox.updateLoop = function(dt) {
    if (ox.currentScene.update) ox.currentScene.update(dt);
  for (var i = 0, len = ox.currentEntities.length; i < len; i++){
    var entity = ox.currentEntities[i];
    if (entity.update) entity.update(dt);
  }
}
window.onload = function() {
  ox.canvas = document.getElementById('canvas');
  ox.ctx = ox.canvas.getContext('2d');
  ox.calculateDeltaTime();
  ox.setScene('loading');
  ox.gameLoop();
}
