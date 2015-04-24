---
layout: documentation
title: "Setting a scene"
---

You can end the current scene and start a new one by calling the `ox.scenes.set` method.

----

**Parameter:**

- `name`: a string with the name of the scene you want to set.

----

Using this method will clear all current entities and call the `init` function of the scene you are changing into, if it has it.

{% highlight javascript %}
ox.scenes.set('shop'); //Sets the scene to src/scenes/shop.js
{% endhighlight %}
