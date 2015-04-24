---
layout: documentation
title: "Assets overview"
---

Ox includes a few tools to automate the process of adding assets into the game. When you run `npm start` on your project, ox will automatically watch for changes in the `./images`, `./audio`, `./data` folders.

----

**Audio assets**

- [`ox.audio['filename.mp3']`]({{site.url}}/docs/assets/audio.html)

**Data assets**

- [`ox.data['filename.json']`]({{site.url}}/docs/assets/data.html)

**Image assets**

- [`ox.images['filename.png']`]({{site.url}}/docs/assets/images.html)

----

The example below logs a message from a `story.json`, plays `bg.mp3` and draws `pony.png`.

{% highlight javascript %}
module.exports = {
    init: function() {
        this.story = ox.data['story.json'];
        console.log(this.story.message1);
        ox.audio['bg.mp3'].play();
    },

    draw: function() {
        ox.context.drawImage(ox.images['pony.png'], 100, this.y);
    }
};
{% endhighlight %}