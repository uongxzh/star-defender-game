import { Bullet } from '../entities/Bullet';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { PowerUp } from '../entities/PowerUp';

export interface CollisionResult {
  bulletHits: Array<{ bullet: Bullet; enemy: Enemy }>;
  playerHits: Enemy[];
  powerUpCollects: PowerUp[];
}

export class CollisionSystem {
  checkCollisions(
    player: Player,
    bullets: Bullet[],
    enemies: Enemy[],
    powerUps: PowerUp[]
  ): CollisionResult {
    const bulletHits: Array<{ bullet: Bullet; enemy: Enemy }> = [];
    const playerHits: Enemy[] = [];
    const powerUpCollects: PowerUp[] = [];

    for (const bullet of bullets) {
      if (!bullet.active) continue;
      for (const enemy of enemies) {
        if (!enemy.active) continue;
        if (bullet.canHit(enemy) && bullet.isCollidingWith(enemy)) {
          bulletHits.push({ bullet, enemy });
        }
      }
    }

    if (!player.isDead()) {
      for (const enemy of enemies) {
        if (!enemy.active) continue;
        if (player.isCollidingWith(enemy)) {
          playerHits.push(enemy);
        }
      }
    }

    for (const pu of powerUps) {
      if (!pu.active) continue;
      if (player.isCollidingWith(pu)) {
        powerUpCollects.push(pu);
      }
    }

    return { bulletHits, playerHits, powerUpCollects };
  }
}
