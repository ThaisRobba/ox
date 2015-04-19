var current = [];

module.exports = {
    current: current,
    library: require('../entities.js'),
    spawn: function (name, options) {
        if (!this.library[name]) throw new Error("Entity '" + name + "' does not exist and cannot be spawned.");
        var obj = options || {};
        for (var key in this.library[name]) {
            obj[key] = this.library[name][key];
        }
        obj.remove = this.remove.bind(obj);
        obj.id = this.current.length;
        this.current.push(obj);
        if (obj.init) obj.init();
        //        if (obj.update) PUSH TO UPDATE LIST AND SAVE TIME :D
        obj.isReady = true;
        return obj;
    },

    remove: function () {
        var id = this.id;
        current.splice(this.id, 1);
        for (var i = 0; i < current.length; i++) {
            if (current[i].id > id) current[i].id--;
        }
    }
};
