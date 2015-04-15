#!/usr/bin/env node

var fs = require('fs');
var list = [];

function traverse(folder) {
  var files = fs.readdirSync(folder);
  for (var i = 0; i < files.length; i++) {
    if (files[i].indexOf('.png') > 0 || files[i].indexOf('.jpg') > 0 || files[i].indexOf('.json') > 0 || files[i].indexOf('.mp3') > 0 || files[i].indexOf('.ogg') > 0) {
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
    var data = fs.readFileSync('./src/assets.js', 'utf-8');
  } catch (err) {
    fs.writeFile("./src/assets.js");
  }

  traverse('./images');
  traverse('./data');
  if (list.toString() == require('../assets.js')) return;
  var string = "module.exports = [\n";
  for (var i = 0; i < list.length; i++) {
    string += "  '" + list[i];
    if (list[i] !== list[list.length - 1]) {
      string += "',\n";
    } else {
      string += "'\n];";
    }
  }
  fs.writeFile("./src/assets.js", string, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("Assets file was updated!");
  });
}


start();
