---
layout: documentation
title: "Mouse"
---

ox exposes the global variable `ox.mouse` containing `x` and `y` coordinates of the pointer. This is automatically update with mouse movement so you can use it for things like hit detection.

----

###ox.mouse

**Properties**

- `x`: Horizontal coordinate of the user's mouse.
- `y`: Vertical coordinate of the user's mouse.
- `isDown`: Boolean indicating if a click is happening.

**Methods**

They are called from within scenes. Both accept an argument for the button being pressed.

- `mouseUp`: Called when the mouse is released.
- `mouseDown`: Called when the mouse is pressed.

----

Below an example of a scene using mouse callbacks:

{% highlight javascript %}
module.exports = {
       mouseDown: function (button) {
        console.log("Clicked the " + button + " button.");
        console.log("Coords: " + ox.mouse.x + ", " + ox.mouse.y);
    },

    mouseUp: function (button) {
        console.log("Released the " + button + " button.");
        console.log("Coords: " + ox.mouse.x + ", " + ox.mouse.y);
    } 
};
{% endhighlight %}
