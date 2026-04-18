import { GameEntity } from './Entity';
import { Vector2 } from '../utils/Vector2';
import { GAME_WIDTH, GAME_HEIGHT, BULLET_SPEED, BULLET_LIFETIME, COLORS } from '../utils/constants';

export class Bullet extends GameEntity {
  radius = 4;
  lifetime = BULLET_LIFETIME;
  damage = 10;

  spawn(pos: Vector2, direction: Vector2, damage: number = 10) {
    this.position = pos.clone();
    this.velocity = direction.normalize().mul(BULLET_SPEED);
    this.damage = damage;
    this.lifetime = BULLET_LIFETIME;
    this.active = true;
  }

  update(dt: number) {
    this.position = this.position.add(this.velocity.mul(dt / 1000));
    this.lifetime -= dt;

    if (this.lifetime <= 0 ||
        this.position.x < -20 || this.position.x > GAME_WIDTH + 20 ||
        this.position.y < -20 || this.position.y > GAME_HEIGHT + 20) {
      this.active = false;
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = COLORS.bullet;
    ctx.fillStyle = COLORS.bullet;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.position.x - this.velocity.x * 0.005, this.position.y - this.velocity.y * 0.005, this.radius * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
