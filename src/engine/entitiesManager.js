var list = require('../entities'),
    current = [],
    toUpdate = [],
    toDraw = [],
    spawn = function (name, options) {
        if (!list[name]) throw new Error("Entity [" + name + "] does not exist and cannot be spawned.");
        var obj = options || {};
        for (var key in list[name]) {
            obj[key] = list[name][key];
        }
        obj.disable = disable.bind(obj);
        obj.enable = enable.bind(obj);
        obj.id = current.length;
        current.push(obj);
        if (obj.init) obj.init();
        obj.enable();
        return obj;
    },
    disable = function () {
        console.log(this.id);
        toDraw.splice(toDraw.indexOf(this.id), 1);
        toUpdate.splice(toUpdate.indexOf(this.id), 1);
    },
    enable = function () {
        console.log(this.id);
        if (this.update) toUpdate.push(this.id);
        if (this.draw) toDraw.push(this.id);
    };

module.exports = {
    current: current,
    list: list,
    toDraw: toDraw,
    toUpdate: toUpdate,
    spawn: spawn
};
