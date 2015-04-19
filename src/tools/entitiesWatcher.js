#!/usr/bin/env node

var fs = require('fs'),
  list = [],
  traverse = require('./traverse'),
  fileCheck = require('./fileCheck'),
  writeToFile = require('./writeToFile');

fileCheck('entities.js');
traverse('./src/entities', ['js'], list);
writeToFile('entities', 15, list);
