module.exports = {
  init: function () {
    this.x = 0;
  },

  draw: function () {
    this.x++;

    ox.canvas
      .fillStyle('blue')
      .fillRect(80, 80, 100, 200)
      .strokeStyle('grey')
      .strokeRect(80, 80, 100, 200)
      .drawImage('pony', this.x, 0);

    ox.canvas.shape('rectangle', {
      x: 80,
      y: 40,
      h: 100,
      w: 40,
      fill: "yellow",
      stroke: "black",
      lineWidth: 2,
    })
  }
};
