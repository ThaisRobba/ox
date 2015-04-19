var images = require('./loader').images,
    keyboard = require('./keyboard'),
    mouse = require('./mouse');

var canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d');

context.drawSprite = function (src, x, y, width, height, frame) {
    if (typeof width === 'number') {
        context.drawImage(
            images[src],
            width * frame[0],
            height * frame[1],
            width, height, x, y, width, height);
    } else {
        context.drawImage(images[src], x, y);
    }
};

canvas.tabIndex = 1000;
canvas.style.outline = "none";
canvas.onkeydown = keyboard.keyDown.bind(keyboard);
canvas.onkeyup = keyboard.keyUp.bind(keyboard);
canvas.onmousemove = mouse.onMove.bind(mouse);
canvas.onmousedown = mouse.onDown.bind(mouse);
canvas.onmouseup = mouse.onUp.bind(mouse);
canvas.height = 2000;
canvas.style.cursor = "none";

module.exports = context;
