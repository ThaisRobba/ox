module.exports = {
  init: function () {
    var test = ox.entities.spawn('counter2');
    this.x = 0;
    this.poney = ox.entities.spawn('poney');
    this.sprite3 = ox.entities.spawn('sprite', {
      src: 'coin2',
      x: 20,
      y: 1,
      animation: 'spin',
      frameRate: 3,
      height: 40,
      width: 44
    });
    this.sprite = ox.entities.spawn('sprite', {
      src: 'coin2',
      x: 80,
      y: 1,
      animation: 'spin',
      animations: {
        spin: [0, 1, 2, 3, 4, 4, 4, 4, 5, 6, 7, 8],
        idle: [8, 0, 8, 0, 8, 0]
      },
      loop: false,
      frameRate: 2,
      height: 40,
      width: 44
    });
    this.sprite.play('spin', true);
  },
  draw: function () {

  },
  update: function (dt) {

    this.x += 1;
    if (this.x > 300) this.x -= 400;
  }
};
