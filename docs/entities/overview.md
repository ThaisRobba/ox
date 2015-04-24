---
layout: documentation
title: "Entities overview"
---

Think of entities as the actors in a play. Sure, they are just blocks of data and logic but they can be infinitely instanced and they only run when they are enabled and added onto a scene.

They are composable, meaning one entity can call multiple other entities and they can be enabled/disabled as you see fit.

----

**Creating entity templates**

- [`module.exports={}`]({{site.url}}/docs/entities/creating.html)


**Spawning entities**

- [`ox.spawn(type, options)`]({{site.url}}/docs/entities/spawn.html)

- [`entity`: object]({{site.url}}/docs/entity/overview.html) returned by the spawn function.

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
