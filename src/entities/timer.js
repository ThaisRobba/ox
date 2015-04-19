module.exports = {
  init: function () {
    this.value = 0;
    this.isFinished = false;
  },

  update: function (dt) {
    if (!this.isFinished && !this.isPaused) {
      this.value += dt;
      if (this.value >= this.goal) {
        this.isFinished = true;
        this.func();
        if (this.loop) this.restart();
      }
    }
  },

  restart: function () {
    this.value = 0;
    this.isFinished = false;
  },

  pause: function () {
    this.isPaused = true;
  },

  resume: function () {
    this.isPaused = false;
  },

};
