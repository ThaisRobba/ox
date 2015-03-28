module.exports = {
  current: null,
  create: function (name, obj) {
    if (this[name]) throw new Error("Cannot create scene: '" + name + "', it already exists!");
    this[name] = obj;
  },
  set: function (name) {
    if (!this[name]) throw new Error("Scene '" + name + "' does not exist!");
    this.current = this[name];
    if (this.current.init) this.current.init();
  }
}
