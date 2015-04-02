module.exports = {
  init: function () {
    var test = ox.entities.spawn('counter2');
    this.x = 0;
    this.poney = ox.entities.spawn('poney');
    //    this.sprite = ox.entities.spawn('sprite', {
    //      src: 'coin',
    //      x: 0,
    //      y: 1,
    //      animation: 'spin',
    //      frameRate: 3,
    //      width: 44
    //    });
    //
    //    this.sprite2 = ox.entities.spawn('sprite', {
    //      src: 'coinTwisted',
    //      x: 20,
    //      y: 1,
    //      frameRate: 3,
    //      height: 44
    //    });
    this.sprite3 = ox.entities.spawn('sprite', {
      src: 'coin2',
      x: 20,
      y: 1,
      animation: 'spin',
      frameRate: 3,
      height: 40,
      width: 44
    });
  },
  draw: function () {},
  update: function (dt) {
    this.x += 1;
    if (this.x > 300) this.x -= 400;
  }
};
