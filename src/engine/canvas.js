var images = require('./loader.js').images

module.exports = {
  context: document.getElementById('canvas').getContext('2d'),

  fillStyle: function (color) {
    this.context.fillStyle = color;
    return this;
  },

  fillRect: function (x, y, w, h) {
    this.context.fillRect(x, y, w, h);
    return this;
  },

  strokeStyle: function (color) {
    this.context.strokeStyle = color;
    return this;
  },

  strokeRect: function (x, y, w, h) {
    this.context.strokeRect(x, y, w, h);
    return this;
  },

  clearRect: function (x, y, w, h) {
    this.context.clearRect(x, y, w, h);
    return this;
  },

  lineWidth: function (size) {
    this.context.lineWidth = size;
    return this;
  },

  drawImage: function (src, x, y, width, height, frame) {
    if (typeof width === 'number') {
      this.context.drawImage(
        images[src],
        width * frame[0],
        height * frame[1],
        width, height, x, y, width, height);
    } else {
      this.context.drawImage(images[src], x, y);
    }

    return this;
  },

  save: function () {
    this.context.save();
    return this;
  },

  scale: function (x, y) {
    this.context.scale(x, y);
    return this;
  },

  translate: function (x, y) {
    this.context.translate(x, y);
    return this;
  },

  restore: function () {
    this.context.restore();
    return this;
  },

  font: function (options) {
    this.context.font = options;
    return this;
  },

  fillText: function (text, x, y) {
    this.context.fillText(text, x, y);
    return this;
  },

  shape: function (type, options) {
    if (type === "rectangle") {
      if (options.fill) {
        this.context.fillStyle = options.fill;
        this.context.fillRect(
          options.x || 0,
          options.y || 0,
          options.w || 10,
          options.h || 10)
      }
      if (options.stroke) {
        if (options.lineWidth) this.context.lineWidth = options.lineWidth
        this.context.strokeStyle = options.stroke;
        this.context.strokeRect(
          options.x || 0,
          options.y || 0,
          options.w || 10,
          options.h || 10)
      }

    }
  }
}
