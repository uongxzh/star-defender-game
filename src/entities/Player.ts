import { GameEntity } from './Entity';
import { Vector2 } from '../utils/Vector2';
import { Input } from '../game/Input';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_SPEED, PLAYER_MAX_HEALTH, PLAYER_FIRE_RATE, PLAYER_INVINCIBLE_TIME, COLORS } from '../utils/constants';
import type { WeaponState } from '../types';

export class Player extends GameEntity {
  health = PLAYER_MAX_HEALTH;
  maxHealth = PLAYER_MAX_HEALTH;
  radius = 18;
  angle = 0;
  invincibleTimer = 0;
  fireTimer = 0;
  weapon: WeaponState = { type: 'single', timer: 0, fireRate: PLAYER_FIRE_RATE };
  shieldTimer = 0;

  private input: Input;

  constructor(input: Input) {
    super();
    this.input = input;
    this.position = new Vector2(GAME_WIDTH / 2, GAME_HEIGHT / 2);
  }

  update(dt: number) {
    const move = this.input.getMovementVector();
    const speed = PLAYER_SPEED * (dt / 1000);
    this.position = this.position.add(move.mul(speed));

    this.position.x = Math.max(this.radius, Math.min(GAME_WIDTH - this.radius, this.position.x));
    this.position.y = Math.max(this.radius, Math.min(GAME_HEIGHT - this.radius, this.position.y));

    const mouseDir = this.input.mousePos.sub(this.position);
    this.angle = mouseDir.angle();

    if (this.invincibleTimer > 0) this.invincibleTimer -= dt;
    if (this.shieldTimer > 0) this.shieldTimer -= dt;
    if (this.weapon.timer > 0) {
      this.weapon.timer -= dt;
      if (this.weapon.timer <= 0) {
        this.weapon.type = 'single';
        this.weapon.fireRate = PLAYER_FIRE_RATE;
      }
    }
    if (this.fireTimer > 0) this.fireTimer -= dt;
  }

  canShoot(): boolean {
    return this.fireTimer <= 0 && this.input.mouseDown;
  }

  getFirePattern(): Vector2[] {
    this.fireTimer = this.weapon.fireRate;
    const baseDir = Vector2.fromAngle(this.angle, 1);
    const patterns: Record<string, Vector2[]> = {
      single: [baseDir],
      double: [baseDir, Vector2.fromAngle(this.angle + 0.15, 1)],
      triple: [baseDir, Vector2.fromAngle(this.angle - 0.2, 1), Vector2.fromAngle(this.angle + 0.2, 1)],
      rapid: [baseDir],
    };
    return patterns[this.weapon.type] || patterns.single;
  }

  takeDamage(amount: number): boolean {
    if (this.invincibleTimer > 0 || this.shieldTimer > 0) return false;
    this.health -= amount;
    this.invincibleTimer = PLAYER_INVINCIBLE_TIME;
    return true;
  }

  isDead(): boolean {
    return this.health <= 0;
  }

  reset() {
    this.position = new Vector2(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    this.health = this.maxHealth;
    this.velocity = new Vector2(0, 0);
    this.invincibleTimer = 0;
    this.fireTimer = 0;
    this.weapon = { type: 'single', timer: 0, fireRate: PLAYER_FIRE_RATE };
    this.shieldTimer = 0;
    this.active = true;
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer / 100) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.angle);

    ctx.shadowBlur = 15;
    ctx.shadowColor = COLORS.playerGlow;

    ctx.fillStyle = COLORS.player;
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-12, 12);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-12, -12);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1e40af';
    ctx.beginPath();
    ctx.arc(-4, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    if (this.shieldTimer > 0) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.4 + Math.sin(Date.now() / 200) * 0.2;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }
}
