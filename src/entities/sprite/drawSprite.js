module.exports = function (src, x, y, width, height, frame) {
    if (typeof width === 'number') {
        ox.context.drawImage(
            ox.images[src],
            width * frame[0],
            height * frame[1],
            width, height, x, y, width, height);
    } else {
        ox.context.drawImage(ox.images[src], x, y);
    }
};
