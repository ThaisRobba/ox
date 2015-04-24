---
layout: documentation
title: "Audio assets"
---

Audio files should be stored within the `./audio` folder.


----

**Formats:**

- `mp3`, `ogg`

**Acessing audio files**

Ox will automatically create the object `ox.audio` that contains all supported audio files that reside in its folder and sub-folders. You can access it by passing the file name, like so:

- `ox.audio['filename.mp3']`

----

The example below plays `bg.mp3`.

{% highlight javascript %}
module.exports = {
    init: function() {
        var song = ox.audio['bg.mp3'];
        song.play();
    }
};
{% endhighlight %}