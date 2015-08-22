/*
  Project: Arena game
  Author:  Copyright (C) 2015, Atanas Laskov

  License: BSD license, see LICENSE.md for more details.

  http://www.atanaslaskov.com/arena/
*/

/// <reference path="spaceship.ts" />

// Spaceship controled by the player
//
class PlayerSpaceship extends Spaceship{
  private playerScore: number;

  constructor(p: PolarCoordinate) {
    super(p);

    this.playerScore = 0;

    document.addEventListener('keydown', (e) => {
      if( e.keyCode == 37 ) this.direction = +1;
      if( e.keyCode == 39 ) this.direction = -1;
      if( e.keyCode == 32 ) this.prepareAttack();
    });
    document.addEventListener('keyup', (e) => {
      if( e.keyCode == 37 ) this.direction = 0;
      if( e.keyCode == 39 ) this.direction = 0;
    });
    document.getElementById("game_over").style.opacity = "0.0";
  }

  // Ask the spaceship
  public ask(sentence: DynamicMessage): DynamicMessage {
    // Player spaceship overides the normal "destroy" message with "gameover"
    if( sentence.verb == "gameover?" && this.hp <= 0 ) {
      // The "game over" screen has CSS-transition on opacity, we don't need to animate it manually
      document.getElementById("game_over").style.opacity = "1.0";
      return { verb: "gameover!" };
    }

    // Otherwise, ask the parent
    return super.ask(sentence);
  }
}
