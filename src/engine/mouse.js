var scene = require('./scenesManager');

module.exports = {
    x: 0,
    y: 0,
    isDown: false,

    onMove: function (e) {
        ox.mouse.x = e.clientX - ox.canvas.offsetLeft;
        ox.mouse.y = e.clientY - ox.canvas.offsetTop;
        if (scene.current.mouseMove) scene.current.mouseMove(ox.mouse);
    },
    onUp: function (e) {
        if (scene.current.mouseUp) scene.current.mouseUp(this.buttons[e.button]);
        this.isDown = false;
    },
    onDown: function (e) {
        if (scene.current.mouseDown) scene.current.mouseDown(this.buttons[e.button]);
        this.isDown = true;
    },

    buttons: {
        0: "left",
        1: "middle",
        2: "right"
    }
};
