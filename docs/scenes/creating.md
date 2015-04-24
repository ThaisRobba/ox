---
layout: documentation
title: "Creating new scenes"
---

You can create new scene templates by creating a `.js` file within the `src/scenes` folder (or sub-folders). This file should export an object.

----
**Basic template:**

{% highlight javascript %}
module.exports = {};
{% endhighlight %}

**Optional functions:**

- [`init`]({{site.url}}/docs/scenes/init.html): called when first entering into the scene. Useful for spawning entities and setting up properties that you will use. 
- [`draw`]({{site.url}}/docs/scenes/draw.html): called up to 60 times per second - on slower machines frames can be dropped to maintain a consistent gameplay experience.
- [`update`]({{site.url}}/docs/scenes/update.html): called an average of 60 times per second in between frame updates.


If a scene doesn't need to init or draw or update, don't create the init or draw or update function for it. This helps performance as it avoids empty function calls.

----

Below is a simple scene that, when entered, spawns a timer entity.

{% highlight javascript %}
module.exports = {
    init: function() {
        ox.spawn('timer', {
            target: 2000,
            callback: function() {
                console.log("This scene is cool");
            }
        });
    }
};
{% endhighlight %}
