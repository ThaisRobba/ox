var fs = require('fs');

module.exports = function (file, type, list) {
  var string;

  if (Array.isArray(type)) {
    string = "module.exports = [\n";
  } else {
    string = "module.exports = {\n";
  }

  for (var i = 0; i < list.length; i++) {
    string += "  '" + list[i];
    if (list[i] !== list[list.length - 1]) {
      string += "',\n";
    } else {
      if (Array.isArray(type)) {
        string += "'\n];";
      } else {
        string += "'\n};";
      }
    }
  }

  fs.writeFile("./src/" + file, string, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log(file + " was updated!");
  });
};
