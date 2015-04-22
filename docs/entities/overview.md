---
layout: documentation
title: "Entities overview"
---

Think of entities as blocks of data and logic that only run when they are added onto an scene and enabled. They are composable, meaning one entity can call multiple other entities and they can be enabled/disabled as you see fit.

----

**Creating entity templates**

- [`module.exports={}`]({{site.url}}/docs/entities/creating.html)


**Spawning entities**

- [`ox.spawn(type, options)`]({{site.url}}/docs/entities/spawn.html)

**Properties**

- [`id`]({{site.url}}/docs/entities/id.html), [`type`]({{site.url}}/docs/entities/type.html)

**Methods**

- [`draw`]({{site.url}}/docs/entities/draw.html), [`disable`]({{site.url}}/docs/entities/disable.html), [`enable`]({{site.url}}/docs/entities/enable.html), [`init`]({{site.url}}/docs/entities/init.html), [`update`]({{site.url}}/docs/entities/update.html)

----

### Pong example

The paddles in pong are easily thought of as entities. We can spawn a sprite entity for the player and have it track the mouse y coordinate.

{% highlight javascript %}
module.exports = {
    init: function() {
        this.sprite = ox.spawn('sprite', {
            source: 'paddle.png',
            x: 20,
            y: 20
        });
    },
    
    update: function(dt) {
        this.sprite.y = ox.mouse.y;
    }
};
{% endhighlight %}

Done!
