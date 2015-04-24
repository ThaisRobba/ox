---
layout: documentation
title: ".disable()"
---

Every entity inherits the `disable` method.
With this you can remove an entity from the list of entities to be drawn and updated.

The entity data is kept intact - entities are only destroyed when changing scenes.

{% highlight javascript %}
var monster = ox.spawn('blob'); // We return an entity to a variable
monster.disable(); //The monster will not be drawn nor updated anymore
{% endhighlight %}
