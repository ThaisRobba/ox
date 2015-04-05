module.exports = {
  init: function () {
    this.x = 0;
  },

  draw: function () {
    this.x++;
    ox.canvas.fillStyle = 'blue'
    ox.canvas.fillRect(80, 80, 100, 200)
    ox.canvas.strokeStyle = 'grey'
    ox.canvas.strokeRect(80, 80, 100, 200)
    ox.canvas.drawSprite('pony', this.x, 0);
    ox.canvas.drawSprite('pony', this.x + 10, 0);
  }
};
