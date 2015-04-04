module.exports = {
  init: function () {
    this.srcWidth = ox.images[this.src].width;
    this.width = this.width || this.srcWidth;
    this.srcHeight = ox.images[this.src].height;
    this.height = this.height || this.srcHeight;

    if (this.animation) {
      this.update = this.updateAnimation;
      this.draw = this.drawAnimation;
      this.counter = 0;
      this.frame = 0;
      this.frameRate = this.frameRate || 5;
      this.frames = [[0, 0]];

      var x = 0,
          y = 0;

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
  },

  draw: function () {
    ox.canvas.drawImage(this.src, this.x, this.y);
  },

  drawAnimation: function () {
    ox.canvas.drawImage(this.src, this.x, this.y, this.width, this.height, this.frames[this.frame]);
  },

  updateAnimation: function () {
    this.counter += 1;
    if (this.counter > this.frameRate) {
      if (this.frame === (this.frames.length - 1)) {
        this.frame = 0;
      } else {
        this.frame += 1;
      }
      this.counter = 0;
    }
  }
};
