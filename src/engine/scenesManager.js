var clearEntities = require('./entitiesManager').clear;


module.exports = {
    isChanging: false,
    current: null,
    list: require('../scenes.js'),
    set: function (name) {
        if (!this.list[name]) throw new Error("Scene [" + name + "] does not exist!");
        clearEntities();
        this.isChanging = true;
        this.current = null;
        this.current = this.list[name];
        this.current.init();
        this.isChanging = false;
    }
};
