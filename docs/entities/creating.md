---
layout: documentation
title: "Creating new entities"
---

You can create new entity templates by creating a `.js` file within the `src/entities` folder (or sub-folders). This file should export an object.

----
**Basic template:**

{% highlight javascript %}
module.exports = {};
{% endhighlight %}

**Optional functions:**

- [`init`]({{site.url}}/docs/entities/init.html): called when an entity is first spawned. Useful for spawning other entities and setting up properties that you will use with this entity. 
- [`draw`]({{site.url}}/docs/entities/draw.html): called up to 60 times per second - on slower machines frames can be dropped to maintain a consistent gameplay experience.
- [`update`]({{site.url}}/docs/entities/update.html): called an average of 60 times per second in between frame updates.

If an entity doesn't need to init or draw or update, don't create the init or draw or update function for it. This helps performance as it avoids empty function calls.


**Reserved words:**

- [`id`]({{site.url}}/docs/entities/id.html), [`type`]({{site.url}}/docs/entities/type.html), [`disable`]({{site.url}}/docs/entities/disable.html), [`enable`]({{site.url}}/docs/entities/enable.html)

Over-writing any of these is likely to crash the engine and your game.

----

Below is a simple entity that, when spawned, draws a square that moves to the right of the screen.

{% highlight javascript %}
module.exports = {
    init: function() {
        this.x = 100;
    },
    
    draw: function() {
        ox.context.fillRect(this.x, 100, 100, 100);
    },
    
    update: function(dt) {
        this.x += dt;
    }
};
{% endhighlight %}
