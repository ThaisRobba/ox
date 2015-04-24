---
layout: documentation
title: ".enable()"
---

Every entity inherits the `enable` method.
With this you can add an entity to the list of entities to be drawn and updated.
You should only use enable on entities that have already been disabled.

The entity data is kept intact - entities are only destroyed when changing scenes.

{% highlight javascript %}
var monster = ox.spawn('blob');
monster.disable(); //No point in enabling something that isn't disabled
monster.enable(); //There, now the monster is drawn and updated again
{% endhighlight %}
