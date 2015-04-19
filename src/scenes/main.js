module.exports = {
    init: function () {

        this.sprite2 = ox.sprite('coin2.png', {
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
            loop: true
        });

        this.sprite3 = ox.sprite('pony.png', {
            x: 100,
            y: 100
        });
        this.coin = ox.sprite('coin.png', {
            animation: 'spin',
            animations: {
                spin: [0, 1, 2, 3, 4, 5],
                idle: [4]
            },
            frameRate: 10,
            width: 44,
            height: 40
        });

        ox.spawn('player');

    },

    update: function (dt) {
        this.sprite2.x = ox.mouse.x;
        this.sprite2.y = ox.mouse.y;

        ox.camera.set(ox.mouse.x, ox.mouse.y);
    },

    keyDown: function (key) {
        console.log("keyDown: " + key);
    },

    keyPress: function (key) {
        console.log("keyPress: " + key);
    },

    keyUp: function (key) {
        console.log("keyUp: " + key);
    },

    mouseDown: function (e) {
        console.log("Clicked at: " + ox.mouse.x + ", " + ox.mouse.y, e);
    },

    mouseUp: function (e) {
        console.log("Released at: " + ox.mouse.x + ", " + ox.mouse.y);
    }
};
