var fs = require('fs');

function traverse(folder, type, list) {
  var files = fs.readdirSync(folder);

  for (var i = 0; i < files.length; i++) {
    for (var j = 0; j < type.length; j++) {
      if (files[i].indexOf(type[j]) > 0) {
        list.push(folder + "/" + files[i]);
      } else {
        var path = folder + "/" + files[i];
        if (fs.lstatSync(path).isDirectory()) {
          traverse(path, type, list);
        }
      }
    }
  }
}

module.exports = traverse;
