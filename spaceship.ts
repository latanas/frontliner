/*
  Project: Arena game
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE.md for more details.

  http://www.atanaslaskov.com/arena/
*/

/// <reference path="vector.ts" />
/// <reference path="polar_coordinate.ts" />
/// <reference path="dynamic_object.ts" />
/// <reference path="renderer.ts" />

// Base class for a spaceship
//
class Spaceship implements DynamicObject{
  public speed:    number;
  public position: PolarCoordinateAreal;

  protected direction: number;

  protected projectileSpeed: number;
  protected projectileAreal: number;
  protected projectile: Projectile;

  constructor(p: PolarCoordinate) {
    this.position = new PolarCoordinateAreal(p.angle, p.radius, 1.0);
    this.speed = 0.001;
    this.projectileSpeed = 0.001;
    this.projectileAreal = 1.0;

    this.direction = +0;
    this.projectile = null;
  }

  public animate(dt: number, origin_speed: number) {
    this.position.angle += dt * (this.speed + origin_speed) * this.direction;
  }

  public render(renderer: Renderer, origin: Vector) {
    var v = Vector.plus( this.position.vector(), origin );
    renderer.spaceship( v, 20, this.position.angle );
  }

  // Ask the spaceship
  public ask(sentence: DynamicMessage): DynamicMessage {

    // Somebody asked the Spaceship to follow to new position, it knows how to do this
    if( sentence.verb == "follow!" ) {
      this.position.radius = <number> sentence.argument;
      return { verb: "follow!" };
    }

    // Somebody asked the Spaceship if it wants to attack
    if( sentence.verb == "attack?" && this.projectile ) {
      // Yes, we want to attack. Reply with the projectile
      var msg = { verb: "attack!", argument: this.projectile };
      this.projectile = null;
      return msg;
    }

    // Otherwise just smile
    return { verb: "smile!" };
  }

  // Prepare for attach
  protected prepareAttack(){
    var p = this.position.copy();

    this.projectile = new Projectile(
        -1.0*this.projectileSpeed,
        new PolarCoordinateAreal(p.angle, p.radius, this.projectileAreal)
    );
  }
}
