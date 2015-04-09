watchify src/engine/core.js -o build/ox.js -v -d -t require-globify & browser-sync start --server --files "build/ox.js"
