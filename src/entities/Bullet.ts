import { GameEntity } from './Entity';
import { Vector2 } from '../utils/Vector2';
import { GAME_WIDTH, GAME_HEIGHT, BULLET_SPEED, BULLET_LIFETIME } from '../utils/constants';
import { Enemy } from './Enemy';
import type { ParticleSystem } from '../systems/ParticleSystem';

export class Bullet extends GameEntity {
  radius = 4;
  lifetime = BULLET_LIFETIME;
  damage = 10;
  pierceCount = 0;
  color = '#fbbf24';
  hitEnemies: Enemy[] = [];

  private _particleSystem?: ParticleSystem;
  private _muzzleFlashFired = false;
  private _onHit?: () => void;

  setParticleSystem(ps: ParticleSystem) {
    this._particleSystem = ps;
  }

  spawn(
    pos: Vector2,
    direction: Vector2,
    damage: number = 10,
    pierceCount: number = 0,
    color: string = '#fbbf24'
  ) {
    this.position = pos.clone();
    this.velocity = direction.normalize().mul(BULLET_SPEED);
    this.damage = damage;
    this.lifetime = BULLET_LIFETIME;
    this.pierceCount = pierceCount;
    this.color = color;
    this.hitEnemies = [];
    this.active = true;
    this._muzzleFlashFired = false;
  }

  // Called by CollisionSystem after registering a hit
  onHitEnemy(): boolean {
    // Returns true if bullet should stay active (can still pierce)
    if (this._onHit) this._onHit();
    if (this.pierceCount > 0) {
      this.pierceCount--;
      return true;
    }
    this.active = false;
    return false;
  }

  setOnHit(fn: () => void) {
    this._onHit = fn;
  }

  update(dt: number) {
    // ====== ZX-9: Fire muzzle flash on first frame of bullet life ======
    if (!this._muzzleFlashFired && this._particleSystem) {
      this._particleSystem.spawnMuzzleFlash(this.position, this.velocity, this.color);
      this._muzzleFlashFired = true;
    }

    this.position = this.position.add(this.velocity.mul(dt / 1000));
    this.lifetime -= dt;

    if (
      this.lifetime <= 0 ||
      this.position.x < -20 || this.position.x > GAME_WIDTH + 20 ||
      this.position.y < -20 || this.position.y > GAME_HEIGHT + 20
    ) {
      this.active = false;
    }
  }

  canHit(enemy: Enemy): boolean {
    return !this.hitEnemies.includes(enemy);
  }

  registerHit(enemy: Enemy) {
    this.hitEnemies.push(enemy);
    this.onHitEnemy();
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(
      this.position.x - this.velocity.x * 0.005,
      this.position.y - this.velocity.y * 0.005,
      this.radius * 1.5, 0, Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }
}
