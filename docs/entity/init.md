---
layout: documentation
title: ".init()"
---

This method is added by the user at entity creation time. It is optional and should only be added if the entity needs it.


It is automatically called when an entity is first spawned. Useful for spawning other entities and setting up properties that you will use with this entity.

{% highlight javascript %}
module.exports = {
    init: function() {
        console.log("I was initialized! :D");
    }
};

{% endhighlight %}