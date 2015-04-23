var drawSprite = require('./sprite/drawSprite'),
    animated = require('./sprite/animated');

module.exports = {
    init: function () {
        this.srcWidth = ox.images[this.source].width;
        this.srcHeight = ox.images[this.source].height;
        this.width = this.width || this.srcWidth;
        this.height = this.height || this.srcHeight;
        this.x = this.x || 0;
        this.y = this.y || 0;

        if (this.animation) animated.call(this);
    },

    draw: function () {
        drawSprite(this.source, this.x, this.y);
    },

    calculateFrames: function () {
        var x = 0,
            y = 0;
        this.frames = [[0, 0]];

        for (var i = 1; i < this.srcHeight / this.height * this.srcWidth / this.width; i++) {
            if (x < this.srcWidth / this.width - 1) {
                x++;
            } else if (y < this.srcHeight / this.height - 1) {
                y++;
                x = 0;
            }
            this.frames.push([x, y]);
        }
    }
};
