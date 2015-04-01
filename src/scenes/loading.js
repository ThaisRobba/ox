module.exports = {
  init: function () {
    ox.preloader.load(require('../assets.js'));
    this.barLength = ox.preloader.assetsToLoad;
  },

  draw: function () {
    ox.canvas.fillStyle("black")
      .fillRect(0, 0, ox.canvas.width, ox.canvas.height)
      .fillStyle("rgb(46, 238, 245)")
      .fillRect(ox.canvas.width / 4, 2 * ox.canvas.height / 3, ox.canvas.width / 2, 1)
      .fillStyle("grey")
      .save()
      .translate(ox.canvas.width / 4, 2 * ox.canvas.height / 3)
      .scale(-1, 1)
      .fillRect(-ox.canvas.width / 2, 0, ox.canvas.width / 2 * ox.preloader.assetsToLoad / this.barLength, 1)
      .restore()
      .fillStyle("white")
      .font('200% sans-serif')
      .fillText('loading...', ox.canvas.width / 2 - 68, ox.canvas.height / 2 + 10);
  },

  update: function () {
    if (ox.preloader.assetsToLoad === 0) ox.scenes.set('main');
  }
};
