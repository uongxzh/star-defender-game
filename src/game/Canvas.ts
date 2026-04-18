import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';

export class Canvas {
  element: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  scale = 1;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error(`Container #${containerId} not found`);

    this.element = document.createElement('canvas');
    this.element.width = GAME_WIDTH;
    this.element.height = GAME_HEIGHT;
    this.element.style.width = '100%';
    this.element.style.height = '100%';
    this.element.style.display = 'block';
    this.element.style.imageRendering = 'auto';
    this.ctx = this.element.getContext('2d')!;

    container.style.width = '100%';
    container.style.height = '100%';
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.background = '#020617';
    container.appendChild(this.element);

    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  private handleResize() {
    const parent = this.element.parentElement!;
    const parentW = parent.clientWidth;
    const parentH = parent.clientHeight;
    const scaleX = parentW / GAME_WIDTH;
    const scaleY = parentH / GAME_HEIGHT;
    this.scale = Math.min(scaleX, scaleY, 1);
    this.element.style.width = `${GAME_WIDTH * this.scale}px`;
    this.element.style.height = `${GAME_HEIGHT * this.scale}px`;
  }

  clear() {
    this.ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  fill(color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }
}
