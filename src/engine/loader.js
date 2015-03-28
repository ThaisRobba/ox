module.exports = {
  images: {},
  data: {},
  audio: {},
  assetsToLoad: 0,

  loadImage: function (name) {
    this.images[name] = new Image();
    this.images[name].onload = this.assetsToLoad--;
    this.images[name].src = "images/" + name + ".png";
  },

  loadData: function (file) {
    var self = this,
      xhr = new XMLHttpRequest;
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        self.data[file] = JSON.parse(xhr.responseText);
        self.assetsToLoad--;
      }
    };

    xhr.open("GET", "data/" + file + ".json");
    xhr.send();
  },

  loadAudio: function (name) {},

  load: function (obj) {
    if (obj.images) {
      this.assetsToLoad += obj.images.length;
      for (var i = 0; i < obj.images.length; i++) {
        this.loadImage(obj.images[i]);
      }
    }

    if (obj.data) {
      this.assetsToLoad += obj.data.length;
      for (var j = 0; j < obj.data.length; j++) {
        this.loadData(obj.data[j]);
      }
    }

    if (obj.audio) {
      this.assetsToLoad += obj.audio.length;
      for (var k = 0; k < obj.audio.length; k++) {
        this.loadAudio(obj.audio[k]);
      }
    }
  }
}
