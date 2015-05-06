module.exports = {
    images: {},
    data: {},
    audio: {},

    loadImage: function (path) {
        var name = path.slice(9, path.length),
            self = this;
        this.images[name] = new Image();
        this.images[name].onload = function() {
            self.assetsToLoad--;
        };
        this.images[name].src = path;
    },

    loadData: function (path) {
        var file = path.slice(7, path.length - 5),
            self = this,
            xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                self.data[file] = JSON.parse(xhr.responseText);
                self.assetsToLoad--;
            }
        };
        xhr.open("GET", path);
        xhr.send();
    },

    loadAudio: function (path) {
        var name = path.slice(8, path.length),
            self = this;
        this.audio[name] = new Audio(path);
        this.audio[name].oncanplaythrough = function() {
            self.assetsToLoad--;
        };
    },

    load: function (list) {
        this.assetsToLoad = list.length;

        for (var i = 0; i < list.length; i++) {
            if (list[i].indexOf('./images') > -1) {
                this.loadImage(list[i]);
            } else if (list[i].indexOf('./data') > -1) {
                this.loadData(list[i]);
            } else if (list[i].indexOf('./audio') > -1) {
                this.loadAudio(list[i]);
            }
        }

    }
};
