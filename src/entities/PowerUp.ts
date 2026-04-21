import { GameEntity } from './Entity';
import { Vector2 } from '../utils/Vector2';
import { POWERUP_TYPES, GAME_HEIGHT } from '../utils/constants';
import type { PowerUpType, WeaponKind } from '../types';

export class PowerUp extends GameEntity {
  radius = 14;
  typeName = 'firepower';
  lifetime = 8000;
  pulsePhase = Math.random() * Math.PI * 2;
  rotation = 0;

  spawn(position: Vector2, typeName?: string) {
    const types = Object.keys(POWERUP_TYPES) as (keyof typeof POWERUP_TYPES)[];
    const key = typeName || types[Math.floor(Math.random() * types.length)];
    this.typeName = key;
    this.position = position.clone();
    this.lifetime = 8000;
    this.active = true;
    this.rotation = 0;
  }

  update(dt: number) {
    this.position.y += 20 * (dt / 1000);
    this.lifetime -= dt;
    this.pulsePhase += dt / 300;
    this.rotation += dt / 500;
    if (this.lifetime <= 0 || this.position.y > GAME_HEIGHT + 30) {
      this.active = false;
    }
  }

  getType(): PowerUpType {
    return POWERUP_TYPES[this.typeName as keyof typeof POWERUP_TYPES];
  }

  getWeaponKind(): WeaponKind | null {
    const map: Record<string, WeaponKind> = {
      FIREPOWER: 'firepower',
      RAPID: 'rapid',
      SPREAD: 'spread',
      PIERCE: 'pierce',
    };
    return map[this.typeName] || null;
  }

  render(ctx: CanvasRenderingContext2D) {
    const type = this.getType();
    const pulse = 1 + Math.sin(this.pulsePhase) * 0.2;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);
    ctx.scale(pulse, pulse);

    ctx.shadowBlur = 20 + Math.sin(this.pulsePhase * 2) * 10;
    ctx.shadowColor = type.color;

    ctx.fillStyle = type.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6 + Math.sin(this.pulsePhase * 3) * 0.3;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const icons: Record<string, string> = {
      firepower: 'F',
      rapid: 'R',
      spread: 'S',
      pierce: 'P',
      shield: '🛡',
    };
    ctx.fillText(icons[this.typeName] || '?', 0, 1);

    ctx.restore();
  }
}
