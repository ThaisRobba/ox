---
layout: documentation
title: "Entity Object overview"
---

Every entity object starts with a few inherited methods and properties. An object lasts only as long as the scene it is in, meaning every instance of an entity is deleted when a different scene starts.

----

**Properties**

- [`id`]({{site.url}}/docs/entity/id.html), [`type`]({{site.url}}/docs/entity/type.html)

**Methods**

- [`draw`]({{site.url}}/docs/entity/draw.html), [`disable`]({{site.url}}/docs/entity/disable.html), [`enable`]({{site.url}}/docs/entity/enable.html), [`init`]({{site.url}}/docs/entity/init.html), [`update`]({{site.url}}/docs/entity/update.html)

----



{% highlight javascript %}
module.exports = {
    init: function() {
        this.paddle = ox.spawn('sprite', {
            source: 'paddle.png',
            x: 20,
            y: 20
        });
        //Changing scene will delete the this.paddle entity
        ox.scenes.set('menu');
    }
};
{% endhighlight %}