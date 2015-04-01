module.exports = {
  init: function () {
    this.counter = 0;
    this.frame = 1;
    this.frameWidth = this.frameWidth || ox.images[this.src].width;
    this.frameHeight = this.frameHeight || ox.images[this.src].height;
    this.ticksPerFrame = this.ticksPerFrame || 5;
    this.totalFrames = (ox.images[this.src].width / this.frameWidth) * (ox.images[this.src].height / this.frameHeight) || 0;
    console.log(this.totalFrames)
  },

  draw: function () {
    ox.canvas.drawImage(this.src, this.x, this.y, this.frameWidth, this.frameHeight, this.frame);
  },

  update: function () {
    this.counter += 1;
    if (this.counter > this.ticksPerFrame) {
      if (this.frame === this.totalFrames) this.frame = 0;
      else this.frame += 1;
      this.counter = 0;
    }
  }
}
