#!/usr/bin/env node

var fs = require('fs');
var list = [];

function traverse(folder) {
  var files = fs.readdirSync(folder);
  for (var i = 0; i < files.length; i++) {
    if (files[i].indexOf('.js') > 0) {
      list.push(folder + "/" + files[i]);
    } else {
      var path = folder + "/" + files[i];
      if (fs.lstatSync(path).isDirectory()) {
        traverse(path);
              }
    }
  }
}

function start() {
  try {
    var data = fs.readFileSync('./src/entities.js', 'utf-8');
  } catch (err) {
    fs.writeFile("./src/entities.js");
  }

  traverse('./src/entities');

  var string = "module.exports = {\n";
  for (var i = 0; i < list.length; i++) {
    var file = list[i].slice(15, list[i].indexOf('.js'));
    string += "  "+ file +": require('./entities/" + file + ".js')";
    if (list[i] !== list[list.length - 1]) {
      string += ",\n";
    } else {
      string += "\n};";
    }
  }

    if (string == fs.readFileSync('./src/entities.js', 'utf-8')) return;
  fs.writeFile("./src/entities.js", string, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("Entities file was updated!");
  });
}


start();
