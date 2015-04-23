var clearEntities = require('./entitiesManager').clear,
    list = require('../scenes.js');

module.exports = {
    current: null,
    set: function (name) {
        if (!list[name]) throw new Error("Scene [" + name + "] does not exist!");
        clearEntities();
        this.current = list[name];
        this.current.init();
    }
};
