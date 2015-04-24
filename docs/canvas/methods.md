---
layout: documentation
title: "Canvas methods"
---

You can access standard canvas methods through `ox.context`. It is highly recommended to read through canvas documentation from reliable sources like <a href="http://www.w3schools.com/tags/ref_canvas.asp" target="_blank">w3schools</a> and <a href="https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D" target="_blank">MDN</a>.


{% highlight javascript %}
module.exports = {
    draw: function() {
        ox.context.fillStyle = "lightred";
        ox.context.fillRect(0, 0, 100, 100);
    }
};
{% endhighlight %}
