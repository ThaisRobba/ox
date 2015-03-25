ox.Load = function (obj) {
  if (!obj.images) obj.images = [];
  if (!obj.data) obj.data = [];
  if (!obj.audio) obj.audio = [];

  var images  = obj.images.length  || 0,
      data    = obj.data.length    || 0,
      audio   = obj.audio.length   || 0;

  this.assetsToLoad = images + data + audio;

  //I need to call the loading function for each thing. It is mostly the same interface.
  if (images > 0) {
    for (var i = 0; i < images; i++) {
      this.loadImage(obj.images[i]);
    }
  }

  if (data > 0) {
    for (var i = 0; i < data; i++){
      this.loadData(obj.data[i]);
    }
  }

  if (audio > 0) {
    for (var i = 0; i < audio; i++){
      this.loadData(obj.data[i]);
    }
  }
}

//IMAGE LOADING
ox.loadImage = function (name) {
  ox.images[name] = new Image();
  ox.images[name].onload = function () {
    ox.assetsToLoad--
    console.log(name + " fully loaded!")
  }
  ox.images[name].src = "images/" + name + ".png";
};


//JSON LOADING
var xhr = new XMLHttpRequest;

xhr.onreadystatechange = function () {
  if (xhr.readyState === 4 && xhr.status === 200) {
    var str = xhr.responseURL;
    var cutoff = str.indexOf('data/') + 5;
    var filename = str.slice(cutoff, -5);
    ox.data[filename] = JSON.parse(xhr.responseText);
    ox.assetsToLoad--;
  }
}

ox.loadData = function (file) {
  xhr.open("GET", "data/" + file + ".json");
  xhr.send();
}


//LOADING SCENE
ox.Scene('loading', {
  init: function () {
    this.full = ox.imagesToLoad;
  },

  draw: function () {
    ox.ctx.fillStyle = "black";
    ox.ctx.fillRect(0, 0, ox.canvas.width, ox.canvas.height);
    ox.ctx.fillStyle = "rgb(46, 238, 245)";
    ox.ctx.fillRect(ox.canvas.width / 4, 2 * ox.canvas.height / 3, ox.canvas.width / 2, 1);
    ox.ctx.fillStyle = "grey";
    ox.ctx.save();
    ox.ctx.translate(ox.canvas.width / 4, 2 * ox.canvas.height / 3)
    ox.ctx.scale(-1, 1);
    ox.ctx.fillRect(-ox.canvas.width / 2, 0, ox.canvas.width / 2 * ox.imagesToLoad / this.full, 1);
    ox.ctx.restore();
    ox.ctx.fillStyle = "white";
    ox.ctx.font = '200% sans-serif';
    ox.ctx.fillText('loading...', ox.canvas.width / 2 - 68, ox.canvas.height / 2 + 10);
  },

  update: function () {
        if (ox.assetsToLoad === 0) ox.setScene('main');
  }
});
