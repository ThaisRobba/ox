ox.entities = {};
ox.currentEntities = [];
ox.sortEntitiesByZ = function() {
  ox.currentEntities.sort(function(a, b) {
    return a.z - b.z;
  });
};

ox.checkEntityZ = function(entity) {
  if (entity.z !== entity.lastZ) {
    entity.lastZ = entity.z;
    this.refreshZ = true;
  }
}

ox.Entity = function (name, obj) {
  this.entities[name] = obj;
  this.entities[name].z = 0 || obj.z;
  this.entities[name].lastZ = 0;
};

ox.Spawn = function (name, options) {
  var obj = options || {};
  for (var key in ox.entities[name]) {
    obj[key] = ox.entities[name][key];
  }
  this.currentEntities.push(obj);
  obj.init();
  return obj;
};
