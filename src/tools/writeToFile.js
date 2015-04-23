var fs = require('fs');

module.exports = function (file, type, list) {
    var string;

    if (Array.isArray(type)) {
        string = "module.exports = [\n";
        for (var i = 0; i < list.length; i++) {
            string += "  '" + list[i];
            if (list[i] !== list[list.length - 1]) {
                string += "',\n";
            } else {
                string += "'\n];";
            }
        }
    } else {

        string = "module.exports = {\n";
        for (var i = 0; i < list.length; i++) {
            var name = list[i].slice(type, list[i].indexOf('.js'));
            string += "  '" + name + "': require('./" + file + "/" + name + ".js')";
            if (list[i] !== list[list.length - 1]) {
                string += ",\n";
            } else {
                string += "\n};";
            }
        }
    }
    if (string == fs.readFileSync('./src/' + file + '.js', 'utf-8')) return;

    fs.writeFile("./src/" + file + ".js", string, function (err) {
        if (err) {
            return console.log(err);
        }
    });
};
