---
layout: documentation
title: "Canvas properties"
---

You can access standard canvas properties through `ox.canvas`.

----

- `width`: an integer reflecting how wide the canvas is.
- `height`: an integer reflecting how tall the canvas is.

Reference: <a href="https://developer.mozilla.org/en/docs/Web/API/HTMLCanvasElement" target="_blank">MDN</a>

----

{% highlight javascript %}
//Assuming the canvas is 800px wide
module.exports = {
    init: function() {
        console.log(ox.canvas.width); //logs: 800
    }
};
{% endhighlight %}
