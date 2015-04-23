#!/usr/bin/env node

var fs = require('fs'),
    list = [],
    traverse = require('./traverse'),
    fileCheck = require('./fileCheck'),
    writeToFile = require('./writeToFile');

fileCheck('assets.js');
traverse('./images', ['png', 'jpg', 'gif'], list);
traverse('./data', ['json'], list);
traverse('./audio', ['mp3', 'ogg'], list);
writeToFile('assets', [], list);
