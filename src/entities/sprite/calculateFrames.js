module.exports = function () {
    var x = 0,
        y = 0;
    this.frames = [[0, 0]];

    for (var i = 1; i < this.sourceHeight / this.height * this.sourceWidth / this.width; i++) {
        if (x < this.sourceWidth / this.width - 1) {
            x++;
        } else if (y < this.sourceHeight / this.height - 1) {
            y++;
            x = 0;
        }
        this.frames.push([x, y]);
    }
};
