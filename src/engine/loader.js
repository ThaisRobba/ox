ox.Load = function (obj) {
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
    ox.imagesToLoad--
  }
  ox.images[name].src = "images/" + name + ".png";
};

ox.Scene('loading', {
  init: function () {
    this.full = ox.imagesToLoad;
  },

  draw: function () {
    ox.ctx.fillStyle = "black";
    ox.ctx.fillRect(0, 0, ox.canvas.width, ox.canvas.height);
    ox.ctx.fillStyle = "rgb(46, 238, 245)";
    ox.ctx.fillRect(ox.canvas.width / 4, 2 * ox.canvas.height / 3, ox.canvas.width / 2, 1);
    ox.ctx.fillStyle = "grey";
    ox.ctx.save();
    ox.ctx.translate(ox.canvas.width / 4, 2 * ox.canvas.height / 3)
    ox.ctx.scale(-1, 1);
    ox.ctx.fillRect(-ox.canvas.width / 2, 0, ox.canvas.width / 2 * ox.imagesToLoad / this.full, 1);
    ox.ctx.restore();
    ox.ctx.fillStyle = "white";
    ox.ctx.font = '200% sans-serif';
    ox.ctx.fillText('loading...', ox.canvas.width / 2 - 68, ox.canvas.height / 2 + 10);
  },

  update: function () {
//    if (ox.imagesToLoad === 0) ox.setScene('main');
  }
});
