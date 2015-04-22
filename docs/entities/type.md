---
layout: documentation
title: ".type"
---

Every entity inherits the `type` property.

This is the name of the entity and is made available for the sake of convenience - you can quickly check what is the type of an entity and compare it against others.

Entities that live in subfolders (e.g. `src/entities/player/healthbar.js`) will have compounded names, like so: `player/healthbar`.

Do not alter the type of an entity unless you have a very good reason to do so.

{% highlight javascript %}
var clock = ox.spawn('timer');
console.log(clock.type) // logs: timer
{% endhighlight %}
