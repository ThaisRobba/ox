ox.Entity('tinyCounter',{
  z: 3,

  init: function() {
    this.value = 1;
  },
  update: function() {
  }
});

ox.Entity('counter', {
  z: 0,

  init: function() {
    this.x = this.x || 0;
    this.y = this.y || 0;
    this.value = this.value || 0;
    ox.ctx.fillStyle = "lightblue";
  },

  draw: function(dt) {
    ox.fillRect(this.x, this.y, 100, 100);
    ox.ctx.drawImage(ox.images.pony, -this.x,-this.x/10);
  },

  update: function(dt) {
    this.x += Math.floor(dt * 100);
    if (this.x > ox.canvas.width) this.x = -200;
  }
});

ox.Scene('main', {
  init: function() {
    this.counter2 = ox.Spawn('counter', {y: 120});//, {value: 10, z: 3});//tiny: true});
    this.counter = ox.Spawn('counter');
    this.counter2 = ox.Spawn('counter', {x: - 200});//, {value: 10, z: 3});//tiny: true});
  },

  update: function(dt) {
  }
});
