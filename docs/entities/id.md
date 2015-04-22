---
layout: documentation
title: ".id"
---

Every entity inherits the `id` property.

This is used internally by the engine to sort entities, adding and removing them from the update and draw list. It can be handy to check if entities are different from one another.

Do not alter the id of an entity.

{% highlight javascript %}
var monster = ox.spawn('blob');
console.log(monster.id) // We have no other entities so the id would be 0
{% endhighlight %}
