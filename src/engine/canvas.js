var keyboard = require('./keyboard'),
    mouse = require('./mouse'),
    canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d');

canvas.tabIndex = 1000;
canvas.style.outline = "none";
canvas.onkeydown = keyboard.keyDown.bind(keyboard);
canvas.onkeyup = keyboard.keyUp.bind(keyboard);
canvas.onmousemove = mouse.onMove.bind(mouse);
canvas.onmousedown = mouse.onDown.bind(mouse);
canvas.onmouseup = mouse.onUp.bind(mouse);
canvas.style.cursor = "none";
canvas.oncontextmenu = function () {
    return false;
};

module.exports = context;
