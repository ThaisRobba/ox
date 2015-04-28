module.exports = {
    init: function () {
        ox.preloader.load(require('../assets'));
        this.barLength = ox.preloader.assetsToLoad;
    },

    draw: function () {
        ox.context.fillStyle = "black";
        ox.context.fillRect(0, 0, ox.canvas.width, ox.canvas.height);
        ox.context.fillStyle = "grey";
        ox.context.fillRect(ox.canvas.width / 4, ox.canvas.height / 2, ox.canvas.width / 2, 1);
        ox.context.fillStyle = "grey";
        ox.context.fillStyle = "rgb(46, 238, 245)";
        ox.context.fillRect(ox.canvas.width / 4, ox.canvas.height / 2, ox.canvas.width / 2 - ox.canvas.width / 2 * ox.preloader.assetsToLoad / this.barLength, 1);
    },

    update: function () {
        if (ox.preloader.assetsToLoad === 0) ox.scenes.set('main');
    }
};
