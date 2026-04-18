import { Vector2 } from '../utils/Vector2';

export class Input {
  keys: Set<string> = new Set();
  mousePos = new Vector2(0, 0);
  mouseDown = false;
  mousePressed = false;
  mouseReleased = false;

  private canvas: HTMLCanvasElement;
  private touchActive = false;
  private touchStart = new Vector2(0, 0);
  private touchCurrent = new Vector2(0, 0);

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupKeyboard();
    this.setupMouse();
    this.setupTouch();
  }

  private setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });
  }

  private setupMouse() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.mousePos.x = (e.clientX - rect.left) * scaleX;
      this.mousePos.y = (e.clientY - rect.top) * scaleY;
    });

    this.canvas.addEventListener('mousedown', () => {
      this.mouseDown = true;
      this.mousePressed = true;
    });

    window.addEventListener('mouseup', () => {
      this.mouseDown = false;
      this.mouseReleased = true;
    });
  }

  private setupTouch() {
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.touchActive = true;
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.touchStart.x = this.touchCurrent.x = (touch.clientX - rect.left) * scaleX;
      this.touchStart.y = this.touchCurrent.y = (touch.clientY - rect.top) * scaleY;
      this.mousePos.x = this.touchCurrent.x;
      this.mousePos.y = this.touchCurrent.y;
      this.mouseDown = true;
      this.mousePressed = true;
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.touchCurrent.x = (touch.clientX - rect.left) * scaleX;
      this.touchCurrent.y = (touch.clientY - rect.top) * scaleY;
      this.mousePos.x = this.touchCurrent.x;
      this.mousePos.y = this.touchCurrent.y;
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.touchActive = false;
      this.mouseDown = false;
      this.mouseReleased = true;
    });
  }

  getMovementVector(): Vector2 {
    if (this.touchActive) {
      const dir = this.touchCurrent.sub(this.touchStart);
      const maxDist = 80;
      const dist = Math.min(dir.magnitude(), maxDist);
      if (dist < 10) return new Vector2(0, 0);
      return dir.normalize().mul(dist / maxDist);
    }

    let x = 0;
    let y = 0;
    if (this.keys.has('a') || this.keys.has('arrowleft')) x -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) x += 1;
    if (this.keys.has('w') || this.keys.has('arrowup')) y -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) y += 1;

    const v = new Vector2(x, y);
    if (v.magnitude() > 0) return v.normalize();
    return v;
  }

  isPressed(key: string): boolean {
    return this.keys.has(key.toLowerCase());
  }

  resetFrame(): void {
    this.mousePressed = false;
    this.mouseReleased = false;
  }
}
