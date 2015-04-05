module.exports = {
  init: function () {
    this.srcWidth = ox.images[this.src].width;
    this.width = this.width || this.srcWidth;
    this.srcHeight = ox.images[this.src].height;
    this.height = this.height || this.srcHeight;
    this.x = this.x || 0;
    this.y = this.y || 0;

    if (this.animation) {
      this.initAnimation();
      this.update = this.updateAnimation;
      this.draw = this.drawAnimation;
    }
  },

  draw: function () {
    ox.canvas.drawImage(this.src, this.x, this.y);
  },

  initAnimation: function () {
    this.isPlaying = true;
    this.isFinished = false;
    if (typeof this.loop !== 'boolean') this.loop = true;
    this.counter = 0;
    this.frameRate = this.frameRate || 2;
    this.calculateFrames();

    if (this.animations) {
      this.animationArray = this.animations[this.animation]
      this.arrayCounter = 0;
      this.frame = this.animationArray[this.arrayCounter];
    } else {
      this.frame = 0;
    }

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
  },

  drawAnimation: function () {
    ox.canvas.drawImage(this.src, this.x, this.y, this.width, this.height, this.frames[this.frame]);
  },

  updateAnimation: function () {
    this.counter += 1;
    if (this.counter > this.frameRate) {
      this.counter = 0;
      if (this.animations) this.multipleAnimations();
      else this.singleAnimation()
    }
  },

  multipleAnimations: function () {
    if ((this.isFinished && !this.loop)) return this.stop();

    if (this.arrayCounter === this.animationArray.length - 1) {
      this.isFinished = true;
      this.frame = this.animationArray[0]
      this.arrayCounter = 0;
    } else {
      this.arrayCounter++;
      this.frame = this.animationArray[this.arrayCounter]
    }
  },

  singleAnimation: function () {
    if ((this.isFinished && !this.loop)) return this.stop();

    if (this.frame === (this.frames.length - 1)) {
      this.isFinished = true;
      this.frame = 0
    } else {
      this.frame += 1;
    }
  },

  play: function (animation, options) {
    this.isFinished = false;
    this.isPlaying = true;
    if (this.animations) {
      if (animation) this.animation = animation;
      this.animationArray = this.animations[this.animation];
      this.arrayCounter = 0;
      this.frame = this.animationArray[this.arrayCounter];
      if (typeof options.loop === 'boolean') this.loop = options.loop;
    }
  },

  stop: function () {
    this.isPlaying = false;
    return;
  },
};
