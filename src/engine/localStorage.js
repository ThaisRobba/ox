ox.save = function (obj) {
  localStorage.setItem("save", JSON.stringify(obj));
};

ox.loadSave = function () {
  return JSON.parse(localStorage.getItem("save"));
};

ox.deleteSave = function () {
  localStorage.removeItem("save");
};
