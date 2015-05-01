module.exports = {
    init: function () {
        this.value = 0;
        this.target = this.target || 1000;
        this.callback = this.callback || function () {};
    },

    update: function (dt) {
        this.value = Math.round(this.value + dt * 1000);
        if (this.value >= this.target) {
            if (this.context) {
                this.callback(this.context, this.value);
            } else {
                this.callback(this.value);
            }

            if (this.loop) {
                this.value = 0;
            } else {
                this.disable();
            }
        }
    },

    restart: function () {
        this.value = 0;
        this.enable();
    }
};
