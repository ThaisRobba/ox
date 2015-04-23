module.exports = {
    init: function () {

        this.sprite3 = ox.sprite('pony.png', {
            x: 0,
            y: 100
        });

        this.sprite4 = ox.sprite('pony.png', {
            x: 100,
            y: 100
        });

        this.sprite4 = ox.sprite('pony.png', {
            x: 200,
            y: 100
        });

        ox.spawn('timer', {
            target: 2000,
            callback: function (value) {
                console.log(value);
                this.sprite4.y += -10;
                if (this.sprite4.y < 0) this.sprite4.y = 200;
                ox.scenes.set('main');
            },
            context: this
        });
    },

    update: function (dt) {
        //        this.sprite2.x = ox.mouse.x;
        //        this.sprite2.y = ox.mouse.y;

        //        ox.camera.set(ox.mouse.x, ox.mouse.y);
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

    mouseDown: function (button) {
        console.log("Clicked at: " + ox.mouse.x + ", " + ox.mouse.y + " with the " + button + " button.");
    },

    mouseUp: function (button) {
        console.log("Released at: " + ox.mouse.x + ", " + ox.mouse.y + " with the " + button + " button.");
    }
};
