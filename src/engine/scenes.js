ox.currentScene = {};
ox.scenes = {};
ox.Scene = function (name, obj) {
  this.scenes[name] = obj;
};
ox.setScene = function (name) {
  this.currentScene = this.scenes[name];
  if (this.currentScene.init) this.currentScene.init();
};
