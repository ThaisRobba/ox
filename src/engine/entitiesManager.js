module.exports = {
  current: [],
  list: require('../entities'),
  dirtyZ: false,
  spawn: function (name, options) {
    if (!this.list[name]) throw new Error("Entity '" + name + "' does not exist and cannot be spawned.");
    var obj = options || {};
    for (var key in this.list[name]) {
      obj[key] = this.list[name][key];
    }
    this.current.push(obj);
    if (obj.init) obj.init();
    return obj;
  },
  checkZ: function (entity) {
    if (typeof entity.z === 'undefined') entity.z = 0;
    if (entity.z !== entity.lastZ) {
      entity.lastZ = entity.z;
      this.dirtyZ = true;
    }
  },
  sortByZ: function () {
    this.current.sort(function (a, b) {
      return a.z - b.z;
    });
  }
};
