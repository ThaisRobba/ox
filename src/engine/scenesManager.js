var clearEntities = require('./entitiesManager').clear;

module.exports = {
    current: null,
    list: require('../scenes.js'),
    set: function (name) {
        if (!this.list[name]) throw new Error("Scene [" + name + "] does not exist!");
        clearEntities();
        this.current = this.list[name];
        this.current.init();
    }
};
