export class GameLoop {
  private running = false;
  private lastTime = 0;
  private accumulator = 0;
  private rafId = 0;

  private update: (dt: number) => void;
  private render: () => void;
  private fixedDt: number;

  constructor(update: (dt: number) => void, render: () => void, fixedDt: number = 1000 / 60) {
    this.update = update;
    this.render = render;
    this.fixedDt = fixedDt;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.tick(this.lastTime);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private tick = (time: number) => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.tick);

    let dt = time - this.lastTime;
    this.lastTime = time;

    if (dt > 100) dt = 100;

    this.accumulator += dt;

    while (this.accumulator >= this.fixedDt) {
      this.update(this.fixedDt);
      this.accumulator -= this.fixedDt;
    }

    this.render();
  };
}
