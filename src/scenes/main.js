module.exports = {
    init: function () {
        this.background1 = ox.spawn('sprite', {
            source: 'background.png'
        });

        this.background2 = ox.spawn('sprite', {
            source: 'background.png',
            x: 640
        });

        this.ox = ox.spawn('sprite', {
            source: 'ox.png',
            x: ox.canvas.width / 2,
            y: 234,
            width: 56,
            animation: 'walking',
            frameRate: 1
        });

        this.foreground1 = ox.spawn('sprite', {
            source: 'foreground.png'
        });

        this.foreground2 = ox.spawn('sprite', {
            source: 'foreground.png',
            x: 640
        });

        this.cursor = ox.spawn('sprite', {
            source: 'cursor.png'
        });
    },

    update: function (dt) {
        this.cursor.x = ox.mouse.x;
        this.cursor.y = ox.mouse.y;
        this.scroll(this.background1, dt);
        this.scroll(this.background2, dt);
        this.scroll(this.foreground1, dt);
        this.scroll(this.foreground2, dt);
    },

    scroll: function (image, dt) {
        var width = ox.data.example.backgroundWidth;
        image.x -= dt * 20;
        if (image.x < -width) image.x = width;
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
        ox.audio['ox.mp3'].play();
        console.log("Clicked: " + ox.mouse.x + ", " + ox.mouse.y + " with " + button + " button.");
    },

    mouseUp: function (button) {
        console.log("Released: " + ox.mouse.x + ", " + ox.mouse.y + " with " + button + " button.");
    }
};
