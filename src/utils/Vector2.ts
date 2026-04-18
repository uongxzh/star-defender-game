export class Vector2 {
  x: number;
  y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  static fromAngle(angle: number, magnitude: number): Vector2 {
    return new Vector2(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
  }

  static distance(a: Vector2, b: Vector2): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  static randomDirection(): Vector2 {
    const angle = Math.random() * Math.PI * 2;
    return Vector2.fromAngle(angle, 1);
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  add(v: Vector2): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  sub(v: Vector2): Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  mul(s: number): Vector2 {
    return new Vector2(this.x * s, this.y * s);
  }

  div(s: number): Vector2 {
    return new Vector2(this.x / s, this.y / s);
  }

  magnitude(): number {
    return Math.hypot(this.x, this.y);
  }

  normalize(): Vector2 {
    const m = this.magnitude();
    if (m === 0) return new Vector2(0, 0);
    return this.div(m);
  }

  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }

  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  limit(max: number): Vector2 {
    const m = this.magnitude();
    if (m > max) return this.normalize().mul(max);
    return this.clone();
  }
}
