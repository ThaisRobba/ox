---
layout: documentation
title: "Image assets"
---

Image files should be stored within the `./images` folder.


----

**Format:**

- `png`, `gif`, `jpg`

**Acessing image files**

Ox will automatically create the object `ox.images` that contains all supported image files that reside in its folder and sub-folders. You can access it by passing the file name, like so:

- `ox.images['filename.png']`

----

The example below draws `pony.png`.

{% highlight javascript %}
module.exports = {
    draw: function() {
        ox.context.drawImage(ox.images['pony.png'], 100, this.y);
    }
};
{% endhighlight %}