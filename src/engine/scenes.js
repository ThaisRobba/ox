ox.currentScene = {};
ox.scenes = {};
ox.Scene = function (name, obj) {
  this.scenes[name] = obj;
};
ox.setScene = function (name) {
  this.currentScene = this.scenes[name];
  this.currentScene.init();
};
