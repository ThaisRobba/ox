module.exports = {
  init: function () {
    var test = ox.entities.spawn('counter2');
    this.x = 0;
    this.poney = ox.entities.spawn('poney');

    //    this.sprite3 = ox.sprite('coin2', {
    //      x: 20,
    //      animation: 'spin',
    //      height: 40,
    //      width: 44
    //    });
    //
    //    this.sprite = ox.sprite('coin2', {
    //      animation: 'spin2',
    //      loop: false,
    //      height: 40,
    //      width: 44
    //    });
    this.sprite2 = ox.sprite('coin2', {
      x: 80,
      y: 1,
      animation: 'spin',
      animations: {
        spin: [0, 1, 2, 3, 4, 4, 4, 4, 5, 6, 7, 8],
        idle: [8, 4, 8, 4, 8, 4, 8, 4, 8, 4, 8, 4, 8, 4, 8, 4]
      },
      height: 40,
      width: 44
    });
    this.sprite2.play('spin', {
      loop: false,
      onFinish: function () {
        this.x = 10;
        this.play();
        console.log("Finished!", this)

      },
      onStart: function () {
        console.log("animation started!");
      }
    });

  },
  test: function () {

  },

  update: function (dt) {

    this.x += 10
    if (this.x > 300) this.x -= 400;
    if (this.x < 399 && !this.isPlaying) {
      this.sprite2.play('spin', true);
      this.isPlaying = true;
    }
  }
};
