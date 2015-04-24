---
layout: documentation
title: "Scenes overview"
---

Think of scenes as if you were in a theater. The actors are moving about on stage but, as the scene ends, anything can change. We might be presented different characters, different scenarios, different stories.

Use scenes to spawn and manage entities, like a director would in a play.

----

**Creating a scene templates**

- [`module.exports={}`]({{site.url}}/docs/scenes/creating.html)


**Setting a scene**

- [`ox.scenes.set(name)`]({{site.url}}/docs/scenes/set.html)

----

### Pong example

Imagine we have already made all the pong entities (paddles, ball, scoreboard). We could set a scene like the one below for the game:
{% highlight javascript %}
module.exports = {
    init: function() {
        this.paddlePlayer = ox.spawn('player');
        this.paddleAi = ox.spawn('cpu');
        this.ball = ox.spawn('ball');
        this.scoreboard = ox.spawn('scoreboard');
    }
};
{% endhighlight %}

Done!