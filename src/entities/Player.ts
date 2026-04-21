import { GameEntity } from './Entity';
import { Vector2 } from '../utils/Vector2';
import { Input } from '../game/Input';
import {
  GAME_WIDTH, GAME_HEIGHT,
  PLAYER_SPEED, PLAYER_MAX_HEALTH,
  PLAYER_FIRE_RATE, PLAYER_INVINCIBLE_TIME,
  COLORS, WEAPON_CONFIGS, MAX_WEAPON_LEVEL,
} from '../utils/constants';
import type { WeaponKind } from '../types';
import type { ParticleSystem } from '../systems/ParticleSystem';

export class Player extends GameEntity {
  health = PLAYER_MAX_HEALTH;
  maxHealth = PLAYER_MAX_HEALTH;
  radius = 18;
  angle = 0;
  invincibleTimer = 0;
  fireTimer = 0;
  shieldTimer = 0;

  // ZX-9: Permanent weapon upgrade state
  weaponKind: WeaponKind = 'firepower';
  weaponLevel = 1;
  private weaponLevels: Record<string, number> = {
    firepower: 1, rapid: 0, spread: 0, pierce: 0,
  };

  // ZX-9: Hit flash state (white bright flash on damage)
  hitFlashTimer = 0;
  private static HIT_FLASH_DURATION = 300; // ms

  private input: Input;
  private _particleSystem?: ParticleSystem;

  constructor(input: Input) {
    super();
    this.input = input;
    this.position = new Vector2(GAME_WIDTH / 2, GAME_HEIGHT / 2);
  }

  setParticleSystem(ps: ParticleSystem) {
    this._particleSystem = ps;
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
    if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;
    if (this.fireTimer > 0) this.fireTimer -= dt;
  }

  canShoot(): boolean {
    return this.fireTimer <= 0 && this.input.mouseDown;
  }

  // Returns fire pattern with direction and piercing for each bullet
  getFirePattern(): { dir: Vector2; pierce: number }[] {
    const config = WEAPON_CONFIGS[this.weaponKind];
    const rateMul = config.fireRateMultiplier(this.weaponLevel);
    this.fireTimer = PLAYER_FIRE_RATE * rateMul;

    const count = config.bulletCount(this.weaponLevel);
    const spread = config.spreadAngle ? config.spreadAngle(this.weaponLevel) : 0;
    const baseDir = Vector2.fromAngle(this.angle, 1);
    const pierce = config.piercing(this.weaponLevel);

    if (count === 1) {
      return [{ dir: baseDir, pierce }];
    }

    const patterns: { dir: Vector2; pierce: number }[] = [];
    const startAngle = this.angle - spread / 2;
    const step = spread / (count - 1);
    for (let i = 0; i < count; i++) {
      patterns.push({ dir: Vector2.fromAngle(startAngle + step * i, 1), pierce });
    }
    return patterns;
  }

  getPiercing(): number {
    return WEAPON_CONFIGS[this.weaponKind].piercing(this.weaponLevel);
  }

  // ====== ZX-9: Permanent weapon upgrade ======
  upgradeWeapon(kind: WeaponKind): { upgraded: boolean; maxed: boolean } {
    if (this.weaponLevels[kind] === undefined) this.weaponLevels[kind] = 0;
    if (this.weaponLevels[kind] >= MAX_WEAPON_LEVEL) {
      return { upgraded: false, maxed: true };
    }
    this.weaponLevels[kind]++;
    this.weaponKind = kind;
    this.weaponLevel = this.weaponLevels[kind];
    return { upgraded: true, maxed: this.weaponLevels[kind] >= MAX_WEAPON_LEVEL };
  }

  getWeaponLevel(kind: WeaponKind): number {
    return this.weaponLevels[kind] ?? 0;
  }

  takeDamage(amount: number): boolean {
    if (this.invincibleTimer > 0 || this.shieldTimer > 0) return false;
    this.health -= amount;
    this.invincibleTimer = PLAYER_INVINCIBLE_TIME;

    // ====== ZX-9: Trigger white flash + red particle burst ======
    this.hitFlashTimer = Player.HIT_FLASH_DURATION;
    if (this._particleSystem) {
      this._particleSystem.spawnPlayerHitFlash(this.position);
    }

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
    this.weaponKind = 'firepower';
    this.weaponLevel = 1;
    this.weaponLevels = { firepower: 1, rapid: 0, spread: 0, pierce: 0 };
    this.shieldTimer = 0;
    this.hitFlashTimer = 0;
    this.active = true;
  }

  render(ctx: CanvasRenderingContext2D) {
    // ====== ZX-9: Invincibility blink — white highlight + red glow ======
    if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer / 100) % 2 === 0) {
      ctx.save();
      ctx.translate(this.position.x, this.position.y);
      ctx.rotate(this.angle);
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#ef4444';
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(-12, 12);
      ctx.lineTo(-8, 0);
      ctx.lineTo(-12, -12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fca5a5';
      ctx.beginPath();
      ctx.arc(-4, 0, 6, 0, Math.PI * 2);
      ctx.fill();

      // Hit flash overlay even during invincibility blink
      if (this.hitFlashTimer > 0) {
        const alpha = (this.hitFlashTimer / Player.HIT_FLASH_DURATION) * 0.9;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#ff0000';
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(-12, 12);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-12, -12);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.angle);

    ctx.shadowBlur = 15;
    ctx.shadowColor = COLORS.playerGlow;

    // Base ship body
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

    // ====== ZX-9: Hit flash overlay ======
    if (this.hitFlashTimer > 0) {
      const alpha = (this.hitFlashTimer / Player.HIT_FLASH_DURATION) * 0.9;
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#ff0000';
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(-12, 12);
      ctx.lineTo(-8, 0);
      ctx.lineTo(-12, -12);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }
}
