---
layout: documentation
title: "Scene Object overview"
---

Every scene object starts with a few inherited methods that deal with input. The scene object is temporary, meaning that any changes that ir suffers are forgotten when you leave it.

----


**Methods**

- [`draw`]({{site.url}}/docs/hooks/draw.html), [`keyDown`]({{site.url}}/docs/scene/disable.html), [`keyUp`]({{site.url}}/docs/scene/enable.html), [`init`]({{site.url}}/docs/hooks/init.html), [`update`]({{site.url}}/docs/hooks/update.html)

----



{% highlight javascript %}
module.exports = {
    init: function () {
        console.log("Entered the scene");
    },
    
    draw: function () {
        console.log("Scene was drawn");
    },
    
    update: function (dt) {
        console.log("Scene was updated");
    },
    
    keyDown: function (key) {
        console.log("keyDown: " + key);
    },

    keyPress: function (key) {
        console.log("keyPress: " + key);
    },

    keyUp: function (key) {
        console.log("keyUp: " + key);
    },

    mouseDown: function (button) {
        console.log("Clicked at: " + ox.mouse.x + ", " + ox.mouse.y + " with the " + button + " button.");
    },

    mouseUp: function (button) {
        console.log("Released at: " + ox.mouse.x + ", " + ox.mouse.y + " with the " + button + " button.");
    }
};
{% endhighlight %}