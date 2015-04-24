---
layout: documentation
title: ".draw()"
---

This method is added by the user at entity creation time. It is optional and should only be added if the entity needs it.


It is automatically called up to 60 times per second - on slower machines frames can be dropped to maintain a consistent gameplay experience.

This draws a 100 pixels wide, 100 pixels tall rectangle at the top left corner of the screen.

{% highlight javascript %}
module.exports = {
    draw: function() {
        ox.context.fillRect(100, 100, 0, 0);
    }
};
{% endhighlight %}