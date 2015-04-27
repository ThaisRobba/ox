---
layout: documentation
title: ".update(dt)"
---

This method is added by the user at entity creation time. It is optional and should only be added if the entity needs it.

----
**Parameter:**

- `dt`: short for delta time, this is how long it took to draw and update the last frame. Use it when manipulating values to ensure a smooth and consistent gameplay across different devices.

----

This function is called 60 times per second and is used to run game logic. Things like increasing a character's velocity, creating timers, checking for collisions and other cool stuff.

The entity below logs "Even!" to the console whenever delta time is a power of two.
 
{% highlight javascript %}
module.exports = {
    update: function(dt) {
        if ((1000 * dt) % 2 === 0){
            console.log("Even!");
        }
    }
};
{% endhighlight %}