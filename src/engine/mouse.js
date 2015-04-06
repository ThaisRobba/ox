var scene = require('./scenesManager');

module.exports = {
  x: 0,
  y: 0,
  isPressed: {},

  onMove: function (e) {
    ox.mouse.x = e.clientX - ox.canvas.offsetLeft;
    ox.mouse.y = e.clientY - ox.canvas.offsetTop;
    if (scene.current.mouseMove) scene.current.mouseMove(ox.mouse)
  },
  onUp: function (e) {
    if (scene.current.mouseUp) scene.current.mouseUp(e);
  },
  onDown: function (e) {
    if (scene.current.mouseDown) scene.current.mouseDown(e);
  }
}

/**
  isPressed: {},
  keyDown: function (e) {
    if (scene.current.keyDown) scene.current.keyDown(this.keys[e.keyCode]);
    this.keyPress(e);
  },
  keyPress: function (e) {
    if (this.isPressed[e.keyCode]) return;
    if (scene.current.keyPress) scene.current.keyPress(this.keys[e.keyCode]);
    this.isPressed[e.keyCode] = true;
  },
  keyUp: function (e) {
    if (scene.current.keyUp) scene.current.keyUp(this.keys[e.keyCode]);
    this.isPressed[e.keyCode] = false;
  },
**/
