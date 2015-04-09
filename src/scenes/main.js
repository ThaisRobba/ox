module.exports = {
  init: function () {
    this.poney = ox.spawn('poney');
    this.staticPony = ox.sprite('pony');
    this.sprite2 = ox.sprite('coin2', {
      animation: 'spin',
      animations: {
        spin: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        idle: [8, 4, 8, 4, 8, 4, 8, 4, 8, 4, 8, 4, 8, 4, 8, 4]
      },
      height: 40,
      frameRate: 30,
      width: 44,
    });

    this.sprite2.play('spin', {
      loop: false
    });

  },

  update: function (dt) {
    this.sprite2.x = ox.mouse.x;
    this.sprite2.y = ox.mouse.y;
  },

  keyDown: function (key) {
    console.log("keyDown: " + key)
  },

  keyPress: function (key) {
    console.log("keyPress: " + key)
  },

  keyUp: function (key) {
    console.log("keyUp: " + key)
  },

  mouseDown: function (e) {
    console.log("Clicked at: " + ox.mouse.x + ", " + ox.mouse.y)
  },

  mouseUp: function (e) {
    console.log("Released at: " + ox.mouse.x + ", " + ox.mouse.y)

  }
};
