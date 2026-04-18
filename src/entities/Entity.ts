import { Vector2 } from '../utils/Vector2';

export abstract class GameEntity {
  position = new Vector2(0, 0);
  velocity = new Vector2(0, 0);
  radius = 10;
  active = true;

  abstract update(dt: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;

  distanceTo(other: GameEntity): number {
    return Vector2.distance(this.position, other.position);
  }

  isCollidingWith(other: GameEntity): boolean {
    return this.distanceTo(other) < this.radius + other.radius;
  }
}
