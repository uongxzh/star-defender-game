import { GameEntity } from './Entity';
import { Vector2 } from '../utils/Vector2';
import { Player } from './Player';
import { GAME_WIDTH, GAME_HEIGHT, ENEMY_TYPES, COLORS } from '../utils/constants';

export class Enemy extends GameEntity {
  health = 30;
  maxHealth = 30;
  damage = 10;
  speed = 100;
  baseSpeed = 100;  // 基础速度
  score = 10;
  typeName = 'chaser';
  flashTimer = 0;
  waveNumber = 1;   // 波次号
  speedMultiplier = 1.0; // 速度倍率

  private wobbleOffset = Math.random() * Math.PI * 2;

  spawn(type: keyof typeof ENEMY_TYPES, wave: number = 1) {
    const config = ENEMY_TYPES[type];
    this.typeName = config.name;
    this.baseSpeed = config.speed;
    this.waveNumber = wave;
    
    // 根据波次计算速度倍率：每6个波次速度+15%
    this.speedMultiplier = 1 + (wave - 1) * 0.05;
    this.speed = this.baseSpeed * this.speedMultiplier;
    
    this.health = config.health;
    this.maxHealth = config.health;
    this.damage = config.damage;
    this.score = config.score;
    this.radius = config.radius;
    this.flashTimer = 0;

    const edge = Math.floor(Math.random() * 4);
    const margin = 40;
    switch (edge) {
      case 0: this.position = new Vector2(Math.random() * GAME_WIDTH, -margin); break;
      case 1: this.position = new Vector2(GAME_WIDTH + margin, Math.random() * GAME_HEIGHT); break;
      case 2: this.position = new Vector2(Math.random() * GAME_WIDTH, GAME_HEIGHT + margin); break;
      default: this.position = new Vector2(-margin, Math.random() * GAME_HEIGHT); break;
    }
    this.active = true;
  }

  private target: Player | null = null;

  setTarget(player: Player) {
    this.target = player;
  }

  update(dt: number) {
    if (!this.target) return;
    const toPlayer = this.target.position.sub(this.position);
    const dist = toPlayer.magnitude();

    if (dist > 0) {
      const dir = toPlayer.normalize();
      const currentSpeed = this.speed * this.speedMultiplier;
      const speed = currentSpeed * (dt / 1000);

      if (this.typeName === 'fast') {
        this.position = this.position.add(dir.mul(speed));
        const perp = new Vector2(-dir.y, dir.x);
        const wobble = Math.sin(Date.now() / 200 + this.wobbleOffset) * speed * 0.5;
        this.position = this.position.add(perp.mul(wobble));
      } else if (this.typeName === 'tank') {
        this.position = this.position.add(dir.mul(speed));
      } else {
        this.position = this.position.add(dir.mul(speed));
      }
    }

    if (this.flashTimer > 0) this.flashTimer -= dt;
  }

  takeDamage(amount: number): boolean {
    this.health -= amount;
    this.flashTimer = 100;
    return this.health <= 0;
  }

  render(ctx: CanvasRenderingContext2D) {
    const config = ENEMY_TYPES[this.typeName.toUpperCase() as keyof typeof ENEMY_TYPES];
    const color = this.flashTimer > 0 ? '#ffffff' : (config?.color || '#ef4444');

    ctx.save();
    ctx.translate(this.position.x, this.position.y);

    ctx.shadowBlur = 10;
    ctx.shadowColor = config?.color || '#ef4444';

    ctx.fillStyle = color;
    if (this.typeName === 'tank') {
      ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
      ctx.fillStyle = '#7c3aed';
      ctx.fillRect(-this.radius * 0.5, -this.radius * 0.5, this.radius, this.radius);
    } else if (this.typeName === 'fast') {
      ctx.beginPath();
      ctx.moveTo(this.radius, 0);
      ctx.lineTo(-this.radius * 0.7, this.radius * 0.7);
      ctx.lineTo(-this.radius * 0.7, -this.radius * 0.7);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 显示波次信息
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`W${this.waveNumber}`, 0, 0);

    const barW = this.radius * 2;
    const barH = 4;
    const barY = -this.radius - 10;
    ctx.fillStyle = COLORS.healthBarBg;
    ctx.fillRect(-barW / 2, barY, barW, barH);
    ctx.fillStyle = COLORS.healthBar;
    ctx.fillRect(-barW / 2, barY, barW * (this.health / this.maxHealth), barH);

    ctx.restore();
  }
}
