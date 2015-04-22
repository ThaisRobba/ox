var fs = require('fs');

module.exports = function (file) {
    var path = './src/' + file;
    try {
        var data = fs.readFileSync(path, 'utf-8');
    } catch (err) {
        fs.writeFile(path);
    }
};
