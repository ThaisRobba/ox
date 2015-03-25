ox.Assets = function (obj) {
  ox._assets = obj;
};

ox.load = function (obj) {
  this.assetsToLoad = 0;

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
};

ox.loadImage = function (name) {
  ox.images[name] = new Image();
  ox.images[name].onload = function () {
    ox.assetsToLoad--;
  };
  ox.images[name].src = "images/" + name + ".png";
};


ox.loadData = function (file) {
  var xhr = new XMLHttpRequest;

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      ox.data[file] = JSON.parse(xhr.responseText);
      ox.assetsToLoad--;
    }
  };

  xhr.open("GET", "data/" + file + ".json");
  xhr.send();
};

ox.Scene('loading', {
  init: function () {
    ox.load(ox._assets);
    this.barLength = ox.assetsToLoad;
  },

  draw: function () {
    ox.ctx.fillStyle = "black";
    ox.ctx.fillRect(0, 0, ox.canvas.width, ox.canvas.height);
    ox.ctx.fillStyle = "rgb(46, 238, 245)";
    ox.ctx.fillRect(ox.canvas.width / 4, 2 * ox.canvas.height / 3, ox.canvas.width / 2, 1);
    ox.ctx.fillStyle = "grey";
    ox.ctx.save();
    ox.ctx.translate(ox.canvas.width / 4, 2 * ox.canvas.height / 3);
    ox.ctx.scale(-1, 1);
    ox.ctx.fillRect(-ox.canvas.width / 2, 0, ox.canvas.width / 2 * ox.assetsToLoad / this.barLength, 1);
    ox.ctx.restore();
    ox.ctx.fillStyle = "white";
    ox.ctx.font = '200% sans-serif';
    ox.ctx.fillText('loading...', ox.canvas.width / 2 - 68, ox.canvas.height / 2 + 10);
  },

  update: function () {
    if (ox.assetsToLoad === 0) ox.setScene('main');
  }
});
