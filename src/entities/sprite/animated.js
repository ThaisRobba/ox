var drawSprite = require('./drawSprite'),
    init = function () {
        this.isPlaying = true;
        this.isFinished = false;
        this.pause = pause.bind(this);
        this.play = play.bind(this);
        this.finished = finished.bind(this);
        this.update = update.bind(this);
        this.draw = draw.bind(this);
        if (typeof this.loop !== 'boolean') this.loop = true;
        this.counter = 0;
        this.frameRate = this.frameRate || 30;
        this.calculateFrames();

        if (this.animations) {
            this.animationArray = this.animations[this.animation];
            this.arrayCounter = 0;
            this.frame = this.animationArray[this.arrayCounter];
        } else {
            this.frame = 0;
        }
    },
    draw = function () {
        drawSprite(this.source, this.x, this.y, this.width, this.height, this.frames[this.frame]);
    },
    update = function (dt) {
        if (!this.isPlaying) return;
        if (this.isFinished) return this.finished();

        this.counter += dt * 1000;
        if (this.counter > 1000 / this.frameRate) {
            this.counter = 0;
            if (this.animations) {
                multipleAnimations.call(this);
            } else {
                singleAnimation.call(this);
            }
        }
    },
    multipleAnimations = function () {
        if (this.arrayCounter === this.animationArray.length - 1) {
            if (!this.loop) this.isFinished = true;
            this.frame = this.animationArray[0];
            this.arrayCounter = 0;
        } else {
            this.arrayCounter++;
            this.frame = this.animationArray[this.arrayCounter];
        }
    },

    singleAnimation = function () {
        if (this.frame === (this.frames.length - 1)) {
            if (!this.loop) this.isFinished = true;
            this.frame = 0;
        } else {
            this.frame += 1;
        }
    },
    finished = function () {
        this.pause();
        if (this.callback) this.callback();
    },

    play = function (animation, options) {
        if (options) {
            for (var key in options) {
                this[key] = options[key];
            }
        }

        if (this.animations) {
            if (animation) this.animation = animation;
            this.animationArray = this.animations[this.animation];
            this.arrayCounter = 0;
            this.frame = this.animationArray[this.arrayCounter];
        }
        this.isFinished = false;
        this.isPlaying = true;
    },

    pause = function () {
        this.isPlaying = false;
    };

module.exports = init;
