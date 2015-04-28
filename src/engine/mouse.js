var scene = require('./scenesManager');

module.exports = {
    x: 0,
    y: 0,
    isDown: false,
    offset: {},
    init: function () {
        if (ox.canvas.offsetParent) {
            this.offset.x = ox.canvas.offsetParent.offsetLeft + ox.canvas.offsetLeft;
            this.offset.y = ox.canvas.offsetParent.offsetTop + ox.canvas.offsetTop;
        } else {
            this.offset.x = ox.canvas.offsetLeft;
            this.offset.y = ox.canvas.offsetTop;
        }
    },

    onMove: function (e) {

        ox.mouse.x = e.clientX - this.offset.x;
        ox.mouse.y = e.clientY - this.offset.y;
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
