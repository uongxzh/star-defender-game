import { Vector2 } from './utils/Vector2';

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';

export interface Entity {
  position: Vector2;
  velocity: Vector2;
  radius: number;
  active: boolean;
  update(dt: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}

export interface EnemyType {
  name: string;
  speed: number;
  health: number;
  damage: number;
  score: number;
  radius: number;
  color: string;
}

export interface PowerUpType {
  name: string;
  color: string;
  duration: number;
}

export interface ParticleData {
  position: Vector2;
  velocity: Vector2;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface GameStats {
  score: number;
  wave: number;
  kills: number;
  time: number;
}

export interface WeaponState {
  type: 'single' | 'double' | 'triple' | 'rapid';
  timer: number;
  fireRate: number;
}
