var images = require('./loader').images,
  canvas = document.getElementById('canvas').getContext('2d');
canvas.drawSprite = function (src, x, y, width, height, frame) {
  if (typeof width === 'number') {
    canvas.drawImage(
      images[src],
      width * frame[0],
      height * frame[1],
      width, height, x, y, width, height);
  } else {
    canvas.drawImage(images[src], x, y);
  }
};

module.exports = canvas;
