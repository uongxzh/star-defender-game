import { Particle } from '../entities/Particle';
import { Vector2 } from '../utils/Vector2';
import { ObjectPool } from './ObjectPool';
import { COLORS } from '../utils/constants';

export class ParticleSystem {
  particles: Particle[] = [];
  screenFlashTimer = 0;
  screenFlashColor = 'rgba(255, 0, 0, 0)';
  private pool: ObjectPool<Particle>;

  constructor() {
    this.pool = new ObjectPool<Particle>(
      () => new Particle(),
      (p) => { p.active = false; },
      200
    );
  }

  spawnExplosion(pos: Vector2, count: number = 12, color?: string) {
    const colors = color ? [color] : COLORS.particleExplosion;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 200;
      const vel = Vector2.fromAngle(angle, speed);
      const life = 300 + Math.random() * 500;
      const size = 2 + Math.random() * 4;
      const c = colors[Math.floor(Math.random() * colors.length)];

      const p = this.pool.acquire();
      p.spawn(pos, vel, life, c, size);
      this.particles.push(p);
    }
  }

  spawnTrail(pos: Vector2, direction: Vector2, count: number = 2) {
    for (let i = 0; i < count; i++) {
      const angle = direction.angle() + (Math.random() - 0.5) * 0.5;
      const speed = 20 + Math.random() * 60;
      const vel = Vector2.fromAngle(angle, speed).add(direction.mul(-0.3));
      const life = 200 + Math.random() * 300;
      const size = 1 + Math.random() * 2;

      const p = this.pool.acquire();
      p.spawn(pos, vel, life, COLORS.particleTrail, size);
      this.particles.push(p);
    }
  }

  spawnHit(pos: Vector2, color: string = '#fff') {
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 100;
      const vel = Vector2.fromAngle(angle, speed);
      const life = 150 + Math.random() * 250;
      const size = 1 + Math.random() * 3;

      const p = this.pool.acquire();
      p.spawn(pos, vel, life, color, size);
      this.particles.push(p);
    }
  }

  // ====== ZX-9: Muzzle flash — gun muzzle sparks + bright core ======
  spawnMuzzleFlash(pos: Vector2, direction: Vector2, color: string = '#fbbf24') {
    const palette = [color, '#ffffff', this.lighten(color, 0.3), this.lighten(color, -0.2)];
    const count = 10;

    for (let i = 0; i < count; i++) {
      const angle = direction.angle() + (Math.random() - 0.5) * 0.7;
      const speed = 80 + Math.random() * 180;
      const vel = Vector2.fromAngle(angle, speed);
      const life = 60 + Math.random() * 80;
      const size = 1.5 + Math.random() * 3;
      const c = palette[Math.floor(Math.random() * palette.length)];

      const p = this.pool.acquire();
      p.spawn(pos, vel, life, c, size);
      this.particles.push(p);
    }

    // Bright central flash orb (very brief, large)
    const core = this.pool.acquire();
    core.spawn(pos, new Vector2(0, 0), 40, '#ffffff', 8);
    this.particles.push(core);
  }

  // ====== ZX-9: Player hit — red particle burst + full-screen red flash ======
  spawnPlayerHitFlash(pos: Vector2) {
    const colors = ['#ff0000', '#ff4444', '#ff6b6b', '#ff8c00', '#ffffff'];
    const count = 20;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 150;
      const vel = Vector2.fromAngle(angle, speed);
      const life = 250 + Math.random() * 400;
      const size = 2 + Math.random() * 5;
      const c = colors[Math.floor(Math.random() * colors.length)];

      const p = this.pool.acquire();
      p.spawn(pos, vel, life, c, size);
      this.particles.push(p);
    }

    // Full-screen red flash
    this.screenFlashTimer = 250;
    this.screenFlashColor = 'rgba(255, 0, 0, 0.35)';
  }

  // Alias used by Game.ts
  spawnPlayerDamageFlash(pos: Vector2) {
    this.spawnPlayerHitFlash(pos);
  }

  private lighten(color: string, amount: number): string {
    // Simple hex lighten/darken
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + Math.round(amount * 255)));
    const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + Math.round(amount * 255)));
    const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + Math.round(amount * 255)));
    return `rgb(${r},${g},${b})`;
  }

  update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update(dt);
      if (!p.active) {
        this.pool.release(p);
        this.particles.splice(i, 1);
      }
    }
    if (this.screenFlashTimer > 0) {
      this.screenFlashTimer -= dt;
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      p.render(ctx);
    }

    if (this.screenFlashTimer > 0) {
      ctx.save();
      const alpha = 0.35 * (this.screenFlashTimer / 250);
      ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }
  }

  clear() {
    for (const p of this.particles) {
      this.pool.release(p);
    }
    this.particles = [];
    this.screenFlashTimer = 0;
  }
}
