---
layout: documentation
title: ".init()"
---

This method is added by the user at object creation time. It is optional and should only be added if the object needs it.

If available, it will be automatically called when an entity is first spawned or when you first enter a scene. Very useful for spawning other entities and setting up properties that you will use with this entity.

{% highlight javascript %}
module.exports = {
    init: function() {
        console.log("I was initialized! :D");
    }
};

{% endhighlight %}