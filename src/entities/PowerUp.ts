import { GameEntity } from './Entity';
import { Vector2 } from '../utils/Vector2';
import { POWERUP_TYPES, GAME_HEIGHT } from '../utils/constants';
import type { PowerUpType } from '../types';

export class PowerUp extends GameEntity {
  radius = 14;
  typeName = 'double_shot';
  lifetime = 8000;
  pulsePhase = Math.random() * Math.PI * 2;

  spawn(position: Vector2) {
    const types = Object.keys(POWERUP_TYPES) as (keyof typeof POWERUP_TYPES)[];
    const key = types[Math.floor(Math.random() * types.length)];
    this.typeName = key;
    this.position = position.clone();
    this.lifetime = 8000;
    this.active = true;
  }

  update(dt: number) {
    this.position.y += 20 * (dt / 1000);
    this.lifetime -= dt;
    this.pulsePhase += dt / 300;
    if (this.lifetime <= 0 || this.position.y > GAME_HEIGHT + 30) {
      this.active = false;
    }
  }

  getType(): PowerUpType {
    return POWERUP_TYPES[this.typeName as keyof typeof POWERUP_TYPES];
  }

  render(ctx: CanvasRenderingContext2D) {
    const type = this.getType();
    const pulse = 1 + Math.sin(this.pulsePhase) * 0.15;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.scale(pulse, pulse);

    ctx.shadowBlur = 12;
    ctx.shadowColor = type.color;

    ctx.fillStyle = type.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const icons: Record<string, string> = {
      double_shot: '2X',
      triple_shot: '3X',
      rapid_fire: 'R',
      shield: 'S',
    };
    ctx.fillText(icons[this.typeName] || '?', 0, 1);

    ctx.restore();
  }
}
