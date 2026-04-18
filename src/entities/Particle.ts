import { Vector2 } from '../utils/Vector2';

export class Particle {
  position: Vector2;
  velocity: Vector2;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  active = true;

  constructor() {
    this.position = new Vector2(0, 0);
    this.velocity = new Vector2(0, 0);
    this.life = 0;
    this.maxLife = 1;
    this.color = '#fff';
    this.size = 2;
  }

  spawn(pos: Vector2, velocity: Vector2, life: number, color: string, size: number) {
    this.position = pos.clone();
    this.velocity = velocity.clone();
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.size = size;
    this.active = true;
  }

  update(dt: number) {
    this.position = this.position.add(this.velocity.mul(dt / 1000));
    this.life -= dt;
    this.velocity = this.velocity.mul(0.98);
    if (this.life <= 0) this.active = false;
  }

  render(ctx: CanvasRenderingContext2D) {
    const alpha = this.life / this.maxLife;
    const size = this.size * (0.5 + alpha * 0.5);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
