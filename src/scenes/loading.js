module.exports = {
  init: function () {
    ox.preloader.load(require('../assets.js'));
    this.barLength = ox.preloader.assetsToLoad;
  },

  draw: function () {
    ox.ctx.fillStyle = "black";
    ox.ctx.fillRect(0, 0, ox.canvas.width, ox.canvas.height);
    ox.ctx.fillStyle = "rgb(46, 238, 245)";
    ox.ctx.fillRect(ox.canvas.width / 4, 2 * ox.canvas.height / 3, ox.canvas.width / 2, 1);
    ox.ctx.fillStyle = "grey";
    ox.ctx.save();
    ox.ctx.translate(ox.canvas.width / 4, 2 * ox.canvas.height / 3);
    ox.ctx.scale(-1, 1);
    ox.ctx.fillRect(-ox.canvas.width / 2, 0, ox.canvas.width / 2 * ox.preloader.assetsToLoad / this.barLength, 1);
    ox.ctx.restore();
    ox.ctx.fillStyle = "white";
    ox.ctx.font = '200% sans-serif';
    ox.ctx.fillText('loading...', ox.canvas.width / 2 - 68, ox.canvas.height / 2 + 10);
  },

  update: function () {
    if (ox.preloader.assetsToLoad === 0) ox.scenes.set('main');
  }
};
