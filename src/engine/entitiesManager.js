module.exports = {
  current: [],
  dirtyZ: false,
  create: function (name, obj) {
    this[name] = obj;
    this[name].z = 0 || obj.z;
    this[name].lastZ = 0;
  },
  spawn: function (name, options) {
    var obj = options || {};
    for (var key in this[name]) {
      obj[key] = this[name][key];
    }
    this.current.push(obj);
    obj.init();
    return obj;
  },
  checkZ: function (entity) {
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
