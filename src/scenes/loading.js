module.exports = {
  init: function () {
    ox.preloader.load(require('../assets.js'));
    this.barLength = ox.preloader.assetsToLoad;
  },

  draw: function () {
    ox.canvas.fillStyle = "black"
    ox.canvas.fillRect(0, 0, ox.canvas.width, ox.canvas.height)
    ox.canvas.fillStyle = "rgb(46, 238, 245)"
    ox.canvas.fillRect(ox.canvas.width / 4, 2 * ox.canvas.height / 3, ox.canvas.width / 2, 1)
    ox.canvas.fillStyle = "grey"
    ox.canvas.save()
    ox.canvas.translate(ox.canvas.width / 4, 2 * ox.canvas.height / 3)
    ox.canvas.scale(-1, 1)
    ox.canvas.fillRect(-ox.canvas.width / 2, 0, ox.canvas.width / 2 * ox.preloader.assetsToLoad / this.barLength, 1)
    ox.canvas.restore()
    ox.canvas.fillStyle = "white"
    ox.canvas.font = '200% sans-serif'
    ox.canvas.fillText('loading...', ox.canvas.width / 2 - 68, ox.canvas.height / 2 + 10);
  },

  update: function () {
    if (ox.preloader.assetsToLoad === 0) ox.scenes.set('main');
  }
};
