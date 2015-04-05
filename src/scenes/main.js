module.exports = {
  init: function () {
    this.poney = ox.spawn('poney');
    this.staticPony = ox.sprite('pony');
    this.sprite2 = ox.sprite('coin2', {
      x: 80,
      y: 1,
      animation: 'spin',
      animations: {
        spin: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        idle: [8, 4, 8, 4, 8, 4, 8, 4, 8, 4, 8, 4, 8, 4, 8, 4]
      },
      height: 40,
      frameRate: 30,
      width: 44,
      onFinish: function () {
        this.x = 10;
        this.destroy();
        ox.scenes.current.testing();
      }
    });

    this.sprite2.play('spin', {
      loop: false
    });

  },
  testing: function () {
    console.log("I was called when the animation ended.")
  },

  update: function (dt) {

  },

  keyDown: function (key) {
    console.log("keyDown!" + key)
  },

  keyPress: function (key) {
    console.log("keyPress!" + key)
  },

  keyUp: function (key) {
    console.log("keyUp! " + key)
  }
};
