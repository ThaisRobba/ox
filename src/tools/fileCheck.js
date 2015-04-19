var fs = require('fs');

module.exports = function (file) {
  try {
    var data = fs.readFileSync('./src/' + file, 'utf-8');
  } catch (err) {
    fs.writeFile("./src/" + file);
  }
};
