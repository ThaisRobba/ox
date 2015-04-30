var scene = require('./scenesManager');

module.exports = {
    x: 0,
    y: 0,
    isDown: false,
    onMove: function (e) {
        this.offset = ox.canvas.getBoundingClientRect();
        ox.mouse.x = e.clientX - this.offset.left;
        ox.mouse.y = e.clientY - this.offset.top;
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
