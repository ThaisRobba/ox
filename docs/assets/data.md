---
layout: documentation
title: "Data assets"
---

Data files should be stored within the `./data` folder.


----

**Format:**

- `json`

**Acessing data files**

Ox will automatically create the object `ox.data` that contains all supported data files that reside in its folder and sub-folders. You can access it by passing the file name, like so:

- `ox.data['filename.json']`

----

The example below logs a message from `story.json`.

{% highlight javascript %}
module.exports = {
    init: function() {
        this.story = ox.data['story.json'];
        console.log(this.story.message1);
    }
};
{% endhighlight %}