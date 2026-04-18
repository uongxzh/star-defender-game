import { Particle } from '../entities/Particle';
import { Vector2 } from '../utils/Vector2';
import { ObjectPool } from './ObjectPool';
import { COLORS } from '../utils/constants';

export class ParticleSystem {
  particles: Particle[] = [];
  private pool: ObjectPool<Particle>;

  constructor() {
    this.pool = new ObjectPool<Particle>(
      () => new Particle(),
      (p) => { p.active = false; },
      100
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

  update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update(dt);
      if (!p.active) {
        this.pool.release(p);
        this.particles.splice(i, 1);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      p.render(ctx);
    }
  }

  clear() {
    for (const p of this.particles) {
      this.pool.release(p);
    }
    this.particles = [];
  }
}
