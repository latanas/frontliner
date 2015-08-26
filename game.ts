/*
  Project: Arena game
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE.md for more details.

  http://www.atanaslaskov.com/arena/
*/

/// <reference path="vector.ts" />
/// <reference path="polar_coordinate.ts" />
/// <reference path="renderer.ts" />
/// <reference path="clock.ts" />

/// <reference path="arena.ts" />
/// <reference path="dynamic_object.ts" />
/// <reference path="player_spaceship.ts" />
/// <reference path="enemy_spaceship.ts" />
/// <reference path="projectile.ts" />
/// <reference path="badge.ts" />

// Game initializes and manages dynamic objects
//
class Game{
  private renderer: Renderer;

  private clock: Clock;
  private isPaused: boolean;

  private arena: Arena;
  private dynamicObjects: DynamicObject[];

  constructor(r: Renderer) {
    this.renderer = r;

    this.clock    = new Clock();
    this.isPaused = false;

    this.arena = new Arena( new Vector(0.0, 0.0), 0.45 );

    this.dynamicObjects = [];
    this.spawnPlayer();
    this.spawnEnemy();
  }

  // Single action frame of the game
  //
  actionFrame = () => {
    var dt = this.clock.tick();

    this.render();
    if( !this.isPaused ) this.animate(dt);
    window.requestAnimationFrame( this.actionFrame );
  }

  // Make a picture
  //
  private render() {
    var r = this.renderer;

    r.background();
    this.arena.render(r);

    for( var i=0; i<this.dynamicObjects.length; i++) {
      var o = this.dynamicObjects[i];

      if( !o ) continue;
      o.render(r, this.arena.origin);
    }
  }

  // Make things move
  //
  private animate(dt: number) {
    this.arena.animate(dt);

    // Dynamic objects
    //
    for( var i=0; i<this.dynamicObjects.length; i++) {
      var o = this.dynamicObjects[i];
      if( !o ) continue;
      o.animate(dt, 0.0);

      // Ask the object to follow arena contour
      o.ask({ verb: "follow!", argument: this.arena.radiusAt( o.position.angle ) })

      // Ask the object if it wants to attack
      var attack = o.ask({verb: "attack?"});

      // The object says "attack!", so it must give us a Projectile
      if( attack.verb == "attack!") {
        this.spawnObject( <Projectile> attack.argument );
      }

      // Ask the object if it collides with another one
      for( var j=0; j<this.dynamicObjects.length; j++) {
        var oo = this.dynamicObjects[j];
        if( (i == j) || !oo ) continue;
        var collide = o.ask({ verb: "collide?", argument: oo });

        if( collide.verb == "collide!" ) {
          oo.ask({ verb: "damage!", argument: collide.argument });
        }
      }

      // If a ship is discarded, we want to spawn a new one
      if( o.ask({verb: "discard?"}).verb == "discard!" ) {
        if( o.ask({ verb: "gameover?" }).verb == "gameover!" ) {
          this.isPaused = true;
          setTimeout(this.spawnPlayer, 4000);
          setTimeout(this.spawnEnemy, 6000);
        }
        else if( o.ask({ verb: "is?", argument: "spaceship" }).verb == "is!" ) {
          this.spawnObject( new Badge() );
          setTimeout(this.spawnEnemy, 3000);
        }
        this.dynamicObjects[i] = null;
      }
    }
  }

  // Spawn an object in a free slot
  //
  private spawnObject(o: DynamicObject) {
    for( var i=0; i<this.dynamicObjects.length; i++) {
      if( !this.dynamicObjects[i] ) {
        this.dynamicObjects[i] = o;
        return;
      }
    }
    this.dynamicObjects.push(o);
  }

  // Spawn a new enemy spaceship
  //
  spawnEnemy = () => {
    console.log("Respawn spaceship.");
    this.spawnObject(
      new EnemySpaceship( new PolarCoordinate( /*Math.random()*Math.PI*0.5 + 1.2*/(-0.5)*Math.PI, 0.4) )
    );
  }

  // Spawn a new player spaceship
  //
  spawnPlayer = () => {
    console.log("Respawn player.");

    this.isPaused = false;
    this.dynamicObjects.length = 0;

    this.spawnObject(
      new PlayerSpaceship( new PolarCoordinate(Math.PI*0.5, 0.4) )
    );
  }
}
