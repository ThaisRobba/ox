var drawSprite = require('./sprite/drawSprite'),
    animated = require('./sprite/animated');

module.exports = {
    init: function () {
        this.sourceWidth = ox.images[this.source].width || 1;
        this.sourceHeight = ox.images[this.source].height || 1;
        this.width = this.width || this.sourceWidth;
        this.height = this.height || this.sourceHeight;
        this.x = this.x || 0;
        this.y = this.y || 0;

        if (this.animation) animated.call(this);
    },

    draw: function () {
        drawSprite(this.source, this.x, this.y);
    }
};
