---
layout: home
title: the tiny 2d framework for the web
---

#Entities

Think of entities as blocks of data and logic that only run when they are added onto an scene and enabled. They are composable, meaning one entity can call multiple other entities and they can be enabled/disabled as you see fit.

##Project layout

    ...
    src/entities/ # All entity files should be stored here.
    ...
    
##Example
    
Below is a very simple entity:

    module.exports = {
        init: function() {
            this.x = 100;
        },
        
        draw: function() {
            ox.context.fillRect(this.x, 100, 100, 100);
        },
        
        update: function(dt) {
            this.x += dt;
        }
    };

This creates a square that moves to the right of the screen.
The context of 'this' relates to the entity itself so you can safely use it to manipulate data.

##Creating an entity

Entities in ox are simple JavaScript objects with a few hooks.
This can be an entity:


    module.exports = {};


It works but it does nothing, so let's add some meat to it. We can do so by adding some special functions.

## Init

This function is called when the entity is first spawned. It is useful for setting properties, spawning other entities and priming for action.


    module.exports = {
        init: function() {
            console.log("I was initialized! :D");
        }
    };


Anything you initialize here will be accessible to the other functions of the entity object.

## Draw

This function is called up to 60 times per second and is used to draw things onto the screen.


    module.exports = {
        draw: function() {
            ox.context.fillRect(100, 100, 100, 100);
        }
    };



## Update

This function is called 60 times per second and is used to run game logic. Things like increasing a character's velocity, creating timers, checking for collisions and other cool stuff.


    module.exports = {
        update: function(dt) {
            if ((1000 * dt) % 2 === 0){
                console.log("Even!");
            }
        }
    };


You might have noticed that we pass a dt parameter to the update function. Dt stands for Delta Time, meaning the amount of time in milliseconds that have ellapsed since the last frame was drawn. This is important for having constant performance regardless of platform.

##Reserved Words

- `disable`
- `enable`
- `id`

Disable, enable and id are assigned by the game engine when an entity is spawned. Avoid over-writing them or things will break. You can call disable or enable to control entities, just as you can check id (it is a simple number).

##Spawning an entity

They can be spawned by calling:

    ox.spawn('entityName');

Optional parameters should be passed with an object, like so:

{% highlight javascript %}
ox.spawn('entityName', {
    message: "I'm being added to the entity :D",
    greeting: "Hey!"
});

var simpleObject = {
    message: "Oh, hey"
};

ox.spawn('entityName', simpleObject);
    
{% endhighlight %}
    
##Enabling/Disabling an entity

The game loop iterates over two different lists of entities. One is for entities with update functions and the other is for entities with draw functions.

When you disable an entity, it will still be there (so all data is untouched), it just won't be rendered or updated by the engine.

    var player = ox.spawn('player'); // Here we create an entity
    player.disable(); //Here we disable it
    
When you enable a disabled entity, it will be added back onto the correct lists, being rendered and updated again.

    player.enable(); //Now the player is drawn and updated once again
    
