#!/usr/bin/env node

var fs = require('fs'),
  list = [],
  traverse = require('./traverse'),
  fileCheck = require('./fileCheck'),
  writeToFile = require('./writeToFile');

fileCheck('scenes.js');
traverse('./src/scenes', ['js'], list);
writeToFile('scenes', 13, list);
