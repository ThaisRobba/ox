ox.Load = function(obj) {
  this.imagesToLoad = obj.images.length;
  this.assetsToLoad += this.imagesToLoad;
  if (this.imagesToLoad > 0) {
    for (var i = 0; i < this.imagesToLoad; i++) {
      this.loadImage(obj.images[i]);
    }
  }
}

ox.loadImage = function (name) {
  ox.images[name] = new Image();
  ox.images[name].onload = function () {
    this.imagesToLoad--
  }
  ox.images[name].src = "images/" + name + ".png";
};
