module.exports = {
  init: function () {
    var test = ox.entities.spawn('counter2');
    this.x = 0;
    this.poney = ox.entities.spawn('poney');
    ox.ctx.fillStyle = "lightblue";
  },
  draw: function () {
    ox.ctx.fillRect(this.x, 0, 100, 100);
  },
  update: function (dt) {
    this.x += 1;
    if (this.x > 300) this.x -= 400;
  }
};
